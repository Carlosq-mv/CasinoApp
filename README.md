# Flask app w/ Three.js

# Setup
* `git clone https://github.com/Carlosq-mv/CasinoApp.git` to clone the repository in your current directory.
* `cd CasinoApp` to enter the repository 
* `python -m venv venv` to create a virtual environment.  
* `venv\Scripts\activate` to activate virtual environment.  
* `pip install -r requirements.txt` to install all the dependencies needed to run the app.
* `python run.py` to run the application
* ctrl/cmd + click `http://127.0.0.1:5000` to run the application in your broswer

# Configure Private Environment Data
- Change `.env.sample` to `.env` 
    - Terminal Command: `mv .env.sample .env` 
- Add `.env` to your `.gitignore` file so private data stays hidden   
    - Terminal Command: `echo ".env" >> .gitignore` 
* Set your own `SECRET_KEY`, `SECURITY_PASSWORD_SALT`, *`MAIL_USERNAME`, *`MAIL_PASSWORD`
### ***For Gmail Users**
##### **MUST HAVE:**  
1. Use a working gmail account
2. Have 2 Factor Authentication turned on  

##### Setup App Password:
* (**DO NOT** use your personal Gmail password, it will not work)
* Go to your Gmail **Account** -> **Security** -> **How you sign in to Google**
* Click on **2-Step Verification**
* Scroll to the bottom of the page until you see **App Passwords**, click on it (this should be at the bottom of the page)
* Create a new App name (name doesn't matter just choose something that is relevant)
* It should generate a password, copy that password
* Paste that password in you `.env` variable: `MAIL_PASSWORD` (**NOTE:** when you add it, **REMOVE** all whitespaces)
* This should allow for emails to be sent to your account