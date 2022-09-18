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

## PICs

- [Jasmine](#)
- [Angelina](#)