const sounds = new Map();
let stopActiveSound = null;

function getSound(name) {
    if (!sounds.has(name)) {
        const audioUrl = new URL(`../Sounds/${name}.mp3`, import.meta.url).href;
        const audio = new Audio(audioUrl);
        audio.preload = 'auto';
        audio.volume = 1;
        sounds.set(name, audio);
    }
    return sounds.get(name);
}

['Ball', 'Balloon', 'Cat', 'Complete', 'Dog', 'Duck', 'Elephant', 'Lion', 'Monkey', 'Star', 'Tractor']
    .forEach((name) => getSound(name).load());

export function hasSound(name) {
    return Boolean(name);
}

export function stopSound() {
    stopActiveSound?.();
    stopActiveSound = null;
}

export function playSound(name, fallbackPitch = 520) {
    const audio = getSound(name);
    stopSound();
    audio.currentTime = 0;
    audio.volume = 1;
    audio.playbackRate = 1;
    const playPromise = audio.play();
    if (playPromise) playPromise.catch(() => {});
    stopActiveSound = () => {
        audio.pause();
        audio.currentTime = 0;
    };
}

export function playFallback(frequency = 520) {
    stopSound();
    const context = playFallback.context ??= new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.16, context.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.13);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.14);
    stopActiveSound = () => {
        gain.gain.cancelScheduledValues(context.currentTime);
        gain.gain.setValueAtTime(0.0001, context.currentTime);
    };
}
