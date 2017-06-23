FROM tiangolo/uwsgi-nginx-flask:flask-python3.5
COPY ./flask_app /app
COPY requirements.txt /app
WORKDIR /app
RUN pip3 install -r ./requirements.txt
