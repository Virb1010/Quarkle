from flask import request, jsonify
import stripe
import os
import logging
from subscriptions import (
    cancel_stripe_subscription,
    create_or_update_stripe_subscription,
)
from AI.AI_helper import LOOPS_API_KEY, LOOPS_EVENT_URL
import requests

logger = logging.getLogger(__name__)


def listen():
    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")
    signature = request.headers.get("stripe-signature")

    if not webhook_secret:
        logger.error("Webhook secret is not set.")
        return jsonify({"error": "Configuration error"}), 500

    try:
        event = stripe.Webhook.construct_event(
            payload=request.data, sig_header=signature, secret=webhook_secret
        )
    except stripe.error.SignatureVerificationError as e:
        logger.warning(f"Signature verification failed: {e}")
        return jsonify({"error": "Invalid signature"}), 400
    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        return jsonify({"error": "Internal server error"}), 500

    event_type = event["type"]
    event_data = event["data"]

    logger.info(f"Received event: {event_type}")

    if event_type == "checkout.session.completed":
        logger.info("Payment succeeded")

    elif event_type == "customer.subscription.created":
        # To create a new subscription in our database
        subscription_id = event_data["object"]["id"]
        logger.info(
            f"Received Subscription Created event. Subscription ID: {subscription_id} | Event ID: {event.id}"
        )
        metadata = event_data["object"]["metadata"]
        body = {
            "subscription_type": metadata["subscriptionType"],
            "stripe_customer_id": event_data["object"]["customer"],
            "stripe_subscription_id": event_data["object"]["id"],
            "stripe_subscription_status": event_data["object"]["status"],
            "stripe_payment_method": event_data["object"]["default_payment_method"],
            "stripe_price_id": event_data["object"]["items"]["data"][0]["price"]["id"],
            "stripe_current_period_end": event_data["object"]["current_period_end"],
            "stripe_current_period_start": event_data["object"]["current_period_start"],
            "stripe_cancel_at_period_end": event_data["object"]["cancel_at_period_end"],
            "user_email": metadata["userEmail"],
        }
        return create_or_update_stripe_subscription(body)

    elif event_type == "invoice.payment_succeeded":
        # To mark our subscription as active
        subscription_id = event_data["object"]["subscription"]
        logger.info(
            f"Received Payment Succeeded event. Subscription ID: {subscription_id} | Event ID: {event.id}"
        )
        metadata = event_data["object"]["subscription_details"]["metadata"]
        body = {
            "is_active": True,
            "stripe_subscription_id": event_data["object"]["subscription"],
            "user_email": metadata["userEmail"],
            "subscription_type": metadata["subscriptionType"],
        }

        try:
            payload = {
                "email": metadata["userEmail"],
                "eventName": "Pro Plan Activated",
            }
            headers = {
                "Authorization": f"Bearer {LOOPS_API_KEY}",
                "Content-Type": "application/json",
            }

            response = requests.request(
                "POST", LOOPS_EVENT_URL, json=payload, headers=headers
            )

        except:
            logger.error(f"Error sending event to Loops {metadata['userEmail']}")

        return create_or_update_stripe_subscription(body)

    elif event_type == "customer.subscription.updated":
        # Will handle renewals and cancelation data for stripe columns in Db
        subscription_id = event_data["object"]["id"]
        logger.info(
            f"Received Subscription Updated event. Subscription ID: {subscription_id} | Event ID: {event.id}"
        )
        metadata = event_data["object"]["metadata"]
        body = {
            "stripe_customer_id": event_data["object"]["customer"],
            "stripe_subscription_id": event_data["object"]["id"],
            "stripe_subscription_status": event_data["object"]["status"],
            "stripe_payment_method": event_data["object"]["default_payment_method"],
            "stripe_price_id": event_data["object"]["items"]["data"][0]["price"]["id"],
            "stripe_current_period_end": event_data["object"]["current_period_end"],
            "stripe_current_period_start": event_data["object"]["current_period_start"],
            "stripe_cancel_at_period_end": event_data["object"]["cancel_at_period_end"],
        }
        return create_or_update_stripe_subscription(body)

    elif event_type == "invoice.payment_failed":
        subscription_id = event_data["object"]["subscription"]
        logger.info(
            f"Received Payment Failed event. Subscription ID: {subscription_id} | Event ID: {event.id}"
        )
        invoice_data = event_data["object"]
        body = {
            "stripe_subscription_id": invoice_data["subscription"],
            "is_active": False,
        }
        return cancel_stripe_subscription(body)

    elif event_type == "customer.subscription.deleted":
        subscription_id = event_data["object"]["id"]
        logger.info(
            f"Received Subscription Deleted event. Subscription ID: {subscription_id} | Event ID: {event.id}"
        )
        body = {
            "stripe_subscription_id": event_data["object"]["id"],
            "stripe_subscription_status": event_data["object"]["status"],
            "is_active": False,
        }
        return cancel_stripe_subscription(body)

    return jsonify({"status": "success"}), 200
