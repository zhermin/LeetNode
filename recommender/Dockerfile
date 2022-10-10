FROM python:3.10.4-slim

ENV APP_HOME /app
WORKDIR $APP_HOME

COPY ./requirements.txt ./
COPY ./gunicorn_config.py ./

RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY ./model-custom.pkl ./
COPY ./main.py ./

CMD gunicorn main:app -c gunicorn_config.py