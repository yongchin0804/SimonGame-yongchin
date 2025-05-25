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
    let topScores = [];
    let strictMode = false;
    let gameActive = false;
    let isPlayingSequence = false;
    let difficulty = 'medium';
    let playerCounter = 0;
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
        
        sequence = [];
        playerSequence = [];
        score = 0;
        scoreDisplay.textContent = score;
        gameActive = true;
        startNewRound();
        
        if (musicOn) bgMusic.play().catch(e => console.log("Music play failed:", e));
    }

    // Toggle music
    function toggleMusic() {
        musicOn = !musicOn;
        musicBtn.textContent = `Music: ${musicOn ? 'ON' : 'OFF'}`;
        musicOn ? bgMusic.play() : bgMusic.pause();
    }

    // Initialize game
    function initGame() {
        sequence = [];
        playerSequence = [];
        score = 0;
        updateScore();
        gameActive = true;
    }

    // Start new round
    function startNewRound() {
        playerSequence = [];
        sequence.push(Math.floor(Math.random() * buttons.length));
        playSequence();
    }

    // Play sequence
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

    // Light up button
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

    // Handle button clicks
    function handleButtonClick(e) {
        if (!gameActive || isPlayingSequence) return;
        
        const buttonId = parseInt(e.target.id);
        playerSequence.push(buttonId);
        lightUpButton(buttonId);
        
        // Check sequence match
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
        
        // Correct sequence
        if (playerSequence.length === sequence.length) {
            score++;
            !practiceBtn.disabled ? updateScore() : scoreDisplay.textContent = score;
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
        playerCounter++;
        // Convert player number to letter (1=A, 2=B, etc.)
        const playerLetter = String.fromCharCode(64 + playerCounter);
        topScores.push({ player: playerLetter, score: newScore });
        topScores.sort((a, b) => b.score - a.score);
        topScores = topScores.slice(0, 10);
        renderTopScores();
    }

    // Render scores - Modified to show "1. Player A: Score 3" format
    function renderTopScores() {
        topScoresList.innerHTML = '';
        topScores.forEach((entry, index) => {
            const li = document.createElement('li');
            li.textContent = `${index + 1}. Player ${entry.player}: Score ${entry.score}`;
            topScoresList.appendChild(li);
        });
    }

    // Toggle strict mode
    function toggleStrictMode() {
        strictMode = !strictMode;
        strictBtn.textContent = `Strict Mode: ${strictMode ? 'ON' : 'OFF'}`;
    }

    // Play sounds
    function playSound(color) {
        try {
            new Audio(`sounds/${color}.mp3`).play();
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
    buttons.forEach(button => button.addEventListener('click', handleButtonClick));
    startBtn.addEventListener('click', () => {
        resetPracticeMode();
        initGame();
        startNewRound();
        if (musicOn) bgMusic.play();
    });
    strictBtn.addEventListener('click', toggleStrictMode);
    musicBtn.addEventListener('click', toggleMusic);
    practiceBtn.addEventListener('click', startPracticeMode);
    playAgainBtn.addEventListener('click', () => {
        resetPracticeMode();
        gameOverScreen.classList.add('hidden');
        initGame();
        startNewRound();
        if (musicOn) bgMusic.play();
    });
    difficultySelect.addEventListener('change', (e) => difficulty = e.target.value);

    // Initial setup
    renderTopScores();
    highScoreDisplay.textContent = '0';
});
