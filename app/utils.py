from itsdangerous import URLSafeTimedSerializer
from flask_mail import Message
from app import myapp, mail
from math import log

# TODO: change from global variable
multiplier = 1
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
    
    
def process_choice(guess, card_value, next_card_value):
    if card_value and next_card_value not in range(1, 11):
        raise Exception('Not a valid card value')
    if guess not in ('higher', 'lower'):
        raise Exception('Not a valid guess')
    
    if next_card_value > card_value and guess == 'higher':
        # the user wins here 
        return 'win'
    elif next_card_value < card_value and guess == 'lower':
        # the user wins here
        return 'win'
    elif card_value == next_card_value:
        # the user ties here
        return 'tie'
    else:
        # the use loses
        global multiplier
        multiplier = 1
        return 'loss'


def get_probability(card, guess):
    if card not in range(1, 11):
        raise Exception('Not a valid card value')
    if guess not in ('higher', 'lower'):
        raise Exception('Not a valid guess')
    
    if guess == 'lower':
        odds = (card - 1)/13
    elif guess == 'higher':
        odds = (13-card) / 13
        
    return odds

def calculate_multiplier(probability):
    '''    
    Multiplier is calculated by taking the natural logarithm of the probability a card is higher or lower.
    This ensures when the probability of a card being higher or lower, is really high,
    the multiplier value will not increase by too much, and when probability is lower (a higher risk bet), 
    the multiplier is higher. 
    Higher Risk --> Higher Multiplier, Lower Risk --> Lower Multiplier
    '''
    if probability <= 0:
        raise Exception('Probability must be higher than 0')
    global multiplier
    # print(f"base mult {multiplier}")

    multiplier += abs(log(probability))
    return round(multiplier, 2)
