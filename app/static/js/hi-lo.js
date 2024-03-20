let card;
let cardValue;
let nextCard;
let nextCardValue;
// TODO: fix game loop, handle when deck runs out of cards & reloading webpage
class CardDeck {
    constructor() {
        this.deck = [];
        this.size = 0;
    }
    // Helper function to shuffle the deck
    shuffleDeck() {
        for (let i = 0; i < this.deck.length; i++) {
            let j = Math.floor(Math.random() * this.size); // (0-1) * 52 => (0-51.9999)
            let temp = this.deck[i];
            this.deck[i] = this.deck[j];
            this.deck[j] = temp;
        }
    }

    // Helper function to build the deck
    buildDeck() {
        let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
        let types = ["C", "D", "H", "S"];
 
        for (let i = 0; i < types.length; i++) {
            for (let j = 0; j < values.length; j++) {
                this.push_back(values[j] + "-" + types[i]); //A-C -> K-C, A-D -> K-D
            }
        }
    }

    // Helper function to get value of the card
    getValue(card) {
        let data = card.split("-"); // "4-C" -> ["4", "C"]
        let value = data[0];
        

        if (isNaN(value)) { //A J Q K
            if (value == "A") { // Ace is a wild card
                return randomNumberGen(0, 11);
            } 
            return 10;
        }
        return parseInt(value);
    }
    peek () {
        if (this.isEmpty()) {
            console.log('Stack Underflow: No cards in the deck');
            return undefined;
        }
        return this.deck[this.size - 1];
    }
    pop_back () {
        if (this.isEmpty()) {
            console.log('Stack Underflow: No cards in the deck');
            return undefined;
        }
        const topCardIndex = this.size - 1;
        const topCard = this.deck[topCardIndex];
        // this.deck.pop();
        this.deck.splice(topCardIndex, 1);
        this.size--;
        return topCard;
    }
    isEmpty() {
        if(this.size === 0) {
            console.log('Error: No cards left');
            return true;
        }
        return false;
    }
    push_back(card_value) {
        if(this.size === 52) {
            console.log('Stack Overflow: No more than 52 cards at a time');
            return undefined;
        }
        this.deck[this.size] = card_value;
        this.size++;
    }
}
class GameClass {
    constructor() {
        this.displayedCards = [];
    }
 
    update_screen() {
        // Update to show only last 5 cards
        if (this.displayedCards.length < 5) {
            this.displayedCards.push(card); 
        } else {
            this.displayedCards.shift(); 
            this.displayedCards.push(card);
        }

        // Display cards from displayedCards
        document.getElementById("my-card").innerHTML = ""; // Clear existing cards

        for (const card of this.displayedCards) {
            let usedCardDiv = document.createElement("div");
            usedCardDiv.className = "used-card";
    
            let usedCardImg = document.createElement("img");
            usedCardImg.src = "../../static/images/cards/" + card + ".png";
            usedCardImg.style.animation = "fadeIn 1s forwards";
    
            usedCardDiv.appendChild(usedCardImg);
            document.getElementById("my-card").appendChild(usedCardDiv);
            
        }
        // prevent previous cards from populating screen
        document.getElementById("cards").innerHTML = ""
    }   

}
let deck_cards = new CardDeck();
let game_w = new GameClass();

window.onload = startGame();

function startGame() {
    deck_cards.buildDeck();
    deck_cards.shuffleDeck();
    renderGame();
    document.getElementById("lower-button").addEventListener("click", () => play("lower"));
    document.getElementById("higher-button").addEventListener("click", () => play("higher"));
}

function renderGame() {
    
    if (deck_cards.isEmpty()) {
        // TODO: display wins and loss stats after cards run out
        return
    }

    // Current card 
    let cardImg = document.createElement("img");
    card = deck_cards.pop_back();
    console.log(card);

    cardValue = deck_cards.getValue(card);
    cardImg.src = "../../static/images/cards/" + card + ".png";
    cardImg.style.animation = "flyIn 1s forwards";  // add animation when new card loads
    document.getElementById("cards").appendChild(cardImg);

    // Next card
    nextCard = deck_cards.peek();
    nextCardValue = deck_cards.getValue(nextCard);

    console.log(`card: ${card} -- value ${deck_cards.getValue(card)}`)
    console.log(`next card: ${nextCard} -- value ${deck_cards.getValue(nextCard)} `)
    console.log(deck_cards.deck);
}




function play(guess) { 
    const play_with = document.getElementById("play_with").value;
    console.log("play_with:", play_with);

    if (!validateForm()) {
        return;
    }
    // Get bet amount
    const betAmount = parseInt(document.getElementById("bet-amount").value);
    // Get bet multiplier
    const betMultiplier = parseInt(document.getElementById("multiplier-data").value);

    ajaxConnection(guess, play_with, betAmount, betMultiplier);
    game_w.update_screen();
    renderGame();
}

// Sends data to Flask backend and handles data sent from Flask backend
function ajaxConnection(guess, play_with, betAmount, betMultiplier) {
    
    fetch(`/home/hi-lo/${play_with}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
            "guess": guess, 
            "cardValue" : cardValue,
            "betAmount" : betAmount,
            "betMultiplier" : betMultiplier,
            "nextCardValue" : nextCardValue
         })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error("Network response was not ok.");
    })
    .then(data => { // Handle the response from the Flask backend
        // handles and dynamically updates user's cash/coin amount
        document.getElementById("currency").innerText = data.updated_currency;

        //console.log(`updated currency ${data.updated_currency}`);

        if(data.result === "win")
            console.log("you won");
        else if(data.result === "tie")
            console.log("you tied");
        else
            console.log("you lost");
    })
    .catch(error => {
        console.error("There was a problem with the fetch operation:", error);
    });
}

// Validates bet amount inout form (user must input a value)
function validateForm() {
    let betAmountInput = document.getElementById("bet-amount");
    let isValid = betAmountInput.checkValidity(); 

    if (!isValid) {
        betAmountInput.reportValidity();
    }
    return isValid;
}

function randomNumberGen(min, max) {
    const random = Math.random();
    const random_num = random * (max - min) + min;
    return Math.floor(random_num);
}

