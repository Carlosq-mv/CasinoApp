from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, HiddenField, SelectField, DateField, EmailField
from wtforms.validators import ValidationError, DataRequired, Email, EqualTo, Optional
from wtforms.widgets import TextArea, TextInput
from .models import User
from datetime import datetime, timedelta
import re

# These are like html forms just "wrapped" to work w/ flask
class SignupForm(FlaskForm):
    username = StringField('Username 1', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password', message='Passwords must match')])
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
        
    def validate_password(self, password):
        uppercase = r'[A-Z]'
        digits = r'\d'
        special_char_pattern = r'[!@#$%^&*()\-_=+\\|[\]{};:\'",.<>/?]'
        
        if len(password.data) < 16:
            raise ValidationError('Password must be 16 characters long')
        
        if (len(re.findall(uppercase, password.data)) < 1 and len(re.findall(special_char_pattern, password.data)) < 2 and len(digits, password.data) < 3):
            raise ValidationError('Password must be include at least 1 Caps characters and 2 special char and at least 3 numbers')
        
class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    email = EmailField('Email', validators=[DataRequired(), Email()])
    submit = SubmitField('Login')