import time
import random
import logging
from flask import make_response
from models import Users, user_schema
import json

logger = logging.getLogger(__name__)


def simple_test():
    logger.info("Simple test request received")
    time.sleep(random.uniform(0, 1))
    return make_response("Test OK", 200)


def db_user_test():
    logger.info("DB user test request received")
    user_data = Users.query.filter(Users.id == 52).first()
    return make_response(f"Test OK: {user_schema.dump(user_data)}", 200)
