from flask import Flask 
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_mail import Mail
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from datetime import datetime
from dotenv import load_dotenv
import os

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
        # NOTE: this admin should be private but for right now leave as is (also look up if there is a better way of doing admin user)
        # check if there is an admin user in database
        if not db.session.execute(db.select(User).filter_by(admin=True)).scalar_one_or_none():
            # create admin user
            admin = User(
                username='admin', email='admin@admin.com',
                date_of_birth=datetime.strptime("1990-01-01", "%Y-%d-%m"),
                confirmed=True, admin=True,
            )
            admin.set_password('1234')
            db.session.add(admin)
            db.session.commit() 
             
# create instance of admin         
admin = Admin(myapp)
admin.add_view(ModelView(User, db.session))

from app import routes