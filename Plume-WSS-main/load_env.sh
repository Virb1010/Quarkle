#!/bin/bash

# Load environment variables from .env file
while IFS= read -r line; do
    # Ignore comments
    if [[ "$line" =~ ^\# ]]; then
        continue
    fi
    # Ignore lines that do not include '='
    if [[ "$line" == *'='* ]]; then
        # Use eval to correctly handle variable values with spaces
        eval "export $line"
    fi
done < .env

# Optional: Print all loaded variables for verification
echo "TOGETHER_API_KEY=$TOGETHER_API_KEY"
echo "AUTH0_DOMAIN=$AUTH0_DOMAIN"
