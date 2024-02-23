document.getElementById('deal-button').addEventListener('click', () => 
{
    console.log('Deal button clicked');
    fetch('/deal')
        .then(response => response.json())
        .then(data => {
            // Display player and dealer hands
            document.getElementById('player-hand').innerText = `Player hand: ${JSON.stringify(data.player_hand)}`;
            document.getElementById('dealer-hand').innerText = `Dealer hand: ${JSON.stringify(data.dealer_hand)}`;
        })
        .catch(error => console.error('Error:', error));
});