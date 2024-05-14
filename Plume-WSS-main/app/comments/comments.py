import re
from AI.AI_helper import chunk_text_size, token_counter
from models import Books, Comments, Summaries, Chapters
from config import db
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception,
)
import json
from .prompt import (
    summary_system_prompt,
    quarkle_comment_prompt_builder,
    comment_function_tool,
)
from service import CallOpenAIFunction, CallOpenAI
import logging
import asyncio

logger = logging.getLogger(__name__)


async def send_progress_message(
    websocket,
    message,
    current_step_completion_limit,
    total_time_estimate=0,
):
    # percent_completion = int((current_step / total_steps) * 100)
    # message = f"//{message}:{percent_completion}"  # //Reading Book:5
    message = json.dumps(
        {
            "type": "progress_update",
            "message": message,
            "current_step_completion_limit": current_step_completion_limit,
            "total_time_estimate": total_time_estimate,
        }
    )
    await websocket.send(message)


async def critique(
    user_input,
    summarize,
    book_id,
    chapter_id,
    existing_user,
    tokens_used_input,
    tokens_used_output,
    use_pro_model,
    websocket,
):
    PERCENTAGE_COMPLETE_UNTIL_NEXT_STEP = 15
    TIME_PER_CHUNK_SECONDS = 25 if not use_pro_model else 45

    await send_progress_message(
        websocket,
        "Getting Ready",
        PERCENTAGE_COMPLETE_UNTIL_NEXT_STEP,
    )
    # Delete all existing summaries for the book
    Summaries.query.filter_by(book_id=book_id).delete()

    user_book = Books.query.filter(Books.id == book_id).one_or_none()

    if user_book is None or user_book.user_id != existing_user.id:
        raise "No book found or user does not own book"

    chunks, line_number_to_char_count_dict = format_book(chapter_id)

    feedback_comments_list = []
    summary_of_all_events = ""
    for i, chunk in enumerate(chunks, start=1):
        PERCENTAGE_COMPLETE_UNTIL_NEXT_STEP += 85 / len(chunks)
        CHUNKS_REMAINING = len(chunks) - i + 1

        await send_progress_message(
            websocket,
            f"Annotating {i} of {len(chunks)} chunks",
            PERCENTAGE_COMPLETE_UNTIL_NEXT_STEP,
            total_time_estimate=CHUNKS_REMAINING * TIME_PER_CHUNK_SECONDS,
        )

        tokens_used_input = token_counter(chunk)
        existing_user.tokens_used_today += tokens_used_input

        task1 = asyncio.create_task(
            get_feedback_comments_from_LLM(
                chunk, user_input, summarize, summary_of_all_events, use_pro_model
            )
        )

        if summarize:
            task2 = asyncio.create_task(summarize_chunk(chunk, use_pro_model=False))
            feedback_comments, chunk_summary = await asyncio.gather(task1, task2)
            summary_of_all_events = await truncate_summary_if_needed(
                summary_of_all_events + chunk_summary
            )
            add_summary_to_db(summary_of_all_events, user_book.id)
        else:
            feedback_comments = await task1

        for feedback_comment in feedback_comments:
            logger.info(f"Feedback Comment: \n {feedback_comment}")

            character_start, character_end = convert_line_number_to_char_start_char_end(
                feedback_comment, line_number_to_char_count_dict
            )

            comment_json = add_comment_to_db(
                feedback_comment["actionable_feedback_summary"],
                feedback_comment["actionable_feedback_content"],
                user_book,
                character_start,
                character_end,
            )

            await websocket.send(comment_json)

            feedback_comments_list.append(feedback_comment)

        db.session.commit()

        await send_progress_message(
            websocket,
            "Complete",
            PERCENTAGE_COMPLETE_UNTIL_NEXT_STEP,
            total_time_estimate=0,
        )
    return feedback_comments_list


async def summarize_chunk(chunk, use_pro_model=False):
    summary_json = await CallOpenAI(
        [
            {"role": "system", "content": summary_system_prompt},
            {"role": "user", "content": chunk},
        ],
        json_mode=True,
        use_pro_model=use_pro_model,
    )

    return json.loads(summary_json)["summary"]


def format_book(chapter_id):
    chapter_content = (
        Chapters.query.filter(Chapters.id == chapter_id).one_or_none().content
    )

    book_text = re.sub(r"<br\s*/?>|<br>\s*</br>", " ", chapter_content)
    book_text = re.sub(r"</p>", "  ", book_text)
    book_text = re.sub(r"<[^>]+>", "", book_text)
    sentences = re.split(r"(?<=[.!?])", book_text)

    line_number = 1
    line_number_to_char_count = {}
    charcount = 0
    formatted_story = ""
    for sentence in sentences:
        charcount += len(sentence)
        line_number_to_char_count[line_number] = charcount
        formatted_story += f"[L{line_number}] {sentence}\n\n"
        line_number += 1

    chunks = chunk_text_size(formatted_story, 2000)
    return chunks, line_number_to_char_count


def convert_line_number_to_char_start_char_end(
    feedback_comment, line_number_to_char_count
):
    start = line_number_to_char_count.get(feedback_comment["line_number"] - 1, 0) + 1
    end = line_number_to_char_count.get(feedback_comment["line_number"], 0)
    return start, end


def add_comment_to_db(comment_title, comment_content, user_book, start, end):
    # TODO: move this from book_id to chapter_id over time
    new_comment = Comments(
        title=comment_title,
        message=comment_content,
        chapter_id=user_book.id,
        is_user=False,
        resolved=False,
        rating=0,
    )
    db.session.add(new_comment)
    db.session.flush()
    new_comment.parent_comment_id = new_comment.id

    comment_json = json.dumps(
        [
            {
                "id": new_comment.id,
                "title": comment_title,
                "message": comment_content,
                "character_start": start,
                "character_end": end,
            }
        ]
    )
    return comment_json


def add_summary_to_db(summary, book_id):
    new_summary = Summaries(summary_text=summary, book_id=book_id)
    db.session.add(new_summary)
    db.session.flush()
    return new_summary


def is_retryable_exception(exception):
    return isinstance(exception, (json.JSONDecodeError, KeyError))


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=30),
    retry=retry_if_exception(is_retryable_exception),
)
async def get_feedback_comments_from_LLM(
    chunk, user_input, summarize, summary_of_all_events, use_pro_model=False
):
    prompt = quarkle_comment_prompt_builder(
        user_input, summarize, summary_of_all_events
    )
    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": chunk},
    ]

    try:
        summary_and_critic = await CallOpenAIFunction(
            messages, tools=comment_function_tool, use_pro_model=use_pro_model
        )
        feedback_comments = json.loads(summary_and_critic.arguments)[
            "actionable_feedbacks"
        ]

        # Check if all required keys are present in each feedback comment
        required_keys = [
            "line_number",
            "actionable_feedback_summary",
            "actionable_feedback_content",
        ]
        for comment in feedback_comments:
            if not all(key in comment for key in required_keys):
                raise KeyError(
                    "One or more required keys are missing in the feedback comment"
                )

        return feedback_comments
    except (json.JSONDecodeError, KeyError) as e:
        logger.error(f"Error: {e}")
        logger.error(f"summary_and_critic: {summary_and_critic}")
        raise


async def truncate_summary_if_needed(summary):
    if token_counter(summary) < 750:
        return summary
    logger.info("Summary too long, truncating")
    logger.info(summary)
    return await summarize_chunk(summary, use_pro_model=False)
