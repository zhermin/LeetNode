from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Security, status
from fastapi.security import APIKeyHeader
from pyBKT.models import Model, Roster
from pydantic import BaseModel
from typing import Literal

import numpy as np
import multiprocessing, os, pickle, re, time
import pyrebase

# Load .env file during local development
load_dotenv("../leetnode/.env")

# Middleware to require a valid API key
api_key_header = APIKeyHeader(name="access_token", auto_error=False)


async def get_api_key(
    api_key_header: str = Security(api_key_header),
) -> str:
    if api_key_header == os.environ.get("RECOMMENDER_API_KEY"):
        return api_key_header
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing API Key",
        )


# Firebase persistent storage configurations
config = {
    "apiKey": "AIzaSyBkOgyEaJLDrryHW5AtVs45miWidFhz-2g",
    "authDomain": "recommender-storage.firebaseapp.com",
    "projectId": "recommender-storage",
    "storageBucket": "recommender-storage.appspot.com",
    "serviceAccount": "serviceAccountKey.json",
    "databaseURL": "//recommender-storage.appspot.com",
}

firebase_storage = pyrebase.initialize_app(config)
storage = firebase_storage.storage()

# Multiprocessing lock for thread safety
lock = multiprocessing.Lock()


def get_model() -> Model:
    """
    Loads the trained model from a pickle file in storage.
    """

    model = Model()
    model.load("model.pkl")
    return model


def get_roster_model() -> Roster:
    """
    Loads the latest roster file in the persistent storage.
    Updates the roster with the latest training model on startup.
    """

    storage.download("roster.pkl", "roster.pkl")
    with open("roster.pkl", "rb") as handle:
        roster: Roster = pickle.load(handle)
    try:
        # Prevent API from crashing in case the training model doesn't fit the roster model
        roster.set_model(app.state.model)
    except Exception as e:
        print(
            f"[ERROR] Training model did not fit the roster model, defaulting to model in storage.\n{e}"
        )
    finally:
        return roster


def get_all_topics() -> list[str]:
    """
    Returns list of topics by parsing the topicSlugs in the seed_data.ts file.
    """

    with open(os.path.dirname(__file__) + "/seed_data.ts", "r") as f:
        text = f.read()
        topics = re.findall(r"topicSlug: .*", text)
        topics = set(topics)  # Remove duplicates
        topics = [
            topic.replace('topicSlug: "', "").rstrip('",') for topic in topics
        ]  # Clean up
    return topics


class Topics(BaseModel):
    student_id: str
    topics: dict[str, Literal["0", "1"]]


app = FastAPI()


@app.on_event("startup")
async def startup_event() -> None:
    """
    Updates state variables with the latest model in persistent storage during startup.
    """

    app.state.model = get_model()
    app.state.roster = get_roster_model()


@app.get("/", status_code=status.HTTP_200_OK)
def home() -> dict[str, str]:
    """
    Homepage
    """

    return {"Status": "The recommender microservice is running!"}


@app.get(
    "/get-all-mastery-probs",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(get_api_key)],
)
def get_all_mastery_probabilities() -> dict[str, dict[str, float]]:
    """
    Fetches mastery probabilities for all students for each topic.
    """

    with lock:
        return {
            topic: app.state.roster.get_mastery_probs(topic)
            for topic in app.state.roster.skill_rosters
        }


@app.post(
    "/students-topic/{student_ids}/{topic}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(get_api_key)],
)
def add_students_to_topic(student_ids: str, topic: str) -> dict[str, bool]:
    """
    Adds comma-separated student IDs for 1 topic, ignoring those already in the Roster.

    Notes:
        Add multiple students at once.
        Can only add 1 topic at a time.
    """

    with lock:
        filtered_student_ids = student_ids.split(",")
        filtered_student_ids = [
            student.strip()
            for student in filtered_student_ids
            if student not in app.state.roster.skill_rosters[topic].students
        ]

        if topic not in app.state.roster.skill_rosters:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid topic name",
            )

        app.state.roster.add_students(topic, filtered_student_ids)
        save_roster_model()

        return {"Created": True}


@app.delete(
    "/students-topic/{student_ids}/{topic}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(get_api_key)],
)
def remove_students_from_topic(student_ids: str, topic: str) -> dict[str, bool]:
    """
    Removes comma-separated student IDs for 1 topic, ignoring those not in the Roster.

    Notes:
        Removes multiple students at once.
        Can only remove 1 topic at a time.
    """

    with lock:
        filtered_student_ids = student_ids.split(",")
        filtered_student_ids = [
            student.strip()
            for student in filtered_student_ids
            if student in app.state.roster.skill_rosters[topic].students
        ]

        if topic not in app.state.roster.skill_rosters:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid topic name",
            )

        app.state.roster.remove_students(topic, filtered_student_ids)
        save_roster_model()

        return {"Deleted": True}


