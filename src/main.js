import { createScene } from './scene.js';
import { createField } from './field.js';
import { createPreview } from './preview.js';
import { createAudio } from './audio.js';
import { createAnimations } from './animations.js';
import { createGameState, updateHUD, showStartHiScore, startGame, pauseGame, resumeGame, gameOver, resetGame, addScore } from './game.js';
import { spawnPiece, tryMove, rotatePiece, renderCurrentPiece } from './pieces.js';
import { renderGhost } from './ghost.js';
import { setupInput } from './input.js';

// --- Инициализация ---
const { scene, camera, renderer, controls } = createScene();
const field = createField(scene);
const preview = createPreview();
const audio = createAudio();
const animations = createAnimations(scene);
const state = createGameState();

// --- Вспомогательные функции для wiring ---
function doRenderCurrentPiece() {
  renderCurrentPiece(state, scene, () => renderGhost(state, scene, field.canPlace));
}

function doRenderPreview() {
  preview.render(state.nextPiece);
}

function doSpawn() {
  spawnPiece(state, field, doRenderCurrentPiece, doRenderPreview, doGameOver);
}

function doGameOver() {
  gameOver(state, scene, audio);
}

function doStartGame() {
  startGame(state, doSpawn);
}

// --- Фиксация фигуры ---
function lockPiece() {
  audio.sfxLand();
  field.lockBlocks(state.currentPiece, state.currentPosition);
  if (state.currentGroup) scene.remove(state.currentGroup);
  state.currentGroup = null;
  if (state.ghostGroup) { scene.remove(state.ghostGroup); state.ghostGroup = null; }
  state.currentPiece = null;

  const fullLayers = field.checkAndClearLayers();
  if (fullLayers.length === 0) {
    doSpawn();
    return;
  }

  addScore(state, fullLayers.length);
  audio.sfxClear();
  const meshes = field.getLayerMeshes(fullLayers);
  animations.startClearAnim(meshes, fullLayers);
}

// --- Game tick ---
function gameTick(now) {
  if (state.gameState !== 'playing' || animations.clearAnim.active || !state.currentPiece) return;
  const interval = state.softDrop ? state.dropInterval / 4 : state.dropInterval;
  if (now - state.lastDropTime >= interval) {
    const np = { x: state.currentPosition.x, y: state.currentPosition.y - 1, z: state.currentPosition.z };
    if (field.canPlace(state.currentPiece, np)) {
      const oldY = state.currentPosition.y;
      state.currentPosition = np;
      animations.startSmoothDrop(oldY + 0.5, np.y + 0.5, now);
      if (state.currentGroup) {
        state.currentGroup.position.set(state.currentPosition.x + 0.5, oldY + 0.5, state.currentPosition.z + 0.5);
      }
      renderGhost(state, scene, field.canPlace);
    } else {
      lockPiece();
    }
    state.lastDropTime = now;
  }
}

// --- Привязка ввода ---
setupInput({
  move(dx, dy, dz) {
    if (state.gameState !== 'playing' || animations.clearAnim.active || !state.currentPiece) return;
    if (tryMove(state, dx, dy, dz, field, doRenderCurrentPiece)) audio.sfxMove();
  },
  rotate(axis, dir) {
    if (state.gameState !== 'playing' || animations.clearAnim.active || !state.currentPiece) return;
    rotatePiece(state, axis, dir, field, doRenderCurrentPiece);
    audio.sfxRotate();
  },
  hardDrop() {
    if (state.gameState !== 'playing' || animations.clearAnim.active || !state.currentPiece) return;
    const startY = state.currentPosition.y;
    while (tryMove(state, 0, -1, 0, field, doRenderCurrentPiece)) {}
    animations.spawnHardDropTrail(state.currentPiece, startY, state.currentPosition.y, state.currentPosition.x, state.currentPosition.z);
    audio.sfxHardDrop();
    lockPiece();
  },
  softDropStart() {
    if (state.gameState !== 'playing') return;
    state.softDrop = true;
  },
  softDropEnd() {
    state.softDrop = false;
  },
  pause() {
    if (state.gameState === 'playing') pauseGame(state);
    else if (state.gameState === 'paused') resumeGame(state);
  },
  toggleHelp() {
    const help = document.getElementById('controls-help');
    help.style.display = help.style.display === 'none' ? 'block' : 'none';
  },
});

// --- Привязка кнопок оверлеев ---
document.getElementById('btn-start').addEventListener('click', doStartGame);
document.getElementById('btn-resume').addEventListener('click', () => resumeGame(state));
document.getElementById('btn-reset').addEventListener('click', () => resetGame(state, field, doStartGame));

// --- Показать hi-score на стартовом экране ---
showStartHiScore(state);

// --- Главный цикл ---
function animate(time) {
  const now = time || performance.now();

  const result = animations.update(now, state.currentGroup);
  if (result.clearFinished) {
    field.finishClearAnimation(result.clearedYs);
    doSpawn();
  }

  gameTick(now);
  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
