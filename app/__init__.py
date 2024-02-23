from flask import Flask 
from flask_sqlalchemy import SQLAlchemy
import os
from flask_login import LoginManager
from dotenv import load_dotenv

# not necessary right now
load_dotenv() 

# create the Flask app
myapp = Flask(__name__)

# handles login 
login = LoginManager(myapp)
login.login_view = 'login'

basedir = os.path.abspath(os.path.dirname(__file__))

# app configurations
myapp.config.from_mapping(
    SECRET_KEY = 'sfsdfsdfsdf',
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'app.db'),
    SQLALCHEMY_TRACK_MODIFICATIONS = False
)

# db creation
db = SQLAlchemy(myapp)

# when app is rum, this method will automatically create the db file
with myapp.app_context():
    from app.models import User
    db.create_all()

from app import routes