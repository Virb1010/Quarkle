# Use an official Python runtime as a parent image
FROM python:3.10

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY app/ .
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install -r requirements.txt && rm requirements.txt

# Make port 443 available to the world outside this container
EXPOSE 443

# Run app.py when the container launches
CMD ["python", "./app.py"]