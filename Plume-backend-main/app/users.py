from flask import abort, _request_ctx_stack
from sqlalchemy import func
import requests

from auth import requires_auth
from config import db
from models import Users, user_schema, Subscriptions
from username import assign_username
import logging
from AI.AI_helper import LOOPS_API_KEY

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


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


@requires_auth
def create(data):
    auth_id = _request_ctx_stack.top.current_user["sub"]

    email = data.get("email")
    existing_user = Users.query.filter(Users.email == email).one_or_none()

    if existing_user is None:
        data["auth_id"] = auth_id
        # auto_increment_id = db.session.query(func.max(Users.id)).scalar()
        data["username"] = "Vir"
        # assign_username(auto_increment_id + 1)
        new_user = user_schema.load(data, session=db.session)
        db.session.add(new_user)
        db.session.flush()
        create_contact_send_loop(email, new_user.id)
        db.session.commit()
        return user_schema.dump(new_user), 201
    else:
        if existing_user.auth_id is None:
            existing_user.auth_id = auth_id
            db.session.merge(existing_user)
            db.session.commit()
        return f"User already registered", 200


@requires_auth
def read_one():
    auth_id = _request_ctx_stack.top.current_user["sub"]
    user = Users.query.filter(Users.auth_id == auth_id).one_or_none()

    if user is not None:
        return user_schema.dump(user)
    else:
        abort(404, f"User not found")


@requires_auth
def save_terms_accepted():
    auth_id = _request_ctx_stack.top.current_user["sub"]
    user = Users.query.filter(Users.auth_id == auth_id).one_or_none()

    if user is not None:
        user.accepted_terms = True
        db.session.merge(user)
        db.session.commit()
        return "Successfully saved terms accepted", 200
    else:
        abort(404, f"User not found")


@requires_auth
def read_user_accepted_terms():
    auth_id = _request_ctx_stack.top.current_user["sub"]
    user = Users.query.filter(Users.auth_id == auth_id).one_or_none()

    if user is not None:
        return user.accepted_terms, 200
    else:
        abort(404, f"User not found")


def create_contact_send_loop(email, user_id):
    url = "https://app.loops.so/api/v1/contacts/create"

    payload = {
        "email": email,
        "firstName": "",
        "lastName": "",
        "source": "quarkle_backend",
        "subscribed": True,
        "userGroup": "quarkle",
        "userId": user_id,
    }
    headers = {
        "Authorization": f"Bearer {LOOPS_API_KEY}",
        "Content-Type": "application/json",
    }

    response = requests.request("POST", url, json=payload, headers=headers)

    return response.text
