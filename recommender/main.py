from fastapi import FastAPI, status, HTTPException

from pyBKT.models import Model, Roster
import numpy as np
import re


# Initialize the model (Either load from file or train from some data)
def train_model() -> Model:
    """
    Train a model from some data
    Data is currently hardcoded, but should be loaded from our database or file in the future
    """

    model = Model()
    defaults = {
        "order_id": "Anon Student Id",
        "skill_name": "KC(Default)",
        "correct": "Correct First Attempt",
    }
    model.fit(data_path="Data_Analysis_CSV.csv", defaults=defaults)
    model.save("model-custom.pkl")
    return model


def load_model() -> Model:
    """
    Load a trained model from a pickle file in local storage
    """

    model = Model()
    model.load("model-custom.pkl")
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


@app.get("/", status_code=status.HTTP_200_OK)
def home() -> dict:
    """
    Homepage
    """

    return {"Status": "The recommender microservice is running!"}


@app.post("/add-student/{student_id}/{skill}", status_code=status.HTTP_200_OK)
def add_student(student_id: str, skill: str) -> dict:
    """
    Adds students with given names for a skill with optional initial states.
    Notes:
        Update multiple students at once
        Can only update 1 skill at a time
    """

    student_id = student_id.split(",")
    if skill not in skills_list:  # Ensure valid skill name
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid skill name",
        )
    elif any(
        student in roster.skill_rosters[skill].students for student in student_id
    ):  # Prevent overwriting
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Data already exists",
        )
    roster.add_students(skill, student_id)
    return {"Created": True, "Student ID": student_id, "Skills": skill}


@app.delete("/remove-student/{student_id}/{skill}", status_code=status.HTTP_200_OK)
def remove_student(student_id: str, skill: str) -> dict:
    """
    Removes students with given names for a skill.
    Notes:
        Removes multiple students at once
        Can only remove 1 skill at a time
    """

    student_id = student_id.split(",")
    if skill not in skills_list:  # Ensure valid skill name
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid skill name",
        )
    elif not all(
        student in roster.skill_rosters[skill].students for student in student_id
    ):  # Ensure all students in the arguments exists in the Roster
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Student ID {student_id} does NOT exists",
        )
    roster.remove_students(skill, student_id)
    return {"Deleted": True, "Student ID": student_id, "Skills": skill}


@app.get("/get-mastery/{student_id}/{skill}", status_code=status.HTTP_200_OK)
def get_mastery(student_id: str, skill: str) -> dict:
    """
    Fetches mastery probability for a particular student for a skill.
    Notes:
        1 student at a time
        1 skill at a time
    """

    if skill not in skills_list:  # Ensure valid skill name
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid skill name",
        )
    elif (
        student_id not in roster.skill_rosters[skill].students
    ):  # Ensure all students in the arguments exists in the Roster
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Student ID {student_id} does NOT exists",
        )
    return {f"Mastery ({skill})": roster.get_mastery_prob(skill, student_id)}


@app.patch(
    "/update-state/{student_id}/{skill}/{correct}", status_code=status.HTTP_200_OK
)
def update_state(student_id: str, skill: str, correct: str) -> dict:
    """
    Updates state of a particular student for a skill given one response.
    Notes:
        Update 1 student at a time
        Update 1 skill at a time
    """

    if skill not in skills_list:  # Ensure valid skill name
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid skill name",
        )
    elif student_id not in roster.skill_rosters[skill].students:  # Prevent overwriting
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Student ID {student_id} does NOT exists",
        )
    elif not bool(re.fullmatch("[01]+", correct)):  # Ensure that string is binary
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Missing / Incorrect argument. Please ensure that the last agrument is a binary string.",
        )
    roster.update_state(skill, student_id, np.array([int(i) for i in correct]))
    return {"Updated": True, "Student ID": student_id, "Skill": skill}
