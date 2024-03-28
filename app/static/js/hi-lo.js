// Deck class
class Deck {
    constructor() {
        this.deck = [];
        this.dealtCards = [];
        this.size = 0;
        this.maxSize = 52;
        this.buildDeck();
        this.shuffleDeck();
    }

    dealCard() {
        if (this.isEmpty()) {
            console.error('No cards in the deck');
            return undefined;
        }
        this.size--;
        const dealtCard = this.deck.pop();
        this.dealtCards.push(dealtCard);
        return dealtCard;
    }

    nextCard() {
        if (this.isEmpty()) {
            console.error('No cards in the deck');
            return undefined;
        }
        return this.deck[this.size - 1];
    }


    buildDeck() {
        let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
        let types = ["C", "D", "H", "S"];
        for (let i = 0; i < types.length; i++) {
            for (let j = 0; j < values.length; j++) {
                this.deck.push(values[j] + "-" + types[i]);
                this.size++;
            }
        }
        // Remove two A's, two K's and two J's
        // this.deck = [
        //     "A-C", "2-C", "3-C", "4-C", "5-C", "6-C", "7-C", "8-C", "9-C", "10-C", "J-C", "Q-C", "K-C",
        //     "A-D", "2-D", "3-D", "4-D", "5-D", "6-D", "7-D", "8-D", "9-D", "10-D", "J-D", "Q-D", "K-D",
        //     "A-H", "2-H", "3-H", "4-H", "5-H", "6-H", "7-H", "8-H", "9-H", "10-H", "J-H", "Q-H", "K-H",
        //     "A-S", "2-S", "3-S", "4-S", "5-S", "6-S", "7-S", "8-S", "9-S", "10-S", "J-S", "Q-S", "K-S"
        // ];
        // this.size = this.deck.length;
        
    }

