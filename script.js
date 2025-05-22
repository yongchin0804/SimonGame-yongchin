document.addEventListener('DOMContentLoaded', () => {
    // Game state
    let sequence = [];
    let playerSequence = [];
    let score = 0;
    let highScore = 0;
    let topScores = JSON.parse(localStorage.getItem('simonTopScores')) || [];
    let strictMode = false;
    let gameActive = false;
    
    // DOM elements
    const buttons = document.querySelectorAll('.button');
    const startBtn = document.getElementById('start-btn');
    const strictBtn = document.getElementById('strict-btn');
    const scoreDisplay = document.getElementById('score');
    const highScoreDisplay = document.getElementById('high-score');
    const gameOverScreen = document.getElementById('game-over');
    const finalScoreDisplay = document.getElementById('final-score');
    const topScoresList = document.getElementById('top-scores-list');
    const playAgainBtn = document.getElementById('play-again-btn');
    
    // Initialize game
    function initGame() {
        sequence = [];
        playerSequence = [];
        score = 0;
        updateScore();
        gameActive = true;
    }
    
    // Start a new round
    function startNewRound() {
        playerSequence = [];
        sequence.push(Math.floor(Math.random() * 4));
        playSequence();
    }
    
    // Play the current sequence
    function playSequence() {
        let i = 0;
        const interval = setInterval(() => {
            if (i >= sequence.length) {
                clearInterval(interval);
                return;
            }
            
            const buttonId = sequence[i];
            lightUpButton(buttonId);
            i++;
        }, 800);
    }
    
    // Light up a button
    function lightUpButton(buttonId) {
        const button = document.getElementById(buttonId.toString());
        button.classList.add('lit');
        
        // Play sound (you would need audio files for this)
        // playSound(button.getAttribute('data-color'));
        
        setTimeout(() => {
            button.classList.remove('lit');
        }, 500);
    }
    
    // Handle player input
    function handleButtonClick(e) {
        if (!gameActive) return;
        
        const buttonId = parseInt(e.target.id);
        playerSequence.push(buttonId);
        lightUpButton(buttonId);
        
        // Check if the player's sequence matches
        if (playerSequence[playerSequence.length - 1] !== sequence[playerSequence.length - 1]) {
            // Wrong sequence
            if (strictMode) {
                gameOver();
            } else {
                setTimeout(() => playSequence(), 1000);
                playerSequence = [];
            }
            return;
        }
        
        // Correct sequence so far
        if (playerSequence.length === sequence.length) {
            // Completed the sequence
            score++;
            updateScore();
            
            if (score > highScore) {
                highScore = score;
                highScoreDisplay.textContent = highScore;
            }
            
            setTimeout(() => startNewRound(), 1000);
        }
    }
    
    // Update score display
    function updateScore() {
        scoreDisplay.textContent = score;
    }
    
    // Game over
    function gameOver() {
        gameActive = false;
        updateTopScores(score);
        finalScoreDisplay.textContent = score;
        gameOverScreen.classList.remove('hidden');
    }
    
    // Update top scores
    function updateTopScores(newScore) {
        topScores.push(newScore);
        topScores.sort((a, b) => b - a); // Sort descending
        topScores = topScores.slice(0, 10); // Keep only top 10
        
        // Save to localStorage
        localStorage.setItem('simonTopScores', JSON.stringify(topScores));
        
        // Update display
        renderTopScores();
    }
    
    // Render top scores
    function renderTopScores() {
        topScoresList.innerHTML = '';
        topScores.forEach((score, index) => {
            const li = document.createElement('li');
            li.textContent = `${index + 1}. ${score}`;
            topScoresList.appendChild(li);
        });
    }
    
    // Toggle strict mode
    function toggleStrictMode() {
        strictMode = !strictMode;
        strictBtn.textContent = `Strict Mode: ${strictMode ? 'ON' : 'OFF'}`;
    }
    
    // Event listeners
    buttons.forEach(button => {
        button.addEventListener('click', handleButtonClick);
    });
    
    startBtn.addEventListener('click', () => {
        initGame();
        startNewRound();
    });
    
    strictBtn.addEventListener('click', toggleStrictMode);
    
    playAgainBtn.addEventListener('click', () => {
        gameOverScreen.classList.add('hidden');
        initGame();
        startNewRound();
    });
    
    // Initialize top scores display
    renderTopScores();
    highScoreDisplay.textContent = topScores.length > 0 ? topScores[0] : 0;
    function playSound(color) {
    const audio = new Audio(`sounds/${color}.mp3`);
    audio.play().catch(e => console.log("Audio play failed:", e));
}
});