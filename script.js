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
    let topScores = JSON.parse(localStorage.getItem('simonTopScores')) || [0, 0, 0];
    let strictMode = false;
    let gameActive = false;
    let difficulty = 'medium';
    let practiceMode = false;
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
    const difficultySelect = document.createElement('select');
    const practiceBtn = document.createElement('button');
    
    // Create difficulty selection and practice button
    function createControls() {
        difficultySelect.id = 'difficulty-select';
        
        const difficulties = [
            { value: 'easy', text: 'Easy' },
            { value: 'medium', text: 'Medium' },
            { value: 'hard', text: 'Hard' }
        ];
        
        difficulties.forEach(diff => {
            const option = document.createElement('option');
            option.value = diff.value;
            option.textContent = diff.text;
            if (diff.value === difficulty) option.selected = true;
            difficultySelect.appendChild(option);
        });
        
        difficultySelect.addEventListener('change', (e) => {
            difficulty = e.target.value;
        });
        
        // Create Practice Mode button
        practiceBtn.id = 'practice-btn';
        practiceBtn.textContent = 'Practice Mode';
        practiceBtn.addEventListener('click', togglePracticeMode);
        
        // Add to controls div
        const controls = document.querySelector('.controls');
        const label = document.createElement('label');
        label.textContent = 'Difficulty: ';
        label.appendChild(difficultySelect);
        controls.insertBefore(label, startBtn);
        controls.insertBefore(practiceBtn, startBtn);
    }
    
    // Toggle Practice Mode
    function togglePracticeMode() {
        practiceMode = !practiceMode;
        practiceBtn.textContent = practiceMode ? 'Practice Mode: ON' : 'Practice Mode';
        practiceBtn.style.backgroundColor = practiceMode ? '#4CAF50' : '#333';
        
        if (practiceMode) {
            startBtn.textContent = 'Start Practice';
        } else {
            startBtn.textContent = 'Start Game';
        }
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
        sequence.push(Math.floor(Math.random() * 5));
        playSequence();
    }
    
    // Play the current sequence with difficulty-based speed
    function playSequence() {
        let i = 0;
        const speed = speedSettings[difficulty].sequenceSpeed;
        
        const interval = setInterval(() => {
            if (i >= sequence.length) {
                clearInterval(interval);
                return;
            }
            
            const buttonId = sequence[i];
            lightUpButton(buttonId);
            i++;
        }, speed);
    }
    
    // Light up a button with difficulty-based duration
    function lightUpButton(buttonId) {
        const button = document.getElementById(buttonId.toString());
        button.classList.add('lit');
        playSound(button.getAttribute('data-color'));
        
        setTimeout(() => {
            button.classList.remove('lit');
        }, speedSettings[difficulty].lightDuration);
    }
    
    // Update score display (won't update top scores in practice mode)
    function updateScore() {
        scoreDisplay.textContent = score;
        
        if (!practiceMode) {
            if (score > highScore) {
                highScore = score;
                highScoreDisplay.textContent = `Highest: Level ${highScore}`;
            }
            
            if (score > 0 && !topScores.includes(score)) {
                updateTopScores(score);
            }
        }
    }
    
    // Handle player input
    function handleButtonClick(e) {
        if (!gameActive) return;
        
        const buttonId = parseInt(e.target.id);
        playerSequence.push(buttonId);
        lightUpButton(buttonId);
        
        if (playerSequence[playerSequence.length - 1] !== sequence[playerSequence.length - 1]) {
            if (strictMode && !practiceMode) {
                gameOver();
            } else {
                setTimeout(() => playSequence(), 1000);
                playerSequence = [];
            }
            return;
        }
        
        if (playerSequence.length === sequence.length) {
            score++;
            updateScore();
            setTimeout(() => startNewRound(), speedSettings[difficulty].sequenceSpeed);
        }
    }
    
    // Game over (only in regular mode)
    function gameOver() {
        if (practiceMode) return;
        
        gameActive = false;
        finalScoreDisplay.textContent = score;
        gameOverScreen.classList.remove('hidden');
    }
    
    // Update top scores (not used in practice mode)
    function updateTopScores(newScore) {
        if (practiceMode) return;
        
        if (!topScores.includes(newScore)) {
            topScores.push(newScore);
            topScores.sort((a, b) => b - a);
            topScores = topScores.slice(0, 3);
            localStorage.setItem('simonTopScores', JSON.stringify(topScores));
            renderTopScores();
        }
    }
    
    // Render top scores
    function renderTopScores() {
        topScoresList.innerHTML = '';
        topScores.filter(score => score > 0).forEach((score) => {
            const li = document.createElement('li');
            li.textContent = `Reached Level ${score}`;
            topScoresList.appendChild(li);
        });
    }
    
    // Toggle strict mode (disabled in practice mode)
    function toggleStrictMode() {
        if (practiceMode) {
            strictMode = false;
            strictBtn.textContent = 'Strict Mode: OFF';
            return;
        }
        
        strictMode = !strictMode;
        strictBtn.textContent = `Strict Mode: ${strictMode ? 'ON' : 'OFF'}`;
    }
    
    // Play sound for buttons
    function playSound(color) {
        const audio = new Audio(`sounds/${color}.mp3`);
        audio.play().catch(e => console.log("Audio play failed:", e));
    }
    
    // Create controls on load
    createControls();
    
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
