import * as THREE from 'three';
import { BG_COLOR } from './config.js';
import { createPieceMesh, getPieceBounds } from './pieces.js';

export function createPreview() {
  const previewCanvas = document.getElementById('preview-canvas');
  previewCanvas.width = 150;
  previewCanvas.height = 150;
  const previewRenderer = new THREE.WebGLRenderer({ canvas: previewCanvas, antialias: true });
  previewRenderer.setSize(150, 150);
  previewRenderer.setClearColor(BG_COLOR);

  const previewScene = new THREE.Scene();
  const previewCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
  previewCamera.position.set(3, 3, 3);
  previewCamera.lookAt(0, 0, 0);

  previewScene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const previewDir = new THREE.DirectionalLight(0xffffff, 0.8);
  previewDir.position.set(3, 5, 3);
  previewScene.add(previewDir);

  function render(piece) {
    // Очистить старые меши (оставить 2 источника света)
    while (previewScene.children.length > 2) {
      previewScene.remove(previewScene.children[previewScene.children.length - 1]);
    }
    if (!piece) return;
    const mesh = createPieceMesh(piece);
    const bounds = getPieceBounds(piece);
    mesh.position.set(
      -(bounds.minX + bounds.maxX) / 2,
      -(bounds.minY + bounds.maxY) / 2,
      -(bounds.minZ + bounds.maxZ) / 2
    );
    previewScene.add(mesh);
    previewRenderer.render(previewScene, previewCamera);
  }

  return { render };
}
