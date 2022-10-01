from fastapi import FastAPI
from pydantic import BaseModel

from pyBKT.models import Model, Roster
import numpy as np


# Initialize the model (Either load from file or train from some data)
def train_model() -> Model:
    """Train a model from some data
    Data is currently hardcoded, but should be loaded from our database or file in the future
    """

    model = Model()
    defaults = {
        "order_id": "Anon Student Id",
        "skill_name": "KC(Default)",
        "correct": "Correct First Attempt",
    }
    model.fit(data_path="Data_Analysis_CSV.csv", defaults=defaults)
    model.save("models/model-custom.pkl")
    return model


def load_model() -> Model:
    """Load a trained model from a pickle file in local storage"""
    model = Model()
    model.load("models/model-custom.pkl")
    return model


# model = train_model()
model = load_model()


# Get all the topics - hardcoded for now
skills_list = [
    "Ohm's law",
    "voltage division principle",
    "Equivalent resistance when connected in series or parallel",
    "Thevenin Equivalent Circuit",
    "node voltage analysis technique",
    "transient analysis of series RC circuits, and series RL circuits",
    "steady state analysis of R,L,C circuits",
]

# Initialise empty Roster
roster = Roster(students=[], skills=skills_list, model=model)

app = FastAPI()


@app.get("/")
def home() -> dict:
    """Homepage"""
    return {"Status": "The recommender microservice is running!"}


@app.post("/add-student/{student_id}/{skill}")
def add_student(student_id: str, skill: str) -> dict:
    """Adds students with given names for a skill with optional initial states.
    Notes:
        Update multiple students at once
        Can only update 1 skill at a time
    """

    student_id = student_id.split(",")
    if skill not in skills_list:  # Ensure valid skill name
        return {"Error": "Invalid skill name"}
    elif any(
        student in roster.skill_rosters[skill].students for student in student_id
    ):  # Prevent overwriting
        return {"Error": "Data already exists"}
    roster.add_students(skill, student_id)
    return {"Created": True, "Student ID": student_id, "Skills": skill}


@app.delete("/remove-student/{student_id}/{skill}")
def remove_student(student_id: str, skill: str) -> dict:
    """Removes students with given names for a skill.
    Notes:
        Removes multiple students at once
        Can only remove 1 skill at a time
    """

    student_id = student_id.split(",")
    if skill not in skills_list:  # Ensure valid skill name
        return {"Error": "Invalid skill name"}
    elif all(
        student in roster.skill_rosters[skill].students for student in student_id
    ):  # Ensure all students in the arguments exists in the Roster
        roster.remove_students(skill, student_id)
        return {"Deleted": True, "Student ID": student_id, "Skills": skill}
    return {"Error": f"Student ID {student_id} does NOT exists"}


@app.get("/get-mastery/{student_id}/{skill}")
def get_mastery(student_id: str, skill: str) -> dict:
    """Fetches mastery probability for a particular student for a skill.
    Notes:
        1 student at a time
        1 skill at a time
    """

    if skill not in skills_list:  # Ensure valid skill name
        return {"Error": "Invalid skill name"}
    elif (
        student_id not in roster.skill_rosters[skill].students
    ):  # Ensure all students in the arguments exists in the Roster
        return {"Error": f"{student_id} does not exists"}
    return {f"Mastery ({skill})": roster.get_mastery_prob(skill, student_id)}


@app.patch("/update-state/{student_id}/{skill}/{correct}")
def update_state(student_id: str, skill: str, correct: str) -> dict:
    """Updates state of a particular student for a skill given one response.
    Notes:
        Update 1 student at a time
        Update 1 skill at a time
    """

    if skill not in skills_list:  # Ensure valid skill name
        return {"Error": "Invalid skill name"}
    elif student_id not in roster.skill_rosters[skill].students:  # Prevent overwriting
        return {"Error": "Data mising"}
    roster.update_state(skill, student_id, np.array([int(i) for i in correct]))
    return {"Updated": True, "Student ID": student_id, "Skill": skill}
