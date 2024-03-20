// decks
let deck;
let displayedCards = [];    // display the last 5 cards
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

// TODO: fix game loop, handle when deck runs out of cards & reloading webpage

// Main game loop
function game() {
    // Check if the deck is empty
    if (deck.length === 0) {
        // TOD: display wins and loss stats after cards run out
        console.log("out of cards")
        return
    }
    // Current card 
    let cardImg = document.createElement("img");
    card = deck.pop();
    cardValue = getValue(card);
    cardImg.src = "../../static/images/cards/" + card + ".png";
    cardImg.style.animation = "flyIn 1s forwards";  // add animation when new card loads
    document.getElementById("cards").appendChild(cardImg);

    // Next card
    nextCard = deck[deck.length - 1];
    nextCardValue = getValue(deck[deck.length - 1]);

    console.log("card: " + card)
    console.log("next card: " + nextCard)
    console.log(deck.length);
}

// Handles event when user clicks 'higher' or 'lower'
function play(guess, play_with) { // choice is when user select 'higher' or 'lower'
    // validates there is data for amount being bet 
    if (!validateForm()) {
        return;
    }
    // Get bet amount
    betAmount = parseInt(document.getElementById("bet-amount").value);
    console.log("Bet Amount: " + betAmount);

    // Get bet multiplier
    betMultiplier = parseInt(document.getElementById("multiplier-data").value);
    console.log("Multiplier: " + betMultiplier);
    ajaxConnection(guess, play_with)

    // Update to show only last 5 cards
    if (displayedCards.length < 5) {
        displayedCards.push(card); 
    } else {
        displayedCards.shift(); 
        displayedCards.push(card);
    }

    // Display cards from displayedCards
    document.getElementById("my-card").innerHTML = ""; // Clear existing cards

    for (const card of displayedCards) {
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
    game();
}

// Sends data to Flask backend and handles data sent from Flask backend
function ajaxConnection(guess, play_with) {
    
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
        console.log(`updated currency ${data.updated_currency}`);

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

// Helper function to get value of the card
function getValue(card) {
    let data = card.split("-"); // "4-C" -> ["4", "C"]
    let value = data[0];

    if (isNaN(value)) { //A J Q K
        if (value == "A") {
            return 11;
        } else if(value == "J") {   // jack is wild card card 
            return randomNumberGen(0, 11);
        }
        return 10;
    }
    return parseInt(value);
}
function randomNumberGen(min, max) {
    const random = Math.random();
    const random_num = random * (max - min) + min;
    return Math.floor(random_num);
}

// Helper function to build the deck
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

// Helper function to shuffle the deck
function shuffleDeck() {
    for (let i = 0; i < deck.length; i++) {
        let j = Math.floor(Math.random() * deck.length); // (0-1) * 52 => (0-51.9999)
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
}