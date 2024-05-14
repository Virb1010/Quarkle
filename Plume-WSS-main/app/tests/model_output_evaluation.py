import asyncio
import json
import sys
from pathlib import Path
from datetime import datetime
import argparse

sys.path.append(str(Path(__file__).resolve().parent))
sys.path.append(str(Path(__file__).resolve().parent.parent))
sys.path.append(str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv

load_dotenv(dotenv_path="../../local.env")

from AI.prompts import (
    quarkle_template,
    evaluation_message,
    evaluation_tool,
    evaluation_question_answer_template,
    closed_expression_model_template,
)
from service import StreamOpenAI, CallOpenAIFunction


async def test_brainstorm(
    user_input,
    use_pro_model,
    use_open_expression_model,
    model_name,
    websocket,
):
    quarkle_messages = [
        {
            "role": "system",
            "content": quarkle_template.format(
                context="Chapter 1:",
                closed_expression_model_instructions=closed_expression_model_template
                if use_open_expression_model
                else "",
                subscription_type="Pro" if use_pro_model else "Basic",
            ),
        },
        {"role": "user", "content": user_input},
    ]

    tokens_used_output, quarkle_reply = await StreamOpenAI(
        quarkle_messages,
        websocket,
        use_pro_model,
        use_open_expression_model,
        model_name,
    )

    return quarkle_reply


# Function to read questions from CSV
def read_questions_from_json(file_path="questions.json"):
    with open(file_path, "r") as f:
        questions = json.load(f)

    return questions.get("questions_list")


# Function to generate responses using brainstorm
async def generate_responses(questions, model_name):
    responses = []
    for question in questions:
        response = await test_brainstorm(
            question.get("question"), False, False, model_name, None
        )
        responses.append(response)
    return responses


# Function to evaluate responses using OpenAI Evaluation
async def evaluate_with_openai(questions, responses):
    evaluations = []
    for question, response in zip(questions, responses):
        messages = [
            {"role": "system", "content": evaluation_message},
        ]
        for sample_response in question.get("sample_responses"):
            messages.append(
                {
                    "role": "user",
                    "content": evaluation_question_answer_template.format(
                        question=question.get("question"),
                        response=sample_response.get("response"),
                    ),
                }
            )
            messages.append(
                {
                    "role": "function",
                    "name": "evaluate_question_response",
                    "content": json.dumps(sample_response.get("function")),
                }
            )

        messages.append(
            {
                "role": "user",
                "content": evaluation_question_answer_template.format(
                    question=question.get("question"),
                    response=response,
                ),
            },
        )

        evaluation = await CallOpenAIFunction(
            messages=messages,
            tools=[evaluation_tool],
            use_pro_model=False,
        )
        eval_dict = json.loads(evaluation.arguments)
        evaluations.append(eval_dict)

    return evaluations


def save_response(test_name, model_name, questions, responses, evaluations):
    # Get current date to create a folder for today's date
    date_str = datetime.now().strftime("%Y-%m-%d")
    time_str = datetime.now().strftime("%H-%M-%S")
    base_path = Path(f"results/{test_name}-{date_str}")

    # Create directory for today's date if it doesn't exist
    base_path.mkdir(parents=True, exist_ok=True)

    # Create a directory for the test_name, incrementing if it already exists
    file_name = f"{model_name}-evaluated_responses-{time_str}.json"
    file_path = base_path / file_name

    # Save the data in a JSON format
    data = [
        {
            "question": q.get("question"),
            "response": r,
            "score": e.get("score", 0),
            "reason": e.get("reason", ""),
        }
        for q, r, e in zip(questions, responses, evaluations)
    ]
    with open(file_path, "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)


# Main async function to process everything
async def main(args):
    # Read questions from CSV
    questions = read_questions_from_json()

    # Generate responses for each question
    responses = await generate_responses(questions, args.model_name)

    # Evaluate the responses
    evaluated_responses = await evaluate_with_openai(questions, responses)

    # Save responses with test name
    save_response(
        args.test_name, args.model_name, questions, responses, evaluated_responses
    )


# Argument parser setup
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
    asyncio.run(main(args))
