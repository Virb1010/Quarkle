import json
from priomptipy import AssistantMessage, UserMessage, Scope

chat_tools = [
    {
        "type": "function",
        "function": {
            "name": "highlight_sections_for_comments",
            "description": "Provides detailed referential feedback and highlights specific sections of a user's text. Ideal for queries that require pinpointing specific sections of a user's work or when user asks `Show me` or `Where` questions.",
            "parameters": {
                "type": "object",
                "properties": {
                    "prompt": {
                        "type": "string",
                        "description": "A prompt that is sent to the comments engine to add comments on certain sections of the user's work. It should resemble the user's query as closely as possible.",
                    },
                    "summarization_reason": {
                        "type": "string",
                        "description": "A reason for why the comments engine would benefit from summary of the user's work.",
                    },
                    "summarize": {
                        "type": "boolean",
                        "description": "A boolean that determines whether or not the comments engine should summarize the user's work depending on whether the commenting is high level like grammar or fact-checking which won't require summary, or detailed commenting like character development which would benefit from summary.",
                    },
                },
                "required": ["prompt", "summarization_reason", "summarize"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "creative_assistance_and_chat",
            "description": "Offers assistance in brainstorming, discussing work, and providing feedback on various aspects of a user's project. This function is a go-to for general support, creative ideation, and interactive discussion",
            "parameters": {
                "type": "object",
                "properties": {
                    "prompt": {
                        "type": "string",
                        "description": "A prompt that is sent to the brainstorming engine to help the user brainstorm. It should resemble the user's query as closely as possible.",
                    },
                    "user_asking_about_pro_subscription": {
                        "type": "boolean",
                        "description": "A boolean that determines whether or not the user is asking about Quarkle Pro subscription. If the user is asking about the Pro subscription, we can recommend it to them.",
                    },
                },
                "required": ["prompt", "user_asking_about_pro_subscription"],
            },
        },
    },
]


tools_usage_examples = [
    Scope(
        children=[
            UserMessage("Show me where I can improve my writing"),
            AssistantMessage(
                function_call={
                    "name": "highlight_sections_for_comments",
                    "arguments": json.dumps(
                        {
                            "prompt": "Show me where I can improve my writing",
                            "summarization_reason": "The user wants to improve their writing, so summarizing their work will help the comments engine provide better and wholistic feedback.",
                            "summarize": "true",
                        }
                    ),
                }
            ),
        ],
        relative_priority=-1,
    ),
    Scope(
        children=[
            UserMessage("What can I do to improve my character's motivation"),
            AssistantMessage(
                function_call={
                    "name": "creative_assistance_and_chat",
                    "arguments": json.dumps(
                        {
                            "prompt": "What can I do to improve my character's motivation",
                            "user_asking_about_pro_subscription": "false",
                        }
                    ),
                }
            ),
        ],
        relative_priority=-2,
    ),
    Scope(
        children=[
            UserMessage("Where have I used too much passive voice"),
            AssistantMessage(
                function_call={
                    "name": "highlight_sections_for_comments",
                    "arguments": json.dumps(
                        {
                            "prompt": "Where have I used too much passive voice",
                            "summarization_reason": "We can detect passive voice without summarizing the user's work.",
                            "summarize": "false",
                        }
                    ),
                },
            ),
        ],
        relative_priority=-3,
    ),
    Scope(
        children=[
            UserMessage("Give me examples for what I can name my protagonist"),
            AssistantMessage(
                function_call={
                    "name": "creative_assistance_and_chat",
                    "arguments": json.dumps(
                        {
                            "prompt": "Give me examples for what I can name my protagonist",
                            "user_asking_about_pro_subscription": "false",
                        }
                    ),
                }
            ),
        ],
        relative_priority=-4,
    ),
    Scope(
        children=[
            UserMessage("Quarkle show me some parts I should elimitate or cut"),
            AssistantMessage(
                function_call={
                    "name": "highlight_sections_for_comments",
                    "arguments": json.dumps(
                        {
                            "prompt": "Quarkle show me some parts I should elimitate or cut",
                            "summarization_reason": "We should summarize the text so we can identify parts that can be cut while keeping the story intact.",
                            "summarize": "true",
                        }
                    ),
                },
            ),
        ],
        relative_priority=-5,
    ),
    Scope(
        children=[
            UserMessage("What's a good title for my book"),
            AssistantMessage(
                function_call={
                    "name": "creative_assistance_and_chat",
                    "arguments": json.dumps(
                        {
                            "prompt": "What's a good title for my book",
                            "user_asking_about_pro_subscription": "false",
                        }
                    ),
                }
            ),
        ],
        relative_priority=-6,
    ),
    Scope(
        children=[
            UserMessage("What are the benefits of Quarkle Pro"),
            AssistantMessage(
                function_call={
                    "name": "creative_assistance_and_chat",
                    "arguments": json.dumps(
                        {
                            "prompt": "What are the benefits of Quarkle Pro",
                            "user_asking_about_pro_subscription": "true",
                        }
                    ),
                },
            ),
        ],
        relative_priority=-7,
    ),
]
