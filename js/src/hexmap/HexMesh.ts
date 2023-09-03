import * as THREE from "three";
import {HexCell} from "./HexCell";
import {HexMetrics} from "./HexMetrics";
import {Vector3} from "../lib/Vector3";

export class HexMesh extends THREE.Mesh {

    meshGeometry: THREE.BufferGeometry = new THREE.BufferGeometry()
    meshVertices: Array<THREE.Vector3> = new Array<THREE.Vector3>()
    meshTriangles: Array<number> = new Array<number>()

    constructor() {
        const geometry = new THREE.BufferGeometry()
        // TODO add debug gui toggle for wireframe
        const material = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: false})
        material.side = THREE.DoubleSide
        super(geometry, material);
    }

    triangulate(cells: Array<HexCell>) {
        this.meshVertices = []
        this.meshTriangles = []
        for (let i = 0; i < cells.length; i++) {
            this.triangulateCell(cells[i])
        }

        const flatennedVertices: number[] = []
        this.meshVertices.forEach(vertex => {
            flatennedVertices.push(vertex.x, vertex.y, vertex.z);
        })
        console.log(this.meshTriangles)
        console.log(flatennedVertices)
        this.meshGeometry = new THREE.BufferGeometry()
        this.meshGeometry.setIndex(this.meshTriangles)
        this.meshGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(flatennedVertices), 3));
        this.meshGeometry.computeVertexNormals()
        this.geometry = this.meshGeometry
        // this.geometry = new BoxGeometry(3,3,3)
    }

    triangulateCell(cell: HexCell) {
        const center = Vector3.copy(cell.position)

        for (let i = 0; i < 6; i++) {
            this.addTriangle(
                center,
                Vector3.add(center, HexMetrics.corners[i]),
                Vector3.add(center, HexMetrics.corners[i + 1])
            )
        }
    }

    addTriangle(v1: THREE.Vector3, v2: THREE.Vector3, v3: THREE.Vector3) {
        const vertexIndex = this.meshVertices.length;
        this.meshVertices.push(v1);
        this.meshVertices.push(v2);
        this.meshVertices.push(v3);
        this.meshTriangles.push(vertexIndex);
        this.meshTriangles.push(vertexIndex + 1);
        this.meshTriangles.push(vertexIndex + 2);
    }
}