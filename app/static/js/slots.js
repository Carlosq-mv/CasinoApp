// Get a reference to the "Spin" button element
const spinButton = document.getElementById('spinButton');

// Add event listener to the "Spin" button
spinButton.addEventListener('click', () => {
    // Call the spin function when the button is clicked
    console.log('Deal button clicked');
    spin();
});

function spin() {
    fetch('/spin', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('results').innerHTML = `
            <p>Reel 1: ${data.reel1}</p>
            <p>Reel 2: ${data.reel2}</p>
            <p>Reel 3: ${data.reel3}</p>
            <p>Result: ${data.result}</p>
        `;
    })
    .catch(error => console.error('Error:', error));
}
