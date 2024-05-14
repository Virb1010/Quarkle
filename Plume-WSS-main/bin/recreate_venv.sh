#!/bin/bash

# Define the virtual environment directory
VENV_DIR="venv"

# Check if the virtual environment directory exists and remove it
if [ -d "$VENV_DIR" ]; then
    echo "Removing existing virtual environment..."
    rm -rf "$VENV_DIR"
fi

# Create a new virtual environment
echo "Creating new virtual environment..."
python3 -m venv "$VENV_DIR"

# Activate the virtual environment
source "$VENV_DIR/bin/activate"

# Install requirements from requirements.txt
echo "Installing packages from requirements.txt..."
pip install -r requirements.txt

# Deactivate the virtual environment
deactivate

echo "Virtual environment recreated and packages installed."