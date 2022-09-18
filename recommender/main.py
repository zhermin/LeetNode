from pyBKT.models import Model

model = Model()
model.load("models/model-custom.pkl")

import pandas as pd
from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def home():
    return "The recommender microservice is running!"


@app.get("/predict")
def predict(user_id: str, topic: str, correct: int, problem_name: str = None):
    data = pd.DataFrame(
        [
            {
                "Student ID": user_id.upper(),
                "Topic": topic.lower(),
                "Correct": correct,
                "Problem Name": problem_name,
            }
        ]
    )
    try:
        pred = model.predict(data=data)
        return pred.to_dict()
    except ValueError:
        return {"Error": "Invalid Topic Name"}
