import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 7);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Post-processing setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Create UnrealBloomPass
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight), // Resolution of the render target
  1.5,  // Strength of the bloom effect
  0.4,  // Radius of the bloom
  0.85   // Threshold of brightness for bloom
);
composer.addPass(bloomPass);

// Function to Create Cube
function createCube() {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    cube.position.y = 2.25;
    scene.add(cube);
    return cube;
}

// Function to Create Floor
function createFloor() {
    const geometry = new THREE.PlaneGeometry(50, 50);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });
    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
}

// Function to Create Light
function createLight() {
    const light = new THREE.PointLight(0xffffff, 40, 15);
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    scene.add(light);

    const sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lightSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(lightSphere);

    return { light, lightSphere };
}

// Initialize Scene Objects
const cube = createCube();
createFloor();
const { light, lightSphere } = createLight();

// Raycaster for detecting mouse clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let intersectedObject = null;

// Mouse event listener
window.addEventListener('click', onMouseClick, false);

function onMouseClick(event) {
    // Normalize mouse position to be between -1 and 1
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Set the raycaster based on the mouse position
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections
    const intersects = raycaster.intersectObject(cube);

    // If the cube is clicked, change its color
    if (intersects.length > 0) {
        cube.material.color.set(Math.random() * 0xffffff); // Change color to a random color
    }
}

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime();

    // Rotate Cube
    cube.rotation.x += 0.005;
    cube.rotation.y += 0.005;

    // Move Light in a Circle
    light.position.set(Math.sin(elapsedTime) * 4, 4.5, Math.cos(elapsedTime) * 4);
    lightSphere.position.copy(light.position);

    controls.update();
    composer.render();
}

renderer.setAnimationLoop(animate);

// Handle Window Resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
