import { BASE_DROP_INTERVAL } from './config.js';

export function createGameState() {
  return {
    gameState: 'start',
    score: 0,
    totalLines: 0,
    hiScore: parseInt(localStorage.getItem('tetris3d-hiscore')) || 0,
    dropInterval: BASE_DROP_INTERVAL,
    lastDropTime: 0,
    softDrop: false,
    currentPiece: null,
    currentPosition: { x: 0, y: 0, z: 0 },
    currentGroup: null,
    nextPiece: null,
    ghostGroup: null,
  };
}

export function updateHUD(state) {
  document.getElementById('score-value').textContent = state.score;
  document.getElementById('lines-value').textContent = state.totalLines;
  document.getElementById('hiscore-value').textContent = state.hiScore;
}

export function showStartHiScore(state) {
  const el = document.getElementById('start-hiscore');
  if (state.hiScore > 0) el.textContent = 'Рекорд: ' + state.hiScore;
}

export function startGame(state, spawnFn) {
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('preview').style.display = '';
  document.getElementById('preview-label').style.display = '';
  document.getElementById('score-panel').style.display = '';
  document.getElementById('controls-help').style.display = 'block';
  state.score = 0;
  state.totalLines = 0;
  state.dropInterval = BASE_DROP_INTERVAL;
  updateHUD(state);
  state.gameState = 'playing';
  state.lastDropTime = performance.now();
  spawnFn();
}

export function pauseGame(state) {
  document.getElementById('pause-screen').style.display = '';
  state.gameState = 'paused';
}

export function resumeGame(state) {
  document.getElementById('pause-screen').style.display = 'none';
  state.gameState = 'playing';
  state.lastDropTime = performance.now();
}

export function gameOver(state, scene, audio) {
  audio.sfxGameOver();
  if (state.ghostGroup) { scene.remove(state.ghostGroup); state.ghostGroup = null; }
  if (state.currentGroup) { scene.remove(state.currentGroup); state.currentGroup = null; }
  document.getElementById('final-score').textContent = state.score;
  const isRecord = state.score > state.hiScore;
  if (isRecord) {
    state.hiScore = state.score;
    localStorage.setItem('tetris3d-hiscore', state.hiScore);
  }
  document.getElementById('new-record').style.display = isRecord ? '' : 'none';
  document.getElementById('gameover-screen').style.display = '';
  state.gameState = 'gameover';
}

export function resetGame(state, field, startFn) {
  document.getElementById('gameover-screen').style.display = 'none';
  field.clearAll();
  state.currentPiece = null;
  state.nextPiece = null;
  startFn();
}

export function addScore(state, layerCount) {
  const pts = layerCount === 1 ? 100 : layerCount === 2 ? 300 : layerCount === 3 ? 600 : 1000;
  state.score += pts;
  state.totalLines += layerCount;
  state.dropInterval = 1000 * Math.pow(0.9, Math.floor(state.totalLines / 5));
  updateHUD(state);
}
