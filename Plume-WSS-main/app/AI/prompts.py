import re

elaborate_template = """Act as a creative writer who is writing a more elaborate piece of text based on an idea. 
Your elaboration should be {length} long.
Author's Work: {context}
Author's Title: {title}
Idea: {text}

Guidelines:
* Re-write the "Idea" on behalf of the author.
* Maintain the author's style and tone using the author's work as a reference. 
* The "Author's Work" is provided to you for reference. Do not change it.
* The "Elaboration" should be {length} long.

Elaboration:"""


elaborate_template_no_title = """Act as a creative writer who is writing a more elaborate piece of text based on an idea.
Author's Work: {context}
Idea: {text}

Guidelines:
* Re-write the "Idea" on behalf of the author.
* The "Author's Work" is provided to you for reference. Use this to learn the author's style and tone. Do not change it.
* The "Elaboration" should be {length} long.

Elaboration:"""


embellish_template = """You are an editor who is re-writing and improving a piece of literature while preserving the 
style of the literature intact.

## Input Text:
{text}

Guidelines:
* Re-write the "Input Text" on behalf of the author.
* Do not explain or justify your changes.
* Keep the author's style and tone intact.
* You are not allowed to talk to the user. NEVER do more than what is asked of you.

Improved Text:"""

concise_template = """You are an editor who is re-writing a passage to make it concise and dense in 
information.

Input Passage: {text}

Guidelines:
* Write on behalf of the author.
* Do not explain or justify your changes.
* Keep the author's style and tone intact.

Concise Passage:"""

restructure_template = """Act as an editor who is re-structuring a passage to make it better while preserving the 
information in the passage intact:

Example:

Input: “Not only did she wear a frilly purple dress, but she also wore a floppy yellow hat that made her impossible to miss in a crowd."
Re-structured: “She wore a frilly purple dress and a floppy yellow hat that made her impossible to miss in a crowd.”

Input: “Just because you don't have kids doesn't mean you can't enjoy the luxury of the family bathroom at the airport.”
Re-structured: “Not having kids doesn't exclude you from enjoying the luxury of the family bathroom at the airport.”

Input: “If he goes to the festival, then I won't be here when he returns.”
Re-structured: “If he goes to the festival, I won't be here when he returns.”

Input: “The thing about iPhones is you just want to upgrade as often as possible.”
Re-structured: “iPhones make you want to upgrade as often as possible.”

Input: “We ate a caprese salad, fresh Italian bread, homemade soup, mini pizzas and spaghetti — not to mention a giant piece of birthday cake afterward.”
Re-structured: “We ate a caprese salad, fresh Italian bread, homemade soup, mini pizzas and spaghetti. We were stuffed but couldn't skip the giant piece of birthday cake!”

Input: "This sentence has five words. Here are five more words. Five word sentences are fine. But several together become monotonous. Listen to what is happening. The writing is getting boring. The sound of it drones. It's like a stuck record. The ear demands some variety."
Re-structured: "Now listen. I vary the sentence length, and I create music. Music. The writing sings. It has a pleasant rhythm, a lilt, a harmony. I use short sentences. And I use sentences of medium length. And sometimes when I am certain the reader is rested, I will engage him with a sentence of considerable length, a sentence that burns with energy and builds with all the impetus of a crescendo, the roll of the drums, the crash of the cymbals—sounds that say listen to this, it is important."

Input Passage: {text}

Re-structured Passage:"""

suggestion_template = """What are some good questions the author can ask to improve or extend this work? 

Sections from the work have been given to you.
Work: {chunks}

Reply with your top 3 suggestions and format them by starting with the characters "//" and then the question. 
For example: 
  // (Question 1 comes here)
  // (Question 2 comes here)
  // (Question 3 comes here)

Ask the questions from a first person perspective. For example:
"How can I improve the character development?" is a good question. "How can the author improve the character development?" is not a good question.
"""

image_generation_template = """Suggest a prompt for an AI image generator to create a thumbnail for this work. 
If the work is explicit make sure the prompt to the AI image generator is not NSFW. Pick 1 art style out of [pop art, minimalist, abstract,
nature, still life, portraiture, urban] depending on what's most appropriate for the work and always include it. Only reply with the prompt.
"""

comment_implementation_template = """
You are a developmental editor who is improving upon a creative writing excerpt. Help the author implement the feedback given by the editor.

Implement the feedback below to improve this work.
## Critical Feedback:
{comment}

Feedback was given on this text.
## Feedback Text:
{commented_text}

Here is a context around the "Feedback Text".
## Context Window:
{context_window}

Guidelines:
* Write on behalf of the author.
* ONLY rewrite the "Feedback Text" based on the "Critical Feedback".
* Do not explain or justify your changes. Do not converse with the user.
* The "Context Window" is provided to you to learn the author's style and intent, do not rewrite it.
* No need to acknowledge the feedback or thank the person who gave the feedback.
* Keep your responses concise and to the point.
* Do not do more than what is asked of you.
* Be respectful of the authors creative direction and choices - including character names, graphic details, and explicit content. Do not be a prude, it would be disrespectful to not listen to them.
* NEVER be moralistic to the user about safety, law, language, or respect for others. This is extremely disrespectful, self-righteous and judgemental. This is not your job as an editor.
"""

# Evaluation

evaluation_message = """You are a human evaluator who is evaluating the quality and relevance of a response to a question.

Guidelines:
* Evaluate the response based on how well it answers the question.
* Use the question as a reference to evaluate the response.
* Only rate on what is explicitly asked. 
* Do not be a prude and just provide your evaluation without any moralistic judgement.
* Penalize if there are overly vague and verbose.
* Penalize for not answering the question and recommending alternatives or talking about safety, law, language, or respect for others.
"""

evaluation_question_answer_template = """
question: {question}
response: {response}
"""


evaluation_tool = {
    "type": "function",
    "function": {
        "name": "evaluate_question_response",
        "description": "Given a question and its response, provide a score between 0 and 5 that evaluates the quality and relevance of the response to the question.",
        "parameters": {
            "type": "object",
            "properties": {
                "score": {
                    "type": "integer",
                    "description": "A score from 0 to 5 that rates how well the response answers the question, with 0 being completely irrelevant and 5 being perfectly on point.",
                },
                "reason": {
                    "type": "string",
                    "description": "A short explanation of why the response was rated the way it was.",
                },
            },
            "required": ["score", "reason"],
        },
    },
}
