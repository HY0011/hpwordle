let words = [];

fetch('../data/words.json')
    .then(response => response.json())
    .then(data => {
        words = data; 
        // console.log('Words loaded:', words.length); 
    })
    .catch(error => console.error('Failed to load words:', error));



self.onmessage = function(e) {
    const { type, guess } = e.data;
    const normalizedGuess = guess.toLowerCase();
    const exists = words.includes(normalizedGuess);

    postMessage({ type: type, exists: exists, guess: normalizedGuess });
};

