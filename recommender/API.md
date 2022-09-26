# Recommender Microservice API

This API is available at: ```bash
http://127.0.0.1:8000/
```

## Add students

Adds students with given names for a skill.

- URL:
⇥ /add-student/:student_id/:skill

- METHOD:
⇥ ```bash
POST
```

- URL Params:
⇥ ```bash
student_id = [str] # Multiple students separated by commas
skill = [str] # Only 1 skill
```

- Data Params:
⇥ None

- Success Response:
⇥ Code: 200 OK
⇥ Content:
```bash
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


## Remove students

Removes students with given names for a skill.

- URL:
⇥ /remove-student/:student_id/:skill

- METHOD:
⇥ ```bash
DELETE
```

- URL Params:
⇥ ```bash
student_id = [str] # Multiple students separated by commas
skill = [str] # Only 1 skill
```

- Data Params:
⇥ None

- Success Response:
⇥ Code: 200 OK
⇥ Content:
```bash
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

## Get mastery

Fetches mastery probability for a particular student for a skill.

- URL:
⇥ /get-mastery/:student_id/:skill

- METHOD:
⇥ ```bash
GET
```

- URL Params:
⇥ ```bash
student_id = [str] # Only 1 student
skill = [str] # Only 1 skill
```

- Data Params:
⇥ None

- Success Response:
⇥ Code: 200 OK
⇥ Content:
```bash
{
    "Mastery (voltage division principle)": 0.7930704584200629
}
```

- Error Response:

## Update state

Updates state of a particular student for a skill given one response.

- URL:
⇥ /update-state/:student_id/:skill/:correct

- METHOD:
⇥ ```bash
PATCH
```

- URL Params:
⇥ ```bash
student_id = [str] # Only 1 student
skill = [str] # Only 1 skill
```

- Data Params:
⇥ None

- Success Response:
⇥ Code: 200 OK
⇥ Content:
```bash
{
    "Updated": true,
    "Student ID": "A01",
    "Skill": "voltage division principle"
}
```

- Error Response: