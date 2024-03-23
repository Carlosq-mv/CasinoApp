from app import db, login
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

@login.user_loader
def load_user(id):
    return User.query.get(int(id))

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(32), nullable=False)
    password = db.Column(db.String(32), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    admin = db.Column(db.Boolean, nullable=False, default=False)
    confirmed = db.Column(db.Boolean, nullable=False, default=False)
    confirmed_on = db.Column(db.DateTime, nullable=True)
    coins = db.Column(db.Integer, nullable=False, default=3200)
    cash = db.Column(db.Integer, nullable=False, default=1500)
    transactions = db.relationship('Transaction', backref='owner')

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)
    
    def update_currency(self, value, mode):
        if mode not in ('coins', 'cash'):
            raise Exception('Not a valid mode. Must be Coins or Cash')
        if mode == 'coins':
            self.coins += value
        elif mode == 'cash':
            self.cash += value
        
    def __repr__(self):
        return f'<user {self.id}: {self.username}>'
    
class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    transaction_type = db.Column(db.String(32), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    game = db.Column(db.String(32), nullable=False)
    
    def __repr__(self):
        return f'<transaction {self.id}: ${self.amount}>'
    