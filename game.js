// --- CONFIGURAÇÃO DA CENA ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Cor do céu
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light, new THREE.AmbientLight(0x404040));

// --- VARIÁVEIS DE JOGO ---
let blocks = [];
let drops = [];
let inventory = { iron: 0, gold: 0, blocks: 64 };
let velocityY = 0;
const gravity = -0.008;
const jumpForce = 0.12;
const playerHeight = 1.8;

// --- CRIAÇÃO DE BLOCOS ---
function createCube(x, y, z, color, type = 'block') {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshLambertMaterial({ color })
    );
    mesh.position.set(x, y, z);
    mesh.userData.type = type;
    scene.add(mesh);
    blocks.push(mesh);
    return mesh;
}

// Chão (Ilha Inicial)
for(let x=-5; x<=5; x++) {
    for(let z=-5; z<=5; z++) {
        createCube(x, 0, z, 0x55aa55);
    }
}

// Elementos do Mapa
createCube(0, 1, -2, 0xff0000, 'bed'); // Cama
const npc = createCube(3, 1, 0, 0x0000ff, 'npc'); // Loja
const genPos = new THREE.Vector3(-3, 1, 0); // Local do Gerador
createCube(genPos.x, 0.5, genPos.z, 0x333333);

// --- GERADOR DE ITENS ---
function spawnItem() {
    const isGold = Math.random() > 0.8;
    const item = new THREE.Mesh(
        new THREE.SphereGeometry(0.15),
        new THREE.MeshBasicMaterial({ color: isGold ? 0xffd700 : 0xdddddd })
    );
    item.position.copy(genPos).add(new THREE.Vector3(0, 1, 0));
    item.userData = { type: isGold ? 'gold' : 'iron' };
    scene.add(item);
    drops.push(item);
}
setInterval(spawnItem, 2000);

// --- CONTROLES E MOVIMENTO ---
let keys = {};
document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

let yaw = 0, pitch = 0;
document.body.addEventListener('click', () => document.body.requestPointerLock());
document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement !== document.body) return;
    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;
    pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
    camera.rotation.set(pitch, yaw, 0, 'YXZ');
});

camera.position.set(0, 3, 5);

// --- LOOP DE ATUALIZAÇÃO ---
function update() {
    // Movimento WASD
    const speed = 0.1;
    const dir = new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
    dir.y = 0; dir.normalize();
    const side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0,1,0)).normalize();

    if(keys['w']) camera.position.add(dir.clone().multiplyScalar(speed));
    if(keys['s']) camera.position.add(dir.clone().multiplyScalar(-speed));
    if(keys['a']) camera.position.add(side.clone().multiplyScalar(-speed));
    if(keys['d']) camera.position.add(side.clone().multiplyScalar(speed));

    // Gravidade e Pulo
    velocityY += gravity;
    camera.position.y += velocityY;
    if(camera.position.y < playerHeight) {
        camera.position.y = playerHeight;
        velocityY = 0;
        if(keys[' ']) velocityY = jumpForce;
    }

    // Coleta de Itens no chão
    drops.forEach((item, index) => {
        if(camera.position.distanceTo(item.position) < 1.2) {
            inventory[item.userData.type]++;
            document.getElementById(item.userData.type + '-count').innerText = inventory[item.userData.type];
            scene.remove(item);
            drops.splice(index, 1);
        }
    });

    // Detectar NPC
    const distToNPC = camera.position.distanceTo(npc.position);
    document.getElementById('shop-msg').style.display = distToNPC < 3 ? 'block' : 'none';
}

// --- INTERAÇÃO (CLIQUES) ---
const raycaster = new THREE.Raycaster();
window.addEventListener('mousedown', (e) => {
    if (document.pointerLockElement !== document.body) return;
    raycaster.setFromCamera({x:0, y:0}, camera);
    const intersects = raycaster.intersectObjects(blocks);

    if(intersects.length > 0) {
        const hit = intersects[0];
        // Clique Esquerdo: Colocar Bloco
        if(e.button === 0 && inventory.blocks > 0) {
            const pos = hit.object.position.clone().add(hit.face.normal);
            createCube(pos.x, pos.y, pos.z, 0xaaaaaa);
            inventory.blocks--;
            document.getElementById('block-count').innerText = inventory.blocks;
        }
        // Clique Direito: Quebrar
        if(e.button === 2 && hit.object.position.y > 0) {
            scene.remove(hit.object);
            blocks = blocks.filter(b => b !== hit.object);
        }
    }
});

window.addEventListener('contextmenu', e => e.preventDefault());

function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}
animate();

// Ajustar tela ao redimensionar
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
