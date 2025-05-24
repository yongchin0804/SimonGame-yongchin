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
    
    // Create controls
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
        
        // Practice button
        practiceBtn.id = 'practice-btn';
        practiceBtn.textContent = 'Practice Mode';
        practiceBtn.addEventListener('click', startPracticeMode);
        
        // Add to controls div
        const controls = document.querySelector('.controls');
        const label = document.createElement('label');
        label.textContent = 'Difficulty: ';
        label.appendChild(difficultySelect);
        controls.insertBefore(label, startBtn);
        controls.insertBefore(practiceBtn, startBtn);
    }
    
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
        sequence.push(Math.floor(Math.random() * 5));
        playSequence();
    }
    
    // Play the current sequence
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
    
    // Light up a button
    function lightUpButton(buttonId) {
        const button = document.getElementById(buttonId.toString());
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
            highScoreDisplay.textContent = `Highest: Level ${highScore}`;
        }
        
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
            // Completed the sequence
            score++;
            if (!practiceBtn.disabled) { // Only update score if not in practice mode
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
        if (practiceBtn.disabled) return; // Don't update in practice mode
        
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
    
    // Reset practice mode
    function resetPracticeMode() {
        practiceBtn.disabled = false;
        practiceBtn.textContent = 'Practice Mode';
        practiceBtn.style.backgroundColor = '#9c27b0';
    }
    
    // Create controls on load
    createControls();
    
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
    
    playAgainBtn.addEventListener('click', () => {
        resetPracticeMode();
        gameOverScreen.classList.add('hidden');
        initGame();
        startNewRound();
        if (musicOn) bgMusic.play().catch(e => console.log("Music play failed:", e));
    });
    
    // Initialize displays
    renderTopScores();
    highScoreDisplay.textContent = topScores.length > 0 ? `Highest: Level ${Math.max(...topScores)}` : '0';
});
