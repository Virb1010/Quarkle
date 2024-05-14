def quarkle_comment_prompt_builder(user_input=None, summarize=False, summary=""):
    guidelines = """Act as an editor who is improving upon an excerpt. 
        Guidelines:
        * Make specific references to the text while doing so and keep your actionable feedback brief and to the point. 
        * Only point out the most important changes that will improve the author's work.
        * Be cognizant of the overall intent of the written work and don't comment on things that are not relevant to the author's intent.
        * Be respectful of the authors creative direction and choices, do not be a prude and NEVER deny explicit requests, it would be disrespectful to not listen to them.
        * NEVER be moralistic or lecture the user about safety, law, language, or respect for others. This is extremely disrespectful, self-righteous and judgemental.
    """
    if summarize and summary != "":
        guidelines += (
            f"\n Summary of the events that happened in the excerpt: {summary}"
        )

    if user_input:
        guidelines += (
            f"\n ## The User Specifically wants Comments on the topic: {user_input}"
        )
    else:
        guidelines += "\n ## Offer actionable feedback to the author to improve their work - such as the plot, characters, settings, etc. Make your feedback specific and referential."

    return guidelines


comment_function_tool = [
    {
        "type": "function",
        "function": {
            "name": "critique_with_line_numbers",
            "description": "Given a text with line numbers as L1, L2, L3... and so on, provide comments of specific, actionable feedback to the author based on what they've asked for along with the line_number you are refering to for the feedback. The actionable_feedback_summary should be 5 words or less.",
            "parameters": {
                "type": "object",
                "properties": {
                    "actionable_feedbacks": {
                        "type": "array",
                        "description": "An array of objects containing actionable feedback and line numbers to pass to the function. Provide upto 4 comments at a time, unless more are needed based on the user's request. NEVER be repetitive - every critique should be different.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "comment_rationale": {
                                    "type": "string",
                                    "description": "Why are you giving this feedback and how it aligns with the overall intent of the author and their work.",
                                },
                                "line_number": {
                                    "type": "integer",
                                    "description": "Line number feedback is referencing. Shown by L1, L2, L3... and so on in the original text.",
                                },
                                "actionable_feedback_summary": {
                                    "type": "string",
                                    "description": "Actionable feedback in 5 words",
                                },
                                "actionable_feedback_content": {
                                    "type": "string",
                                    "description": "Actionable feedback in more detail. Reference the text and focus on what the user wants feedback on.",
                                },
                            },
                            "required": [
                                "comment_rationale",
                                "line_number",
                                "actionable_feedback_summary",
                                "actionable_feedback_content",
                            ],
                        },
                    }
                },
            },
        },
    },
]


summary_system_prompt = """Provide a comprehensive summary of the given text. The summary should cover all the key points and main ideas presented
in the original text, while also condensing the information into a concise and easy-to-understand format. Please ensure that the summary includes 
relevant details and examples that support the main ideas, while avoiding any unnecessary information or repetition. The length of the summary should
be appropriate for the length and complexity of the original text, providing a clear and accurate overview without omitting any important information.
Provide your answer as a JSON object with the key "summary" and the value as the summary. NO OTHER KEYS SHOULD BE PRESENT. 
Example: "summary": (comprehensive summary of the given text) 
"""
