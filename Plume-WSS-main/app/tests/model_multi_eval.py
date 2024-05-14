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


def read_json_files(directory):
    """Reads JSON files and returns a dictionary with questions as keys and a dictionary of model responses as values."""
    all_data = {}
    for file_path in glob.glob(os.path.join(directory, "*.json")):
        with open(file_path, "r") as file:
            content = json.load(file)
            model_name = os.path.basename(file_path).split("-")[0]
            for entry in content:
                question = entry.get("question")
                response = entry.get("response")
                if question not in all_data:
                    all_data[question] = {}
                all_data[question][model_name] = response
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


def calculate_average_scores(model_data):
    """Calculates and returns the average score for each model."""
    average_scores = {}
    for model, q_and_s in model_data.items():
        total_score = sum(item["score"] for item in q_and_s)
        average_score = total_score / len(q_and_s) if q_and_s else 0
        average_scores[model] = average_score
    return average_scores


async def evaluate_with_openai(all_model_responses, questions_list):
    """Evaluates the responses using OpenAI's evaluation tool."""

    index_to_model_name = None
    final_evaluations = {}

    for question, model_responses in all_model_responses.items():
        messages = [
            {"role": "system", "content": evaluation_message},
        ]

        # if question in questions_list:
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

        received_appropriate_response = False
        while not received_appropriate_response:
            evaluation = await CallOpenAIFunction(
                messages=messages,
                tools=[evaluation_tool],
                use_pro_model=False,
            )
            eval_dict = json.loads(evaluation.arguments)
            if len(eval_dict.get("score")) == len(index_to_response):
                received_appropriate_response = True

        print(eval_dict)
        print(index_to_model_name)

        # Add the evaluations to the final evaluations dictionary
        for index, score in enumerate(eval_dict.get("score")):
            model_name = index_to_model_name[index + 1]
            final_evaluations.setdefault(model_name, []).append(
                {
                    "question": question,
                    "score": score,
                    "response": index_to_response[index + 1],
                }
            )

    # Calculate average scores
    average_scores = calculate_average_scores(final_evaluations)
    for model, avg_score in average_scores.items():
        print(f"Model: {model}, Average Score: {avg_score}")

    return final_evaluations, index_to_model_name


def read_questions_from_json(file_path="questions_compare.json"):
    with open(file_path, "r") as f:
        questions = json.load(f)

    return questions.get("questions_list")


if __name__ == "__main__":
    current_date = datetime.now().strftime("%Y-%m-%d")
    test_name = "comprehensive_test"
    results_path = f"results/{test_name}-{current_date}/"
    all_model_responses = read_json_files(results_path)
    questions_list = read_questions_from_json()

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
        writer.writerow(["Model", "Question", "Score", "Response"])
        for model, q_and_s in final_evaluation.items():
            for item in q_and_s:
                writer.writerow(
                    [model, item["question"], item["score"], item["response"]]
                )
