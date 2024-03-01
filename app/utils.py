from itsdangerous import URLSafeTimedSerializer
from flask_mail import Message
from app import myapp, mail


def generate_token(email):
    serializer = URLSafeTimedSerializer(myapp.config["SECRET_KEY"])
    return serializer.dumps(email, salt=myapp.config["SECURITY_PASSWORD_SALT"])


def confirm_token(token, expiration=3600):
    serializer = URLSafeTimedSerializer(myapp.config["SECRET_KEY"])
    try:
        email = serializer.loads(
            token, salt=myapp.config["SECURITY_PASSWORD_SALT"], max_age=expiration
        )
        return email
    except Exception:
        return False


def send_email(to, subject, template):
    msg = Message(
        subject,
        recipients=[to],
        html=template,
        sender=myapp.config["MAIL_DEFAULT_SENDER"],
    )
    mail.send(msg)