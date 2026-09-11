const homeScreen = document.querySelector('#homeScreen');
const animalWorld = document.querySelector('#animalWorld');
const simpleWorld = document.querySelector('#simpleWorld');
const simpleTitle = document.querySelector('#simpleTitle');
const simpleIcon = document.querySelector('#simpleIcon');
const simpleIconLarge = document.querySelector('#simpleIconLarge');
const simpleInstruction = document.querySelector('#simpleInstruction');
const simpleGameArea = document.querySelector('#simpleGameArea');
const simpleResult = document.querySelector('#simpleResult');
let gameAudioContext;

function playGameClick(pitch = 520) {
    gameAudioContext ??= new AudioContext();
    const oscillator = gameAudioContext.createOscillator();
    const gain = gameAudioContext.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(pitch, gameAudioContext.currentTime);
    gain.gain.setValueAtTime(0.001, gameAudioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.16, gameAudioContext.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, gameAudioContext.currentTime + 0.12);
    oscillator.connect(gain).connect(gameAudioContext.destination);
    oscillator.start();
    oscillator.stop(gameAudioContext.currentTime + 0.13);
}

const games = {
    ball: { title: 'Potkaise pallo', icon: '⚽', instruction: 'Paina palloa niin monta kertaa kuin haluat!' },
    balloons: { title: 'Poksauta ilmapallot', icon: '🎈', instruction: 'Poksauta kaikki ilmapallot!' },
    carwash: { title: 'Autopesula', icon: '🚗', instruction: 'Paina autoa ja pese lika pois!' },
    puzzle: { title: 'Palapeli', icon: '🧩', instruction: 'Paina palat numerojärjestyksessä!' },
    colors: { title: 'Värit', icon: '🔴', instruction: 'Valitse pyydetty väri!' },
    letters: { title: 'Kirjainpeli', icon: '🔤', instruction: 'Löydä kirjain A!' },
    fruit: { title: 'Kerää hedelmät', icon: '🍎', instruction: 'Kerää kaikki hedelmät!' },
    construction: { title: 'Rakennustyömaa', icon: '🚜', instruction: 'Aja kone lippuun asti!' },
    bedtime: { title: 'Iltasat-seikkailu', icon: '🌙', instruction: 'Sytytä kaikki tähdet!' }
};

function showHome() {
    animalWorld.hidden = true;
    simpleWorld.hidden = true;
    homeScreen.hidden = false;
}

function showSimpleGame(game) {
    const content = games[game];
    if (!content) return;
    homeScreen.hidden = true;
    animalWorld.hidden = true;
    simpleWorld.hidden = false;
    simpleTitle.textContent = content.title;
    simpleIcon.textContent = content.icon;
    simpleIconLarge.textContent = content.icon;
    simpleInstruction.textContent = content.instruction;
    simpleResult.textContent = '';
    renderGame(game);
}

document.querySelector('#openAnimals').addEventListener('click', () => {
    homeScreen.hidden = true;
    simpleWorld.hidden = true;
    animalWorld.hidden = false;
});

document.querySelector('#backToHome').addEventListener('click', showHome);
document.querySelector('#backFromSimple').addEventListener('click', showHome);
document.querySelectorAll('[data-simple-game]').forEach((button) => {
    button.addEventListener('click', () => showSimpleGame(button.dataset.simpleGame));
});

function renderGame(game) {
    const views = {
        ball: '<button class="play-object ball-object" data-action="ball" aria-label="Pallo">⚽</button><span class="game-score">Potkut: <b data-count>0</b></span>',
        balloons: '<div class="balloon-field">' + ['🔴', '🟡', '🔵', '🟢', '🟣'].map((balloon) => `<button class="play-object balloon-object" data-action="balloon" aria-label="Ilmapallo">${balloon}</button>`).join('') + '</div><span class="game-score">Jäljellä: <b data-count>5</b></span>',
        carwash: '<button class="play-object car-object" data-action="wash" aria-label="Auto">🚗</button><div class="wash-meter"><span></span></div>',
        puzzle: '<div class="puzzle-board"><button class="puzzle-piece" data-piece="2">2</button><button class="puzzle-piece" data-piece="3">3</button><button class="puzzle-piece" data-piece="1">1</button></div><span class="game-score">Seuraava pala: <b data-next>1</b></span>',
        colors: '<div class="color-target" data-target="red">PUNAINEN</div><div class="color-options"><button class="color-dot color-red" data-color="red" aria-label="Punainen"></button><button class="color-dot color-blue" data-color="blue" aria-label="Sininen"></button><button class="color-dot color-yellow" data-color="yellow" aria-label="Keltainen"></button></div>',
        letters: '<div class="letter-field">' + ['M', 'A', 'K', 'O'].map((letter) => `<button class="letter-tile" data-letter="${letter}">${letter}</button>`).join('') + '</div>',
        fruit: '<div class="fruit-field">' + ['🍎', '🍐', '🍊', '🍌', '🍓'].map((fruit) => `<button class="play-object fruit-object" data-action="fruit" aria-label="Hedelmä">${fruit}</button>`).join('') + '</div><span class="game-score">Kerätty: <b data-count>0</b>/5</span>',
        construction: '<div class="construction-track"><button class="play-object machine-object" data-action="drive" aria-label="Työkone">🚜</button><span class="finish-flag">🏁</span></div><span class="game-score">Ajo: <b data-count>0</b>/5</span>',
        bedtime: '<div class="star-field">' + ['★', '★', '★'].map(() => '<button class="star-object" data-action="star" aria-label="Tähti">☆</button>').join('') + '</div>'
    };
    simpleGameArea.innerHTML = views[game];
    bindGame(game);
}

