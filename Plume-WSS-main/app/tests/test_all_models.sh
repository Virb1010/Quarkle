#!/bin/bash

# Prompt the user for a test name or use a default
read -p "Enter the test name (Press enter for 'comprehensive_test'): " test_name
test_name=${test_name:-comprehensive_test}

# Define the models to test
declare -a models=("Mixtral" "OpenHermes" "ChronosHermes")

# Navigate to the directory containing the Python script
cd app/tests

# Run the test for each model
for model in "${models[@]}"
do
    echo "Running test for $model... \n"
    # python model_output_evaluation.py --test_name "$test_name" --model_name "$model"
    python model_multi_output.py --test_name "$test_name" --model_name "$model"
done

echo "All model results saved completed.\n"

# After running individual tests, perform the final evaluation
echo "Running final evaluation..."
python model_multi_batch_eval.py --test_name "$test_name"

echo "All tests and final evaluation completed."
