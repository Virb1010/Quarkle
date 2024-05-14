#!/bin/bash

# Define variables
REGION="us-east-1"
ACCOUNT_ID="884237330161"
REPO_NAME="wss-repo"
IMAGE_NAME="quarkle-wss"
TAG="latest"
SERVICE_NAME="quarkle-wss-service"
CLUSTER_NAME="wss-app"

# Function to exit in case of an error
exit_on_error() {
    echo "Error: $1"
    exit 1
}

# Check if we're on main branch
if [ "$(git branch --show-current)" != "main" ]; then
    exit_on_error "You must be on the main branch to push to production."
fi

# Build the Docker image
docker build -t ${IMAGE_NAME}:${TAG} . || exit_on_error "Failed to build Docker image."

# Tag the Docker image for ECR
docker tag ${IMAGE_NAME}:${TAG} ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${REPO_NAME}:${TAG} || exit_on_error "Failed to tag Docker image."

# Authenticate to ECR
aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com || exit_on_error "Failed to authenticate to ECR."

# Push the image to ECR
docker push ${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${REPO_NAME}:${TAG} || exit_on_error "Failed to push Docker image to ECR."

echo "Docker image pushed to ECR successfully."

# Update the ECS service to use the latest container image
aws ecs update-service --cluster ${CLUSTER_NAME} --service ${SERVICE_NAME} --force-new-deployment --region ${REGION} --no-cli-pager > /dev/null || exit_on_error "Failed to force new ECS service deployment."

echo "ECS service updated and new deployment forced."