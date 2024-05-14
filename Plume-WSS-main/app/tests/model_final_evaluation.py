import os
import argparse

import json
import glob
import csv
from datetime import datetime


def read_json_files(directory):
    """Reads JSON files and returns a dictionary of models with their questions and scores."""
    all_data = {}
    for file_path in glob.glob(os.path.join(directory, "*.json")):
        with open(file_path, "r") as file:
            content = json.load(file)
            model_name = os.path.basename(file_path).split("-")[0]
            for entry in content:
                question = entry.get("question")
                score = entry.get("score")
                all_data.setdefault(model_name, []).append(
                    {"question": question, "score": score}
                )
    return all_data


def calculate_average_scores(model_data):
    """Calculates and returns the average score for each model."""
    average_scores = {}
    for model, q_and_s in model_data.items():
        total_score = sum(item["score"] for item in q_and_s)
        average_score = total_score / len(q_and_s) if q_and_s else 0
        average_scores[model] = average_score
    return average_scores


def write_to_csv(model_data, filename):
    """Writes the model data to a CSV file."""
    with open(filename, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["Model", "Question", "Score"])
        for model, q_and_s in model_data.items():
            for item in q_and_s:
                writer.writerow([model, item["question"], item["score"]])


def main(args):
    current_date = datetime.now().strftime("%Y-%m-%d")
    test_name = args.test_name
    results_path = f"results/{test_name}-{current_date}/"
    csv_file_path = (
        f"results/{test_name}-{current_date}/{test_name}-results-{current_date}.csv"
    )

    # Process the JSON files
    model_data = read_json_files(results_path)

    # Calculate average scores
    average_scores = calculate_average_scores(model_data)
    for model, avg_score in average_scores.items():
        print(f"Model: {model}, Average Score: {avg_score}")

    # Write to CSV
    write_to_csv(model_data, csv_file_path)
    print(f"Results saved to {csv_file_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test and Evaluate AI responses.")
    parser.add_argument("--test_name", type=str, required=True, help="Name of the test")
    args = parser.parse_args()

    main(args)
