const levels = [
    [
        {id: 1, content: 'ADN'},
        {id: 2, content: 'ARN'},
        {id: 3, content: 'Célula'},
        {id: 4, content: 'Mitocondria'}
    ],
    [
        {id: 1, content: 'ADN'},
        {id: 2, content: 'ARN'},
        {id: 3, content: 'Célula'},
        {id: 4, content: 'Mitocondria'},
        {id: 5, content: 'Ribosoma'},
        {id: 6, content: 'Núcleo'}
    ],
    [
        {id: 1, content: 'ADN'},
        {id: 2, content: 'ARN'},
        {id: 3, content: 'Célula'},
        {id: 4, content: 'Mitocondria'},
        {id: 5, content: 'Ribosoma'},
        {id: 6, content: 'Núcleo'},
        {id: 7, content: 'Cloroplasto'},
        {id: 8, content: 'Citoplasma'}
    ],
    [
        {id: 1, content: 'ADN'},
        {id: 2, content: 'ARN'},
        {id: 3, content: 'Célula'},
        {id: 4, content: 'Mitocondria'},
        {id: 5, content: 'Ribosoma'},
        {id: 6, content: 'Núcleo'},
        {id: 7, content: 'Cloroplasto'},
        {id: 8, content: 'Citoplasma'},
        {id: 9, content: 'Membrana'},
        {id: 10, content: 'Lisosoma'}
    ]
];

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let totalPairs;

const flipSound = new Howl({ src: ['sounds/flip.mp3'] });
const matchSound = new Howl({ src: ['sounds/match.mp3'] });
const backgroundMusic = new Howl({
    src: ['sounds/background.mp3'],
    loop: true,
    volume: 0.5
});

var gameState = {
    time: 0,
    score: 0,
    errors: 0,
    level: 1,
    isPlaying: false
};

function startGame() {
    var playerName = document.getElementById('playerName').value;
    if (playerName) {
        gameState.isPlaying = true;
        alert('¡Bienvenido, ' + playerName + '! Comencemos el juego.');
        backgroundMusic.play();
        startTimer();
        createBoard();
    } else {
        alert('Por favor, ingresa tu nombre.');
    }
}

function startTimer() {
    setInterval(function() {
        if (gameState.isPlaying) {
            gameState.time++;
            document.getElementById('time').textContent = gameState.time;
        }
    }, 1000);
}

async function showRanking() {
    document.getElementById('rankingSection').style.display = 'block';
    const ranking = await loadRanking();
    displayRanking(ranking);
}

function useHint() {
    alert('Has usado una pista');
}

function toggleMusic() {
    if (backgroundMusic.playing()) {
        backgroundMusic.pause();
    } else {
        backgroundMusic.play();
    }
}

function setMusicVolume(volume) {
    backgroundMusic.volume(parseFloat(volume));
}

function updateScore(points) {
    gameState.score += points;
    document.getElementById('score').textContent = gameState.score;
}

function updateErrors() {
    gameState.errors++;
    document.getElementById('errors').textContent = gameState.errors;
}

function updateLevel() {
    gameState.level++;
    document.getElementById('level').textContent = gameState.level;
}

function endGame() {
    gameState.isPlaying = false;
    backgroundMusic.stop();
    document.getElementById('gameOverSection').style.display = 'block';
    updateRanking(document.getElementById('playerName').value, gameState.score, gameState.time, gameState.errors);
}

function restartGame() {
    gameState = {
        time: 0,
        score: 0,
        errors: 0,
        level: 1,
        isPlaying: false
    };
    document.getElementById('time').textContent = '0';
    document.getElementById('score').textContent = '0';
    document.getElementById('errors').textContent = '0';
    document.getElementById('level').textContent = '1';
    document.getElementById('gameOverSection').style.display = 'none';
    startGame();
}

async function loadRanking() {
    try {
        const response = await fetch('ranking.json');
        const ranking = await response.json();
        return ranking;
    } catch (error) {
        console.error('Error al cargar el ranking:', error);
        return [];
    }
}

async function saveRanking(ranking) {
    try {
        const response = await fetch('ranking.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ranking),
        });
        if (!response.ok) {
            throw new Error('No se pudo guardar el ranking');
        }
    } catch (error) {
        console.error('Error al guardar el ranking:', error);
    }
}

async function updateRanking(playerName, score, time, errors) {
    const ranking = await loadRanking();
    ranking.push({ playerName, score, time, errors });
    ranking.sort((a, b) => b.score - a.score);
    ranking.splice(10);
    await saveRanking(ranking);
    displayRanking(ranking);
}

function displayRanking(ranking) {
    const table = document.getElementById('rankingTable');
    table.innerHTML = '<tr><th>Posición</th><th>Jugador</th><th>Puntaje</th><th>Tiempo</th><th>Errores</th></tr>';
    ranking.forEach((player, index) => {
        const row = table.insertRow(-1);
        row.innerHTML = `<td>${index + 1}</td><td>${player.playerName}</td><td>${player.score}</td><td>${player.time}</td><td>${player.errors}</td>`;
    });
}

function createBoard() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    cards = [];
    flippedCards = [];
    matchedPairs = 0;

    const pairs = levels[gameState.level - 1];
    totalPairs = pairs.length;

    cards = [...pairs, ...pairs].sort(() => Math.random() - 0.5);

    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.id = card.id;
        cardElement.dataset.index = index;
        cardElement.innerHTML = `
            <div class="card-front"></div>
            <div class="card-back">${card.content}</div>
        `;
        cardElement.addEventListener('click', flipCard);
        gameBoard.appendChild(cardElement);
    });
}

function flipCard() {
    if (flippedCards.length < 2 && !this.classList.contains('flipped')) {
        this.classList.add('flipped');
        flippedCards.push(this);
        flipSound.play();

        if (flippedCards.length === 2) {
            setTimeout(checkMatch, 1000);
        }
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;

    if (card1.dataset.id === card2.dataset.id) {
        matchedPairs++;
        updateScore(10);
        matchSound.play();
        if (matchedPairs === totalPairs) {
            endLevel();
        }
    } else {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        updateErrors();
    }

    flippedCards = [];
}

function endLevel() {
    if (gameState.level < 4) {
        gameState.level++;
        updateLevel();
        createBoard();
    } else {
        endGame();
    }
}
