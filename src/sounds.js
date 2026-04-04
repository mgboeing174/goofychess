// Sound engine using Web Audio API — no external files needed
const AudioContext = window.AudioContext || window.webkitAudioContext;
let ctx = null;

function getCtx() {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function playTone(freq, duration, type = 'sine', volume = 0.3) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch (e) {
    // silently fail if audio unavailable
  }
}

export function playMoveSound() {
  playTone(600, 0.08, 'sine', 0.2);
  setTimeout(() => playTone(800, 0.06, 'sine', 0.15), 30);
}

export function playCaptureSound() {
  playTone(300, 0.1, 'square', 0.15);
  setTimeout(() => playTone(200, 0.15, 'sawtooth', 0.1), 40);
}

export function playCheckSound() {
  playTone(880, 0.12, 'square', 0.25);
  setTimeout(() => playTone(1100, 0.1, 'square', 0.2), 100);
  setTimeout(() => playTone(880, 0.15, 'square', 0.15), 200);
}

export function playCheckmateSound() {
  playTone(440, 0.15, 'sawtooth', 0.2);
  setTimeout(() => playTone(554, 0.15, 'sawtooth', 0.2), 150);
  setTimeout(() => playTone(659, 0.15, 'sawtooth', 0.2), 300);
  setTimeout(() => playTone(880, 0.3, 'sawtooth', 0.3), 450);
}

export function playGameStartSound() {
  playTone(523, 0.1, 'sine', 0.2);
  setTimeout(() => playTone(659, 0.1, 'sine', 0.2), 100);
  setTimeout(() => playTone(784, 0.15, 'sine', 0.25), 200);
}

export function playIllegalMoveSound() {
  playTone(200, 0.15, 'square', 0.15);
  setTimeout(() => playTone(150, 0.2, 'square', 0.1), 100);
}
