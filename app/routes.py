from flask import jsonify, render_template, redirect, flash, request, url_for
from flask_login import current_user, login_user, login_required, logout_user
from app.forms import SignupForm, LoginForm
from app import myapp, db
from app.models import User
import random

@myapp.route("/login", methods=['GET', 'POST'])
@myapp.route("/", methods=['GET', 'POST'])
def login():
    # if user is logged in, it will take them to home age
    # NOTE: current_user is provided by Flask-Login, it's the currently logged in use
    # Flask-Login handles login, logout, session managment
    if current_user.is_authenticated:
        return redirect('/home')
    
    # custom form (defined in forms.py)
    form = LoginForm()
    
    # form is submited and validators pass
    if form.validate_on_submit():
        # query database w/ user inputted username
        user = User.query.filter_by(username=form.username.data).first()
        
        print(user)
        print(user.check_password(form.password.data))
        
        # check is user DNE in db or users password is not correct
        if user is None or not user.check_password(form.password.data):
            print('Invalid credential. Try Again')
            return redirect('/')
        
        # built in Flask Login method that essentially "registers" user as logged in
        try:
            login_user(user)
            print(f"{user} is logged in")
            return redirect('/home')
        except Exception as e:
            print('Error: ', e)  
                  
    return render_template('login.html', form=form)


@myapp.route("/signup", methods=['GET', 'POST'])
def signup():
    # custom form (defined in forms.py)
    form = SignupForm()
    
    # form is submited and validators pass
    if form.validate_on_submit():
        print("im here")
        
        # create a new user w/ user inputted data
        new_user = User(username=form.username.data, email=form.email.data, date_of_birth=form.date_of_birth.data)
        
        # hashes password
        new_user.set_password(form.password.data)
        
        # adds new user to db
        try:
            db.session.add(new_user)
            db.session.commit()
        except:
            print('Cant create acc')
            
        return redirect('/')
        
    return render_template("signup.html", form=form)

@myapp.route("/sample-graphics")
@login_required
def sample_graphics():
    return render_template('sample.html')

@myapp.route("/logout", methods=['GET', 'POST'])
@login_required
def logout():
    # Flask Login built in method that logout user
    logout_user()
    return redirect('/login')

@myapp.route("/home", methods=['GET', 'POST'])
@login_required
def home():
    return render_template("home.html")

'''NOTE: This slots and blackjack is just sample code from Chat-GPT'''

@myapp.route('/spin', methods=['POST'])
@login_required
def spin():
    # Spin all three reels
    reel1 = spin_reel()
    reel2 = spin_reel()
    reel3 = spin_reel()

    # Check for win
    result = check_win(reel1, reel2, reel3)

    return jsonify({
        'reel1': reel1,
        'reel2': reel2,
        'reel3': reel3,
        'result': result
    })
    
@myapp.route('/slots')
@login_required
def slots():
    return render_template('slots.html')

# helper methods
def spin_reel():
    symbols = ['cherry', 'lemon', 'apple', 'orange', 'grape', 'banana']
    return random.choice(symbols)

def check_win(reel1, reel2, reel3):
    payouts =   {
        'cherry': 2,
        'lemon': 3,
        'apple': 5,
        'orange': 10,
        'grape': 20,
        'banana': 50
    }
    if reel1 == reel2 == reel3:
        return payouts[reel1]
    elif reel1 == reel2 or reel1 == reel3 or reel2 == reel3:
        return payouts[reel1] // 2  # Half of the payout for two matching symbols
    else:
        return 0


@myapp.route('/blackjack')
@login_required
def blackjack():
    return render_template('blackjack.html')

@myapp.route('/deal')
@login_required
def deal():
    # Define the deck of cards
    suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades']
    ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
    deck = [{'rank': rank, 'suit': suit} for rank in ranks for suit in suits]
    # Shuffle the deck
    random.shuffle(deck)
    
    # Deal two cards to the player and one to the dealer
    player_hand = [deck.pop(), deck.pop()]
    dealer_hand = [deck.pop()]

    return jsonify({'player_hand': player_hand, 'dealer_hand': dealer_hand})