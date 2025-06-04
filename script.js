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
    let allScores = [];
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
    const themeToggleBtn = document.getElementById('theme-toggle');
    const topScoresTitle = document.querySelector('.top-scores h3');

    // Theme state
    let darkTheme = false;

    // Initialize theme
    function initTheme() {
        const savedTheme = localStorage.getItem('simonDarkTheme');
        if (savedTheme === 'true') {
            darkTheme = true;
            document.body.classList.add('dark-theme');
            themeToggleBtn.textContent = 'Light Mode';
        }
    }

    // Toggle theme
    function toggleTheme() {
        darkTheme = !darkTheme;
        if (darkTheme) {
            document.body.classList.add('dark-theme');
            themeToggleBtn.textContent = 'Light Mode';
        } else {
            document.body.classList.remove('dark-theme');
            themeToggleBtn.textContent = 'Dark Mode';
        }
        localStorage.setItem('simonDarkTheme', darkTheme);
    }

    // Change the title to "Highest Score List"
    topScoresTitle.textContent = 'Highest Score List';

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
        
        if (score > 0 && !practiceBtn.disabled) {
            allScores.push(score);
            allScores.sort((a, b) => b - a);
            renderAllScores();
        }
        
        gameOverScreen.classList.remove('hidden');
    }

    // Render all scores
    function renderAllScores() {
        topScoresList.innerHTML = '';
        allScores.forEach((score, index) => {
            const scoreItem = document.createElement('div');
            scoreItem.textContent = `${index + 1}. Player A: Score ${score}`;
            topScoresList.appendChild(scoreItem);
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
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Initial setup
    initTheme();
    renderAllScores();
    highScoreDisplay.textContent = '0';
});
