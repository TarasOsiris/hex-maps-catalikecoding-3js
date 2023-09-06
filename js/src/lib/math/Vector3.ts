import * as THREE from 'three'

export class Vector3 {
    static zero = new THREE.Vector3(0, 0, 0)
    static one = new THREE.Vector3(1, 1, 1)
    static back = new THREE.Vector3(0, 0, -1)
    static forward = new THREE.Vector3(0, 0, 1)
    static right = new THREE.Vector3(1, 0, 0)
    static up = new THREE.Vector3(0, 1, 0)

    static copy(vector: THREE.Vector3) {
        return new THREE.Vector3().copy(vector)
    }

    static add(vector1: THREE.Vector3, vector2: THREE.Vector3) {
        return this.copy(vector1).add(vector2)
    }
}