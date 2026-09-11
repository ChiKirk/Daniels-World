const targetDuration = 0.9;
const sounds = new Map();

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

export function hasSound(name) {
    return Boolean(name);
}

export function playSound(name, fallbackPitch = 520) {
    const audio = getSound(name);
    audio.currentTime = 0;
    audio.volume = 1;
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
        audio.playbackRate = Math.max(0.5, Math.min(3, audio.duration / targetDuration));
    }
    const playPromise = audio.play();
    if (playPromise) playPromise.catch(() => {});
}

export function playFallback(frequency = 520) {
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
}
