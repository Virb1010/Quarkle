import pathlib
import connexion
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
import mysql.connector
import os

basedir = pathlib.Path(__file__).parent.resolve()
connex_app = connexion.App(__name__, specification_dir=basedir)

app = connex_app.app
app.config["SQLALCHEMY_DATABASE_URI"] = f"mysql+mysqlconnector://" \
                                        f"{os.getenv('DB_USER_NAME')}:" \
                                        f"{os.getenv('DB_PW_PROD')}@" \
                                        f"{os.getenv('DB_HOST_PROD')}:" \
                                        f"{os.getenv('DB_PORT_PROD')}/plume"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
ma = Marshmallow(app)
