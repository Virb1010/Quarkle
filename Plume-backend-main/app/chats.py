from flask import make_response, _request_ctx_stack

from auth import requires_auth
from models import db, Chats, Conversations


@requires_auth
def get_quarkle_chats(book_id):
    if book_id == 0:
        return {"message": "Invalid book_id"}, 400

    # Get all conversations associated with the book
    conversations = Conversations.query.filter(Conversations.book_id == book_id).all()

    if not conversations:
        new_conversation = Conversations(
            book_id=book_id,
            title="New Conversation",
        )
        db.session.add(new_conversation)
        db.session.commit()
        conversations = [new_conversation]

    conversations.sort(key=lambda x: x.updated_at, reverse=True)
    response = []
    for conversation in conversations:
        # Get all chats associated with the conversation
        chats = (
            Chats.query.filter(Chats.conversation_id == conversation.id)
            .order_by(Chats.id)
            .all()
        )

        chat_list = []
        for c in chats:
            chat_list.append(dict(chat_id=c.id, message=c.message, is_user=c.is_user))
        conversation_dict = {
            "conversation_id": conversation.id,
            "title": conversation.title,
            "created_at": conversation.created_at,
            "updated_at": conversation.updated_at,
            "book_id": book_id,
            "chats": chat_list,
        }
        response.append(conversation_dict)
    return response, 200


@requires_auth
def delete_quarkle_chats(book_id):
    # Delete chats
    Chats.query.filter(Chats.book_id == book_id).delete()

    # Delete conversations
    Conversations.query.filter(Conversations.book_id == book_id).delete()

    db.session.commit()
    return make_response(f"Chats and conversations for book successfully deleted", 200)


@requires_auth
def start_new_conversation(book_id):
    # Create new conversation
    new_conversation = Conversations(
        book_id=book_id,
        title="New Conversation",
    )
    db.session.add(new_conversation)
    db.session.commit()

    return make_response(
        {
            "conversation_id": new_conversation.id,
            "created_at": new_conversation.created_at,
            "updated_at": new_conversation.updated_at,
        },
        200,
    )


@requires_auth
def activate_conversation(conversation_id):
    # Archive all existing conversations
    Conversations.query.filter(Conversations.id != conversation_id).update(
        {Conversations.archived: True}
    )

    Conversations.query.filter(Conversations.id == conversation_id).update(
        {Conversations.archived: False}
    )

    db.session.commit()

    return make_response(f"Conversation activated", 200)
