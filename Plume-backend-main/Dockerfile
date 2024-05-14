# Use an official Python runtime as a parent image
FROM python:3.9

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY ./app .
COPY ./requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install -r requirements.txt && rm requirements.txt

# Make port 443 available to the world outside this container
EXPOSE 443

# Run app.py when the container launches. Logging format is [time] [pid] [method] [url] --> [status] in [time_taken]
CMD ["gunicorn", \
    "--worker-class", "gevent", \
    "--workers", "3", \
    "--timeout", "120", \
    "--bind", "0.0.0.0:443", \
    "--access-logfile", "-", "--access-logformat", "%(t)s %(p)s %(m)s %(U)s --> %(s)s in %(T)ss", \
    "app:app"]