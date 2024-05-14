#!/bin/bash

# Define variables
IMAGE_NAME="quarkle-wss"
TAG="local"
DOCKERFILE="Dockerfile.local"
CONTAINER_NAME="quarkle_wss_server_local"
HOST_PORT=8765

# Function to stop the container
stop_container() {
    echo "Stopping container ${CONTAINER_NAME}..."
    docker stop ${CONTAINER_NAME}
    echo "Container ${CONTAINER_NAME} stopped."
    exit 0
}

# Function to build and run the container
build_and_run() {
    # Delete previous containers with the same name
    docker rm -f ${CONTAINER_NAME}
    echo "Previous container with the same name deleted."

    # Delete previous images with the same tag
    docker rmi $(docker images ${IMAGE_NAME}:${TAG} -q) 2> /dev/null
    echo "Previous image with the same tag deleted."

    # Build the new Docker image using Dockerfile.local
    docker build -f ${DOCKERFILE} -t ${IMAGE_NAME}:${TAG} .
    echo "Docker image built."

    # Check if the build was successful
    if [ $? -eq 0 ]; then
        echo "Docker image built successfully."
        # Run the Docker container
        docker run --cpus="1.0" --memory="3072m" --env-file local.env -p ${HOST_PORT}:443 --name ${CONTAINER_NAME} ${IMAGE_NAME}:${TAG}
    else
        echo "Failed to build Docker image."
        exit 1
    fi
}

# Function to start existing container and follow logs
start_existing_container() {
    since_time=$(date +"%Y-%m-%dT%H:%M:%S")

    echo "Starting existing container..."
    docker start ${CONTAINER_NAME}

    echo "Container ${CONTAINER_NAME} has started."
    echo "Following logs for ${CONTAINER_NAME}:"
    docker logs --follow --since ${since_time} ${CONTAINER_NAME}
}

# Main logic

# Setup SIGINT trap to stop the container when Ctrl+C is pressed
trap stop_container SIGINT

if [ "$1" == "-f" ]; then
    build_and_run
else
    if [ "$(docker ps -a -f name=${CONTAINER_NAME} --format "{{.Names}}")" == "${CONTAINER_NAME}" ]; then
        start_existing_container
    else
        echo "No existing container found. Building and running a new one."
        build_and_run
    fi
fi