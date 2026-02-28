import * as THREE from 'three';
import { FIELD } from './config.js';

export function createField(scene) {
  const fieldGrid = [];
  const blockMeshes = [];

  function initGrid() {
    for (let x = 0; x < FIELD.W; x++) {
      fieldGrid[x] = [];
      blockMeshes[x] = [];
      for (let y = 0; y < FIELD.H; y++) {
        fieldGrid[x][y] = [];
        blockMeshes[x][y] = [];
        for (let z = 0; z < FIELD.D; z++) {
          fieldGrid[x][y][z] = null;
          blockMeshes[x][y][z] = null;
        }
      }
    }
  }

  initGrid();

  function getAbsBlocks(piece, pos) {
    return piece.blocks.map(([dx, dy, dz]) => [pos.x + dx, pos.y + dy, pos.z + dz]);
  }

  function canPlace(piece, pos) {
    return getAbsBlocks(piece, pos).every(([x, y, z]) =>
      x >= 0 && x < FIELD.W &&
      y >= 0 && y < FIELD.H &&
      z >= 0 && z < FIELD.D &&
      fieldGrid[x][y][z] === null
    );
  }

  function lockBlocks(piece, pos) {
    getAbsBlocks(piece, pos).forEach(([x, y, z]) => {
      fieldGrid[x][y][z] = piece.color;
      const geo = new THREE.BoxGeometry(1, 1, 1);
      const mat = new THREE.MeshLambertMaterial({ color: piece.color });
      const cube = new THREE.Mesh(geo, mat);
      cube.castShadow = true;
      cube.receiveShadow = true;
      cube.position.set(x + 0.5, y + 0.5, z + 0.5);
      scene.add(cube);
      blockMeshes[x][y][z] = cube;
    });
  }

  function checkAndClearLayers() {
    const fullLayers = [];
    for (let y = 0; y < FIELD.H; y++) {
      let full = true;
      for (let x = 0; x < FIELD.W && full; x++) {
        for (let z = 0; z < FIELD.D && full; z++) {
          if (fieldGrid[x][y][z] === null) full = false;
        }
      }
      if (full) fullLayers.push(y);
    }
    return fullLayers;
  }

  function getLayerMeshes(layers) {
    const meshes = [];
    for (const y of layers) {
      for (let x = 0; x < FIELD.W; x++) {
        for (let z = 0; z < FIELD.D; z++) {
          const mesh = blockMeshes[x][y][z];
          if (mesh) {
            mesh.material.color.set(0xffffff);
            meshes.push(mesh);
          }
        }
      }
    }
    return meshes;
  }

  function finishClearAnimation(clearedYs) {
    // Удалить меши удалённых слоёв
    for (const y of clearedYs) {
      for (let x = 0; x < FIELD.W; x++) {
        for (let z = 0; z < FIELD.D; z++) {
          const mesh = blockMeshes[x][y][z];
          if (mesh) scene.remove(mesh);
          blockMeshes[x][y][z] = null;
          fieldGrid[x][y][z] = null;
        }
      }
    }

    // Сдвиг слоёв вниз
    const sorted = [...clearedYs].sort((a, b) => a - b);
    for (const removedY of sorted) {
      for (let y = removedY; y < FIELD.H - 1; y++) {
        for (let x = 0; x < FIELD.W; x++) {
          for (let z = 0; z < FIELD.D; z++) {
            fieldGrid[x][y][z] = fieldGrid[x][y + 1][z];
            fieldGrid[x][y + 1][z] = null;
            blockMeshes[x][y][z] = blockMeshes[x][y + 1][z];
            blockMeshes[x][y + 1][z] = null;
            if (blockMeshes[x][y][z]) {
              blockMeshes[x][y][z].position.y = y + 0.5;
            }
          }
        }
      }
    }
  }

  function clearAll() {
    for (let x = 0; x < FIELD.W; x++) {
      for (let y = 0; y < FIELD.H; y++) {
        for (let z = 0; z < FIELD.D; z++) {
          fieldGrid[x][y][z] = null;
          if (blockMeshes[x][y][z]) {
            scene.remove(blockMeshes[x][y][z]);
            blockMeshes[x][y][z] = null;
          }
        }
      }
    }
  }

  return {
    fieldGrid,
    blockMeshes,
    initGrid,
    getAbsBlocks,
    canPlace,
    lockBlocks,
    checkAndClearLayers,
    getLayerMeshes,
    finishClearAnimation,
    clearAll,
  };
}
