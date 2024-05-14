import os
import argparse
import asyncio
import json
import glob
import csv
from datetime import datetime
import sys
from pathlib import Path


sys.path.append(str(Path(__file__).resolve().parent))
sys.path.append(str(Path(__file__).resolve().parent.parent))
sys.path.append(str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv

load_dotenv(dotenv_path="../../local.env")

from AI.eval_prompts import (
    evaluation_message,
    evaluation_question_template,
    evaluation_answer_template,
    evaluation_tool,
)
from service import StreamOpenAI, CallOpenAIFunction


# def read_json_files(directory):
#     """Reads JSON files and returns a dictionary with batch as keys, then questions, and then a list of model responses."""
#     all_data = {}
#     batch_counter = 1  # Initialize a batch counter

#     for file_path in glob.glob(os.path.join(directory, "*.json")):
#         with open(file_path, "r") as file:
#             content = json.load(file)
#             model_name = os.path.basename(file_path).split("-")[0]
#             batch_name = (
#                 f"batch_{batch_counter}"  # Assign a batch name using the counter
#             )
#             for entry in content:
#                 question = entry.get("question")
#                 response = entry.get("response")
#                 if batch_name not in all_data:
#                     all_data[batch_name] = {}
#                 if question not in all_data[batch_name]:
#                     all_data[batch_name][question] = {}
#                 if model_name not in all_data[batch_name][question]:
#                     all_data[batch_name][question][model_name] = []
#                 all_data[batch_name][question][model_name].append(response)

#         batch_counter += 1  # Increment the batch counter for the next file

#     return all_data


def read_json_files(directory):
    """Reads JSON files and returns a dictionary with batch as keys, then questions, and then a list of model responses."""
    all_data = {}
    batch_counter = 1  # Initialize a batch counter

    for file_path in glob.glob(os.path.join(directory, "*.json")):
        with open(file_path, "r") as file:
            content = json.load(file)
            model_name = os.path.basename(file_path).split("-")[0]

            for entry in content:
                question = entry.get("question")
                response = entry.get("response")

                # Find the right batch for this question-model combination
                batch_name = f"batch_{batch_counter}"
                while (
                    batch_name in all_data
                    and question in all_data[batch_name]
                    and model_name in all_data[batch_name][question]
                ):
                    batch_counter += 1
                    batch_name = f"batch_{batch_counter}"

                # Initialize the data structure if needed
                if batch_name not in all_data:
                    all_data[batch_name] = {}
                if question not in all_data[batch_name]:
                    all_data[batch_name][question] = {}
                if model_name not in all_data[batch_name][question]:
                    # all_data[batch_name][question][model_name] = []
                    all_data[batch_name][question][model_name] = response

                # Reset the batch counter for the next file
                batch_counter = 1

    return all_data


def add_sample_responses(questions_list, messages, question):
    # Find the question in the sample questions list and add sample answers
    for sample_question in questions_list:
        if sample_question["question"] == question:
            sample_question_template = evaluation_question_template.format(
                question=question
            )
            # Assuming you want to add all responses to the messages
            for i in range(1, len(sample_question)):
                response_key = f"response_{i}"
                if response_key in sample_question:
                    sample_answer_template = evaluation_answer_template.format(
                        n=i, response=sample_question[response_key]
                    )
                    sample_question_template += sample_answer_template
            break

    messages.append(
        {
            "role": "user",
            "content": sample_question_template,
        },
    )

    messages.append(
        {
            "role": "function",
            "name": "rate_question_responses",
            "content": json.dumps(sample_question.get("function")),
        }
    )


def calculate_average_scores(final_evaluations):
    """Calculates and prints the average score for each model per batch and returns the overall average score for each model."""
    average_scores = {}
    batch_scores = {}  # To keep track of batch-wise scores

    for batch, models in final_evaluations.items():
        batch_scores[batch] = {}
        for model, responses in models.items():
            if model not in average_scores:
                average_scores[model] = []
            if model not in batch_scores[batch]:
                batch_scores[batch][model] = []
            # Extract scores from the list of response dictionaries
            scores = [response["score"] for response in responses]
            average_scores[model].extend(scores)
            batch_scores[batch][model].extend(scores)

        # Print the average score per batch for each model
        print(f"Batch: {batch}")
        for model, scores in batch_scores[batch].items():
            batch_average = sum(scores) / len(scores) if scores else 0
            print(f"Model: {model}, Batch Average Score: {batch_average}")

    # Calculate the overall average for each model
    print("Final Average Scores:")
    for model, scores in average_scores.items():
        average_scores[model] = sum(scores) / len(scores) if scores else 0
        print(f"Model: {model}, Average Score: {average_scores[model]}")

    return average_scores


async def evaluate_with_openai(all_model_responses, questions_list):
    """Evaluates the responses using OpenAI's evaluation tool."""

    final_evaluations = {}

    for batch_name, questions in all_model_responses.items():
        print(f"\n\n Batch: {batch_name}")
        for question, model_responses in questions.items():
            messages = [
                {"role": "system", "content": evaluation_message},
            ]

            add_sample_responses(questions_list, messages, question)

            question_answer_template = evaluation_question_template.format(
                question=question
            )

            # Sort the model names and create a mapping from index to model name
            sorted_model_names = sorted(model_responses.keys())
            index_to_model_name = {
                index + 1: model for index, model in enumerate(sorted_model_names)
            }
            index_to_response = {
                index + 1: model_responses[model]
                for index, model in enumerate(sorted_model_names)
            }

            for index, response in index_to_response.items():
                answer_template = evaluation_answer_template.format(
                    n=index, response=response
                )
                question_answer_template += answer_template

            messages.append(
                {
                    "role": "user",
                    "content": question_answer_template,
                },
            )

            # print(messages)

            received_appropriate_response = False
            while not received_appropriate_response:
                evaluation = await CallOpenAIFunction(
                    messages=messages,
                    tools=[evaluation_tool],
                    use_pro_model=False,
                )
                print(evaluation)
                eval_dict = json.loads(evaluation.arguments)
                if len(eval_dict.get("score")) == len(index_to_response):
                    received_appropriate_response = True

            # Add the evaluations to the final evaluations dictionary
            for index, score in enumerate(eval_dict.get("score")):
                model_name = index_to_model_name[index + 1]
                final_evaluations.setdefault(batch_name, {}).setdefault(
                    model_name, []
                ).append(
                    {
                        "question": question,
                        "score": score,
                        "response": index_to_response[index + 1],
                    }
                )

    # Calculate average scores
    average_scores = calculate_average_scores(final_evaluations)

    return final_evaluations, index_to_model_name


def read_questions_from_json(file_path="questions_compare.json"):
    with open(file_path, "r") as f:
        questions = json.load(f)

    return questions.get("questions_list")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test and Evaluate AI responses.")
    parser.add_argument("--test_name", type=str, required=True, help="Name of the test")
    parser.add_argument(
        "--model_name",
        type=str,
        default=None,
        help="Model name to use for generation",
    )

    args = parser.parse_args()
    test_name = args.test_name

    current_date = datetime.now().strftime("%Y-%m-%d")
    results_path = f"results/{test_name}-{current_date}/"
    all_model_responses = read_json_files(results_path)
    questions_list = read_questions_from_json()

    print(all_model_responses)

    # Evaluate the responses
    final_evaluation, index_to_model_name = asyncio.run(
        evaluate_with_openai(all_model_responses, questions_list)
    )

    # Write the responses to a CSV file
    csv_file_path = (
        f"results/{test_name}-{current_date}/{test_name}-results-{current_date}.csv"
    )
    with open(csv_file_path, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["Batch", "Model", "Question", "Score", "Response"])
        for batch, models in final_evaluation.items():
            for model, responses in models.items():
                for (
                    response_data
                ) in responses:  # responses is a list, so iterate directly over it
                    writer.writerow(
                        [
                            batch,
                            model,
                            response_data["question"],
                            response_data["score"],
                            response_data["response"],
                        ]
                    )
