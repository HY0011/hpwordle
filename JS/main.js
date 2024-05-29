const wordle = 5;  
const chance= 6;  
let puzzle = '';
let tiles = []; 
let currentRow = 0;  
let index=0; 
let times=1;
const gameContainer = document.getElementById('game');  
const keyboardContainer = document.getElementById('keyboard'); 
let isKeyboardInitialized = false; 

//生成随机单词
function chooseRandomWord() {
    fetch('../data/words.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); 
        })
        .then(data => {
           
            // console.log('Loaded words:', data);

            let random = Math.floor(Math.random() * data.length);
            puzzle = data[random].toLowerCase();  
            // console.log('Random word:', puzzle);

            // startGame(puzzle);
        })
        .catch(error => {
            console.error('Error loading the JSON file:', error);
        });

}   
// function startGame(puzzle) {
//     console.log("The game has started with the word:", puzzle);
// }



function initGame() {
    const queryParams = new URLSearchParams(window.location.search);
    const encodedWord = queryParams.get('word');

    tiles = Array.from({ length: chance }, () => []); 
    for (let i = 0; i < chance*wordle; i++) {
        let cell = document.createElement('div');
        cell.className = 'cell';
        gameContainer.appendChild(cell);
    }
    initKeyboard(); 

    if (encodedWord) {
        puzzle = atob(encodedWord); 
        // setupGameForCustomWord(puzzle); 
    } else {
        chooseRandomWord(); 
    }
}

function initKeyboard() {
    if (isKeyboardInitialized) return; 

    const rows = ['QWERTYUIOP', 'ASDFGHJKL']; 
    rows.forEach(row => {                      
        const rowDiv = document.createElement('div');   
        rowDiv.className = 'key-row';          
        row.split('').forEach(char => {        
            const keyDiv = createKey(char);     
            rowDiv.appendChild(keyDiv);         
        });
        keyboardContainer.appendChild(rowDiv); 
    });

   
    const lastRow = 'ZXCVBNM';      
    const lastRowDiv = document.createElement('div'); 
    lastRowDiv.className = 'key-row';  
    const deleteKey = createKey('Delete', true);  
    deleteKey.style.flexGrow = '0.05'; 
    lastRowDiv.appendChild(deleteKey); 

    lastRow.split('').forEach(char => {  
        const keyDiv = createKey(char);  
        lastRowDiv.appendChild(keyDiv);    
    });

    const enterKey = createKey('Enter', true);
    enterKey.style.flexGrow = '0.05'; 
    lastRowDiv.appendChild(enterKey); 
    keyboardContainer.appendChild(lastRowDiv);

    isKeyboardInitialized = true; 
}

function createKey(char, isSpecial = false) {  
    const key = document.createElement('div');  
    key.textContent = char;        
    key.className = isSpecial ? 'key special' : 'key';  
    key.onclick = () => {
        // console.log("Key pressed:", char);
        handleKeyPress(char);}  
    return key;  
}

function updateTileColor() {
    const cells = document.querySelectorAll('.cell');
    const lowerPuzzle = puzzle.toLowerCase();
    for (let i = 0; i < 5; i++) {
        let tileIndex = currentRow * 5 + i;
        const currentChar = tiles[currentRow][i].toLowerCase(); 
        if (puzzle[i] === currentChar) {
            cells[tileIndex].style.backgroundColor = 'green';
        } else if (puzzle.includes(currentChar)) {
            cells[tileIndex].style.backgroundColor = 'yellow';
        } else {
            cells[tileIndex].style.backgroundColor = 'grey';
        }
    }
}


let wordWorker;
if (window.Worker) {
    wordWorker = new Worker('./JS/wordWorker.js');
    window.wordWorker = wordWorker; 

    wordWorker.onmessage = function(event) {
        const { type, exists, guess } = event.data;

        if (type === 'check') {
            if (exists) {
                var encodedWord = btoa(guess);
                var shareUrl = window.location.href.split('?')[0] + '?word=' + encodedWord;
                displayShareLink(shareUrl);
            } else {
                alert('The entered word does not exist, please re-enter a valid word.');
            }
        } else {
            if (!exists) {
                alert('The entered word does not exist, please re-enter a valid word.');
                tiles[currentRow] = []; 
                updateDisplay(); 
                return; 
            }
            updateTileColor(); 
    
            if (guess === puzzle) {
                alert('Congratulations, right guess!');
                return; 
            } else {
                if (currentRow < chance - 1) {
                    currentRow++;
                    tiles[currentRow] = []; 
                } else {
                    alert('The game is over and the answer is ' + puzzle);
                    return; 
                }
            }
        }
    };

    wordWorker.onerror = function(error) {
        console.error('Worker error: ' + error.message);
    };

    initGame(); 
}

function checkGuess() {
    if (tiles[currentRow].length === wordle) {  
        let guess = tiles[currentRow].join('').toLowerCase().trim();

        wordWorker.postMessage({ guess: guess });

    } else {
        alert('Please complete the entry for the current line.');
        return; 
    }
}

function updateDisplay() {
    const cells = document.querySelectorAll('.cell');
    let flatTiles = tiles.flat();  
    cells.forEach((cell, i) => {
        const row = Math.floor(i / wordle);
        const col = i % wordle;
        cell.textContent = tiles[row] && tiles[row][col] ? tiles[row][col] : '';  
    });
}


function handleKeyPress(char) {
    // console.log("Key pressed:", char); // Debugging output
    // console.log("Current tiles state:", tiles);
    // console.log("Current row:", currentRow);

    if (currentRow >= chance) {
        alert('Exceeds the number of attempts.');
        return; 
    }

    if (char === 'Enter') {
        if (tiles[currentRow] && tiles[currentRow].length === 5) {
            checkGuess();
        } else {
            alert('Please complete the entry for the current line.');
        }
    } else if (char === 'Delete') {
        if (tiles[currentRow] && tiles[currentRow].length > 0) {
            tiles[currentRow].pop();
            updateDisplay();  
        }
    } else {
        if (tiles[currentRow] && tiles[currentRow].length < 5) {
            tiles[currentRow].push(char);
            updateDisplay();  
        }
    }
}



