const animalScene = document.querySelector('#animalScene');
const speech = document.querySelector('#speech');
import { playSound } from '../shared/sound.js';

const animals = [
    { emoji: '🦁', name: 'Leijona', sound: 'Murrr!', file: 'Lion', className: 'lion' },
    { emoji: '🐘', name: 'Elefantti', sound: 'Pruut!', file: 'Elephant', className: 'elephant' },
    { emoji: '🐒', name: 'Apina', sound: 'Uh uh!', file: 'Monkey', className: 'monkey' },
    { emoji: '🦆', name: 'Ankka', sound: 'Kvaak!', file: 'Duck', className: 'duck' },
    { emoji: '🐱', name: 'Kissa', sound: 'Miau!', file: 'Cat', className: 'cat' },
    { emoji: '🐶', name: 'Koira', sound: 'Hau hau!', file: 'Dog', className: 'dog' }
];

function playAnimalSound(animal) {
    playSound(animal.file);
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
