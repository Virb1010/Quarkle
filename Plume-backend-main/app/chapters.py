from flask import abort, make_response, _request_ctx_stack, request
from auth import requires_auth
from config import db
from models import Chapters, chapter_schema, Books, Users
from datetime import datetime, timezone
from file_reading_helper import (
    process_single_file,
    process_multi_file,
)
import logging

logger = logging.getLogger(__name__)


@requires_auth
def create(book_id):
    user = _request_ctx_stack.top.current_user["sub"]
    existing_user = Users.query.filter(Users.auth_id == user).one_or_none()
    book = Books.query.filter(Books.id == book_id).one_or_none()

    if existing_user is None or book is None:
        abort(404, f"User or Book not found")

    # Count the number of chapters for the given book_id
    chapters_count = Chapters.query.filter(Chapters.book_id == book_id).count()

    # If there are no chapters yet, start with 1, otherwise increment the chapters_count by 1
    new_chapter_number = chapters_count + 1

    # Create a new chapter object
    chapter = {
        "chapter_number": new_chapter_number,
        "book_id": book.id,
        "title": f"Chapter {new_chapter_number}",
        "content": "",
        # Add other fields as needed
    }

    new_chapter = chapter_schema.load(chapter, session=db.session)
    db.session.add(new_chapter)
    db.session.commit()
    return chapter_schema.dump(new_chapter), 201


@requires_auth
def get_all(book_id):
    chapters = Chapters.query.filter(Chapters.book_id == book_id).all()
    return chapter_schema.dump(chapters, many=True), 200


@requires_auth
def update(chapter_id, chapter):
    existing_chapter = Chapters.query.filter(Chapters.id == chapter_id).one_or_none()

    if existing_chapter is None:
        abort(404, f"Chapter not found")

    existing_chapter.content = chapter["content"]
    db.session.commit()
    return chapter_schema.dump(existing_chapter), 200


from datetime import datetime, timezone


@requires_auth
def update_all(chapters):
    current_datetime = datetime.now()
    utc_timezone = timezone.utc
    utc_datetime = current_datetime.astimezone(utc_timezone)
    formatted_utc_datetime = utc_datetime.strftime("%Y-%m-%d %H:%M:%S")
    time_set = False

    for chapter in chapters:
        existing_chapter = Chapters.query.filter(
            Chapters.id == chapter["chapter_id"]
        ).one_or_none()
        if time_set == False:
            parent_book = Books.query.filter(
                Books.id == existing_chapter.book_id
            ).one_or_none()
            parent_book.time_updated = formatted_utc_datetime
            time_set = True

        if parent_book is None:
            abort(404, f"Parent book not found")

        if existing_chapter is None:
            abort(404, f"Chapter not found")

        existing_chapter.content = chapter["content"]

    db.session.commit()
    return "Successfully updated", 200


@requires_auth
def delete(chapter_id):
    existing_chapter = Chapters.query.filter(Chapters.id == chapter_id).one_or_none()

    if existing_chapter is None:
        abort(404, f"Chapter not found")

    db.session.delete(existing_chapter)
    db.session.commit()
    return make_response(f"Successfully deleted", 200)


@requires_auth
def update_title(chapter_id, chapter):
    existing_chapter = Chapters.query.filter(Chapters.id == chapter_id).one_or_none()

    if existing_chapter is None:
        abort(404, f"Chapter not found")

    # Update the title
    existing_chapter.title = chapter["title"]
    db.session.commit()

    return chapter_schema.dump(existing_chapter), 200


@requires_auth
def upload_documents():
    # Access 'bookId' from form data
    book_id = request.form.get("bookId")

    # Access the files from the files dictionary
    uploaded_files = request.files.getlist("file")

    if not uploaded_files or book_id is None:
        abort(400, "Missing files or bookId")

    # Initial chapter number
    max_chapter_number = (
        db.session.query(db.func.max(Chapters.chapter_number))
        .filter(Chapters.book_id == book_id)
        .scalar()
    )
    chapter_number = max_chapter_number + 1 if max_chapter_number else 1

    added_chapters = []

    # Single file uploaded, could have multiple chapters
    if len(uploaded_files) == 1:
        binary_doc = uploaded_files[0]
        chapters = process_single_file(binary_doc, book_id, chapter_number)
        added_chapters.extend(chapters)
    else:
        # Multiple files uploaded, one chapter per file
        for binary_doc in uploaded_files:
            chapter = process_multi_file(binary_doc, book_id, chapter_number)
            chapter_number += 1
            added_chapters.append(chapter)

    db.session.commit()

    return chapter_schema.dump(added_chapters, many=True), 201
