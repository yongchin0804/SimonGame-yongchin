document.addEventListener('DOMContentLoaded', () => {
    // Background music setup
    const bgMusic = document.getElementById('bgMusic');
    bgMusic.volume = 0.3;
    let musicOn = true;
    const musicBtn = document.getElementById('music-btn');
    
    // Game state
    let sequence = [];
    let playerSequence = [];
    let score = 0;
    let highScore = 0;
    let topScores = JSON.parse(localStorage.getItem('simonTopScores')) || [0, 0, 0]; // Initialize with [0,0,0]
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
    
    // Toggle music function
    function toggleMusic() {
        musicOn = !musicOn;
        musicBtn.textContent = `Music: ${musicOn ? 'ON' : 'OFF'}`;
        
        if (musicOn) {
            bgMusic.play().catch(e => console.log("Music play failed:", e));
        } else {
            bgMusic.pause();
        }
    }
    
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
        sequence.push(Math.floor(Math.random() * 5));
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
        playSound(button.getAttribute('data-color'));
        
        setTimeout(() => {
            button.classList.remove('lit');
        }, 500);
    }
    
    // Update score display and track level achievements
    function updateScore() {
        scoreDisplay.textContent = score;
        
        // Update high score display
        if (score > highScore) {
            highScore = score;
            highScoreDisplay.textContent = `Highest: Level ${highScore}`;
        }
        
        // Update top scores in real-time as player progresses
        if (score > 0 && !topScores.includes(score)) {
            updateTopScores(score);
        }
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
            
            setTimeout(() => startNewRound(), 1000);
        }
    }
    
    // Game over
    function gameOver() {
        gameActive = false;
        finalScoreDisplay.textContent = score;
        gameOverScreen.classList.remove('hidden');
    }
    
    // Update top scores
    function updateTopScores(newScore) {
        // Only add if it's a new level achievement
        if (!topScores.includes(newScore)) {
            topScores.push(newScore);
            topScores.sort((a, b) => b - a);
            topScores = topScores.slice(0, 3);
            
            // Save to localStorage
            localStorage.setItem('simonTopScores', JSON.stringify(topScores));
            
            // Update display
            renderTopScores();
        }
    }
    
    // Render top scores
    function renderTopScores() {
        topScoresList.innerHTML = '';
        // Filter out 0 scores and display only reached levels
        topScores.filter(score => score > 0).forEach((score) => {
            const li = document.createElement('li');
            li.textContent = `Reached Level ${score}`;
            topScoresList.appendChild(li);
        });
    }
    
    // Toggle strict mode
    function toggleStrictMode() {
        strictMode = !strictMode;
        strictBtn.textContent = `Strict Mode: ${strictMode ? 'ON' : 'OFF'}`;
    }
    
    // Play sound for buttons
    function playSound(color) {
        const audio = new Audio(`sounds/${color}.mp3`);
        audio.play().catch(e => console.log("Audio play failed:", e));
    }
    
    // Event listeners
    buttons.forEach(button => {
        button.addEventListener('click', handleButtonClick);
    });
    
    startBtn.addEventListener('click', () => {
        initGame();
        startNewRound();
        if (musicOn) bgMusic.play().catch(e => console.log("Music play failed:", e));
    });
    
    strictBtn.addEventListener('click', toggleStrictMode);
    
    musicBtn.addEventListener('click', toggleMusic);
    
    playAgainBtn.addEventListener('click', () => {
        gameOverScreen.classList.add('hidden');
        initGame();
        startNewRound();
        if (musicOn) bgMusic.play().catch(e => console.log("Music play failed:", e));
    });
    
    // Initialize displays
    renderTopScores();
    highScoreDisplay.textContent = topScores.length > 0 ? `Highest: Level ${Math.max(...topScores)}` : '0';
});
