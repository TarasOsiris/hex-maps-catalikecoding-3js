import * as THREE from "three";
import {HexDirection} from "./HexDirection";

export class HexMetrics {
    static outerRadius = 10;
    static innerRadius = this.outerRadius * 0.866025404;
    static solidFactor = 0.75
    static blendFactor = 1 - this.solidFactor

    private static invZ = -1;

    private static corners = [
        new THREE.Vector3(0, 0, HexMetrics.invZ * this.outerRadius),
        new THREE.Vector3(this.innerRadius, 0, HexMetrics.invZ * 0.5 * this.outerRadius),
        new THREE.Vector3(this.innerRadius, 0, HexMetrics.invZ * -0.5 * this.outerRadius),
        new THREE.Vector3(0, 0, HexMetrics.invZ * -this.outerRadius),
        new THREE.Vector3(-this.innerRadius, 0, HexMetrics.invZ * -0.5 * this.outerRadius),
        new THREE.Vector3(-this.innerRadius, 0, HexMetrics.invZ * 0.5 * this.outerRadius),
        new THREE.Vector3(0, 0, HexMetrics.invZ * this.outerRadius),
    ];

    public static getFirstCorner(direction: HexDirection): THREE.Vector3 {
        return HexMetrics.corners[direction];
    }

    public static getSecondCorner(direction: HexDirection): THREE.Vector3 {
        return HexMetrics.corners[direction + 1];
    }

    public static getFirstSolidCorner(direction: HexDirection): THREE.Vector3 {
        return HexMetrics.corners[direction].clone().multiplyScalar(this.solidFactor);
    }

    public static getSecondSolidCorner(direction: HexDirection): THREE.Vector3 {
        return HexMetrics.corners[direction + 1].clone().multiplyScalar(this.solidFactor);
    }
}