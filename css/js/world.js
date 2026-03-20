import * as THREE from 'three';
import { Block } from './block.js';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    generate(size = 10) {
        for (let x = -size; x < size; x++) {
            for (let z = -size; z < size; z++) {
                const blockInfo = new Block(x, 0, z, 'grass');
                const material = new THREE.MeshLambertMaterial({ color: blockInfo.getColor() });
                const mesh = new THREE.Mesh(this.geometry, material);
                mesh.position.set(x, 0, z);
                this.scene.add(mesh);
            }
        }
    }
}
