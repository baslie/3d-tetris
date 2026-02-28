import * as THREE from 'three';
import { SMOOTH_DROP_MS, TRAIL_MS, CLEAR_ANIM_MS } from './config.js';

export function createAnimations(scene) {
  const smoothDrop = { active: false, fromY: 0, toY: 0, start: 0 };

  const hardDropTrail = { active: false, meshes: [], start: 0 };

  const clearAnim = { active: false, startTime: 0, meshes: [], clearedYs: [] };

  function startSmoothDrop(fromY, toY, now) {
    smoothDrop.active = true;
    smoothDrop.fromY = fromY;
    smoothDrop.toY = toY;
    smoothDrop.start = now;
  }

  function spawnHardDropTrail(piece, fromY, toY, posX, posZ) {
    hardDropTrail.meshes.forEach(m => scene.remove(m));
    hardDropTrail.meshes = [];
    const height = fromY - toY;
    if (height <= 1) return;
    piece.blocks.forEach(([dx, dy, dz]) => {
      const geo = new THREE.BoxGeometry(0.3, height, 0.3);
      const mat = new THREE.MeshBasicMaterial({ color: piece.color, transparent: true, opacity: 0.5 });
      const trail = new THREE.Mesh(geo, mat);
      trail.position.set(posX + dx + 0.5, toY + dy + 0.5 + height / 2, posZ + dz + 0.5);
      scene.add(trail);
      hardDropTrail.meshes.push(trail);
    });
    hardDropTrail.active = true;
    hardDropTrail.start = performance.now();
  }

  function startClearAnim(meshes, clearedYs) {
    clearAnim.active = true;
    clearAnim.startTime = performance.now();
    clearAnim.meshes = meshes;
    clearAnim.clearedYs = clearedYs;
  }

  function update(now, currentGroup) {
    // Анимация уничтожения слоёв
    let clearFinished = false;
    if (clearAnim.active) {
      const elapsed = now - clearAnim.startTime;
      const t = Math.min(elapsed / CLEAR_ANIM_MS, 1);
      const s = 1 - t;
      for (const mesh of clearAnim.meshes) {
        mesh.scale.set(s, s, s);
      }
      if (t >= 1) {
        clearAnim.active = false;
        clearAnim.meshes = [];
        clearFinished = true;
      }
    }

    // Trail от hard drop
    if (hardDropTrail.active) {
      const t = Math.min((now - hardDropTrail.start) / TRAIL_MS, 1);
      for (const m of hardDropTrail.meshes) {
        m.material.opacity = 0.5 * (1 - t);
        m.scale.x = 1 - t * 0.5;
        m.scale.z = 1 - t * 0.5;
      }
      if (t >= 1) {
        hardDropTrail.meshes.forEach(m => scene.remove(m));
        hardDropTrail.meshes = [];
        hardDropTrail.active = false;
      }
    }

    // Плавное падение
    if (smoothDrop.active && currentGroup) {
      const t = Math.min((now - smoothDrop.start) / SMOOTH_DROP_MS, 1);
      currentGroup.position.y = smoothDrop.fromY + (smoothDrop.toY - smoothDrop.fromY) * t;
      if (t >= 1) smoothDrop.active = false;
    }

    return { clearFinished, clearedYs: clearAnim.clearedYs };
  }

  return {
    smoothDrop,
    clearAnim,
    startSmoothDrop,
    spawnHardDropTrail,
    startClearAnim,
    update,
  };
}
