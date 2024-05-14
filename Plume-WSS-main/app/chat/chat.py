import re
import json
from .prompt import chat_tools, tools_usage_examples
from service import CallOpenAIFunction
from priomptipy import SystemMessage, UserMessage, render, Isolate
from brainstorm.brainstorm import brainstorm
from comments.comments import critique
from functools import partial
import logging

logger = logging.getLogger(__name__)


async def chat_with_quarkle(
    user_input,
    book_id,
    chapter_id,
    conversation_id,
    existing_user,
    use_pro_model,
    use_open_expression_model,
    websocket,
):
    brainstorm_function = partial(
        brainstorm,
        user_input=user_input,
        book_id=book_id,
        conversation_id=conversation_id,
        existing_user=existing_user,
        tokens_used_input=0,
        tokens_used_output=0,
        comment_list=[],
        use_message_history=True,
        user_asking_about_pro_subscription=False,
        use_book_context=True,
        use_pro_model=use_pro_model,
        use_open_expression_model=use_open_expression_model,
        websocket=websocket,
    )

    critique_function = partial(
        critique,
        user_input=user_input,
        summarize=False,
        book_id=book_id,
        chapter_id=chapter_id,
        existing_user=existing_user,
        tokens_used_input=0,
        tokens_used_output=0,
        use_pro_model=use_pro_model,
        websocket=websocket,
    )

    blockquote_pattern = re.compile(r">(.*?)\n")
    user_input_without_blockquote = blockquote_pattern.sub("", user_input)

    prompt_messages = [
        SystemMessage(
            "Choose the action you want to take based on the user's question and the tools at your disposal"
        ),
        Isolate(children=tools_usage_examples, token_limit=1000),
        UserMessage(user_input_without_blockquote),
    ]

    render_options = {"token_limit": 10000, "tokenizer": "cl100k_base"}
    prompt = await render(prompt_messages, render_options)
    messages = prompt.get("prompt").get("messages")

    function_called = await CallOpenAIFunction(
        messages=messages,
        tools=chat_tools,
        use_pro_model=False,
    )
    if function_called:
        function_name = function_called.name
        function_args = json.loads(function_called.arguments)
    else:
        function_name = "creative_assistance_and_chat"
        function_args = {
            "user_input": user_input,
            "user_asking_about_pro_subscription": False,
        }

    logger.info(function_called)

    if function_name == "creative_assistance_and_chat":
        await websocket.send(f"//chat_initiate")
        await brainstorm_function(
            user_asking_about_pro_subscription=function_args.get(
                "user_asking_about_pro_subscription", False
            )
        )

    elif function_name == "highlight_sections_for_comments":
        await websocket.send(f"//comments_initiate")
        frontend_response = await websocket.recv()
        if frontend_response == "GIVE_ME_COMMENTS":
            feedback_comments_list = await critique_function()
            await websocket.send(f"//comments_complete")
            if len(feedback_comments_list) > 0:
                await websocket.send(f"//chat_initiate")
                await brainstorm_function(
                    comment_list=feedback_comments_list, use_message_history=False
                )
        else:
            await websocket.send(f"//chat_initiate")
            await brainstorm_function()

    return function_name, function_args
