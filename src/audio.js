let audioCtx = null;

function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playTone(freq, duration, type, freqEnd) {
  const ctx = ensureAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || 'square';
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  if (freqEnd) osc.frequency.linearRampToValueAtTime(freqEnd, ctx.currentTime + duration);
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export function createAudio() {
  return {
    sfxMove()     { playTone(600, 0.04, 'square'); },
    sfxRotate()   { playTone(800, 0.05, 'square'); },
    sfxLand()     { playTone(150, 0.1, 'triangle'); },
    sfxHardDrop() { playTone(200, 0.15, 'sawtooth', 80); },
    sfxClear()    { playTone(400, 0.25, 'sine', 1000); },
    sfxGameOver() { playTone(400, 0.6, 'sawtooth', 80); },
  };
}
