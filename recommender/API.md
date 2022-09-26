# Recommender Microservice API

This API is available at: ```http://127.0.0.1:8000/```

## Add students

Adds students with given names for a skill.

- URL:
/add-student/:student_id/:skill

- METHOD:
```POST```

- URL Params:  
```
student_id = [str] # Multiple students separated by commas
skill = [str] # Only 1 skill
```

- Data Params:
None

- Success Response:  
    - Code: 200 OK  
    - Content:
```
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
/remove-student/:student_id/:skill

- METHOD:
```DELETE```

- URL Params:
```
student_id = [str] # Multiple students separated by commas
skill = [str] # Only 1 skill
```

- Data Params:
None

- Success Response:
    - Code: 200 OK
    - Content:
```
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
/get-mastery/:student_id/:skill

- METHOD:
```GET```

- URL Params:
```
student_id = [str] # Only 1 student
skill = [str] # Only 1 skill
```

- Data Params:
None

- Success Response:
    - Code: 200 OK
    - Content:
```
{
    "Mastery (voltage division principle)": 0.7930704584200629
}
```

- Error Response:

## Update state

Updates state of a particular student for a skill given one response.

- URL:
/update-state/:student_id/:skill/:correct

- METHOD:
```PATCH```

- URL Params:
```
student_id = [str] # Only 1 student
skill = [str] # Only 1 skill
```

- Data Params:
None

- Success Response:
    - Code: 200 OK
    - Content:
```
{
    "Updated": true,
    "Student ID": "A01",
    "Skill": "voltage division principle"
}
```

- Error Response:
