import * as THREE from "three";
import {HexCell} from "./HexCell";
import {HexMetrics} from "./HexMetrics";
import GUI from "lil-gui";
import {HexDirection, HexDirectionUtils} from "./HexDirection";
import {HexEdgeType} from "./HexEdgeType";

export class HexMesh extends THREE.Mesh {

    meshVertices: Array<number> = new Array<number>()
    meshTriangles: Array<number> = new Array<number>()
    meshColors: Array<number> = new Array<number>()

    constructor(gui: GUI) {
        const geometry = new THREE.BufferGeometry()
        const material = new THREE.MeshStandardMaterial({wireframe: false, vertexColors: true})
        material.side = THREE.BackSide
        super(geometry, material);
        this.name = "Hex mesh"
        this.receiveShadow = true
        this.castShadow = true

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
        this.geometry.computeBoundingBox()
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

        if (direction <= HexDirection.SE) {
            const neighbor = cell.getNeighbor(direction)
            if (neighbor == null) {
                return
            }
            this.triangulateConnection(direction, cell, v1, v2);
        }
    }

    private triangulateConnection(direction: HexDirection, cell: HexCell, v1: THREE.Vector3, v2: THREE.Vector3) {
        const neighbor = cell.getNeighbor(direction) ?? cell;

        let bridge = HexMetrics.getBridge(direction);
        let v3 = v1.clone().add(bridge);
        let v4 = v2.clone().add(bridge);
        v3.y = v4.y = neighbor.elevation * HexMetrics.elevationStep

        if (cell.getEdgeType(direction) == HexEdgeType.Slope) {
            this.triangulateEdgeTerraces(v1, v2, cell, v3, v4, neighbor)
        } else {
            this.addQuad(v1, v2, v3, v4)
            this.addQuadColor2v(cell.color.clone(), neighbor.color.clone())
        }

        let nextDirection = HexDirectionUtils.next(direction);
        const nextNeighbor = cell.getNeighbor(nextDirection)
        if (direction <= HexDirection.E && nextNeighbor != null) {
            const v5 = v2.clone().add(HexMetrics.getBridge(nextDirection))
            v5.y = nextNeighbor.elevation * HexMetrics.elevationStep

            if (cell.elevation <= neighbor.elevation) {
                if (cell.elevation <= nextNeighbor.elevation) {
                    this.triangulateCorner(v2, cell, v4, neighbor, v5, nextNeighbor)
                } else {
                    this.triangulateCorner(v5, nextNeighbor, v2, cell, v4, neighbor)
                }
            } else if (neighbor.elevation <= nextNeighbor.elevation) {
                this.triangulateCorner(v4, neighbor, v5, nextNeighbor, v2, cell)
            } else {
                this.triangulateCorner(v5, nextNeighbor, v2, cell, v4, neighbor)
            }
        }
    }

    triangulateCorner(bottom: THREE.Vector3, bottomCell: HexCell,
                      left: THREE.Vector3, leftCell: HexCell,
                      right: THREE.Vector3, rightCell: HexCell) {
        const leftEdgeType = bottomCell.getEdgeTypeWithOtherCell(leftCell);
        const rightEdgeType = bottomCell.getEdgeTypeWithOtherCell(rightCell);

        if (leftEdgeType == HexEdgeType.Slope) {
            if (rightEdgeType == HexEdgeType.Slope) {
                this.triangulateCornerTerraces(bottom, bottomCell, left, leftCell, right, rightCell)
                return
            }

            if (rightEdgeType == HexEdgeType.Flat) {
                this.triangulateCornerTerraces(left, leftCell, right, rightCell, bottom, bottomCell)
                return
            }
        }

        if (rightEdgeType == HexEdgeType.Slope) {
            if (leftEdgeType == HexEdgeType.Flat) {
                this.triangulateCornerTerraces(right, rightCell, bottom, bottomCell, left, leftCell);
                return;
            }
        }

        this.addTriangle(bottom, left, right)
        this.addTriangleColor(bottomCell.color, leftCell.color, rightCell.color)
    }

