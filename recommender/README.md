# Recommender Microservice

This folder houses the microservice scripts which will eventually be run on a cloud server to expose the necessary API endpoints for the recommendation system backed by a machine learning [Bayesian Knowledge Tracing (BKT)](https://en.wikipedia.org/wiki/Bayesian_Knowledge_Tracing "Bayesian Knowledge Tracing Wikipedia") model.

This microservice will be written entirely in Python as the BKT model used is also in Python. Additional machine learning features can also be easily added here due to Python's strong support for machine learning and data manipulation.

This allows the software's user-facing frontend and any additional backend to be handled and worked on separately and in a different tech stack.

## Environment Variables

**IMPORTANT:** Always ensure you have the `serviceAccountKey.json` file from your team and place it in this `/LeetNode/recommender` subfolder for Firebase to work. You can also get it from your Firebase console under `Project Overview > Project settings > Service accounts` after you are added into the Firebase project.

## Docker Setup (Recommended)

Follow the steps in the [root folder](../) to start all 3 Docker containers (Nginx, NextJS and Recommender) with the dev profile on [`http://localhost`](http://localhost).

```bash
docker compose --profile dev up --build --force-recreate
```

## Local Setup

### Dependencies

Install dependencies using either `pip` or `conda`:

```bash
git pull
cd recommender  # make sure you are in the /Leetnode/recommender subfolder
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
1.4.1 (Python/C++)
```

If the version printed includes `(Python)` instead, the fast C++ version failed to install. If so, please refer to the detailed installation steps in the [pyBKT's GitHub repository](https://github.com/CAHLR/pyBKT "A Python implementation of the Bayesian Knowledge Tracing algorithm").

### Start the FastAPI Server Locally

```bash
uvicorn main:app --reload
```

## API Documentation

After starting the server, if using Docker Compose, the API will be available on [`http://localhost/recommender/`](http://localhost/recommender/). Otherwise, if run locally, it will by default be on localhost port 8000: [`http://localhost:8000/`](http://localhost:8000/).

The auto-generated documentation can be found on [`http://localhost/recommender/docs`](http://localhost/recommender/docs) and [`http://localhost:8000/docs`](http://localhost:8000/docs) for Docker Compose and local modes respectively, where you can test out the APIs through a UI.
