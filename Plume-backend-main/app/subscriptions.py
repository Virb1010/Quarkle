from flask import abort, _request_ctx_stack
from sqlalchemy import func

from auth import requires_auth
from config import db
from models import Users, Subscriptions, subscription_schema, subscriptions_schema
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from functools import wraps
import time
import logging

logger = logging.getLogger(__name__)


@requires_auth
def get_subscription():
    """
    Gets a user's subscription.

    Parameters:
    - data (dict): Dictionary containing user details.

    Returns:
    - Tuple containing serialized subscription data and status code.
    """
    logger.info("Getting subscription")
    auth_id = _request_ctx_stack.top.current_user["sub"]
    user = Users.query.filter(Users.auth_id == auth_id).one_or_none()

    try:
        # Check for an existing subscription
        existing_subscription = Subscriptions.query.filter_by(
            user_id=user.id, is_active=True
        ).first()

        if existing_subscription is None:
            return {"message": "No paid subscription for user"}, 404

        return subscription_schema.dump(existing_subscription), 200

    except SQLAlchemyError as e:
        # Handle database errors
        db.session.rollback()
        logger.error(f"Database error: {e}")
        return {"error": "Database operation failed"}, 500
    except Exception as e:
        # Handle other exceptions
        logger.error(f"Unexpected error: {e}")
        return {"error": "An unexpected error occurred"}, 500


def retry_on_failure(max_retries=3, delay=1):
    """
    A decorator to retry a function if it returns a non-200 response code.

    Parameters:
    - max_retries (int): Maximum number of retries.
    - delay (int): Delay in seconds between retries.
    """

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            retries = 0
            nonlocal delay
            while retries < max_retries:
                response, status_code = func(*args, **kwargs)
                if status_code == 200 or status_code == 201:
                    return response, status_code
                retries += 1
                delay = delay * 2
                logger.info(f"Retry {retries}/{max_retries} after {delay} seconds...")
                time.sleep(delay)
            return response, status_code

        return wrapper

    return decorator


@retry_on_failure()
def create_or_update_stripe_subscription(data):
    """
    Only called from backend.
    Creates a Stripe subscription for a user. If an existing subscription is found,
    and it is of the same type, it is returned. Otherwise, the existing subscription
    is marked as 'canceled' before creating a new one.

    Parameters:
    - data (dict): Dictionary containing user details.

    Returns:
    - Tuple containing serialized subscription data and status code.
    """

    existing_subscription = get_existing_subscription_by_stripe_id(
        data.get("stripe_subscription_id")
    )

    try:
        if existing_subscription:
            return update_existing_subscription(existing_subscription, data)

        user = get_user_by_email(data.get("user_email"))
        if user is None:
            return {"error": "User not found"}, 404

        return create_new_stripe_subscription(user, data)

    except SQLAlchemyError as e:
        return handle_database_error(e)
    except Exception as e:
        return handle_unexpected_error(e)


@retry_on_failure()
def cancel_stripe_subscription(data):
    """
    Handles the cancellation of a Pro plan

    Parameters:
    - stripe_subscription_id (str): The Stripe ID of the subscription to cancel.

    Returns:
    - Tuple containing serialized subscription data and status code.
    """
    try:
        existing_subscription = get_existing_subscription_by_stripe_id(
            data.get("stripe_subscription_id")
        )

        if existing_subscription:
            # Deactivate the existing Pro subscription
            update_existing_subscription(existing_subscription, data)

            return "Subscription canceled", 200
        else:
            return {"error": "Pro subscription not found"}, 404

    except SQLAlchemyError as e:
        return handle_database_error(e)
    except Exception as e:
        return handle_unexpected_error(e)


# Helper Functions
def stripe_to_datetime(stripe_datetime):
    """
    Converts a Stripe datetime to a Python datetime.

    Parameters:
    - stripe_datetime (int): The Stripe datetime to convert.

    Returns:
    - datetime: The converted datetime.
    """
    return datetime.fromtimestamp(stripe_datetime)


def handle_database_error(e):
    db.session.rollback()
    logger.error(f"Database error: {e}")
    return "Database operation failed", 500


def handle_unexpected_error(e):
    logger.error(f"Unexpected error: {e}")
    return "An unexpected error occurred", 500


def assign_subscription_data(subscription, data):
    for key, value in data.items():
        if key.startswith("stripe_") or key in ["subscription_type", "is_active"]:
            if "current_period_end" in key or "current_period_start" in key:
                setattr(subscription, key, stripe_to_datetime(value))
            else:
                setattr(subscription, key, value)
    subscription.updated_at = func.now()


def create_new_stripe_subscription(user, data):
    logger.info("Creating new subscription")
    new_subscription = Subscriptions(user_id=user.id, is_active=False)
    assign_subscription_data(new_subscription, data)
    db.session.add(new_subscription)
    db.session.commit()
    return "Subscription created", 201


def update_existing_subscription(subscription, data):
    logger.info("Updating existing subscription")
    assign_subscription_data(subscription, data)
    db.session.merge(subscription)
    db.session.commit()
    return "Subscription updated", 200


def get_existing_subscription_by_stripe_id(stripe_subscription_id):
    return Subscriptions.query.filter_by(
        stripe_subscription_id=stripe_subscription_id
    ).one_or_none()


def get_user_by_email(email):
    return Users.query.filter(Users.email == email).one_or_none()
