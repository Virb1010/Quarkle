from AI.tools_prompts import category_detection_prompt
from models import Books, Chapters, db
from service import CallOpenAI
import json
import logging

logger = logging.getLogger(__name__)


async def categorize(book_id, chapter_id, websocket):
    logger.info("Starting categorize")

    book = Books.query.filter(Books.id == book_id).one_or_none()
    if book.category:
        logger.info(f"Book {book_id} already has a category: {book.category}")
        return

    title = Books.query.filter(Books.id == book_id).one_or_none().title
    writing = Chapters.query.filter(Chapters.id == chapter_id).one_or_none().content

    if writing is None or writing == "":
        logger.info(f"Chapter {chapter_id} has no content")
        websocket.send("")
        return ""

    messages = [
        {
            "role": "system",
            "content": category_detection_prompt.format(title=title, writing=writing),
        }
    ]
    logger.info(messages)

    while True:
        response = await CallOpenAI(messages, json_mode=True, use_pro_model=False)
        logger.info(response)
        try:
            response_json = json.loads(response)["category"]
            book = Books.query.filter(Books.id == book_id).one_or_none()
            book.category = response_json
            db.session.commit()
            await websocket.send(response_json)
            break
        except json.JSONDecodeError:
            pass
