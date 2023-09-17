import * as THREE from "three";

export class SceneUtils {
    static addDefaultCube(scene: THREE.Scene, wireframe: boolean = true) {
        const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
        const material = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: wireframe});
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
    }

    static addArrowAxesHelper(scene: THREE.Scene, length: number = 60) {
        const arrowPos = new THREE.Vector3(0, 0, 0);
        scene.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), arrowPos, length, 0x7F2020, 20, 10));
        scene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), arrowPos, length, 0x207F20, 20, 10));
        scene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), arrowPos, length, 0x20207F, 20, 10));
    }
}