import * as THREE from 'three';
import { Block } from './block.js'; // PRECISA DO .JS NO FINAL

export class World {
    constructor(scene) {
        this.scene = scene;
        this.blockGeometry = new THREE.BoxGeometry(1, 1, 1);
    }

    generate(size = 10) {
        for (let x = -size; x < size; x++) {
            for (let z = -size; z < size; z++) {
                const block = new Block(x, 0, z, 'grass');
                const material = new THREE.MeshLambertMaterial({ color: block.getTextureColor() });
                const mesh = new THREE.Mesh(this.blockGeometry, material);
                mesh.position.set(x, 0, z);
                this.scene.add(mesh);
            }
        }
    }
}
