import random
from AI.AI_helper import chunk_text_size
from models import Books, Chapters
from AI.prompts import comment_implementation_template
import re
from service import StreamOpenAI


async def implement_comment_feedback(
    book_id,
    chapter_id,
    user_input,
    existing_user,
    use_pro_model,
    use_open_expression_model,
    websocket,
):
    user_book = Books.query.filter(Books.id == book_id).one_or_none()
    chapter = Chapters.query.filter(Chapters.id == chapter_id).one_or_none()

    if user_book is not None:
        chapter_text = re.sub(r"<[^>]+>", "", chapter.content)

    # The user_input is of the format 'Commented Text // Comment'
    commented_text = user_input.split("//")[0].strip()
    comment = user_input.split("//")[1].strip()

    idx_commented_text = chapter_text.find(commented_text)
    NUMBER_OF_CHARACTERS_TO_INCLUDE_IN_CONTEXT = 200
    context_window = chapter_text[
        max(
            0, idx_commented_text - NUMBER_OF_CHARACTERS_TO_INCLUDE_IN_CONTEXT
        ) : idx_commented_text
        + len(commented_text)
        + NUMBER_OF_CHARACTERS_TO_INCLUDE_IN_CONTEXT
    ]

    if user_book is None or user_book.user_id != existing_user.id:
        return "No book found or user does not own book"

    chunks = chunk_text_size(chapter_text, 100)

    if len(chunks) > 6:
        chunks = chunks[:2] + random.sample(chunks[2:-2], 2) + chunks[-2:]

    combined_chunks = " ".join(chunks)

    messages = [
        {
            "role": "system",
            "content": comment_implementation_template.format(
                comment=comment,
                commented_text=commented_text,
                context_window=context_window,
                chunks=combined_chunks,
            ),
        },
        {"role": "user", "content": combined_chunks},
    ]
    # print(messages)

    tokens_used, response_str = await StreamOpenAI(
        messages, websocket, use_pro_model, use_open_expression_model=False
    )
    return ""
