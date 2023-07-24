from pyBKT.models import Model, Roster
from dotenv import load_dotenv
from fastapi import FastAPI, status, Security, HTTPException, Depends
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from upstash_redis import Redis

import numpy as np
import re, pickle, os, multiprocessing, base64
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


# Upstash Redis cache configurations
UPSTASH_REDIS_REST_URL = os.environ.get("UPSTASH_REDIS_REST_URL")
UPSTASH_REDIS_REST_TOKEN = os.environ.get("UPSTASH_REDIS_REST_TOKEN")
if UPSTASH_REDIS_REST_URL is None or UPSTASH_REDIS_REST_TOKEN is None:
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail="Upstash Redis invalid or missing URL and token",
    )

r = Redis(
    url=UPSTASH_REDIS_REST_URL,
    token=UPSTASH_REDIS_REST_TOKEN,
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

# Multiprocessing lock
lock = multiprocessing.Lock()


def get_model() -> Model:
    """
    Loads the trained model from a pickle file in storage.
    """

    model = Model()
    model.load("model.pkl")
    return model


def get_roster_model() -> Model:
    """
    Loads the latest roster file in the persistent storage.
    Updates the roster with the latest training model on startup.
    """

    storage.download("roster.pkl", "roster.pkl")
    with open("roster.pkl", "rb") as handle:
        roster = pickle.load(handle)
    try:
        # Prevent API from crashing in case the training model doesn't fit the roster model
        roster.set_model(app.state.model)
    finally:
        return roster


def get_all_topics() -> list:
    """
    Returns list of topics.
    """

    with open(os.path.dirname(__file__) + "/seed_data.ts", "r") as f:
        """
        Get topicSlug from the seed_data.ts
        """
        text = f.read()
        topics = re.findall(r"topicSlug: .*", text)
        topics = set(topics)  # Remove duplicates
        topics = [
            topic.replace('topicSlug: "', "").rstrip('",') for topic in topics
        ]  # Clean up
    return topics


app = FastAPI()
app.state.model = get_model()
app.state.roster = get_roster_model()


class Topics(BaseModel):
    student_id: str
    topics: dict


@app.on_event("startup")
async def startup_event():
    """
    Updates Redis cache with the latest model during start up.
    """

    encoded_data = base64.b64encode(pickle.dumps(app.state.roster)).decode("utf-8")
    r.set("roster", encoded_data)


@app.get("/", status_code=status.HTTP_200_OK)
def home() -> dict:
    """
    Homepage
    """

    return {"Status": "The recommender microservice is running!"}


@app.post(
    "/add-student/{student_id}/{topic}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(get_api_key)],
)
def add_student(student_ids: str, topic: str) -> dict:
    """
    Adds students with given names for a topic with optional initial states.

    Notes:
        Add multiple students at once.
        Can only add 1 topic at a time.
    """

    with lock:
        roster_data = r.get("roster")
        if roster_data is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Roster not initialised",
            )
        app.state.roster = pickle.loads(base64.b64decode(roster_data))
        student_id = student_ids.split(",")

        if topic not in app.state.roster.skill_rosters:  # Ensure valid topic name
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid topic name",
            )
        elif any(
            student in app.state.roster.skill_rosters[topic].students
            for student in student_id
        ):  # Prevent overwriting
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Data already exists",
            )

        app.state.roster.add_students(topic, student_id)  # Add the students
        encoded_data = base64.b64encode(pickle.dumps(app.state.roster)).decode("utf-8")
        r.set("roster", encoded_data)
        return {"Created": True}


