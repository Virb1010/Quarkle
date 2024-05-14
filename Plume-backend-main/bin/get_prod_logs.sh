#!/bin/bash

# Define variables
LOG_GROUP_NAME="/ecs/quarkle-backend-task" # Replace with your actual log group name
TIME_RANGE="5m" # Default time range

# Check for -t argument and update TIME_RANGE if provided
while getopts "t:" opt; do
  case $opt in
    t) TIME_RANGE="${OPTARG}" ;;
    \?) echo "Usage: cmd [-t]" ;;
  esac
done

aws logs tail --follow ${LOG_GROUP_NAME} --format short --since ${TIME_RANGE}