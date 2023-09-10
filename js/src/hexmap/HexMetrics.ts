import * as THREE from "three";
import {HexDirection} from "./HexDirection";

export class HexMetrics {
    static readonly outerRadius = 10;
    static readonly innerRadius = this.outerRadius * 0.866025404;
    static readonly solidFactor = 0.75
    static readonly blendFactor = 1 - this.solidFactor

    static readonly elevationStep = 5
    static readonly terracesPerSlope = 2
    static readonly terraceSteps = HexMetrics.terracesPerSlope * 2 + 1

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

    public static getBridge(direction: HexDirection) {
        let corner1 = this.getFirstCorner(direction).clone();
        let corner2 = this.getSecondCorner(direction).clone();
        return corner1.add(corner2).multiplyScalar(this.blendFactor)
    }

    static readonly horizontalTerraceStepSize = 1 / HexMetrics.terraceSteps

    public static terraceLerp(a: THREE.Vector3, b: THREE.Vector3, step: number) {
        const h = step * this.horizontalTerraceStepSize
        const result = a.clone()
        result.x += (b.x - a.x) * h
        result.z += (b.z - a.z) * h
        return a;
    }
}