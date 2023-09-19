import * as THREE from 'three';

export class Vec3 {
    static zero = new THREE.Vector3(0, 0, 0);
    static one = new THREE.Vector3(1, 1, 1);
    static back = new THREE.Vector3(0, 0, -1);
    static forward = new THREE.Vector3(0, 0, 1);
    static right = new THREE.Vector3(1, 0, 0);
    static up = new THREE.Vector3(0, 1, 0);

    public static lerp(v1: THREE.Vector3, v2: THREE.Vector3, alpha: number) {
        return new THREE.Vector3().lerpVectors(v1, v2, alpha);
    }
}