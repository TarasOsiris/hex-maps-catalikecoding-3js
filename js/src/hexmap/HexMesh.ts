import * as THREE from "three";
import {HexCell} from "./HexCell";
import {HexMetrics} from "./HexMetrics";
import {Vector3} from "../lib/math/Vector3";
import GUI from "lil-gui";
import {HexDirection, HexDirectionUtils} from "./HexDirection";
import {ColorUtils} from "../lib/ColorUtils";
import {Color} from "three";

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
        const center = cell.position.clone()
        let v1 = center.clone().add(HexMetrics.getFirstSolidCorner(direction));
        let v2 = center.clone().add(HexMetrics.getSecondSolidCorner(direction));

        this.addTriangle(center, v1, v2)
        this.addTriangleColor(cell.color.clone(), cell.color.clone(), cell.color.clone())

        let v3 = center.clone().add(HexMetrics.getFirstCorner(direction));
        let v4 = center.clone().add(HexMetrics.getSecondCorner(direction));

        this.addQuad(v1, v2, v3, v4)

        const previousNeighbor = cell.getNeighbor(HexDirectionUtils.previous(direction)) ?? cell
        const neighbor = cell.getNeighbor(direction) ?? cell;
        const nextNeighbor = cell.getNeighbor(HexDirectionUtils.next(direction)) ?? cell

        this.addQuadColor(
            cell.color.clone(),
            cell.color.clone(),
            cell.color.clone()
                .add(previousNeighbor.color.clone())
                .add(neighbor.color.clone())
                .multiplyScalar(1 / 3),
            cell.color.clone()
                .add(neighbor.color.clone())
                .add(nextNeighbor.color.clone())
                .multiplyScalar(1 / 3),
        )
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
        this.addVertices(v1, v2, v3)
        this.meshTriangles.push(vertexIndex);
        this.meshTriangles.push(vertexIndex + 1);
        this.meshTriangles.push(vertexIndex + 2);
    }

    addVertex(v: THREE.Vector3) {
        this.meshVertices.push(v.x, v.y, v.z);
    }

    addVertices(...vertices: Array<THREE.Vector3>) {
        vertices.forEach(v => this.addVertex(v))
    }

    addQuad(v1: THREE.Vector3, v2: THREE.Vector3, v3: THREE.Vector3, v4: THREE.Vector3) {
        const vertexIndex = this.meshVertices.length / 3;
        this.addVertices(v1, v2, v3, v4)
        this.meshTriangles.push(vertexIndex);
        this.meshTriangles.push(vertexIndex + 2);
        this.meshTriangles.push(vertexIndex + 1);
        this.meshTriangles.push(vertexIndex + 1);
        this.meshTriangles.push(vertexIndex + 2);
        this.meshTriangles.push(vertexIndex + 3);
    }

    addQuadColor(c1: THREE.Color, c2: THREE.Color, c3: THREE.Color, c4: THREE.Color) {
        this.addColor(c1);
        this.addColor(c2);
        this.addColor(c3);
        this.addColor(c4);
    }
}