import * as THREE from "three";
import {HexCell} from "./HexCell";
import {BufferGeometry} from "three";

export class HexMesh extends THREE.Mesh {

    geometry: THREE.BufferGeometry = new BufferGeometry()
    vertices: Array<THREE.Vector3> = new Array<THREE.Vector3>()
    triangles: Array<number> = new Array<number>()

    constructor() {
        const geometry = new THREE.PlaneGeometry(10, 10)
        const material = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: false})
        super(geometry, material);
        this.rotateX(-Math.PI/2)
        this.position.set(1,1,1)
    }

    triangulate(cells: Array<HexCell>) {
        this.vertices = []
        this.triangles = []
        this.geometry = new BufferGeometry()

        // TODO continue here
    }
}