from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, HiddenField, SelectField, DateField, EmailField
from wtforms.validators import ValidationError, DataRequired, Email, EqualTo, Optional
from wtforms.widgets import TextArea, TextInput
from .models import User
from datetime import datetime, timedelta

# These are like html forms just "wrapped" to work w/ flask
class SignupForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    email = EmailField('Email', validators=[DataRequired(), Email()])
    date_of_birth = DateField('Enter Date of Birth', validators=[DataRequired()])
    submit = SubmitField('Create Account')
    
    # customs validators
    # for example in signup route, we don't have to create code to check if username already exists,
    # this validator will automatically throw errors and user won't be able to submit wrong data
    def validate_username(self, username):
        user = User.query.filter_by(username=username.data).first()
        if user is not None:
            raise ValidationError('Enter a different username.')

    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user is not None:
            raise ValidationError('Enter a different email address.')
        
    def validate_date_of_birth(self, date_of_birth):
        today = datetime.now().date()
        delta = today - timedelta(days=21*365)
        if date_of_birth.data > delta:
            raise ValidationError('You must be at least 21 years old to sign up.')
        
class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    email = EmailField('Email', validators=[DataRequired(), Email()])
    submit = SubmitField('Login')