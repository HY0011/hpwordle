document.getElementById('customWordleBtn').addEventListener('click', function() {
    var form = document.getElementById('customWordForm');
    if (form.style.display === 'none') {
        form.style.display = 'block';
    } else {
        form.style.display = 'none';
    }
});


function submitCustomWord() {
    var inputWord = document.getElementById('wordInput').value.trim().toLowerCase();
    
    if (!inputWord || inputWord.length !== 5 || !/^[a-z]+$/.test(inputWord)) {
        alert('Please enter a valid 5-letter word using only alphabetical characters.');
        return;
    }
    
    wordWorker.postMessage({ type: 'check', guess: inputWord });
}

function generateShareLink(word) {
    var encodedWord = btoa(word); 
    var shareUrl = window.location.href.split('?')[0] + '?word=' + encodedWord; 
    console.log("Share URL: ", shareUrl);
    displayShareLink(shareUrl);
}

function displayShareLink(url) {
    var linkInput = document.getElementById('shareLinkInput');
    linkInput.value = url;  

    var modal = document.getElementById('linkModal');
    modal.style.display = 'flex';  
}

function copyToClipboard() {
    var linkInput = document.getElementById('shareLinkInput');
    linkInput.select();  
    document.execCommand('copy');  

    alert('Link copied to clipboard!');  
}

function closeModal() {
    var modal = document.getElementById('linkModal');
    modal.style.display = 'none';  
}
