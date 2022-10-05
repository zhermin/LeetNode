# Recommender Microservice

This folder houses the microservice scripts which will eventually be run on a cloud server to expose the necessary API endpoints for the recommendation system backed by a machine learning [Bayesian Knowledge Tracing (BKT)](https://en.wikipedia.org/wiki/Bayesian_Knowledge_Tracing "Bayesian Knowledge Tracing Wikipedia") model. 

This microservice will be written entirely in Python as the BKT model used is also in Python. Additional machine learning features can also be easily added here due to Python's strong support for machine learning and data manipulation. 

This allows the software's user-facing frontend and any additional backend to be handled and worked on separately and in a different tech stack. 

## Setup

### Installation

Install dependencies using either `pip` or `conda`:
```bash
$ cd recommender
$ pip install -r requirements.txt
```

### pyBKT Local Installation

Note that for pyBKT, the fast C++ version is only available on Linux or Mac. For Windows, operate in WSL to mimic a Linux environment, otherwise it will default to the slow Python version. 

#### Linux/WSL

```bash
$ sudo apt install gcc g++
```

#### Mac

```bash
$ brew install libomp
```

#### Install and Check pyBKT Version

```bash
$ pip install pybkt
$ python
>>> import pyBKT
>>> print(pyBKT.version)
1.4 (Python/C++)
```

If the version printed is `1.4 (Python)` instead, the fast C++ version failed to install. If so, please refer to the detailed installation steps in the [pyBKT's GitHub repository](https://github.com/CAHLR/pyBKT "A Python implementation of the Bayesian Knowledge Tracing algorithm"). 

### Starting the FastAPI Server Locally

```bash
$ uvicorn main:app --reload
```

## Recommender Microservice API

This API is available at: `http://127.0.0.1:8000/`

### Add students

Adds students with given names for a skill.

- URL: `/add-student/:student_id/:skill`

- METHOD: `POST`

- URL Params:  
```python
student_id = [str] # Multiple students separated by commas
skill = [str] # Only 1 skill
```

- Data Params: `None`

- Success Response:  
    - Code: `200 OK`
    - Content:
```json
{
    "Created": true,
    "Student ID": [
        "A01",
        "A02"
    ],
    "Skills": "voltage division principle"
}
```

- Error Response:
  - Code: `422 UNPROCESSABLE ENTITY`
  - Content:
```json
{
    "detail": "Invalid skill name"
}
```
OR
  - Code: `422 UNPROCESSABLE ENTITY`
  - Content:
```json
{
    "detail": "Data already exists"

}
```


### Remove students

Removes students with given names for a skill.

- URL: `/remove-student/:student_id/:skill`

- METHOD: `DELETE`

- URL Params:
```python
student_id = [str] # Multiple students separated by commas
skill = [str] # Only 1 skill
```

- Data Params: `None`

- Success Response:
    - Code: `200 OK`
    - Content:
```json
{
    "Deleted": true,
    "Student ID": [
        "A01",
        "A02"
    ],
    "Skills": "voltage division principle"
}
```

- Error Response:
  - Code: `422 UNPROCESSABLE ENTITY`
  - Content:
```json
{
    "detail": "Invalid skill name"
}
```
OR
  - Code: `422 UNPROCESSABLE ENTITY`
  - Content:
```json
{
    "detail": "Student ID ['A01', 'A02'] does NOT exists"
}
```

### Get mastery

Fetches mastery probability for a particular student for a skill.

- URL: `/get-mastery/:student_id/:skill`

- METHOD: `GET`

- URL Params:
```python
student_id = [str] # Only 1 student
skill = [str] # Only 1 skill
```

- Data Params: `None`

- Success Response:
    - Code: `200 OK`
    - Content:
```json
{
    "Mastery (voltage division principle)": 0.7930704584200629
}
```

- Error Response:
  - Code: `422 UNPROCESSABLE ENTITY`
  - Content:
```json
{
    "detail": "Invalid skill name"
}
```
OR
  - Code: `422 UNPROCESSABLE ENTITY`
  - Content:
```json
{
    "detail": "Student ID A01 does NOT exists"
}
```

### Update state

Updates state of a particular student for a skill given one response.

- URL: `/update-state/:student_id/:skill/:correct`

- METHOD: `PATCH`

- URL Params:
```python
student_id = [str] # Only 1 student
skill = [str] # Only 1 skill
corrrect = [str] # String should be binary
```

- Data Params: `None`

- Success Response:
    - Code: `200 OK`
    - Content:
```json
{
    "Updated": true,
    "Student ID": "A01",
    "Skill": "voltage division principle"
}
```

- Error Response:
  - Code: `422 UNPROCESSABLE ENTITY`
  - Content:
```json
{
    "detail": "Invalid skill name"
}
```
OR
  - Code: `422 UNPROCESSABLE ENTITY`
  - Content:
```json
{
    "detail": "Student ID A01 does NOT exists"
}
```
OR
  - Code: `422 UNPROCESSABLE ENTITY`
  - Content:
```json
{
    "detail": "Missing / Incorrect argument. Please ensure that the last agrument is a binary string."
}
```

## PICs

- [Jasmine](#)
- [Angelina](#)