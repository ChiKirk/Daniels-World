import { playFallback, playSound, stopSound } from '../shared/sound.js';

const homeScreen = document.querySelector('#homeScreen');
const animalWorld = document.querySelector('#animalWorld');
const simpleWorld = document.querySelector('#simpleWorld');
const simpleTitle = document.querySelector('#simpleTitle');
const simpleIcon = document.querySelector('#simpleIcon');
const simpleIconLarge = document.querySelector('#simpleIconLarge');
const simpleInstruction = document.querySelector('#simpleInstruction');
const simpleGameArea = document.querySelector('#simpleGameArea');
const simpleResult = document.querySelector('#simpleResult');
function playGameSound(file, pitch = 520) {
    if (file) playSound(file);
    else playFallback(pitch);
}

const games = {
    ball: { title: 'Potkaise pallo', icon: '⚽', instruction: 'Paina palloa niin monta kertaa kuin haluat!', sound: 'Ball' },
    balloons: { title: 'Poksauta ilmapallot', icon: '🎈', instruction: 'Poksauta kaikki ilmapallot!', sound: 'Balloon' },
    carwash: { title: 'Autopesula', icon: '🚗', instruction: 'Paina autoa ja pese lika pois!' },
    puzzle: { title: 'Palapeli', icon: '🧩', instruction: 'Paina palat numerojärjestyksessä!' },
    colors: { title: 'Värit', icon: '🔴', instruction: 'Valitse pyydetty väri!' },
    letters: { title: 'Kirjainpeli', icon: '🔤', instruction: 'Löydä kirjain A!' },
    fruit: { title: 'Kerää hedelmät', icon: '🍎', instruction: 'Kerää kaikki hedelmät!' },
    construction: { title: 'Rakennustyömaa', icon: '🚜', instruction: 'Aja kone lippuun asti!', sound: 'Tractor' },
    bedtime: { title: 'Iltasat-seikkailu', icon: '🌙', instruction: 'Sytytä kaikki tähdet!', sound: 'Star' }
};

function showHome() {
    stopSound();
    animalWorld.hidden = true;
    simpleWorld.hidden = true;
    homeScreen.hidden = false;
}

function showSimpleGame(game) {
    const content = games[game];
    if (!content) return;
    stopSound();
    homeScreen.hidden = true;
    animalWorld.hidden = true;
    simpleWorld.hidden = false;
    simpleTitle.textContent = content.title;
    simpleIcon.textContent = content.icon;
    simpleIconLarge.textContent = content.icon;
    simpleInstruction.textContent = content.instruction;
    simpleResult.textContent = '';
    renderGame(game, content.sound);
}

document.querySelector('#openAnimals').addEventListener('click', () => {
    stopSound();
    homeScreen.hidden = true;
    simpleWorld.hidden = true;
    animalWorld.hidden = false;
});

document.querySelector('#backToHome').addEventListener('click', showHome);
document.querySelector('#backFromSimple').addEventListener('click', showHome);
document.querySelectorAll('[data-simple-game]').forEach((button) => {
    button.addEventListener('click', () => showSimpleGame(button.dataset.simpleGame));
});

function renderGame(game, gameSound) {
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
    bindGame(game, gameSound);
}

function completeGame(message) {
    playSound('Complete');
    simpleResult.textContent = message;
}

function bindGame(game, gameSound) {
    const area = simpleGameArea;
    if (game === 'ball') {
        area.querySelector('[data-action="ball"]').addEventListener('click', (event) => {
            playGameSound(gameSound, 460);
            const count = area.querySelector('[data-count]');
            const ball = event.currentTarget;
            count.textContent = Number(count.textContent) + 1;
            ball.classList.remove('is-kicking');
            requestAnimationFrame(() => ball.classList.add('is-kicking'));
            simpleResult.textContent = 'Hieno potku!';
        });
    }
    if (game === 'balloons' || game === 'fruit') {
        area.querySelectorAll('[data-action="balloon"], [data-action="fruit"]').forEach((item) => item.addEventListener('click', () => {
            playGameSound(gameSound, game === 'balloons' ? 700 : 560);
            const count = area.querySelector('[data-count]');
            count.textContent = Number(count.textContent) - (game === 'balloons' ? 1 : -1);
            item.remove();
            simpleResult.textContent = game === 'balloons' ? 'Poks!' : 'Hedelmä kerätty!';
            if (!area.querySelector('[data-action="balloon"], [data-action="fruit"]')) completeGame('Hienoa, kaikki kerätty!');
        }));
    }
    if (game === 'carwash') {
        let clean = 0;
        area.querySelector('[data-action="wash"]').addEventListener('click', () => {
            playGameSound(null, 420);
            clean = Math.min(clean + 20, 100);
            area.querySelector('.wash-meter span').style.width = `${clean}%`;
            if (clean === 100) completeGame('Auto on puhdas!');
            else simpleResult.textContent = 'Pese vielä vähän!';
        });
    }
    if (game === 'puzzle') {
        let next = 1;
        area.querySelectorAll('[data-piece]').forEach((piece) => piece.addEventListener('click', () => {
            playGameSound(null, 500);
            if (Number(piece.dataset.piece) !== next) { simpleResult.textContent = `Etsi ensin pala ${next}.`; return; }
            piece.disabled = true; piece.classList.add('placed'); next += 1;
            area.querySelector('[data-next]').textContent = next <= 3 ? next : 'valmis';
            if (next > 3) completeGame('Palapeli valmis!');
            else simpleResult.textContent = 'Hyvä pala!';
        }));
    }
    if (game === 'colors') area.querySelectorAll('[data-color]').forEach((item) => item.addEventListener('click', () => {
        playGameSound(null, item.dataset.color === 'red' ? 620 : 360);
        simpleResult.textContent = item.dataset.color === 'red' ? 'Oikein!' : 'Kokeile punaista.';
        if (item.dataset.color === 'red') completeGame('Oikea väri!');
    }));
    if (game === 'letters') area.querySelectorAll('[data-letter]').forEach((item) => item.addEventListener('click', () => {
        playGameSound(null, item.dataset.letter === 'A' ? 760 : 330);
        simpleResult.textContent = item.dataset.letter === 'A' ? 'Löysit A-kirjaimen!' : 'Etsi vielä A-kirjainta.';
        if (item.dataset.letter === 'A') { item.classList.add('found'); completeGame('Löysit A-kirjaimen!'); }
    }));
    if (game === 'construction') area.querySelector('[data-action="drive"]').addEventListener('click', (event) => {
        playGameSound(gameSound, 390);
        const count = area.querySelector('[data-count]');
        const value = Math.min(Number(count.textContent) + 1, 5);
        count.textContent = value;
        event.currentTarget.style.transform = `translateX(${value * 42}px)`;
        if (value === 5) completeGame('Pääsit perille!');
        else simpleResult.textContent = 'Aja eteenpäin!';
    });
    if (game === 'bedtime') area.querySelectorAll('[data-action="star"]').forEach((item) => item.addEventListener('click', () => {
        playGameSound(gameSound, 820);
        item.textContent = '★'; item.classList.add('lit');
        if (area.querySelectorAll('.star-object.lit').length === 3) completeGame('Hyvää yötä!');
        else simpleResult.textContent = 'Kaunis tähti!';
    }));
}
