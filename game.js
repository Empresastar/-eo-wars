import * as THREE from 'three';

// --- 1. CENA E CÂMERA ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x6eb1ff);
const camera = new THREE.PerspectiveCamera(85, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light, new THREE.AmbientLight(0x707070));

// --- 2. VARIÁVEIS ---
let blocks = [];
let selectedSlot = 1; 
let velocityY = 0;
const gravity = -0.008;
const jumpForce = 0.11;
let isFiring = false;
let canJump = false; // Variável nova para controlar o pulo

// --- 3. ITENS DA MÃO ---
const handBlockGroup = new THREE.Group();
const miniBlock = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), new THREE.MeshLambertMaterial({color: 0xcccccc}));
miniBlock.position.set(0.4, -0.4, -0.6);
handBlockGroup.add(miniBlock);
camera.add(handBlockGroup);

const m4Group = new THREE.Group();
const m4Body = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.5), new THREE.MeshLambertMaterial({color: 0x222222}));
const m4Barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4), new THREE.MeshLambertMaterial({color: 0x111111}));
m4Barrel.rotation.x = Math.PI / 2; m4Barrel.position.z = -0.4;
m4Group.add(m4Body, m4Barrel);
m4Group.position.set(0.4, -0.4, -0.6); 
m4Group.visible = false;
camera.add(m4Group);
scene.add(camera);

// --- 4. FUNÇÃO DE CRIAR BLOCOS ---
function createCube(x, y, z, color = 0x55aa55) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color }));
    mesh.position.set(Math.round(x), Math.round(y), Math.round(z));
    scene.add(mesh);
    blocks.push(mesh);
    return mesh;
}
for(let x=-3; x<=3; x++) { for(let z=-3; z<=3; z++) { createCube(x, 0, z); } }

// --- 5. CONTROLES ---
let keys = {};
document.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    if(e.key === '1') { selectedSlot = 1; handBlockGroup.visible = true; m4Group.visible = false; }
    if(e.key === '2') { selectedSlot = 2; handBlockGroup.visible = false; m4Group.visible = true; }
    
    // Lógica do pulo: só pula se estiver no chão
    if(e.code === 'Space' && canJump) {
        velocityY = jumpForce;
        canJump = false;
    }
});
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

function isPointOnBlock(px, pz) {
    return blocks.some(b => 
        px >= b.position.x - 0.5 && px <= b.position.x + 0.5 &&
        pz >= b.position.z - 0.5 && pz <= b.position.z + 0.5 &&
        Math.abs(camera.position.y - 1.6 - b.position.y) < 1.0
    );
}

// --- 6. LOOP ---
function animate() {
    requestAnimationFrame(animate);
    let isSneaking = keys['shift'];
    let speed = isSneaking ? 0.05 : 0.13;
    let targetHeight = isSneaking ? 1.35 : 1.7;

    const dir = new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
    dir.y = 0; dir.normalize();
    const side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0,1,0)).normalize();

    let nextX = camera.position.x;
    let nextZ = camera.position.z;
    if(keys['w']) { nextX += dir.x * speed; nextZ += dir.z * speed; }
    if(keys['s']) { nextX -= dir.x * speed; nextZ -= dir.z * speed; }
    if(keys['a']) { nextX -= side.x * speed; nextZ -= side.z * speed; }
    if(keys['d']) { nextX += side.x * speed; nextZ += side.z * speed; }

    if(isSneaking) {
        if(!isPointOnBlock(nextX, camera.position.z)) nextX = camera.position.x;
        if(!isPointOnBlock(camera.position.x, nextZ)) nextZ = camera.position.z;
    }

    camera.position.x = nextX; camera.position.z = nextZ;
    
    // Aplicar gravidade
    velocityY += gravity; 
    camera.position.y += velocityY;

    // Resetar canJump a cada frame para verificar colisão
    let onGround = false;

    blocks.forEach(b => {
        // Checagem de colisão horizontal simplificada para o chão
        if(Math.abs(camera.position.x - b.position.x) < 0.65 && Math.abs(camera.position.z - b.position.z) < 0.65) {
            const blockTop = b.position.y + 0.5;
            // Se estiver caindo e encostar no topo do bloco
            if (camera.position.y - targetHeight <= blockTop && camera.position.y - blockTop >= -0.5) {
                camera.position.y = blockTop + targetHeight; 
                velocityY = 0;
                onGround = true;
            }
        }
    });
    
    canJump = onGround;

    if(camera.position.y < -10) {
        camera.position.set(0, 5, 0);
        velocityY = 0;
    }

    // Animação M4
    if(isFiring) {
        m4Group.position.z = THREE.MathUtils.lerp(m4Group.position.z, -0.4, 0.4);
        if(m4Group.position.z > -0.45) isFiring = false;
    } else {
        m4Group.position.z = THREE.MathUtils.lerp(m4Group.position.z, -0.6, 0.1);
    }

    renderer.render(scene, camera);
}

// --- 7. CLIQUES ---
window.addEventListener('mousedown', (e) => {
    if (document.pointerLockElement !== document.body) return;
    
    const ray = new THREE.Raycaster();
    ray.setFromCamera({x:0, y:0}, camera);
    const intersects = ray.intersectObjects(blocks);

    if (e.button === 0) {
        if (selectedSlot === 1) {
            if (intersects.length > 0) {
                const hit = intersects[0];
                const newPos = hit.object.position.clone().add(hit.face.normal);
                if(!blocks.some(b => b.position.equals(newPos))) createCube(newPos.x, newPos.y, newPos.z, 0xcccccc);
            } else {
                const lookDir = new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
                const buildPos = new THREE.Vector3(
                    Math.round(camera.position.x + lookDir.x * 1.5),
                    Math.round(camera.position.y - 1.7),
                    Math.round(camera.position.z + lookDir.z * 1.5)
                );
                if(!blocks.some(b => b.position.equals(buildPos))) createCube(buildPos.x, buildPos.y, buildPos.z, 0xcccccc);
            }
        } else if (selectedSlot === 2) {
            isFiring = true;
        }
    }

    if (e.button === 2) {
        if (intersects.length > 0) {
            const target = intersects[0].object;
            scene.remove(target);
            blocks = blocks.filter(b => b !== target);
        }
    }
});

document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement !== document.body) return;
    camera.rotation.order = 'YXZ';
    camera.rotation.y -= e.movementX * 0.002;
    camera.rotation.x -= e.movementY * 0.002;
    camera.rotation.x = Math.max(-1.5, Math.min(1.5, camera.rotation.x));
});

document.body.addEventListener('click', () => document.body.requestPointerLock());
window.oncontextmenu = (e) => e.preventDefault(); 
camera.position.set(0, 5, 0);
animate();
