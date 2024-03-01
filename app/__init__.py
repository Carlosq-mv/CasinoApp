from flask import Flask 
from flask_sqlalchemy import SQLAlchemy
import os
from flask_login import LoginManager
from dotenv import load_dotenv
from flask_mail import Mail

# loads .env variables
load_dotenv() 

# create the Flask app
myapp = Flask(__name__)

# handles login 
login = LoginManager(myapp)
login.login_view = 'login'

basedir = os.path.abspath(os.path.dirname(__file__))

# app configurations
myapp.config.from_mapping(
    # Main app Configs
    SECRET_KEY = os.getenv('SECRET_KEY'),
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'app.db'),
    SQLALCHEMY_TRACK_MODIFICATIONS = False,
    SECURITY_PASSWORD_SALT = os.getenv('SECURITY_PASSWORD_SALT'),
    
    # Mail Configs
    MAIL_SERVER = "smtp.gmail.com",
    MAIL_PORT = 465,
    MAIL_USERNAME = os.getenv('MAIL_USERNAME'),
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD'),
    MAIL_DEFAULT_SENDER = "noreply@flask.com",
    MAIL_USE_TLS = False,
    MAIL_USE_SSL = True,

)
mail = Mail(myapp)

# db creation
db = SQLAlchemy(myapp)

# when app is rum, this method will automatically create the db file
with myapp.app_context():
    from app.models import User
    db.create_all()

from app import routes