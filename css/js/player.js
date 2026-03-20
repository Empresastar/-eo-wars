// js/player.js
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export class Player {
    constructor(camera, domElement) {
        this.camera = camera;
        this.controls = new PointerLockControls(camera, domElement);
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false; // Lógica de pulo
        this.speed = 100;
        this.jumpHeight = 250;

        // Anexar controles ao corpo
        document.body.appendChild(this.controls.domElement);

        // Lógica para bloquear o ponteiro do mouse
        domElement.addEventListener('click', () => {
            this.controls.lock();
        });

        // Eventos de teclado
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    onKeyDown(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW': this.moveForward = true; break;
            case 'ArrowLeft':
            case 'KeyA': this.moveLeft = true; break;
            case 'ArrowDown':
            case 'KeyS': this.moveBackward = true; break;
            case 'ArrowRight':
            case 'KeyD': this.moveRight = true; break;
            case 'Space':
                if (this.canJump === true) this.velocity.y += this.jumpHeight;
                this.canJump = false;
                break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW': this.moveForward = false; break;
            case 'ArrowLeft':
            case 'KeyA': this.moveLeft = false; break;
            case 'ArrowDown':
            case 'KeyS': this.moveBackward = false; break;
            case 'ArrowRight':
            case 'KeyD': this.moveRight = false; break;
        }
    }

    update(delta) {
        if (this.controls.isLocked) {
            this.velocity.x -= this.velocity.x * 10.0 * delta;
            this.velocity.z -= this.velocity.z * 10.0 * delta;
            this.velocity.y -= 9.8 * 100.0 * delta; // Gravidade

            this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
            this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
            this.direction.normalize(); // Garante movimento consistente em diagonais

            if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * this.speed * delta;
            if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * this.speed * delta;

            this.controls.moveRight(-this.velocity.x * delta);
            this.controls.moveForward(-this.velocity.z * delta);

            this.controls.getObject().position.y += this.velocity.y * delta; // new behavior

            // Colisão com o "chão" (muito simples, precisa de mais complexidade depois)
            if (this.controls.getObject().position.y < 10) {
                this.velocity.y = 0;
                this.controls.getObject().position.y = 10;
                this.canJump = true;
            }
        }
    }
}