    shuffleDeck() {
        for (let i = 0; i < this.deck.length; i++) {
            let j = Math.floor(Math.random() * this.size);
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    getValue(card) {
        if (!card) return 0;
        let data = card.split("-"); // "4-C" -> ["4", "C"]
        let value = data[0];
        
        if (isNaN(value)) { //A J Q K
            if(value == "A") 
                return 1;
            else if(value == "K") 
                return 13;
            else if(value == "Q")
                return 12;
            else if(value == "J")
                return 11;
        }
        return parseInt(value);
    }

    sizeOf() {
        return this.size;
    }

    isEmpty() {
        return this.size === 0;
    }

    isFull() {
        return this.size === this.maxSize;
    }

    getDeck() {
        return this.deck;
    }
}
// Make sure DOM is loaded before and JS code runs
document.addEventListener("DOMContentLoaded", function() {
    // Buttons from HTML doc
    const startButton = document.getElementById('start-game');
    const lowerButton = document.getElementById('lower-button');
    const higherButton = document.getElementById('higher-button');
    const cashOutButton = document.getElementById('cash-out-button');
    // Mode (playing w/ coins or cash)
    const mode = document.getElementById('play-with').value;
    let cardDeck, currentCard;
    // Min and Max bet amounts
    const minBetAmount = 1;
    // Max Bet Amount is different for coins(10,000) and cash(1200)
    const maxBetAmount = mode == 'play-with-coins' ? 10000 : 1200;

    function mainGame() {      
        cardDeck = new Deck(); // Initialize the deck
        currentCard = cardDeck.dealCard(); // Deal the first card
        updateScreen(currentCard); // Update the screen with the first card
        updateUsedCardsDisplay();
        document.getElementById("default-card-back").style.display = 'none';    // Bby default a card back will be shown
        lowerButton.disabled = false;
        higherButton.disabled = false;
        startButton.style.display = 'none'; // Once game starts, hide 'start game' button
        document.getElementById('bet-amount').disabled = true;
        document.getElementById("cash-out-button").style.display = 'inline-block'; // Adjust display as needed
    }
    function startNewRound() {
        // Reset the deck
        cardDeck = new Deck(); 
        
        // Clear the screen
        clearScreen();
  
        // Re-enable the buttons
        lowerButton.disabled = false;
        higherButton.disabled = false;

        startButton.style.display = 'inline-block'; // Show the Start Game button
        document.getElementById("cash-out-button").style.display = 'none'; // Hide the Cash Out button
        document.getElementById("used-cards").style.display = "none";   // Hide the used cards div
        document.getElementById("bet-amount").value = "";
        document.getElementById('bet-amount').disabled = false;


        console.log("New round started");
    }
    // Handles when user clicks 'higher' or 'lower' button
    function handleClick(event) {
        console.log(currentCard)
        console.log(cardDeck.getDeck())
        console.log(cardDeck.sizeOf())

        // Make sure there is an input
        if (!validateForm()) {
            return;
        }
        const nextCard = cardDeck.nextCard();
        if (!nextCard) return; // No more cards

        // Get all of the values
        const guess = event.target.id === 'higher-button' ? 'higher' : 'lower';
        const currentCardValue = cardDeck.getValue(currentCard);
        const nextCardValue = cardDeck.getValue(nextCard);
        const betAmount = parseFloat(document.getElementById('bet-amount').value);
        const betMult = parseFloat(document.getElementById('multiplier').textContent);

        // Data to be sent and process by Flask Backend
        const dataToSend = {
            "guess": guess,
            "currentCard": currentCardValue,
            "nextCard": nextCardValue,
            "betAmount": betAmount,
            "betMult": betMult,
        };
        sendDataToBackend(dataToSend);

        // Prepare for the next round
        currentCard = cardDeck.dealCard(); // Move to the next card
        if (!currentCard) {
            console.log("Game Over: No more cards.");
            lowerButton.disabled = true;
            higherButton.disabled = true;
            return;
        }
        updateScreen(currentCard);
        updateUsedCardsDisplay();
    }
    /*************** Validation methods ***************/
    // Validates bet amount input form (user must input a value)
    function validateForm() {
        const betAmountInput = document.getElementById("bet-amount");
        const betAmountValue = betAmountInput.value.trim();
    
        // Check for empty or non-numeric values first
        if (betAmountValue === '' || isNaN(betAmountValue)) {
            showOutcomeMessage(
                "Invalid Bet", 
                "Please enter a valid numeric bet amount.", 
                "Non-numeric values or empty input are not allowed.", "");
            toggleModalStatus(true);
            return false;
        }
    
        // Bet amount should now be a number
        const betAmount = parseFloat(betAmountValue);
    
        // Check for other bet validation criteria
        return validateBetAmount(betAmount);
    }
    // Validates bet amount input against minimum and maximum values and user's balance
    function validateBetAmount(betAmount) {
        // Get the current user's balance
        const userBalance = parseFloat(document.getElementById('currency').textContent);
        console.log(userBalance)
        const title = 'Error Processing Bet';
 
        // Validate bet amount against minimum and maximum values and user's balance
        if (betAmount < minBetAmount) {
            showOutcomeMessage(
                title, 
                `Oops! Your bet of $${betAmount} is below the minimum amount of $${minBetAmount}`, 
                "Please increase your bet to continue", "");
            toggleModalStatus(true);    // Toggle error modal css
            return false;
        } 
        else if(betAmount > maxBetAmount && betAmount > userBalance) {
            showOutcomeMessage(
                title, 
                `Woah There! Your bet of $${betAmount} is past out max of $${maxBetAmount} and you don't have the sufficient funds`, 
                "Please lower your bet and adding funds to your balance", "");
            toggleModalStatus(true);    // Toggle error modal css
            return false;
        }
        else if (betAmount > maxBetAmount) {
            showOutcomeMessage(
                title, 
                `Woah There! Your bet of $${betAmount} is past out max of $${maxBetAmount}`, 
                "Please lower your bet to continue", ""); 
            toggleModalStatus(true);    // Toggle error modal css      
            return false;
        } 
        else if (betAmount > userBalance) {
            showOutcomeMessage(
                title, 
                `Look like balance is a bit short. You need at least $${betAmount} in your balance to place this bet`, 
                `Consider lowering your betting or adding fund to you balance`, "");    
            toggleModalStatus(true);    // Toggle error modal css  
            return false;
        }
        toggleModalStatus(false);   
        return true;
    }
    /*************** Screen/UI helper methods ***************/
    // Clear Screen of all cards (current card, used cards) -- used when starting new round
    function clearScreen() {
        // Function to clear the game screen/UI
        const cardContainer = document.getElementById("current-card");
        const usedCardsContainer = document.getElementById("used-cards");
    
        // Clear the current card display and used cards display
        cardContainer.innerHTML = '';
        usedCardsContainer.innerHTML = '';
        document.getElementById("default-card-back").style.display = 'block'; 
        document.getElementById("used-cards").style.display = "none";
    }
    // Loads a new card to the screen, and makes sure no more than 1 card populates the screen
    function updateScreen(card) {
        const cardContainer = document.getElementById("current-card");

        // Remove any existing image before adding a new one
        while (cardContainer.firstChild) {
            cardContainer.removeChild(cardContainer.firstChild);
        }

        // Create a new img element for the card
        let cardImg = document.createElement("img");
        cardImg.src = `../../static/images/cards/${card}.png`;
        cardImg.alt = card; // alt text
        cardImg.classList.add('animate__animated', 'animate__lightSpeedInRight')    // animation using animate.css
        // cardImg.style.animation = "flyIn 1s ease-in-out"; // animation

        // Play audio for new card
        let myAudio = document.querySelector('#audio');
        if (myAudio) {
            myAudio.play().catch(error => {
                console.log('Error playing audio:', error);
            });
        }
        // Append the new img element to the container
        cardContainer.appendChild(cardImg);
        
    }
    // Used cards during a round will be displayed under the current card
    function updateUsedCardsDisplay() {
        const usedCardsContainer = document.getElementById("used-cards");
        usedCardsContainer.innerHTML = "";  // Clear previous cards

        if (cardDeck.dealtCards.length > 0) {
            // There are used cards to display, so make the container visible
            usedCardsContainer.style.display = "flex";  // Adjust display style as needed

            cardDeck.dealtCards.forEach(card => {
                const cardImg = document.createElement("img");
                cardImg.src = `../../static/images/cards/${card}.png`;
                cardImg.alt = card;
                cardImg.classList.add("used-card"); // Apply styling
                usedCardsContainer.appendChild(cardImg);
            });
        } else {
            // No used cards to display, so hide the container
            usedCardsContainer.style.display = "none";
        }
    }
    // Used to display feedback to the user with modals
    function showOutcomeMessage(title, message, outcome, updatedBalance) {
        let modal = new bootstrap.Modal(document.getElementById('outcomeModal'), {});
        document.getElementById('game-action').textContent = title;
        document.getElementById('message').textContent = message;
        document.getElementById('outcome').textContent = outcome;
        document.getElementById('updated-balance').textContent = updatedBalance;
        modal.show();
    } 
    // Helper Function that will toggle UI of modal depending if there is an error or not
    function toggleModalStatus(isError) {
        const modal = document.getElementById('outcomeModal');
        if(isError) 
            modal.classList.add('error-modal');
        else
            modal.classList.remove('error-modal');
    }

    /************ Send & Get Date from Flask Backend ************/  
    function sendDataToBackend(data) {
        fetch(`/home/hi-lo/${mode}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {     // Handle any response from the backend here
            console.log(data);

            if(data.result == 'loss') {
                showOutcomeMessage("Game Over", "Not this time... 🍀 Luck's bound to turn around!", `Losses: $${data.lost_money}`, `New Balance: $${data.updated_currency}`)
                startNewRound();
            } 
            // Handles user action - cashout 
            if(data.success != undefined) 
                showOutcomeMessage("Cash Out!", "🎉 Congratulations! You've struck gold! 🥇 Keep your streak alive!", `Winnings: $${data.win_amount}`, `New Balance: $${data.updated_currency}`);
            if(data.updated_mult != undefined)
                document.getElementById('multiplier').innerHTML = data.updated_mult;
            if(data.updated_currency != undefined)
                document.getElementById('currency').innerHTML = data.updated_currency;
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    // Add an action when a button is clicked
    higherButton.addEventListener('click', handleClick);
    lowerButton.addEventListener('click', handleClick);
    cashOutButton.addEventListener('click', function() {
        // Logic to handle cashing out, like saving the score or resetting for a new game
        console.log("Player cashed out!");
        const betAmount = parseFloat(document.getElementById('bet-amount').value);
        const betMult = parseFloat(document.getElementById('multiplier').textContent);
        
        const data = {
            'action' : 'cashout',
            'betAmount' : betAmount,
            'betMult' : betMult,
        }
        sendDataToBackend(data);
        startNewRound(); 
    });
    // Actions for when start game is clicked
    startButton.addEventListener('click', function() {
        console.log('start button clicked');
        if (validateForm()) { // Valid bet entered, start the game
            this.style.display = 'none';
            mainGame();
        } else {
            // Invalid bet entered, validateForm() should handle showing the message
            console.log('Invalid bet amount data');
        }
    });
    // CSS for buttons - make sure effects take place when clicked
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            // Temporarily add a class or directly manipulate the style
            button.classList.add('clicked');

            // Use a timeout to revert the button back to its original state
            setTimeout(() => {
                button.classList.remove('clicked');
                // Optionally, force blur to remove focus from the button
                button.blur();
            }, 200); // Adjust time based on your needs and the length of your animations
        });
    });
    window.addEventListener('beforeunload', function (e) {
        // Cancel the event
        e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
        // Chrome requires returnValue to be set
        e.returnValue = 'Are you sure? Changes might be lost';
      });
});