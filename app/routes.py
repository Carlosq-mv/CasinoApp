from flask import jsonify, render_template, redirect, flash, request, url_for
from flask_login import current_user, login_user, login_required, logout_user
from flask_mail import Message
from app import myapp, db, mail
from app.forms import SignupForm, LoginForm, HiLoForm
from app.utils import generate_token, confirm_token, send_email, process_choice
from app.models import User
import random, os, datetime


@myapp.route("/login", methods=['GET', 'POST'])
@myapp.route("/", methods=['GET', 'POST'])
def login():
    # if user is logged in, it will take them to home age
    if current_user.is_authenticated:
        return redirect('/home')
    
    # custom form (defined in forms.py)
    form = LoginForm()
    
    # form is submitted and validators pass
    if form.validate_on_submit():
        # query database w/ user inputted username
        user = User.query.filter_by(username=form.username.data).first()
        
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
            flash('Error logging to your account. Please try again', 'loginError')  
                  
    return render_template('login.html', form=form)


@myapp.route("/signup", methods=['GET', 'POST'])
def signup():
    # if user is logged in, it will take them to home age
    if current_user.is_authenticated:
        return redirect('/home')
    
    # custom form (defined in forms.py)
    form = SignupForm()
    
    # form is submitted and validators pass
    if form.validate_on_submit():
        # create a new user w/ user inputted data
        new_user = User(username=form.username.data, email=form.email.data, date_of_birth=form.date_of_birth.data)
        
        # hashes password
        new_user.set_password(form.password.data)
        
        # adds new user to db
        try:
            db.session.add(new_user)
            db.session.commit()
            
            # email verification process
            token = generate_token(new_user.email)
            confirm_url = url_for('confirm_email', token=token, _external=True)
            html = render_template("includes/confirm_email.html", confirm_url=confirm_url)
            subject = "Please confirm your email"
            send_email(new_user.email, subject, html)
            flash('Please confirm your email account', 'confirm')
            return redirect('/inactive')

        except Exception as e:
            print('Cant create account:', e)
            flash('Error: Can not create account this moment. Please try again', 'accError')
            
        return redirect('/')
        
    return render_template("signup.html", form=form)

@myapp.route('/inactive', methods=['GET', 'POST'])
def inactive():
    return render_template('includes/inactive.html')
    
@myapp.route('/confirm/<token>')
def confirm_email(token):
    try:
        email = confirm_token(token)
    except:
        flash('The confirmation link is invalid or has expired.', 'danger')
        print('The confirmation link is invalid or has expired.')
        return redirect(url_for('inactive'))
        
    user = User.query.filter_by(email=email).first_or_404()
    
    if user.confirmed:
        flash('Account already confirmed. Please login.', 'success')
        print('Account already confirmed. Please login.')
        return redirect(url_for('login'))
    else:
        user.confirmed = True
        user.confirmed_on = datetime.datetime.now()
        db.session.add(user)
        db.session.commit()
        flash('You have confirmed your account. Thanks!', 'success')
        print('You have confirmed your account. Thanks!')
        login_user(user)
        return redirect(url_for('home'))
  
    
@myapp.route("/logout", methods=['GET', 'POST'])
@login_required
def logout():
    # Flask Login built in method that logout user
    logout_user()
    return redirect('/login')  


@myapp.route("/sample-graphics")
@login_required
def sample_graphics():
    return render_template('sample.html')


@myapp.route("/home", methods=['GET', 'POST'])
@login_required
def home():
    return render_template("home.html")


@myapp.route("/home/hi-lo", methods=['GET', 'POST'])
@login_required
def hi_lo():
    return render_template('HiLo/hi-lo.html')

@myapp.route('/home/hi-lo/<play_with>', methods=['GET', 'POST'])
@login_required
def hi_lo_game(play_with):   
    form = HiLoForm() 
    currency = current_user.coins if play_with == 'play-with-coins' else current_user.cash
    
    if request.method == 'GET':
        return render_template('HiLo/hi-lo-game.html', play_with=play_with, form=form, currency=currency)
    elif request.method == 'POST':
        data = request.json
        guess = data.get('guess')                   # 'higher' or 'lower' guess
        bet_amount = data.get('betAmount')          # bet amount
        mult = data.get('betMultiplier')            # bet multiplier bet_amount
        card_value = data.get('cardValue')          # current card's value
        next_card_value = data.get('nextCardValue') # next card's value
        
        print()
        print(f"Guess: {guess}")
        print(f"Bet Amt: ${bet_amount}")
        print(f"Multiplier: {mult}x")
        print(f"Value of curr card: {card_value}")
        print(f"Value of next card: {next_card_value}")
        print()
      
    
        # Process the choice and return the result
        result = process_choice(guess, card_value, next_card_value)
        
        
        # TODO: implement later
        # if currency < bet_amount:
        #     pass
            # if users current currency is less than the amount they bet, 
            # it should throw an error 
        
        # TODO: implement later (handle win, loss, and tie)
        if result == 'win':
            bet_amount += (bet_amount * mult)
            print(bet_amount)
            current_user.update_coins(bet_amount)
            db.session.commit()
            currency = current_user.coins
        elif result == 'tie':
            pass
        elif result == 'loss':
            bet_amount += (bet_amount * mult)
            print(bet_amount)
            current_user.update_coins(-bet_amount)
            db.session.commit()
            currency = current_user.coins
        else:
            print('Invalid choice')
            
        return jsonify({'result': result, 'updated_currency': currency }), 200, {'Content-Type': 'application/json'}