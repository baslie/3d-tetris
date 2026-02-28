import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FIELD, BG_COLOR, GRID_COLOR, EDGE_COLOR } from './config.js';

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG_COLOR);

  // Камера
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(8, 10, 8);

  // Рендерер
  const canvas = document.getElementById('c');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(3, 6, 3);
  controls.minPolarAngle = 0.1;
  controls.maxPolarAngle = Math.PI / 2 - 0.05;
  controls.update();

  // Сетка платформы
  const gridPositions = [];
  for (let z = 0; z <= FIELD.D; z++) {
    gridPositions.push(0, 0, z, FIELD.W, 0, z);
  }
  for (let x = 0; x <= FIELD.W; x++) {
    gridPositions.push(x, 0, 0, x, 0, FIELD.D);
  }
  const gridGeometry = new THREE.BufferGeometry();
  gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gridPositions, 3));
  const gridMaterial = new THREE.LineBasicMaterial({ color: GRID_COLOR, transparent: true, opacity: 0.5 });
  scene.add(new THREE.LineSegments(gridGeometry, gridMaterial));

  // Границы поля (wireframe)
  const boxGeometry = new THREE.BoxGeometry(FIELD.W, FIELD.H, FIELD.D);
  const edgesGeometry = new THREE.EdgesGeometry(boxGeometry);
  const edgesMaterial = new THREE.LineBasicMaterial({ color: EDGE_COLOR, transparent: true, opacity: 0.2 });
  const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
  edges.position.set(FIELD.W / 2, FIELD.H / 2, FIELD.D / 2);
  scene.add(edges);

  // Плоскость-приёмник теней
  const groundGeo = new THREE.PlaneGeometry(FIELD.W, FIELD.D);
  const groundMat = new THREE.ShadowMaterial({ opacity: 0.3 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(FIELD.W / 2, 0.01, FIELD.D / 2);
  ground.receiveShadow = true;
  scene.add(ground);

  // Освещение
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 15, 5);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 30;
  dirLight.shadow.camera.left = -8;
  dirLight.shadow.camera.right = 8;
  dirLight.shadow.camera.top = 15;
  dirLight.shadow.camera.bottom = -2;
  scene.add(dirLight);

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer, controls };
}
