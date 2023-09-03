import * as THREE from "three";
import {HexCell} from "./HexCell";
import {HexMetrics} from "./HexMetrics";
import {Vector3} from "../lib/Vector3";
import GUI from "lil-gui";

export class HexMesh extends THREE.Mesh {

    meshVertices: Array<THREE.Vector3> = new Array<THREE.Vector3>()
    meshTriangles: Array<number> = new Array<number>()

    constructor(gui: GUI) {
        const geometry = new THREE.BufferGeometry()
        // TODO add debug gui toggle for wireframe
        const material = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: false})
        material.side = THREE.BackSide
        super(geometry, material);

        gui.addFolder("HexMesh").add(material, 'wireframe')
    }

    triangulate(cells: Array<HexCell>) {
        this.meshVertices = []
        this.meshTriangles = []
        for (let i = 0; i < cells.length; i++) {
            this.triangulateCell(cells[i])
        }
        this.geometry = this.createGeometry()
    }

    private createGeometry() {
        const meshGeometry = new THREE.BufferGeometry()
        meshGeometry.setIndex(this.meshTriangles)
        meshGeometry.setAttribute('position', new THREE.BufferAttribute(this.getFlattenedVertices(), 3));
        meshGeometry.computeVertexNormals()
        return meshGeometry
    }

    private getFlattenedVertices() {
        const flatennedVertices: number[] = []
        this.meshVertices.forEach(vertex => {
            flatennedVertices.push(vertex.x, vertex.y, vertex.z);
        })
        return new Float32Array(flatennedVertices);
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