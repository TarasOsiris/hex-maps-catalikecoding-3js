import * as THREE from "three";
import {HexMetrics} from "./HexMetrics";
import {Vector3} from "../lib/math/Vector3";

export class EdgeVertices {
    v1: THREE.Vector3;
    v2: THREE.Vector3;
    v3: THREE.Vector3;
    v4: THREE.Vector3;
    v5: THREE.Vector3;

    constructor(corner1: THREE.Vector3, corner2: THREE.Vector3) {
        this.v1 = corner1.clone();
        this.v2 = corner1.clone().lerp(corner2, 0.25);
        this.v3 = corner1.clone().lerp(corner2, 0.5);
        this.v4 = corner1.clone().lerp(corner2, 0.75);
        this.v5 = corner2.clone();
    }

    public static terraceLerp(a: EdgeVertices, b: EdgeVertices, step: number): EdgeVertices {
        const result = new EdgeVertices(Vector3.zero, Vector3.zero);
        result.v1 = HexMetrics.terraceLerp(a.v1, b.v1, step);
        result.v2 = HexMetrics.terraceLerp(a.v2, b.v2, step);
        result.v3 = HexMetrics.terraceLerp(a.v3, b.v3, step);
        result.v4 = HexMetrics.terraceLerp(a.v4, b.v4, step);
        result.v5 = HexMetrics.terraceLerp(a.v5, b.v5, step);
        return result;
    }

    clone() {
        const result = new EdgeVertices(Vector3.zero, Vector3.zero);
        result.v1 = this.v1.clone();
        result.v2 = this.v2.clone();
        result.v3 = this.v3.clone();
        result.v4 = this.v4.clone();
        result.v5 = this.v5.clone();
        return result;
    }
}