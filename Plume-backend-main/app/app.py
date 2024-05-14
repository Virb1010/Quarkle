from dotenv import load_dotenv
load_dotenv("../.env")

from gevent import monkey

monkey.patch_all()

from flask import render_template, make_response
from flask_cors import CORS
import config
import os
import logging

# Configure logging to include timestamp, file name, log level, and message
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(filename)s [PID: %(process)d] %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)


logger = logging.getLogger(__name__)

app = config.connex_app

origins = [
    "https://quarkle.ai",
    "https://www.quarkle.ai",
    "https://dev.quarkle.ai",
    "https://staging.quarkle.ai",
    "https://enterprise.quarkle.ai",
]

if os.getenv("ENVIRONMENT") == "development":
    origins.append("http://localhost:3000")

CORS(
    app.app,
    resources={r"/*": {"origins": "*"}},
)

swagger_directory = config.basedir / "swaggerAPIs"
app.add_api(swagger_directory / "critique.yml")
app.add_api(swagger_directory / "books.yml")
app.add_api(swagger_directory / "users.yml")
app.add_api(swagger_directory / "subscriptions.yml")

if os.getenv("ENVIRONMENT") == "development":
    app.add_api(swagger_directory / "tests.yml")


@app.route("/")
def home():
    return render_template("home.html")


@app.route("/health")
def health():
    return make_response("OK", 200)


if __name__ == "__main__":
    app.run(port=os.getenv("PORT", 443))
