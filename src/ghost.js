import * as THREE from 'three';

export function renderGhost(state, scene, canPlace) {
  if (state.ghostGroup) { scene.remove(state.ghostGroup); state.ghostGroup = null; }
  if (!state.currentPiece) return;

  const ghostPos = { ...state.currentPosition };
  while (true) {
    const next = { x: ghostPos.x, y: ghostPos.y - 1, z: ghostPos.z };
    if (!canPlace(state.currentPiece, next)) break;
    ghostPos.y = next.y;
  }

  if (ghostPos.y === state.currentPosition.y) return;

  state.ghostGroup = new THREE.Group();
  state.currentPiece.blocks.forEach(([dx, dy, dz]) => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshLambertMaterial({
      color: state.currentPiece.color,
      transparent: true,
      opacity: 0.2,
    });
    const cube = new THREE.Mesh(geo, mat);
    cube.position.set(dx, dy, dz);
    state.ghostGroup.add(cube);
  });
  state.ghostGroup.position.set(ghostPos.x + 0.5, ghostPos.y + 0.5, ghostPos.z + 0.5);
  scene.add(state.ghostGroup);
}