function bindGame(game) {
    const area = simpleGameArea;
    if (game === 'ball') {
        area.querySelector('[data-action="ball"]').addEventListener('click', (event) => {
            playGameClick(460);
            const count = area.querySelector('[data-count]');
            count.textContent = Number(count.textContent) + 1;
            event.currentTarget.classList.remove('is-kicking');
            requestAnimationFrame(() => event.currentTarget.classList.add('is-kicking'));
            simpleResult.textContent = 'Hieno potku!';
        });
    }
    if (game === 'balloons' || game === 'fruit') {
        area.querySelectorAll('[data-action="balloon"], [data-action="fruit"]').forEach((item) => item.addEventListener('click', () => {
            playGameClick(game === 'balloons' ? 700 : 560);
            const count = area.querySelector('[data-count]');
            count.textContent = Number(count.textContent) - (game === 'balloons' ? 1 : -1);
            item.remove();
            simpleResult.textContent = game === 'balloons' ? 'Poks!' : 'Hedelmä kerätty!';
            if (!area.querySelector('[data-action="balloon"], [data-action="fruit"]')) simpleResult.textContent = 'Hienoa, kaikki kerätty!';
        }));
    }
    if (game === 'carwash') {
        let clean = 0;
        area.querySelector('[data-action="wash"]').addEventListener('click', () => {
            playGameClick(420);
            clean = Math.min(clean + 20, 100);
            area.querySelector('.wash-meter span').style.width = `${clean}%`;
            simpleResult.textContent = clean === 100 ? 'Auto on puhdas!' : 'Pese vielä vähän!';
        });
    }
    if (game === 'puzzle') {
        let next = 1;
        area.querySelectorAll('[data-piece]').forEach((piece) => piece.addEventListener('click', () => {
            playGameClick(500);
            if (Number(piece.dataset.piece) !== next) { simpleResult.textContent = `Etsi ensin pala ${next}.`; return; }
            piece.disabled = true; piece.classList.add('placed'); next += 1;
            area.querySelector('[data-next]').textContent = next <= 3 ? next : 'valmis';
            simpleResult.textContent = next > 3 ? 'Palapeli valmis!' : 'Hyvä pala!';
        }));
    }
    if (game === 'colors') area.querySelectorAll('[data-color]').forEach((item) => item.addEventListener('click', () => {
        playGameClick(item.dataset.color === 'red' ? 620 : 360);
        simpleResult.textContent = item.dataset.color === 'red' ? 'Oikein!' : 'Kokeile punaista.';
    }));
    if (game === 'letters') area.querySelectorAll('[data-letter]').forEach((item) => item.addEventListener('click', () => {
        playGameClick(item.dataset.letter === 'A' ? 760 : 330);
        simpleResult.textContent = item.dataset.letter === 'A' ? 'Löysit A-kirjaimen!' : 'Etsi vielä A-kirjainta.';
        if (item.dataset.letter === 'A') item.classList.add('found');
    }));
    if (game === 'construction') area.querySelector('[data-action="drive"]').addEventListener('click', (event) => {
        playGameClick(390);
        const count = area.querySelector('[data-count]');
        const value = Math.min(Number(count.textContent) + 1, 5);
        count.textContent = value;
        event.currentTarget.style.transform = `translateX(${value * 42}px)`;
        simpleResult.textContent = value === 5 ? 'Pääsit perille!' : 'Aja eteenpäin!';
    });
    if (game === 'bedtime') area.querySelectorAll('[data-action="star"]').forEach((item) => item.addEventListener('click', () => {
        playGameClick(820);
        item.textContent = '★'; item.classList.add('lit');
        simpleResult.textContent = area.querySelectorAll('.star-object.lit').length === 3 ? 'Hyvää yötä!' : 'Kaunis tähti!';
    }));
}
