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

    function mainGame() {
        cardDeck = new Deck(); // Initialize the deck
        currentCard = cardDeck.dealCard(); // Deal the first card
        updateScreen(currentCard); // Update the screen with the first card
        updateUsedCardsDisplay()
        lowerButton.disabled = false;
        higherButton.disabled = false;
        startButton.style.display = 'none';
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
    // Validates bet amount input form (user must input a value)
    function validateForm() {
        let betAmountInput = document.getElementById("bet-amount");
        let isValid = betAmountInput.checkValidity(); 

        if (!isValid) {
            betAmountInput.reportValidity();
        }
        return isValid;
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
        cardImg.style.animation = "flyIn 1s ease-in-out"; // animation

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
        .then(data => {
            console.log(data);
            // Handle any response from the backend here
            if(data.result == 'loss') {
                let lossModal = new bootstrap.Modal(document.getElementById('outcomeModal'), {});
                document.getElementById('game-action').textContent = "Game Over";
                document.getElementById('message').textContent = "Not this time... 🍀 Luck's bound to turn around!";
                document.getElementById('outcome').textContent = "Losses: $" +data.lost_money;
                document.getElementById('updated-balance').textContent = data.updated_currency;
                lossModal.show();
                startNewRound();
            } 
            if(data.success != undefined) {
                let winModal = new bootstrap.Modal(document.getElementById('outcomeModal'), {});
                document.getElementById('game-action').textContent = "Cash Out";
                document.getElementById('message').textContent = "🎉 Congratulations! You've struck gold! 🥇 Keep your streak alive!";
                document.getElementById('outcome').textContent = "Winnings: $" + data.win_amount;
                document.getElementById('updated-balance').textContent = data.updated_currency;
                winModal.show();
            }
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
    startButton.addEventListener('click', function() {
        this.style.display = 'none';
        mainGame();
    });
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
});