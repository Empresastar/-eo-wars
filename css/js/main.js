// js/main.js
import * as THREE from 'three';
import { Player } from './player.js';
import { World } from './world.js';

let scene, camera, renderer, player, world;
let prevTime = performance.now(); // Para calcular o delta time

function init() {
    // 1. Cena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Cor do céu

    // 2. Câmera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(10, 10, 10); // Posição inicial da câmera

    // 3. Renderizador
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('game-container').appendChild(renderer.domElement);

    // 4. Luz (opcional, para visualização básica)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // 5. Jogador
    player = new Player(camera, document.body); // Passa o body para os controles de ponteiro

    // 6. Mundo
    world = new World(scene);
    world.generateFlatWorld(20); // Gera um chão 20x20

    // Evento de redimensionamento da janela
    window.addEventListener('resize', onWindowResize);

    // Iniciar o loop de animação
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    const delta = (time - prevTime) / 1000; // Tempo em segundos desde o último frame

    player.update(delta); // Atualiza a posição do jogador

    renderer.render(scene, camera);
    prevTime = time;
}

// Inicia o jogo quando a página carrega
window.addEventListener('load', init);
