import * as THREE from "three";

export class SceneUtils {
    static addDefaultCube(scene: THREE.Scene, wireframe: boolean = true) {
        const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2)
        const material = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: wireframe})
        const mesh = new THREE.Mesh(geometry, material)
        scene.add(mesh)
    }
}