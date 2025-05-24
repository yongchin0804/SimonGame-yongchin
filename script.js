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
    let topScores = JSON.parse(localStorage.getItem('simonTopScores')) || [];
    let strictMode = false;
    let gameActive = false;
    let isPlayingSequence = false;
    let difficulty = 'medium';
    let speedSettings = {
        easy: { sequenceSpeed: 1000, lightDuration: 600 },
        medium: { sequenceSpeed: 800, lightDuration: 500 },
        hard: { sequenceSpeed: 500, lightDuration: 300 }
    };
    
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
    const difficultySelect = document.getElementById('difficulty-select');
    const practiceBtn = document.getElementById('practice-btn');
    
    // Start Practice Mode
    function startPracticeMode() {
        practiceBtn.disabled = true;
        practiceBtn.textContent = 'Practicing...';
        practiceBtn.style.backgroundColor = '#9c27b0';
        
        // Initialize practice game
        sequence = [];
        playerSequence = [];
        score = 0;
        scoreDisplay.textContent = score;
        gameActive = true;
        startNewRound();
        
        if (musicOn) bgMusic.play().catch(e => console.log("Music play failed:", e));
    }
    
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
        sequence.push(Math.floor(Math.random() * buttons.length));
        playSequence();
    }
    
    // Play the current sequence
    function playSequence() {
        isPlayingSequence = true;
        let i = 0;
        const speed = speedSettings[difficulty].sequenceSpeed;
        
        const interval = setInterval(() => {
            if (i >= sequence.length) {
                clearInterval(interval);
                isPlayingSequence = false;
                return;
            }
            
            const buttonId = sequence[i];
            lightUpButton(buttonId);
            i++;
        }, speed);
    }
    
    // Light up a button
    function lightUpButton(buttonId) {
        const button = document.getElementById(buttonId.toString());
        if (!button) return;
        
        button.classList.add('lit');
        playSound(button.getAttribute('data-color'));
        
        setTimeout(() => {
            button.classList.remove('lit');
        }, speedSettings[difficulty].lightDuration);
    }
    
    // Update score display
    function updateScore() {
        scoreDisplay.textContent = score;
        
        if (score > highScore) {
            highScore = score;
            highScoreDisplay.textContent = highScore;
        }
        
        if (score > 0 && !practiceBtn.disabled) {
            updateTopScores(score);
        }
    }
    
    // Handle player input
    function handleButtonClick(e) {
        if (!gameActive || isPlayingSequence) return;
        
        const buttonId = parseInt(e.target.id);
        playerSequence.push(buttonId);
        lightUpButton(buttonId);
        
        // Check if the player's sequence matches
        if (playerSequence[playerSequence.length - 1] !== sequence[playerSequence.length - 1]) {
            playSound('wrong');
            if (strictMode && !practiceBtn.disabled) {
                gameOver();
            } else {
                setTimeout(() => playSequence(), 1000);
                playerSequence = [];
            }
            return;
        }
        
        // Correct sequence so far
        if (playerSequence.length === sequence.length) {
            score++;
            if (!practiceBtn.disabled) {
                updateScore();
            } else {
                scoreDisplay.textContent = score;
            }
            
            setTimeout(() => startNewRound(), speedSettings[difficulty].sequenceSpeed);
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
        topScores.push(newScore);
        topScores.sort((a, b) => b - a);
        topScores = topScores.slice(0, 10);
        localStorage.setItem('simonTopScores', JSON.stringify(topScores));
        renderTopScores();
    }
    
    // Render top scores
    function renderTopScores() {
        topScoresList.innerHTML = '';
        topScores.forEach((score, index) => {
            const li = document.createElement('li');
            li.textContent = `${index + 1}. Reached Level ${score}`;
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
        try {
            const audio = new Audio(`sounds/${color}.mp3`);
            audio.play().catch(e => console.log("Audio play failed:", e));
        } catch (e) {
            console.log("Sound error:", e);
        }
    }
    
    // Reset practice mode
    function resetPracticeMode() {
        practiceBtn.disabled = false;
        practiceBtn.textContent = 'Practice Mode';
        practiceBtn.style.backgroundColor = '#9c27b0';
    }
    
    // Event listeners
    buttons.forEach(button => {
        button.addEventListener('click', handleButtonClick);
    });
    
    startBtn.addEventListener('click', () => {
        resetPracticeMode();
        initGame();
        startNewRound();
        if (musicOn) bgMusic.play().catch(e => console.log("Music play failed:", e));
    });
    
    strictBtn.addEventListener('click', toggleStrictMode);
    musicBtn.addEventListener('click', toggleMusic);
    
    practiceBtn.addEventListener('click', startPracticeMode);
    
    playAgainBtn.addEventListener('click', () => {
        resetPracticeMode();
        gameOverScreen.classList.add('hidden');
        initGame();
        startNewRound();
        if (musicOn) bgMusic.play().catch(e => console.log("Music play failed:", e));
    });
    
    difficultySelect.addEventListener('change', (e) => {
        difficulty = e.target.value;
    });
    
    // Initialize displays
    renderTopScores();
    highScoreDisplay.textContent = topScores.length > 0 ? Math.max(...topScores) : '0';
});
