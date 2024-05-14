# books.py
import json
from datetime import datetime, timezone
from flask import abort, make_response, _request_ctx_stack
from sqlalchemy import func
from auth import requires_auth
from config import db
from models import (
    Books,
    book_schema,
    Users,
    Chats,
    Chapters,
    Comments,
    Conversations,
    chapter_schema,
)


@requires_auth
def create(book):
    user = _request_ctx_stack.top.current_user["sub"]
    if len(book["title"]) < 1:
        abort(400, "No title provided")
    user = Users.query.filter(Users.auth_id == user).one_or_none()
    if user is not None:
        book["user_id"] = user.id
        new_book = book_schema.load(book, session=db.session)
        db.session.add(new_book)
        db.session.flush()  # This will populate the id for new_book without committing the transaction
        book_id = new_book.id
        new_chapter = Chapters(
            title="Chapter 1",
            content="",
            book_id=book_id,
            chapter_number=1,
        )
        db.session.add(new_chapter)
        db.session.commit()
        return {
            "book": book_schema.dump(new_book),
            "chapter": chapter_schema.dump(new_chapter),
        }, 201
    else:
        abort(404, f"User not found")


@requires_auth
def update(book_id, book):
    existing_book = Books.query.filter(Books.id == book_id).one_or_none()

    auth_id = _request_ctx_stack.top.current_user["sub"]

    user = db.session.query(Users).filter(Users.auth_id == auth_id).one_or_none()

    if user is None or existing_book.user_id != user.id:
        abort(403, f"User not authorized to publish book")

    if existing_book:
        current_datetime = datetime.now()
        # Convert to UTC by setting the timezone to UTC
        # Create a UTC timezone object
        utc_timezone = timezone.utc
        # Convert the local datetime to UTC
        utc_datetime = current_datetime.astimezone(utc_timezone)
        formatted_utc_datetime = utc_datetime.strftime("%Y-%m-%d %H:%M:%S")
        existing_book.title = book["title"]
        existing_book.time_updated = formatted_utc_datetime
        db.session.commit()
        return book_schema.dump(existing_book), 201
    else:
        abort(404, f"Book with not found")


@requires_auth
def delete(book_id):
    existing_book = Books.query.filter(Books.id == book_id).one_or_none()
    auth_id = _request_ctx_stack.top.current_user["sub"]

    user = (
        db.session.query(Books, Users)
        .filter(
            Users.id == Books.user_id, Books.id == book_id, Users.auth_id == auth_id
        )
        .one_or_none()
    )

    if user is None:
        abort(403, f"User not authorized to delete book")

    if existing_book:
        # Fetch all conversations associated with the book
        conversations = Conversations.query.filter(
            Conversations.book_id == book_id
        ).all()

        # Delete all chats where conversation's book_id is the book_id being deleted
        for conversation in conversations:
            Chats.query.filter(Chats.conversation_id == conversation.id).delete(
                synchronize_session="fetch"
            )

        # Delete all conversations associated with the book
        Conversations.query.filter(Conversations.book_id == book_id).delete()

        Chapters.query.filter(Chapters.book_id == book_id).delete()
        Comments.query.filter(Comments.chapter_id == book_id).delete()
        db.session.delete(existing_book)
        db.session.commit()
        return make_response(f"Successfully deleted", 200)
    else:
        abort(404, f"Book not found")


@requires_auth
def update_title(book_id, new_title):
    existing_book = Books.query.filter(Books.id == book_id).one_or_none()

    auth_id = _request_ctx_stack.top.current_user["sub"]

    user = (
        db.session.query(Books, Users)
        .filter(
            Users.id == Books.user_id, Books.id == book_id, Users.auth_id == auth_id
        )
        .one_or_none()
    )

    if user is None:
        abort(403, f"User not authorized to update book title")

    if existing_book:
        existing_book.title = new_title
        db.session.commit()
        return book_schema.dump(existing_book), 200
    else:
        abort(404, f"Book not found")


@requires_auth
def update_category(book_id, new_category):
    new_category = new_category["new_category"]
    book = Books.query.filter(Books.id == book_id).one_or_none()

    auth_id = _request_ctx_stack.top.current_user["sub"]

    user = (
        db.session.query(Books, Users)
        .filter(
            Users.id == Books.user_id, Books.id == book_id, Users.auth_id == auth_id
        )
        .one_or_none()
    )

    if user is None:
        abort(403, f"User not authorized")

    if book:
        book.category = new_category
        book.is_category_updated_by_user = True
        db.session.commit()
        return new_category, 200
    else:
        abort(404, f"Book not found")


@requires_auth
def read_category(book_id):
    book = Books.query.filter(Books.id == book_id).one_or_none()

    if book and book.category:
        return book.category, 200
    else:
        return "", 200