@app.delete(
    "/remove-student/{student_id}/{topic}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(get_api_key)],
)
def remove_student(student_ids: str, topic: str) -> dict:
    """
    Removes students with given names for a topic.

    Notes:
        Removes multiple students at once.
        Can only remove 1 topic at a time.
    """

    with lock:
        roster_data = r.get("roster")
        if roster_data is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Roster not initialised",
            )
        app.state.roster = pickle.loads(base64.b64decode(roster_data))
        student_id = student_ids.split(",")

        if topic not in app.state.roster.skill_rosters:  # Ensure valid topic name
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid topic name",
            )
        elif not all(
            student in app.state.roster.skill_rosters[topic].students
            for student in student_id
        ):  # Ensure all students in the arguments exists in the Roster
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Student ID {student_id} does NOT exists",
            )

        app.state.roster.remove_students(topic, student_id)  # Remove the students
        encoded_data = base64.b64encode(pickle.dumps(app.state.roster)).decode("utf-8")
        r.set("roster", encoded_data)
        return {"Deleted": True}


@app.delete(
    "/remove-all/{student_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(get_api_key)],
)
def remove_all(student_id: str) -> dict:
    """
    Removes student for ALL topics.

    Notes:
        Removes for ALL topics (IRREVERSIBLE).
    """

    with lock:
        roster_data = r.get("roster")
        if roster_data is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Roster not initialised",
            )
        app.state.roster = pickle.loads(base64.b64decode(roster_data))

        for topic in app.state.roster.skill_rosters:
            if (
                student_id in app.state.roster.skill_rosters[topic].students
            ):  # Ensure student exists in the Roster
                app.state.roster.remove_students(
                    topic, [student_id]
                )  # Remove the students

        encoded_data = base64.b64encode(pickle.dumps(app.state.roster)).decode("utf-8")
        r.set("roster", encoded_data)
        return {"Deleted": True}


@app.get(
    "/get-mastery/{student_id}/{topic}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(get_api_key)],
)
def get_mastery(student_id: str, topic: str) -> dict:
    """
    Fetches mastery probability for a particular student for a topic.

    Notes:
        Fetches 1 student at a time.
        Fetches 1 topic at a time.
    """

    with lock:
        roster_data = r.get("roster")
        if roster_data is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Roster not initialised",
            )
        app.state.roster = pickle.loads(base64.b64decode(roster_data))

        if topic not in app.state.roster.skill_rosters:  # Ensure valid topic name
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid topic name",
            )
        elif (
            student_id not in app.state.roster.skill_rosters[topic].students
        ):  # Add student if doesn't exists in the Roster
            app.state.roster.add_students(topic, [student_id])

        mastery = app.state.roster.get_mastery_prob(topic, student_id)
        if mastery == -1:  # Not trained
            mastery = 0  # Set default to 0

        encoded_data = base64.b64encode(pickle.dumps(app.state.roster)).decode("utf-8")
        r.set("roster", encoded_data)
        return {f"Mastery": mastery}


@app.get(
    "/get-all/{student_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(get_api_key)],
)
def get_all(student_id: str) -> dict:
    """
    Fetches the mastery probability for a particular student for ALL topic.
    Initialises student if not in Roster.

    Notes:
        Fetches 1 student at a time.
    """

    with lock:
        roster_data = r.get("roster")
        if roster_data is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Roster not initialised",
            )
        app.state.roster = pickle.loads(base64.b64decode(roster_data))
        mastery_dict = {}

        for topic in app.state.roster.skill_rosters:
            if (
                student_id not in app.state.roster.skill_rosters[topic].students
            ):  # Prevent overwriting
                app.state.roster.add_students(
                    topic, [student_id]
                )  # Add student if doesn't exists in the Roster

            mastery = app.state.roster.get_mastery_prob(topic, student_id)
            if mastery == -1:  # Not trained
                mastery_dict[topic] = 0  # Set default to 0
            else:
                mastery_dict[topic] = mastery

        encoded_data = base64.b64encode(pickle.dumps(app.state.roster)).decode("utf-8")
        r.set("roster", encoded_data)
        return {f"Mastery": mastery_dict}


