import * as THREE from "three";

export class EdgeVertices {
    v1: THREE.Vector3
    v2: THREE.Vector3
    v3: THREE.Vector3
    v4: THREE.Vector3

    constructor(corner1: THREE.Vector3, corner2: THREE.Vector3) {
        this.v1 = corner1.clone()
        this.v2 = corner1.clone().lerp(corner2, 1/3)
        this.v3 = corner1.clone().lerp(corner2, 2/3)
        this.v4 = corner2.clone()
    }
}