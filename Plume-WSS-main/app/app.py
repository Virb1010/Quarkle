from dotenv import load_dotenv
load_dotenv("../.env")

import asyncio
import signal
import os
import websockets
import json
import http

from AI.AI_helper import token_counter
from AI.prompts import (
    elaborate_template,
    embellish_template,
    concise_template,
    restructure_template,
    elaborate_template_no_title,
)
import traceback

from chat.chat import chat_with_quarkle
from brainstorm.brainstorm import brainstorm, clean_text, DEFAULT_TEXT
from models import Users, Chapters, Books, Subscriptions
from config import db, app
from auth import validate_auth_token
from comments.comments import critique
from suggest_questions import suggest_questions
from implement_comment_feedback import implement_comment_feedback
from service import StreamOpenAI
from load_test import loadtest
from detect import categorize

import logging

from openai import AsyncOpenAI

client = AsyncOpenAI()

DAILY_TOKEN_LIMIT = 600000

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


async def process_request(path, request_headers):
    if path == "/health":
        return http.HTTPStatus.OK, [], b'{"status": "healthy"}\n'


async def quarkle(websocket):
    logger.info("New Request Received")
    with app.app_context():
        try:
            msg = await websocket.recv()
            message_dict = json.loads(msg)

            action = message_dict["action"]
            user_input = message_dict["data"]
            book_id = message_dict["book_id"]
            token = message_dict["token"]
            open_expression_requested = message_dict.get("open_expression", False)
            conversation_id = message_dict.get("conversation_id", None)

            if action == "LoadTest":
                logger.info("Starting LoadTest")
                await loadtest(websocket)
                return

            if "chapter_id" in message_dict:
                chapter_id = message_dict["chapter_id"]

            decoded_token = validate_auth_token(token)

            if decoded_token is None:
                return "Not authenticated"
            auth_zero_id = decoded_token["sub"]

            user_book = Books.query.filter(Books.id == book_id).one_or_none()

            if user_book is None:
                return "No book found"

            existing_user = Users.query.filter(
                Users.auth_id == auth_zero_id
            ).one_or_none()

            if not existing_user:
                logger.info("User not authenticated")
                return "Not authenticated"

            if user_book.user_id != existing_user.id:
                return "User does not own book"

            tokens_used_input = token_counter(user_input)
            tokens_used_output = 0

            if (
                existing_user.tokens_used_today + tokens_used_input > DAILY_TOKEN_LIMIT
            ) and existing_user.id != 1:
                logger.info(
                    "User %s has exceeded the daily token limit", existing_user.id
                )
                return "It seems like you have exceeded the daily limit. Please come back tomorrow!"

            use_pro_model = is_pro_user(existing_user)
            use_open_expression_model = allow_open_expression_model(
                existing_user, use_pro_model, open_expression_requested
            )

            cleaned_user_input = clean_text(user_input)

            prompt = ""
            if action == "Elaborate":
                title = user_book.title
                prompt = elaborate(chapter_id, user_input, cleaned_user_input, title)

            elif action == "Embellish":
                logger.info("Starting Embellish")
                prompt = embellish_template.format(text=user_input)

            elif action == "Concise":
                logger.info("Starting Concise")
                prompt = concise_template.format(text=user_input)

            elif action == "Restructure":
                logger.info("Starting Restructure")
                prompt = restructure_template.format(text=user_input)

            elif action == "DetectCategory":
                await categorize(book_id, chapter_id, websocket)
                return

            elif action == "Brainstorm":
                logger.info("Starting Chat")
                await chat_with_quarkle(
                    user_input,
                    book_id,
                    chapter_id,
                    conversation_id,
                    existing_user,
                    use_pro_model,
                    use_open_expression_model,
                    websocket,
                )
                return
            elif action == "Comment":
                logger.info("Starting Comment")
                await critique(
                    None,
                    True,
                    book_id,
                    chapter_id,
                    existing_user,
                    tokens_used_input,
                    tokens_used_output,
                    use_pro_model,
                    websocket,
                )
                return
            elif action == "RecommendedQuestions":
                logger.info("Starting RecommendedQuestions")
                await suggest_questions(
                    book_id,
                    chapter_id,
                    existing_user,
                    websocket,
                )
                return
            elif action == "ImplementComment":
                logger.info("Starting ImplementComment")
                await implement_comment_feedback(
                    book_id,
                    chapter_id,
                    user_input,
                    existing_user,
                    use_pro_model,
                    False,  # use_open_expression_model is False since we want to force GPT implementations
                    websocket,
                )
                return
            else:
                return "Invalid"

            messages = [{"role": "user", "content": prompt}]
            tokens_used_output, response = await StreamOpenAI(
                messages, websocket, use_pro_model, use_open_expression_model
            )

            existing_user.tokens_used_today = (
                existing_user.tokens_used_today + tokens_used_input + tokens_used_output
            )
            db.session.commit()
        except Exception as e:
            logger.error("An error occurred: %s", str(e))
            logger.error(traceback.format_exc())

            error_message = {
                "type": "error",
                "message": str(e),
            }
            await websocket.send(json.dumps(error_message))
            await websocket.close()

        finally:
            if not websocket.closed:
                await websocket.close()
                logger.info("WebSocket connection closed in finally block")


def is_pro_user(user):
    try:
        subscription = (
            Subscriptions.query.filter(Subscriptions.user_id == user.id)
            .filter(Subscriptions.subscription_type == "pro")
            .filter(Subscriptions.is_active == True)
            .one_or_none()
        )
        if subscription:
            return True

    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}")
    return False


def allow_open_expression_model(user, use_pro_model, open_expression_requested):
    if open_expression_requested and user.accepted_terms and use_pro_model:
        return True
    return False


def elaborate(chapter_id, user_input, cleaned_user_input, title):
    logger.info("Starting Elaborate")
    chapter = Chapters.query.filter(Chapters.id == chapter_id).one_or_none()

    author_written_content = chapter.content.replace(DEFAULT_TEXT, "")

    idx_author_work = chapter.content.find(user_input)

    NUMBER_OF_CHARACTERS_TO_INCLUDE_IN_CONTEXT = 400

    context = author_written_content[
        max(
            0, idx_author_work - NUMBER_OF_CHARACTERS_TO_INCLUDE_IN_CONTEXT
        ) : idx_author_work
    ]

    length_of_output = determine_output_length(cleaned_user_input)

    if title != "" and title != "Untitled Draft":
        return elaborate_template.format(
            text=cleaned_user_input,
            title=title,
            length=length_of_output,
            context=context,
        )
    return elaborate_template_no_title.format(
        text=cleaned_user_input,
        length=length_of_output,
        context=context,
    )


def determine_output_length(user_input):
    countOfInputWords = len(user_input.split())
    min_output_words = max(int(countOfInputWords * 1.5), 50)
    max_output_words = max(int(countOfInputWords * 2), 100)

    return f"{min_output_words} to {max_output_words} words"


async def main():
    loop = asyncio.get_running_loop()
    stop = loop.create_future()
    loop.add_signal_handler(signal.SIGTERM, stop.set_result, None)

    async with websockets.serve(
        quarkle,
        host="",
        port=int(os.environ["PORT"]),
        process_request=process_request,
    ):
        await stop


if __name__ == "__main__":
    asyncio.run(main())
