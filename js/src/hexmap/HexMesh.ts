import * as THREE from "three";
import {HexCell} from "./HexCell";
import {HexMetrics} from "./HexMetrics";
import {Vector3} from "../lib/math/Vector3";
import GUI from "lil-gui";
import {HexDirection} from "./HexDirection";
import {ColorUtils} from "../lib/ColorUtils";

export class HexMesh extends THREE.Mesh {

    meshVertices: Array<number> = new Array<number>()
    meshTriangles: Array<number> = new Array<number>()
    meshColors: Array<number> = new Array<number>()

    constructor(gui: GUI) {
        const geometry = new THREE.BufferGeometry()
        const material = new THREE.MeshBasicMaterial({wireframe: false, vertexColors: true})
        material.side = THREE.BackSide
        super(geometry, material);

        gui.addFolder("HexMesh").add(material, 'wireframe')
    }

    triangulate(cells: Array<HexCell>) {
        this.meshVertices = []
        this.meshTriangles = []
        this.meshColors = []
        for (let i = 0; i < cells.length; i++) {
            this.triangulateCell(cells[i])
        }
        this.geometry = this.createGeometry()
    }

    private createGeometry() {
        const meshGeometry = new THREE.BufferGeometry()
        meshGeometry.setIndex(this.meshTriangles)
        meshGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.meshVertices), 3));
        meshGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(this.meshColors), 3))
        meshGeometry.computeVertexNormals()
        return meshGeometry
    }

    triangulateCell(cell: HexCell) {
        for (let d = HexDirection.NE; d <= HexDirection.NW; d++) {
            this.triangulateSector(d, cell);
        }
    }

    private triangulateSector(direction: HexDirection, cell: HexCell) {
        const center = Vector3.copy(cell.position)
        this.addTriangle(
            center,
            Vector3.add(center, HexMetrics.getFirstCorner(direction)),
            Vector3.add(center, HexMetrics.getSecondCorner(direction))
        )
        let neighbor = cell.getNeighbor(direction) ?? cell;
        const cellColorCopy = ColorUtils.copy(cell.color)
        let edgeColor = cellColorCopy.add(neighbor.color).multiplyScalar(0.5);
        this.addTriangleColor(cell.color, edgeColor, edgeColor)
    }

    private addTriangleColor(c1: THREE.Color, c2: THREE.Color, c3: THREE.Color) {
        this.addColor(c1);
        this.addColor(c2);
        this.addColor(c3);
    }

    private addColor(color1: THREE.Color) {
        this.meshColors.push(color1.r, color1.g, color1.b)
    }

    addTriangle(v1: THREE.Vector3, v2: THREE.Vector3, v3: THREE.Vector3) {
        const vertexIndex = this.meshVertices.length / 3;
        this.meshVertices.push(v1.x, v1.y, v1.z);
        this.meshVertices.push(v2.x, v2.y, v2.z);
        this.meshVertices.push(v3.x, v3.y, v3.z);
        this.meshTriangles.push(vertexIndex);
        this.meshTriangles.push(vertexIndex + 1);
        this.meshTriangles.push(vertexIndex + 2);
    }
}