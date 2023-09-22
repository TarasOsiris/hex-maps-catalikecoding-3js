import * as THREE from "three";

export class VisualDebugUtils {
    static addDebugCube(parent: THREE.Object3D, position: THREE.Vector3, size: number = 1) {
        const geometry = new THREE.BoxGeometry(size, size, size);
        const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xff0000}));
        mesh.position.set(position.x, position.y, position.z);
        parent.add(mesh);
    }
}