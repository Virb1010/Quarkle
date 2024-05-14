import json
from typing import List
import openai
from langchain import PromptTemplate
from .AI_helper import (
    OPENAI_API_KEY,
    get_openai_model_name,
)
from openai import OpenAI

Client = OpenAI()

NO_TEXT_ERROR = "No text for Quarkle to read"

system_prompt = """Act as a creative writing editor who is improving upon a creative writing excerpt. Offer actionable feedback to the author 
    to improve their work. Make specific references to the text while doing so and keep your actionable feedback brief and to the point. Only point out 
    the most important changes."""


def prompt_builder(prompt_template: PromptTemplate, input) -> str:
    return prompt_template.format(post=input)


def provide_editorial_report(text: str, use_pro_model: bool = False):
    prompt_template = report_prompt_template_builder()

    model = get_openai_model_name(use_pro_model)

    print(f"********** USING MODEL {model} **********")

    prompt = prompt_builder(prompt_template, text)
    print(prompt)
    response = Client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
    )
    summary_and_critic = response.choices[0].message.content
    node = nodeAnalysis(summary_and_critic, 1)

    return node


def report_prompt_template_builder() -> PromptTemplate:
    template = """Act as a literary critic for the excerpt below. Give the text a summary and provide it with constructive 
    criticism along with an honest rating so that the author can improve it. Provide 3 strengths and 3 areas of improvement
    with quotes and examples for the text. Adhere to the format out of output and do not deviate from it.
    Text: {post}

    Summary:

    Strengths:
    1.
    2.
    3.

    Areas of Improvement: 
    1. 
    2.
    3.

    Constructive Criticism(200 words):
    """

    prompt_template = PromptTemplate(
        input_variables=["post"],
        template=template,
    )
    return prompt_template


class nodeAnalysis:
    def __init__(self, text, id):
        print(text)
        summary_start = text.find("Summary:") + len("Summary:")
        summary_end = text.find("Strengths:")

        strengths_start = summary_end + len("Strengths:")
        strengths_end = text.find("Areas of Improvement:")

        areas_of_improvement_start = strengths_end + len("Areas of Improvement:")
        areas_of_improvement_end = text.find("Constructive Criticism:")

        criticism_start = areas_of_improvement_end + len("Constructive Criticism:")
        criticism_end = text.find("Rating:")
        rating_start = criticism_end + len("Rating:")
        rating_end = text.find("/10")

        summary = text[summary_start:summary_end]

        strengths = text[strengths_start:strengths_end]
        print(strengths)
        strengths_1_idx = strengths.find("1.")
        strengths_2_idx = strengths.find("2.")
        strengths_3_idx = strengths.find("3.")
        strength_1 = strengths[strengths_1_idx + len("1.") : strengths_2_idx]
        strength_2 = strengths[strengths_2_idx + len("2.") : strengths_3_idx]
        strength_3 = strengths[strengths_3_idx + len("3.") : strengths_end]

        aoi = text[areas_of_improvement_start:areas_of_improvement_end]
        print(aoi)
        aoi_1_idx = aoi.find("1.")
        aoi_2_idx = aoi.find("2.")
        aoi_3_idx = aoi.find("3.")
        aoi_1 = aoi[aoi_1_idx + len("1.") : aoi_2_idx]
        aoi_2 = aoi[aoi_2_idx + len("2.") : aoi_3_idx]
        aoi_3 = aoi[aoi_3_idx + len("3.") : areas_of_improvement_end]

        criticism = text[criticism_start:criticism_end]
        rating = text[rating_start:rating_end]

        # print(summary)
        # print(criticism)
        # print(strength_1)
        # print(aoi_1)
        # print(rating)

        self.chunk_id = id
        self.summary = summary
        self.criticism = criticism
        self.strength1 = strength_1
        self.strength2 = strength_2
        self.strength3 = strength_3
        self.aoi1 = aoi_1
        self.aoi2 = aoi_2
        self.aoi3 = aoi_3
        self.rating = rating
        self.left = None
        self.right = None
