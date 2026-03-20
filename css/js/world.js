import * as THREE from 'three';
import { Block } from './block.js';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    generate(size = 15) {
        for (let x = -size; x < size; x++) {
            for (let z = -size; z < size; z++) {
                const blockInfo = new Block(x, 0, z, 'grass');
                
                // MeshBasicMaterial aparece mesmo se não houver luz
                const material = new THREE.MeshBasicMaterial({ 
                    color: blockInfo.getColor(),
                    wireframe: false // Mude para true se quiser ver as linhas dos blocos
                });
                
                const mesh = new THREE.Mesh(this.geometry, material);
                mesh.position.set(x, 0, z);
                this.scene.add(mesh);
            }
        }
    }
}