    triangulateCornerTerraces(
        begin: THREE.Vector3, beginCell: HexCell,
        left: THREE.Vector3, leftCell: HexCell,
        right: THREE.Vector3, rightCell: HexCell
    ) {
        let v3 = HexMetrics.terraceLerp(begin, left, 1);
        let v4 = HexMetrics.terraceLerp(begin, right, 1);
        let c3 = HexMetrics.terraceLerpColor(beginCell.color, leftCell.color, 1);
        let c4 = HexMetrics.terraceLerpColor(beginCell.color, rightCell.color, 1);

        this.addTriangle(begin, v3, v4);
        this.addTriangleColor(beginCell.color, c3, c4);

        for (let i = 2; i < HexMetrics.terraceSteps; i++) {
            let v1 = v3;
            let v2 = v4;
            let c1 = c3;
            let c2 = c4;
            v3 = HexMetrics.terraceLerp(begin, left, i);
            v4 = HexMetrics.terraceLerp(begin, right, i);
            c3 = HexMetrics.terraceLerpColor(beginCell.color, leftCell.color, i);
            c4 = HexMetrics.terraceLerpColor(beginCell.color, rightCell.color, i);
            this.addQuad(v1, v2, v3, v4);
            this.addQuadColor4v(c1, c2, c3, c4);
        }

        this.addQuad(v3, v4, left, right);
        this.addQuadColor4v(c3, c4, leftCell.color, rightCell.color);
    }

    triangulateEdgeTerraces(beginLeft: THREE.Vector3, beginRight: THREE.Vector3, beginCell: HexCell,
                            endLeft: THREE.Vector3, endRight: THREE.Vector3, endCell: HexCell) {
        let v3 = HexMetrics.terraceLerp(beginLeft, endLeft, 1)
        let v4 = HexMetrics.terraceLerp(beginRight, endRight, 1)
        let c2 = HexMetrics.terraceLerpColor(beginCell.color, endCell.color, 1)

        this.addQuad(beginLeft, beginRight, v3, v4);
        this.addQuadColor2v(beginCell.color, c2);

        for (let i = 2; i < HexMetrics.terraceSteps; i++) {
            let v1 = v3;
            let v2 = v4;
            let c1 = c2;
            v3 = HexMetrics.terraceLerp(beginLeft, endLeft, i);
            v4 = HexMetrics.terraceLerp(beginRight, endRight, i);
            c2 = HexMetrics.terraceLerpColor(beginCell.color, endCell.color, i);
            this.addQuad(v1, v2, v3, v4);
            this.addQuadColor2v(c1, c2);
        }

        this.addQuad(v3, v4, endLeft, endRight);
        this.addQuadColor2v(c2, endCell.color);
    }

    private addTriangleColor(c1: THREE.Color, c2: THREE.Color, c3: THREE.Color) {
        this.addColor(c1);
        this.addColor(c2);
        this.addColor(c3);
    }

    addTriangle(v1: THREE.Vector3, v2: THREE.Vector3, v3: THREE.Vector3) {
        const vertexIndex = this.meshVertices.length / 3;
        this.addVertices(v1, v2, v3)
        this.meshTriangles.push(vertexIndex);
        this.meshTriangles.push(vertexIndex + 1);
        this.meshTriangles.push(vertexIndex + 2);
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

    addQuadColor4v(c1: THREE.Color, c2: THREE.Color, c3: THREE.Color, c4: THREE.Color) {
        this.addColor(c1);
        this.addColor(c2);
        this.addColor(c3);
        this.addColor(c4);
    }

    addQuadColor2v(c1: THREE.Color, c2: THREE.Color) {
        this.addColor(c1);
        this.addColor(c1);
        this.addColor(c2);
        this.addColor(c2);
    }

    private addColor(color1: THREE.Color) {
        this.meshColors.push(color1.r, color1.g, color1.b)
    }

    addVertex(v: THREE.Vector3) {
        this.meshVertices.push(v.x, v.y, v.z);
    }

    addVertices(...vertices: Array<THREE.Vector3>) {
        vertices.forEach(v => this.addVertex(v))
    }
}