import * as THREE from 'three';
import { createVehicle } from './vehicle.js';
import './style.css';

const container = document.querySelector('#canvas-container');
const hint = document.querySelector('.hint');

if (!(container instanceof HTMLElement)) {
  throw new Error('Could not find the canvas container.');
}

if (!(hint instanceof HTMLElement)) {
  throw new Error('Could not find the controls hint.');
}

const scene = new THREE.Scene();
scene.background = new THREE.Color('#101510');
scene.fog = new THREE.FogExp2(scene.background, 0.025);

const camera = new THREE.PerspectiveCamera(
  40,
  container.clientWidth / container.clientHeight,
  0.1,
  100,
);
camera.position.set(3.5, 2.8, 5);
camera.lookAt(0, -0.85, 0);

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

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({
    color: '#397a47',
    roughness: 1,
  }),
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.85;
scene.add(ground);

const vehicle = createVehicle(scene, camera, ground.position.y, (error) => {
  hint.textContent = 'De bus of texture kon niet laden. Controleer public/models.';
  console.error('Failed to load the van model or its texture.', error);
});

const clock = new THREE.Clock();

function animate() {
  const delta = Math.min(clock.getDelta(), 0.05);
  vehicle.update(delta);
  renderer.render(scene, camera);
}

function resizeRenderer() {
  const { clientWidth, clientHeight } = container;
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(clientWidth, clientHeight);
}

window.addEventListener('resize', resizeRenderer);
renderer.setAnimationLoop(animate);
