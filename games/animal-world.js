const animalScene = document.querySelector('#animalScene');
const speech = document.querySelector('#speech');
let audioContext;

const animals = [
    { emoji: '🦁', name: 'Leijona', sound: 'Murrr!', className: 'lion' },
    { emoji: '🐘', name: 'Elefantti', sound: 'Pruut!', className: 'elephant' },
    { emoji: '🐒', name: 'Apina', sound: 'Uh uh!', className: 'monkey' },
    { emoji: '🦆', name: 'Ankka', sound: 'Kvaak!', className: 'duck' }
];

function playTone(frequency, duration, type = 'sine', delay = 0) {
    audioContext ??= new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + delay);
    gain.gain.setValueAtTime(0.001, audioContext.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.22, audioContext.currentTime + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + delay + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(audioContext.currentTime + delay);
    oscillator.stop(audioContext.currentTime + delay + duration);
}

function playAnimalSound(animal) {
    const tones = {
        lion: [110, 82], elephant: [260, 150], monkey: [420, 580], duck: [520, 680]
    };
    const [first, second] = tones[animal.className];
    playTone(first, 0.18, 'triangle');
    playTone(second, 0.22, 'triangle', 0.14);
    const utterance = new SpeechSynthesisUtterance(animal.sound);
    utterance.lang = 'fi-FI';
    utterance.rate = 0.75;
    utterance.pitch = animal.className === 'lion' ? 0.6 : 1.1;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}

function activateAnimal(button, animal) {
    document.querySelectorAll('.animal-2d').forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');
    speech.textContent = `${animal.name} sanoo ${animal.sound.toLowerCase()}`;
    playAnimalSound(animal);
}

animals.forEach((animal) => {
    const button = document.createElement('button');
    button.className = `animal-2d animal-2d--${animal.className}`;
    button.type = 'button';
    button.setAttribute('aria-label', `${animal.name}, ${animal.sound}`);
    button.innerHTML = `<span class="animal-2d__emoji" aria-hidden="true">${animal.emoji}</span><span class="animal-2d__name">${animal.name}</span>`;
    button.addEventListener('click', () => activateAnimal(button, animal));
    animalScene.appendChild(button);
});
