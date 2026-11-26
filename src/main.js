import * as THREE from 'three';
import './style.css';

const container = document.querySelector('#canvas-container');

if (!(container instanceof HTMLElement)) {
  throw new Error('Could not find the canvas container.');
}

const scene = new THREE.Scene();
scene.background = new THREE.Color('#101510');

const camera = new THREE.PerspectiveCamera(
  40,
  container.clientWidth / container.clientHeight,
  0.1,
  100,
);
camera.position.set(3.5, 2.8, 5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight('#ffffff', 1.4));

const keyLight = new THREE.DirectionalLight('#ffffff', 3);
keyLight.position.set(4, 5, 3);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight('#9dffb0', 1.2);
fillLight.position.set(-4, 1, -3);
scene.add(fillLight);

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1.7, 1.7, 1.7),
  new THREE.MeshStandardMaterial({
    color: '#55e878',
    roughness: 0.32,
    metalness: 0.05,
  }),
);
scene.add(cube);

const clock = new THREE.Clock();

function resizeRenderer() {
  const { clientWidth, clientHeight } = container;
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(clientWidth, clientHeight);
}

window.addEventListener('resize', resizeRenderer);

function animate() {
  const elapsed = clock.getElapsedTime();
  cube.rotation.x = elapsed * 0.18;
  cube.rotation.y = elapsed * 0.28;
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
