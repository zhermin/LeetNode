from fastapi import FastAPI, status, HTTPException
from pyBKT.models import Model, Roster
import numpy as np
import re, pickle, os, ast, json
import pyrebase
import redis

key = os.environ["serviceAccountKey"]
r = redis.from_url(os.environ.get("REDIS_URL"))

with open("serviceAccountKey.json", "w") as f:
    key = ast.literal_eval(key)
    json.dump(key, f)

# Storage configurations
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


def get_model() -> Model:
    """
    Try and load a training model
    If doesn't exist, then train a new model
    """
    try:
        """
        Load a trained model from a pickle file in local storage
        """
        model = Model()
        model.load("model.pkl")
        return model
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
        trained_model.save("model.pkl")
        return trained_model


def get_roster_model() -> Model:
    """
    Load the latest roster file in storage
    Update the roster with the latest training model
    """
    storage.download("roster.pkl", "roster.pkl")
    with open("roster.pkl", "rb") as handle:
        roster = pickle.load(handle)
    # roster.set_model(app.model)
    return roster


app = FastAPI()
app.model = Model()
app.roster = Model()


@app.on_event("startup")
async def startup_event():
    """
    Get latest model during start up
    """
    # Initialise the model (Either load from file or train from some data)
    app.model = get_model()
    app.roster = get_roster_model()
    r.set("roster", pickle.dumps(app.roster))


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
        Add multiple students at once
        Can only add 1 topic at a time
    """

    app.roster = pickle.loads(r.get("roster"))
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

    while True:
        app.roster.add_students(topic, student_id)  # Add the students
        try:
            # Ensures that data is added before returning a response
            for student in student_id:
                app.roster.get_mastery_prob(topic, student)
        except:
            continue  # Unable to get mastery, students are not added
        else:
            r.set("roster", pickle.dumps(app.roster))
            return {
                "Created": True
            }  # Able to get mastery, students have been added, return a JSON response


@app.delete("/remove-student/{student_id}/{topic}", status_code=status.HTTP_200_OK)
def remove_student(student_id: str, topic: str) -> dict:
    """
    Removes students with given names for a topic.
    Notes:
        Removes multiple students at once
        Can only remove 1 topic at a time
    """

    app.roster = pickle.loads(r.get("roster"))
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

    while True:
        app.roster.remove_students(topic, student_id)  # Remove the students
        try:
            # Ensures that data is removed before returning a response
            for student in student_id:
                app.roster.get_mastery_prob(topic, student)
        except:
            r.set("roster", pickle.dumps(app.roster))
            return {
                "Deleted": True
            }  # Unable to get mastery, students have been deleted, return a JSON response
        else:
            continue  # Able to get mastery, students have not been deleted


@app.get("/get-mastery/{student_id}/{topic}", status_code=status.HTTP_200_OK)
def get_mastery(student_id: str, topic: str) -> dict:
    """
    Fetches mastery probability for a particular student for a topic.
    Notes:
        Fetches 1 student at a time
        Fetches 1 topic at a time
    """

    app.roster = pickle.loads(r.get("roster"))
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
    r.set("roster", pickle.dumps(app.roster))
    mastery = app.roster.get_mastery_prob(topic, student_id)
    if mastery == -1:
        return {f"Mastery": 0}  # Set default to 0
    return {f"Mastery": mastery}


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

    app.roster = pickle.loads(r.get("roster"))
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

    while True:
        old_mastery = app.roster.get_mastery_prob(topic, student_id)
        app.roster.update_state(
            topic, student_id, np.array([int(i) for i in correct])
        )  # Update the student
        new_mastery = app.roster.get_mastery_prob(topic, student_id)
        if (
            new_mastery != old_mastery
        ):  # Ensures that data is updated before returning a JSON response
            r.set("roster", pickle.dumps(app.roster))
            return {"Updated": True}


@app.post("/save-roster", status_code=status.HTTP_200_OK)
def save_roster() -> None:
    """
    Saves the Roster model to disk. Uses Python pickles.
    """

    app.roster = pickle.loads(r.get("roster"))
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
        Get topicSlug from the seed_data.ts
        """
        text = f.read()
        topics = re.findall(r"topicSlug: .*", text)
        topics = list(set(topics))  # Remove duplicates
        topics = [
            topic.replace('topicSlug: "', "").rstrip('",') for topic in topics
        ]  # Cleaning up

    app.roster = Roster(students=[], skills=topics, model=app.model)
    r.set("roster", pickle.dumps(app.roster))


@app.on_event("shutdown")
async def shutdown_event():
    """
    Saves the roster file when shutting down
    """

    app.roster = pickle.loads(r.get("roster"))
    with open("roster.pkl", "wb") as handle:
        pickle.dump(app.roster, handle, protocol=pickle.HIGHEST_PROTOCOL)
    storage.child("roster.pkl").put("roster.pkl")
