const targetDuration = 0.9;
const sounds = new Map();
const soundStartOffsets = Object.freeze({
    Ball: 0.027,
    Balloon: 0.072,
    Cat: 0.05,
    Complete: 0.161,
    Dog: 0.023,
    Duck: 0.05,
    Elephant: 0.048,
    Lion: 0.023,
    Monkey: 0.452,
    Star: 0.212,
    Tractor: 0.017
});
const soundEndOffsets = Object.freeze({
    Ball: 1.602,
    Balloon: 0.672,
    Cat: 0.022,
    Complete: 3.376,
    Dog: 0.009,
    Duck: 0.02,
    Elephant: 0.03,
    Lion: 0.01,
    Monkey: 0.192,
    Star: 0.567,
    Tractor: 0.001
});
let stopActiveSound = null;

function getSound(name) {
    if (!sounds.has(name)) {
        const audioUrl = new URL(`../Sounds/${name}.mp3`, import.meta.url).href;
        const audio = new Audio(audioUrl);
        audio.preload = 'auto';
        audio.volume = 1;
        audio.addEventListener('timeupdate', () => {
            const endOffset = soundEndOffsets[name] ?? 0;
            if (endOffset > 0 && audio.duration > 0 && audio.currentTime >= audio.duration - endOffset) {
                audio.pause();
            }
        });
        sounds.set(name, audio);
    }
    return sounds.get(name);
}

Object.keys(soundStartOffsets).forEach((name) => getSound(name).load());

export function hasSound(name) {
    return Boolean(name);
}

export function playSound(name, fallbackPitch = 520) {
    const audio = getSound(name);
    stopActiveSound?.();
    audio.currentTime = soundStartOffsets[name] ?? 0;
    audio.volume = 1;
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
        audio.playbackRate = Math.max(0.5, Math.min(3, audio.duration / targetDuration));
    }
    const playPromise = audio.play();
    if (playPromise) playPromise.catch(() => {});
    stopActiveSound = () => {
        audio.pause();
        audio.currentTime = 0;
    };
}

export function playFallback(frequency = 520) {
    stopActiveSound?.();
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