@app.patch(
    "/update-state/{student_id}/{topic}/{correct}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(get_api_key)],
)
def update_state(student_id: str, topic: str, correct: str) -> dict:
    """
    Updates state of a particular student for a topic given one response.

    Notes:
        Update 1 student at a time.
        Update 1 topic at a time.
    """

    with lock:
        roster_data = r.get("roster")
        if roster_data is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Roster not initialised",
            )
        app.state.roster = pickle.loads(base64.b64decode(roster_data))

        if topic not in app.state.roster.skill_rosters:  # Ensure valid topic name
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid topic name",
            )
        elif not bool(re.fullmatch("[01]+", correct)):  # Ensure that string is binary
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Missing / Incorrect argument. Please ensure that the last agrument is a binary string.",
            )
        elif (
            student_id not in app.state.roster.skill_rosters[topic].students
        ):  # Add student if doesn't exists in the Roster
            app.state.roster.add_students(topic, student_id)

        app.state.roster.update_state(
            topic, student_id, np.array([int(i) for i in correct])
        )  # Update the student
        encoded_data = base64.b64encode(pickle.dumps(app.state.roster)).decode("utf-8")
        r.set("roster", encoded_data)
        return {"Updated": True}


@app.patch(
    "/update-multiple/{student_id}",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(get_api_key)],
)
def update_multiple(student_id: str, topics: Topics) -> dict:
    """
    Updates state of a particular student for all topics given one response.

    Notes:
        Update 1 student at a time
    """

    with lock:
        roster_data = r.get("roster")
        if roster_data is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Roster not initialised",
            )
        app.state.roster = pickle.loads(base64.b64decode(roster_data))

        for topic in topics.topics:
            if topic not in app.state.roster.skill_rosters:  # Ensure valid topic name
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Invalid topic name: {topic}",
                )
            elif not bool(
                re.fullmatch("[01]+", topics.topics[topic])
            ):  # Ensure that string is binary
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Missing / Incorrect argument. Please ensure that the last agrument is a binary string.",
                )
            elif (
                student_id not in app.state.roster.skill_rosters[topic].students
            ):  # If student does not exist in Roster, add student into Roster
                app.state.roster.add_students(topic, student_id)

            app.state.roster.update_state(
                topic, student_id, np.array([int(i) for i in topics.topics[topic]])
            )  # Update the student

        encoded_data = base64.b64encode(pickle.dumps(app.state.roster)).decode("utf-8")
        r.set("roster", encoded_data)
        return {"Updated": True}


@app.post(
    "/reset-roster",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(get_api_key)],
)
def reset_roster() -> None:
    """
    Initialises empty Roster.
    Removes all students.
    """

    with lock:
        topics = get_all_topics()
        app.state.roster = Roster(students=[], skills=topics, model=app.state.model)
        encoded_data = base64.b64encode(pickle.dumps(app.state.roster)).decode("utf-8")
        r.set("roster", encoded_data)


@app.post(
    "/save-roster",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(get_api_key)],
)
def save_roster() -> None:
    """
    Saves the Roster model to disk as a pickle file.
    """

    with lock:
        roster_data = r.get("roster")
        if roster_data is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Roster not initialised",
            )
        app.state.roster = pickle.loads(base64.b64decode(roster_data))
        with open("roster.pkl", "wb") as handle:
            pickle.dump(app.state.roster, handle, protocol=pickle.HIGHEST_PROTOCOL)
        storage.child("roster.pkl").put("roster.pkl")


@app.on_event("shutdown")
async def shutdown_event():
    """
    Saves the roster file when shutting down.
    Saves the Roster model to disk as a pickle file.
    """

    with lock:
        roster_data = r.get("roster")
        if roster_data is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Roster not initialised",
            )
        app.state.roster = pickle.loads(base64.b64decode(roster_data))
        with open("roster.pkl", "wb") as handle:
            pickle.dump(app.state.roster, handle, protocol=pickle.HIGHEST_PROTOCOL)
        storage.child("roster.pkl").put("roster.pkl")
