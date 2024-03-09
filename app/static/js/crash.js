// GPT-3.5 generated code just to get started
// Buttons and display
const startButton = document.getElementById('start-button');
const crashPointDisplay = document.getElementById('crash-point');
const betInput = document.getElementById('bet');
const placeBetButton = document.getElementById('place-bet');
const resultDisplay = document.getElementById('result');

// Check if game started and find crashPoint
let isGameStarted = false;
let crashPoint = null;

// Check if game started
function startGame() {
    if (!isGameStarted) {
        crashPoint = generateCrashPoint();
        crashPointDisplay.textContent = `Crash Point: ${crashPoint}`;
        isGameStarted = true;
    } else {
        alert("Game already started!");
    }
}

// Generates a fixed crashpoint, if user bets below crash point they win.
function generateCrashPoint() {
    return (Math.random() * (2.0 - 1.0) + 1.0).toFixed(2);
}

// Userp lays bet here.
function placeBet() {
    if (!isGameStarted) {
        alert("Please start the game first.");
        return;
    }

    const betAmount = parseInt(betInput.value);
    const result = betAmount * crashPoint;
    resultDisplay.textContent = `You won ${result} coins!`;
    isGameStarted = false;
}

startButton.addEventListener('click', startGame);
placeBetButton.addEventListener('click', placeBet);

// TODO: figure out game graphics, business logic, and HTML backend