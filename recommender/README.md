# Recommender Microservice

This folder houses the microservice scripts which will eventually be run on a cloud server to expose the necessary API endpoints for the recommendation system backed by a machine learning [Bayesian Knowledge Tracing (BKT)](https://en.wikipedia.org/wiki/Bayesian_Knowledge_Tracing "Bayesian Knowledge Tracing Wikipedia") model.

This microservice will be written entirely in Python as the BKT model used is also in Python. Additional machine learning features can also be easily added here due to Python's strong support for machine learning and data manipulation.

This allows the software's user-facing frontend and any additional backend to be handled and worked on separately and in a different tech stack.

## Setup

### Installation

Install dependencies using either `pip` or `conda`:

```bash
cd recommender
pip install -r requirements.txt
```

### pyBKT Local Installation

Note that for pyBKT, the fast C++ version is only available on Linux or Mac. For Windows, operate in WSL to mimic a Linux environment, otherwise it will default to the slow Python version.

#### Linux/WSL

```bash
sudo apt install gcc g++
```

#### Mac

```bash
brew install libomp
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
uvicorn main:app --reload
```

## Recommender Microservice API

This API is available at: `http://127.0.0.1:8000/`

### 1. Add students

Adds students with given names for a topic.

#### 1.1 URL

`/add-student/:student_id/:topic`

#### 1.2 METHOD

`POST`

#### 1.3 URL Params

```python
student_id = [str] # Multiple students separated by commas
topic = [str] # Only 1 topic
```

#### 1.4 Data Params

`None`

#### 1.5 Success Response

Code: `200 OK`

Content:

```json
{
    "Created": true
}
```

#### 1.6 Error Response

Code: `422 UNPROCESSABLE ENTITY`

Content:

```json
{
    "detail": "Invalid topic name"
}
```

OR

Code: `422 UNPROCESSABLE ENTITY`

Content:

```json
{
    "detail": "Data already exists"

}
```

### 2. Remove students

Removes students with given names for a topic.

#### 2.1 URL

`/remove-student/:student_id/:topic`

#### 2.2 METHOD

`DELETE`

#### 2.3 URL Params

```python
student_id = [str] # Multiple students separated by commas
topic = [str] # Only 1 topic
```

#### 2.4 Data Params

`None`

#### 2.5 Success Response

Code: `200 OK`

Content:

```json
{
    "Deleted": true
}
```

#### 2.6 Error Response

Code: `422 UNPROCESSABLE ENTITY`

Content:
  
```json
{
    "detail": "Invalid topic name"
}
```

OR

Code: `422 UNPROCESSABLE ENTITY`

Content:

```json
{
    "detail": "Student ID ['A01', 'A02'] does NOT exists"
}
```

### 3. Get mastery

Fetches mastery probability for a particular student for a topic.

#### 3.1 URL

`/get-mastery/:student_id/:topic`

#### 3.2 METHOD

`GET`

#### 3.3 URL Params

```python
student_id = [str] # Only 1 student
topic = [str] # Only 1 topic
```

#### 3.4 Data Params

`None`

#### 3.5 Success Response

Code: `200 OK`

Content:

```json
{
    "Mastery": 0.7930704584200629
}
```

#### 3.6 Error Response

Code: `422 UNPROCESSABLE ENTITY`

Content:

```json
{
    "detail": "Invalid topic name"
}
```

OR

Code: `422 UNPROCESSABLE ENTITY`

Content:
  
```json
{
    "detail": "Student ID A01 does NOT exists"
}
```

### 4. Update state

Updates state of a particular student for a topic given one response.

#### 4.1 URL

`/update-state/:student_id/:topic/:correct`

#### 4.2 METHOD

`PATCH`

#### 4.3 URL Params

```python
student_id = [str] # Only 1 student
topic = [str] # Only 1 topic
corrrect = [str] # String should be binary
```

#### 4.4 Data Params

`None`

#### 4.5 Success Response

Code: `200 OK`

Content:

```json
{
    "Updated": true
}
```

#### 4.6 Error Response

Code: `422 UNPROCESSABLE ENTITY`

Content:

```json
{
    "detail": "Invalid topic name"
}
```

OR

Code: `422 UNPROCESSABLE ENTITY`

Content:
  
```json
{
    "detail": "Student ID A01 does NOT exists"
}
```

OR

Code: `422 UNPROCESSABLE ENTITY`

Content:

```json
{
    "detail": "Missing / Incorrect argument. Please ensure that the last agrument is a binary string."
}
```

### 5. Save roster

Saves the Roster model to storage. Uses Python pickles.

#### 5.1 URL

`/save-roster`

#### 5.2 METHOD

`POST`

#### 5.3 URL Params

`None`

#### 5.4 Data Params

`None`

#### 5.5 Success Response

Code: `200 OK`

Content:

```json
null
```

#### 5.6 Error Response

`None`

## PICs

- [Jasmine](#)
- [Angelina](#)
