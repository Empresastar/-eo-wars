import * as THREE from 'three';
import { Player } from './player.js';
import { World } from './world.js';

let scene, camera, renderer, player, world, prevTime = performance.now();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Céu azul

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // LUZ: Adicionando luz total para garantir que nada fique preto
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); 
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    player = new Player(camera, renderer.domElement);
    
    // Posiciona a câmera bem alto no início para evitar o "preto" de estar dentro do bloco
    camera.position.set(0, 5, 0); 

    world = new World(scene);
    world.generate(20);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    const time = performance.now();
    const delta = Math.min((time - prevTime) / 1000, 0.1); // Trava o delta para evitar saltos

    player.update(delta);
    renderer.render(scene, camera);
    prevTime = time;
}

init();
