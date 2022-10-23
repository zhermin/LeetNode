from fastapi import FastAPI, status, HTTPException
from pyBKT.models import Model, Roster
import numpy as np
import re, pickle, os
import pyrebase

# Storage configurations
config = {
    "apiKey": "AIzaSyBkOgyEaJLDrryHW5AtVs45miWidFhz-2g",
    "authDomain": "recommender-storage.firebaseapp.com",
    "projectId": "recommender-storage",
    "storageBucket": "recommender-storage.appspot.com",
    "serviceAccount": "/etc/secrets/serviceAccountKey.json",
    "databaseURL": "//recommender-storage.appspot.com",
}

firebase_storage = pyrebase.initialize_app(config)
storage = firebase_storage.storage()


def get_training_model() -> Model:
    """
    Try and load a training model
    If doesn't exist, then train a new model
    """
    try:
        """
        Load a trained model from a pickle file in local storage
        """
        with open("models/training-model-latest.pkl", "rb") as handle:
            return pickle.load(handle)
    except:
        """
        Train a model from some data
        Data is currently hardcoded, but should be loaded from our database or file in the future
        """
        trained_model = Model()
        defaults = {
            "order_id": "Anon Student Id",
            "skill_name": "KC(Default)",
            "correct": "Correct First Attempt",
        }
        trained_model.fit(data_path="Data_Analysis_CSV.csv", defaults=defaults)
        trained_model.save("models/training-model-latest.pkl")
        return trained_model


def get_roster_model() -> Model:
    """
    Get the latest roster file in storage and load them
    """
    storage.download("roster.pkl", "roster.pkl")
    with open("roster.pkl", "rb") as handle:
        return pickle.load(handle)


app = FastAPI()
app.trained_model = Model()
app.roster = Model()


@app.on_event("startup")
async def startup_event():
    """
    Get latest model during start up
    """
    # Initialise the model (Either load from file or train from some data)
    app.trained_model = get_training_model()
    app.roster = get_roster_model()


@app.get("/", status_code=status.HTTP_200_OK)
def home() -> dict:
    """
    Homepage
    """

    return {"Status": "The recommender microservice is running!"}


@app.post("/add-student/{student_id}/{topic}", status_code=status.HTTP_200_OK)
def add_student(student_id: str, topic: str) -> dict:
    """
    Adds students with given names for a topic with optional initial states.
    Notes:
        Update multiple students at once
        Can only update 1 topic at a time
    """

    student_id = student_id.split(",")
    if topic not in app.roster.skill_rosters:  # Ensure valid topic name
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid topic name",
        )
    elif any(
        student in app.roster.skill_rosters[topic].students for student in student_id
    ):  # Prevent overwriting
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Data already exists",
        )
    app.roster.add_students(topic, student_id)
    return {"Created": True}


@app.delete("/remove-student/{student_id}/{topic}", status_code=status.HTTP_200_OK)
def remove_student(student_id: str, topic: str) -> dict:
    """
    Removes students with given names for a topic.
    Notes:
        Removes multiple students at once
        Can only remove 1 topic at a time
    """

    student_id = student_id.split(",")
    if topic not in app.roster.skill_rosters:  # Ensure valid topic name
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid topic name",
        )
    elif not all(
        student in app.roster.skill_rosters[topic].students for student in student_id
    ):  # Ensure all students in the arguments exists in the Roster
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Student ID {student_id} does NOT exists",
        )
    app.roster.remove_students(topic, student_id)
    return {"Deleted": True}


@app.get("/get-mastery/{student_id}/{topic}", status_code=status.HTTP_200_OK)
def get_mastery(student_id: str, topic: str) -> dict:
    """
    Fetches mastery probability for a particular student for a topic.
    Notes:
        1 student at a time
        1 topic at a time
    """

    if topic not in app.roster.skill_rosters:  # Ensure valid topic name
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid topic name",
        )
    elif (
        student_id not in app.roster.skill_rosters[topic].students
    ):  # Ensure all students in the arguments exists in the Roster
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Student ID {student_id} does NOT exists",
        )
    return {f"Mastery": app.roster.get_mastery_prob(topic, student_id)}


@app.patch(
    "/update-state/{student_id}/{topic}/{correct}", status_code=status.HTTP_200_OK
)
def update_state(student_id: str, topic: str, correct: str) -> dict:
    """
    Updates state of a particular student for a topic given one response.
    Notes:
        Update 1 student at a time
        Update 1 topic at a time
    """

    if topic not in app.roster.skill_rosters:  # Ensure valid topic name
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid topic name",
        )
    elif (
        student_id not in app.roster.skill_rosters[topic].students
    ):  # Prevent overwriting
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Student ID {student_id} does NOT exists",
        )
    elif not bool(re.fullmatch("[01]+", correct)):  # Ensure that string is binary
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Missing / Incorrect argument. Please ensure that the last agrument is a binary string.",
        )
    app.roster.update_state(topic, student_id, np.array([int(i) for i in correct]))
    return {"Updated": True}


@app.post("/save-roster", status_code=status.HTTP_200_OK)
def save_roster() -> None:
    """
    Saves the Roster model to disk. Uses Python pickles.
    """

    with open("roster.pkl", "wb") as handle:
        pickle.dump(app.roster, handle, protocol=pickle.HIGHEST_PROTOCOL)
    storage.child("roster.pkl").put("roster.pkl")


@app.post("/reset-roster", status_code=status.HTTP_200_OK)
def reset_roster() -> Model:
    """
    Initialise empty Roster.
    Removes all students.
    """

    with open(os.path.dirname(__file__) + "/seed_data.ts", "r") as f:
        """
        Get topicId from the data.js
        """
        text = f.read()
        topics = re.findall(r"topicSlug: .*", text)
        topics = [topic.replace('topicSlug: "', "").rstrip('",') for topic in topics]

    app.roster = Roster(students=[], skills=topics, model=app.trained_model)


@app.on_event("shutdown")
async def shutdown_event():
    """
    Saves the roster file when shutting down
    """
    storage.child("roster.pkl").put("roster.pkl")
