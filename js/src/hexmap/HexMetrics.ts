import * as THREE from "three";

export class HexMetrics {
    static outerRadius = 10;
    static innerRadius = this.outerRadius * 0.866025404;

    public static corners = [
        new THREE.Vector3(0, 0, this.outerRadius),
        new THREE.Vector3(this.innerRadius, 0, 0.5 * this.outerRadius),
        new THREE.Vector3(this.innerRadius, 0, -0.5 * this.outerRadius),
        new THREE.Vector3(0, 0, -this.outerRadius),
        new THREE.Vector3(-this.innerRadius, 0, -0.5 * this.outerRadius),
        new THREE.Vector3(-this.innerRadius, 0, 0.5 * this.outerRadius)
    ];
}