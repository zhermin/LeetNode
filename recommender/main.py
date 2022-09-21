from fastapi import FastAPI
from pydantic import BaseModel

from pyBKT.models import Model
import pandas as pd

model = Model()
model.load("models/model-custom.pkl")

app = FastAPI()

class Student(BaseModel):
    id: str
    email: str
    skill: str
    correct: int
    mastery: str

students = {
    # Temporary placeholder to hold the students data
}

@app.get("/")
def home():
    # Homepage
    return {"Status": "The recommender microservice is running!"}

@app.get("/get-student")
def get_student():
    # Retrieve all the students' information
    return students

@app.get("/get-student/{student_id}")
def get_student(student_id: str):
    # Retrieve the student information based on student id
    if student_id in students:
        return students[student_id]
    return {"Error": f"Student ID {student_id} does NOT exists"}
    
@app.post("/create-student")
def create_student(student: Student):
    # Creating a new student
    if student.id in students:
        return {"Error": "Student ID exists"}
    students[student.id] = student
    return {"Created": True, "Student ID": f"{student.id} created"}

@app.delete("/delete-student/{student_id}")
def delete_student(student_id: str):
    # Deleting a student
    if student_id in students:
        students.pop(student_id)
        return {"Deleted": True, "Student ID": f"{student_id} deleted"}
    return {"Error": f"Student ID {student_id} does NOT exists"}

@app.get("/predict/{student_id}")
def predict(student_id: str):
    data = pd.DataFrame(
        [
            { # temp
                "Student ID": student_id.upper(),
                "Topic": students[student_id].skill.lower(),
                "Correct": students[student_id].correct,
                "Problem Name": students[student_id].skill
            }
        ]
    )
    try:
        pred = model.predict(data=data)
        return pred.to_dict()
    except ValueError:
        return {"Error": "Invalid Topic Name"}