import * as THREE from 'three';
import { FIELD, PIECES } from './config.js';

export function randomPiece() {
  return PIECES[Math.floor(Math.random() * PIECES.length)];
}

export function createPieceMesh(piece) {
  const group = new THREE.Group();
  piece.blocks.forEach(([dx, dy, dz]) => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshLambertMaterial({ color: piece.color });
    const cube = new THREE.Mesh(geo, mat);
    cube.castShadow = true;
    cube.position.set(dx, dy, dz);
    group.add(cube);
  });
  return group;
}

export function getPieceBounds(piece) {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  piece.blocks.forEach(([dx, dy, dz]) => {
    minX = Math.min(minX, dx); maxX = Math.max(maxX, dx);
    minY = Math.min(minY, dy); maxY = Math.max(maxY, dy);
    minZ = Math.min(minZ, dz); maxZ = Math.max(maxZ, dz);
  });
  return { minX, maxX, minY, maxY, minZ, maxZ,
    w: maxX - minX + 1, h: maxY - minY + 1, d: maxZ - minZ + 1 };
}

export function spawnPiece(state, field, renderFn, previewFn, gameOverFn) {
  state.currentPiece = state.nextPiece || randomPiece();
  state.nextPiece = randomPiece();
  while (state.nextPiece === state.currentPiece) {
    state.nextPiece = randomPiece();
  }
  const bounds = getPieceBounds(state.currentPiece);
  state.currentPosition.x = Math.floor((FIELD.W - bounds.w) / 2);
  state.currentPosition.z = Math.floor((FIELD.D - bounds.d) / 2);
  state.currentPosition.y = FIELD.H - bounds.h;
  if (!field.canPlace(state.currentPiece, state.currentPosition)) {
    state.currentPiece = null;
    gameOverFn();
    return;
  }
  renderFn();
  previewFn();
}

export function tryMove(state, dx, dy, dz, field, renderFn) {
  const np = {
    x: state.currentPosition.x + dx,
    y: state.currentPosition.y + dy,
    z: state.currentPosition.z + dz,
  };
  if (field.canPlace(state.currentPiece, np)) {
    state.currentPosition = np;
    renderFn();
    return true;
  }
  return false;
}

export function rotatePiece(state, axis, dir, field, renderFn) {
  const rotated = state.currentPiece.blocks.map(([x, y, z]) => {
    if (axis === 'y') return dir > 0 ? [-z, y, x] : [z, y, -x];
    if (axis === 'z') return dir > 0 ? [-y, x, z] : [y, -x, z];
    return dir > 0 ? [x, -z, y] : [x, z, -y];
  });
  let mnX = Infinity, mnY = Infinity, mnZ = Infinity;
  rotated.forEach(([x, y, z]) => { mnX = Math.min(mnX, x); mnY = Math.min(mnY, y); mnZ = Math.min(mnZ, z); });
  const norm = rotated.map(([x, y, z]) => [x - mnX, y - mnY, z - mnZ]);
  const test = { blocks: norm, color: state.currentPiece.color };
  if (field.canPlace(test, state.currentPosition)) {
    state.currentPiece = test;
    renderFn();
  }
}

export function renderCurrentPiece(state, scene, ghostRenderFn) {
  if (state.currentGroup) scene.remove(state.currentGroup);
  if (!state.currentPiece) return;
  state.currentGroup = createPieceMesh(state.currentPiece);
  state.currentGroup.position.set(
    state.currentPosition.x + 0.5,
    state.currentPosition.y + 0.5,
    state.currentPosition.z + 0.5
  );
  scene.add(state.currentGroup);
  ghostRenderFn();
}
