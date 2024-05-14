import random
from AI.AI_helper import chunk_text_size
from models import Books, Chapters
from AI.prompts import suggestion_template
from service import StreamOpenAI


async def suggest_questions(book_id, chapter_id, existing_user, websocket):
    user_book = Books.query.filter(Books.id == book_id).one_or_none()

    if user_book is None or user_book.user_id != existing_user.id:
        return "No book found or user does not own book"

    chapter = Chapters.query.filter(Chapters.id == chapter_id).one_or_none()

    chunks = chunk_text_size(chapter.content, 100)

    if len(chunks) > 6:
        chunks = chunks[:2] + random.sample(chunks[2:-2], 2) + chunks[-2:]

    combined_chunks = " ".join(chunks)

    messages = [
        {
            "role": "system",
            "content": suggestion_template.format(chunks=combined_chunks),
        }
    ]

    tokens_used, response = await StreamOpenAI(messages, websocket, use_pro_model=False)
    # existing_user.tokens_used_today += tokens_used
    return ""