@app.delete(
    "/student-all-topics/{student_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(get_api_key)],
)
def remove_student_from_all_topics(student_id: str) -> dict[str, bool]:
    """
    Removes 1 student for ALL topics.

    Notes:
        Removes for ALL topics (IRREVERSIBLE).
    """

    with lock:
        for topic in app.state.roster.skill_rosters:
            if (
                student_id in app.state.roster.skill_rosters[topic].students
            ):  # Ensure student exists in the Roster
                app.state.roster.remove_students(topic, [student_id])

        save_roster_model()

        return {"Deleted": True}


@app.get(
    "/get-mastery/{student_id}/{topic}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(get_api_key)],
)
def get_mastery_of_student(student_id: str, topic: str) -> dict[str, float]:
    """
    Fetches mastery probability for a particular student for a topic.

    Notes:
        Fetches 1 student at a time.
        Fetches 1 topic at a time.
    """

    with lock:
        if topic not in app.state.roster.skill_rosters:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid topic name",
            )
        elif (
            student_id not in app.state.roster.skill_rosters[topic].students
        ):  # Add student if doesn't exist in the Roster
            app.state.roster.add_students(topic, [student_id])

        mastery: float = app.state.roster.get_mastery_prob(topic, student_id)
        if mastery == -1:  # Not trained
            mastery = 0  # Set default to 0

        save_roster_model()

        return {f"Mastery": mastery}


@app.get(
    "/get-all/{student_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(get_api_key)],
)
def get_all_masteries_of_student(student_id: str) -> dict[str, dict[str, float]]:
    """
    Fetches the mastery probability for a particular student for ALL topic.
    Initialises student if not in Roster.

    Notes:
        Fetches 1 student at a time.
    """

    with lock:
        mastery_dict: dict[str, float] = {}

        for topic in app.state.roster.skill_rosters:
            if (
                student_id not in app.state.roster.skill_rosters[topic].students
            ):  # Prevent overwriting existing students
                app.state.roster.add_students(
                    topic, [student_id]
                )  # Add student if doesn't exist in the Roster

            mastery: float = app.state.roster.get_mastery_prob(topic, student_id)
            if mastery == -1:  # Not trained
                mastery_dict[topic] = 0  # Set default to 0
            else:
                mastery_dict[topic] = mastery

        save_roster_model()

        return {f"Mastery": mastery_dict}


@app.patch(
    "/update-state/{student_id}/{topic}/{correct}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(get_api_key)],
)
def update_state_of_student(
    student_id: str, topic: str, correct: Literal["0", "1"]
) -> dict[str, bool]:
    """
    Updates state of a particular student for a topic given one response.

    Notes:
        Update 1 student at a time.
        Update 1 topic at a time.
    """

    with lock:
        if topic not in app.state.roster.skill_rosters:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid topic name",
            )
        elif (
            student_id not in app.state.roster.skill_rosters[topic].students
        ):  # Add student if doesn't exist in the Roster
            app.state.roster.add_students(topic, student_id)

        app.state.roster.update_state(
            topic, student_id, np.array([int(i) for i in correct])
        )

        save_roster_model()

        return {"Updated": True}


@app.patch(
    "/update-multiple/{student_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(get_api_key)],
)
def update_multiple_states_of_student(
    student_id: str, topics: Topics
) -> dict[str, bool]:
    """
    Updates state of a particular student for all topics given one response.

    Notes:
        Update 1 student at a time
    """

    with lock:
        for topic in topics.topics:
            if topic not in app.state.roster.skill_rosters:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Invalid topic name: {topic}",
                )
            elif (
                student_id not in app.state.roster.skill_rosters[topic].students
            ):  # Add student if doesn't exist in the Roster
                app.state.roster.add_students(topic, student_id)

            app.state.roster.update_state(
                topic, student_id, np.array([int(i) for i in topics.topics[topic]])
            )

        save_roster_model()

        return {"Updated": True}


@app.post(
    "/reset-roster",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(get_api_key)],
)
def reset_roster() -> None:
    """
    Reinitialises an empty Roster and wipes out previous Roster.
    Removes all students.
    """

    with lock:
        topics = get_all_topics()
        app.state.roster = Roster(students=[], skills=topics, model=app.state.model)
        save_roster_model()


@app.post(
    "/save-roster",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(get_api_key)],
)
async def save_roster() -> None:
    """
    Saves the Roster model.
    """

    with lock:
        save_roster_model()


@app.on_event("shutdown")
async def shutdown_event() -> None:
    """
    Saves the Roster model on shutdown.
    """

    with lock:
        save_roster_model()


def save_roster_model() -> None:
    """
    Saves the Roster model to disk and persistent storage.
    """
    with open("roster.pkl", "wb") as handle:
        pickle.dump(app.state.roster, handle, protocol=pickle.HIGHEST_PROTOCOL)
    storage.child("roster.pkl").put("roster.pkl")

    print(f"[{time.strftime('%D %H:%M:%S')}] ROSTER MODEL SAVED")
