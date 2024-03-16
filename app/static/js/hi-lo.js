// decks
let deck;
let usedCardDeck = [];
let displayedCards = []; 
let gameOver = false;
// cards
let card;
let cardValue;
let nextCard;
let nextCardValue;
// betting data
let betAmount;
let betMultiplier;

window.onload = function() {
    buildDeck();
    shuffleDeck();
    game();
}

function game() {
    if (gameOver === false) {

        // get bet amount
        betAmount = parseInt(document.getElementById("bet-amount").value);
        console.log("Bet Amount: " + betAmount);

        // get bet multiplier
        betMultiplier = parseInt(document.getElementById("multiplier-data").value);
        console.log("Multiplier: " + betMultiplier);

        // current card 
        let cardImg = document.createElement("img");
        card = deck.pop();
        cardValue = getValue(card);
        cardImg.src = "../../static/images/cards/" + card + ".png";
        document.getElementById("cards").appendChild(cardImg);

        // next card
        nextCard = deck[deck.length - 1];
        nextCardValue = getValue(deck[deck.length - 1]);

        console.log("card: " + card)
        console.log("next card: " + nextCard)
        
        // TODO: fix game loop
        // Check if the deck is empty
        if (deck.length === 0) {
            gameOver = true;
            console.log("out of cards")
        }
    }

}

function play(guess, play_with) { // choice is when user select 'higher' or 'lower'
    submitChoice(guess, play_with)
    
    usedCardDeck.push(card)
    console.log(usedCardDeck)
  
    // Update to show only last 5 cards
    if (displayedCards.length < 5) {
        displayedCards.push(card); // Add card if sub-array is not full
    } 
    else {
        displayedCards.shift(); // Remove oldest card if sub-array is full
        displayedCards.push(card); // Add newest card
    }

    // Display cards from displayedCards
    document.getElementById("my-card").innerHTML = ""; // Clear existing cards

    for (const card of displayedCards) {
        let usedCardDiv = document.createElement("div");
        usedCardDiv.className = "used-card";
        let usedCardImg = document.createElement("img");
        usedCardImg.src = "../../static/images/cards/" + card + ".png";
        usedCardDiv.appendChild(usedCardImg);
        document.getElementById("my-card").appendChild(usedCardDiv);
    }

    // clears cards
    document.getElementById("cards").innerHTML = ""
    game();
}

function handlePlayClick() {
    // Get guess from user input or logic (replace "lower")
    const guess = "lower"; // Replace with actual guess
    const play_with = "{{play_with}}"; // Access play_with from your template

    // Perform game logic (process guess, update game state)
    play(guess, play_with); // Call your existing play function
}
// sends data to Flask route
function submitChoice(guess, play_with) {
    
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
    .then(data => {
        // Handle the response from the Flask backend if needed
        console.log(data);
    })
    .catch(error => {
        console.error("There was a problem with the fetch operation:", error);
    });
}



// helper function to get value of the card
function getValue(card) {
    let data = card.split("-"); // "4-C" -> ["4", "C"]
    let value = data[0];

    if (isNaN(value)) { //A J Q K
        if (value == "A") {
            return 11;
        }
        return 10;
    }
    return parseInt(value);
}

// helper function to build the deck
function buildDeck() {
    let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let types = ["C", "D", "H", "S"];
    deck = [];

    for (let i = 0; i < types.length; i++) {
        for (let j = 0; j < values.length; j++) {
            deck.push(values[j] + "-" + types[i]); //A-C -> K-C, A-D -> K-D
        }
    }
    //console.log(deck)
}

// helper function to shuffle the deck
function shuffleDeck() {
    for (let i = 0; i < deck.length; i++) {
        let j = Math.floor(Math.random() * deck.length); // (0-1) * 52 => (0-51.9999)
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
}
