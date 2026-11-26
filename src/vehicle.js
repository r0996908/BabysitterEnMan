import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MODEL_URL = '/models/van.glb';
const TARGET_SIZE = 2.2;
const MAX_SPEED = 5;
const ACCELERATION = 3.2;
const BRAKING = 7;
const COAST_DECELERATION = 1.8;
const TURN_RATE = 1.6;

const KEY_ACTIONS = new Map([
  ['arrowup', 'forward'],
  ['z', 'forward'],
  ['arrowdown', 'backward'],
  ['s', 'backward'],
  ['arrowleft', 'left'],
  ['q', 'left'],
  ['arrowright', 'right'],
  ['d', 'right'],
]);

export function createVehicle(scene, camera, groundHeight, onError) {
  const vehicle = new THREE.Group();
  vehicle.position.y = groundHeight;
  scene.add(vehicle);

  loadModel(vehicle, onError);

  const pressedActions = new Set();
  window.addEventListener('keydown', (event) => updateKey(event, true));
  window.addEventListener('keyup', (event) => updateKey(event, false));
  window.addEventListener('blur', () => pressedActions.clear());

  const cameraOffset = new THREE.Vector3(0, 3.5, 7);
  const cameraLookOffset = new THREE.Vector3(0, 0.9, 0);
  const worldUp = new THREE.Vector3(0, 1, 0);
  const desiredCameraPosition = new THREE.Vector3();
  const cameraLookPosition = new THREE.Vector3();
  const forward = new THREE.Vector3();
  let speed = 0;

  function updateKey(event, isPressed) {
    const action = KEY_ACTIONS.get(event.key.toLowerCase());
    if (!action) {
      return;
    }

    event.preventDefault();
    if (isPressed) {
      pressedActions.add(action);
    } else {
      pressedActions.delete(action);
    }
  }

  function update(delta) {
    const driveInput =
      (pressedActions.has('forward') ? 1 : 0) -
      (pressedActions.has('backward') ? 1 : 0);
    const targetSpeed = driveInput * MAX_SPEED;
    const isBraking =
      driveInput !== 0 && speed !== 0 && Math.sign(speed) !== driveInput;
    const speedChange = driveInput === 0
      ? COAST_DECELERATION
      : isBraking ? BRAKING : ACCELERATION;

    speed = moveTowards(speed, targetSpeed, speedChange * delta);

    const steering =
      (pressedActions.has('left') ? 1 : 0) -
      (pressedActions.has('right') ? 1 : 0);
    const steeringAuthority = Math.min(Math.abs(speed) / 1.5, 1);
    vehicle.rotation.y +=
      steering * TURN_RATE * delta * Math.sign(speed) * steeringAuthority;

    forward.set(0, 0, -1).applyQuaternion(vehicle.quaternion);
    vehicle.position.addScaledVector(forward, speed * delta);

    desiredCameraPosition
      .copy(cameraOffset)
      .applyAxisAngle(worldUp, vehicle.rotation.y)
      .add(vehicle.position);
    camera.position.lerp(desiredCameraPosition, 1 - Math.exp(-4 * delta));
    cameraLookPosition.copy(vehicle.position).add(cameraLookOffset);
    camera.lookAt(cameraLookPosition);
  }

  return { update };
}

function loadModel(vehicle, onError) {
  const manager = new THREE.LoadingManager();
  manager.setURLModifier((url) => {
    const textureReference = 'Textures/colormap.png';
    if (!url.endsWith(textureReference)) {
      return url;
    }

    return `${url.slice(0, -textureReference.length)}colormap.png`;
  });

  const loader = new GLTFLoader(manager);
  loader.load(
    MODEL_URL,
    (gltf) => {
      const model = gltf.scene;
      const bounds = new THREE.Box3().setFromObject(model);
      const size = bounds.getSize(new THREE.Vector3());
      const horizontalSize = Math.max(size.x, size.z);

      if (horizontalSize <= 0) {
        onError(new Error('The model has no horizontal size.'));
        return;
      }

      model.rotation.y = Math.PI;
      model.scale.setScalar(TARGET_SIZE / horizontalSize);
      bounds.setFromObject(model);
      model.position.x -= (bounds.min.x + bounds.max.x) / 2;
      model.position.z -= (bounds.min.z + bounds.max.z) / 2;
      model.position.y -= bounds.min.y;
      vehicle.add(model);
    },
    undefined,
    onError,
  );
}

function moveTowards(current, target, maxDelta) {
  if (Math.abs(target - current) <= maxDelta) {
    return target;
  }

  return current + Math.sign(target - current) * maxDelta;
}
