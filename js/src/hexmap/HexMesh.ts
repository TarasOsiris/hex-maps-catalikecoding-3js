import * as THREE from "three";
import {Color} from "three";
import {HexCell} from "./HexCell";
import {HexMetrics} from "./HexMetrics";
import {HexDirection, HexDirectionUtils} from "./HexDirection";
import {HexEdgeType} from "./HexEdgeType";
import {EdgeVertices} from "./EdgeVertices";
import {Vec3} from "../lib/math/Vec3";
import {BufferGeometryUtils} from "../lib/BufferGeometryUtils";

export class HexMesh extends THREE.Mesh {

    static meshVertices: Array<number> = new Array<number>();
    static meshTriangles: Array<number> = new Array<number>();
    static meshColors: Array<number> = new Array<number>();

    constructor(material: THREE.Material, wireframe: boolean = false) {
        const geometry = new THREE.BufferGeometry();
        material.side = THREE.BackSide;
        super(geometry, material);
        this.name = "Hex mesh";
        if (wireframe) {
            this.visible = false;
        } else {
            this.receiveShadow = true;
            this.castShadow = true;
        }
    }

    triangulate(cells: Array<HexCell>) {
        HexMesh.meshVertices = [];
        HexMesh.meshTriangles = [];
        HexMesh.meshColors = [];
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i]!;
            this.triangulateCell(cell);
        }
        this.geometry = this.createGeometry();
        this.geometry.computeBoundingBox();
    }

    private createGeometry() {
        const meshGeometry = new THREE.BufferGeometry();
        meshGeometry.setIndex(HexMesh.meshTriangles);
        BufferGeometryUtils.setPosition(meshGeometry, HexMesh.meshVertices);
        BufferGeometryUtils.setColor(meshGeometry, HexMesh.meshColors);
        meshGeometry.computeVertexNormals();
        return meshGeometry;
    }

    triangulateCell(cell: HexCell) {
        for (let d = HexDirection.NE; d <= HexDirection.NW; d++) {
            this.triangulateSector(d, cell);
        }
    }

    private triangulateSector(direction: HexDirection, cell: HexCell) {
        const center = cell.cellPosition.clone();
        const e = new EdgeVertices(
            center.clone().add(HexMetrics.getFirstSolidCorner(direction)),
            center.clone().add(HexMetrics.getSecondSolidCorner(direction))
        );


        if (cell.hasRiver) {
            if (cell.hasRiverThroughEdge(direction)) {
                e.v3.y = cell.streamBedY;
                if (cell.hasRiverBeginOrEnd) {
                    this.triangulateWithRiverBeginOrEnd(direction, cell, center, e);
                } else {
                    this.triangulateWithRiver(direction, cell, center, e);
                }
            } else {
                this.triangulateAdjacentToRiver(direction, cell, center, e);
            }
        } else {
            this.triangulateEdgeFan(center, e, cell.color.clone());
        }

        if (direction <= HexDirection.SE) {
            const neighbor = cell.getNeighbor(direction);
            if (neighbor == null) {
                return;
            }
            this.triangulateConnection(direction, cell, e);
        }
    }

    private triangulateEdgeFan(center: THREE.Vector3, edge: EdgeVertices, color: Color) {
        this.addTriangle(center, edge.v1, edge.v2);
        this.addTriangleColorSingle(color);
        this.addTriangle(center, edge.v2, edge.v3);
        this.addTriangleColorSingle(color);
        this.addTriangle(center, edge.v3, edge.v4);
        this.addTriangleColorSingle(color);
        this.addTriangle(center, edge.v4, edge.v5);
        this.addTriangleColorSingle(color);
    }

    triangulateEdgeStrip(
        e1: EdgeVertices, c1: THREE.Color,
        e2: EdgeVertices, c2: THREE.Color
    ) {
        this.addQuad(e1.v1, e1.v2, e2.v1, e2.v2);
        this.addQuadColor2v(c1, c2);
        this.addQuad(e1.v2, e1.v3, e2.v2, e2.v3);
        this.addQuadColor2v(c1, c2);
        this.addQuad(e1.v3, e1.v4, e2.v3, e2.v4);
        this.addQuadColor2v(c1, c2);
        this.addQuad(e1.v4, e1.v5, e2.v4, e2.v5);
        this.addQuadColor2v(c1, c2);
    }

    private triangulateConnection(direction: HexDirection, cell: HexCell, e1: EdgeVertices) {
        const neighbor = cell.getNeighbor(direction) ?? cell;

        const bridge = HexMetrics.getBridge(direction);
        bridge.y = neighbor.position.y - cell.position.y;
        const e2 = new EdgeVertices(
            e1.v1.clone().add(bridge),
            e1.v5.clone().add(bridge)
        );

        if (cell.hasRiverThroughEdge(direction)) {
            e2.v3.y = neighbor.streamBedY;
        }

        if (cell.getEdgeType(direction) == HexEdgeType.Slope) {
            this.triangulateEdgeTerraces(e1, cell, e2, neighbor);
        } else {
            this.triangulateEdgeStrip(e1, cell.color, e2, neighbor.color);
        }

        const nextDirection = HexDirectionUtils.next(direction);
        const nextNeighbor = cell.getNeighbor(nextDirection);
        if (direction <= HexDirection.E && nextNeighbor != null) {
            const v5 = e1.v5.clone().add(HexMetrics.getBridge(nextDirection));
            v5.y = nextNeighbor.cellPosition.y;

            if (cell.elevation <= neighbor.elevation) {
                if (cell.elevation <= nextNeighbor.elevation) {
                    this.triangulateCorner(e1.v5, cell, e2.v5, neighbor, v5, nextNeighbor);
                } else {
                    this.triangulateCorner(v5, nextNeighbor, e1.v5, cell, e2.v5, neighbor);
                }
            } else if (neighbor.elevation <= nextNeighbor.elevation) {
                this.triangulateCorner(e2.v5, neighbor, v5, nextNeighbor, e1.v5, cell);
            } else {
                this.triangulateCorner(v5, nextNeighbor, e1.v5, cell, e2.v5, neighbor);
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
                this.triangulateCornerTerraces(bottom, bottomCell, left, leftCell, right, rightCell);
            } else if (rightEdgeType == HexEdgeType.Flat) {
                this.triangulateCornerTerraces(left, leftCell, right, rightCell, bottom, bottomCell);
            } else {
                this.triangulateCornerTerracesCliff(bottom, bottomCell, left, leftCell, right, rightCell);
            }
        } else if (rightEdgeType == HexEdgeType.Slope) {
            if (leftEdgeType == HexEdgeType.Flat) {
                this.triangulateCornerTerraces(right, rightCell, bottom, bottomCell, left, leftCell);
            } else {
                this.triangulateCornerCliffTerraces(bottom, bottomCell, left, leftCell, right, rightCell);
            }
        } else if (leftCell.getEdgeTypeWithOtherCell(rightCell) == HexEdgeType.Slope) {
            if (leftCell.elevation < rightCell.elevation) {
                this.triangulateCornerCliffTerraces(right, rightCell, bottom, bottomCell, left, leftCell);
            } else {
                this.triangulateCornerTerracesCliff(left, leftCell, right, rightCell, bottom, bottomCell);
            }
        } else {
            this.addTriangle(bottom, left, right);
            this.addTriangleColor(bottomCell.color, leftCell.color, rightCell.color);
        }
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
            const v1 = v3;
            const v2 = v4;
            const c1 = c3;
            const c2 = c4;
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

    triangulateCornerTerracesCliff(
        begin: THREE.Vector3, beginCell: HexCell,
        left: THREE.Vector3, leftCell: HexCell,
        right: THREE.Vector3, rightCell: HexCell
    ) {
        let b = 1 / (rightCell.elevation - beginCell.elevation);
        if (b < 0) {
            b = -b;
        }

        const boundary = new THREE.Vector3().copy(HexMetrics.perturb(begin))
            .lerp(HexMetrics.perturb(right), b);
        const boundaryColor = new Color().copy(beginCell.color).lerp(rightCell.color, b);

        this.triangulateBoundaryTriangle(begin, beginCell, left, leftCell, boundary, boundaryColor);

        if (leftCell.getEdgeTypeWithOtherCell(rightCell) == HexEdgeType.Slope) {
            this.triangulateBoundaryTriangle(left, leftCell, right, rightCell, boundary, boundaryColor);
        } else {
            this.addTriangleUnperturbed(HexMetrics.perturb(left), HexMetrics.perturb(right), boundary);
            this.addTriangleColor(leftCell.color, rightCell.color, boundaryColor);
        }
    }

    triangulateCornerCliffTerraces(
        begin: THREE.Vector3, beginCell: HexCell,
        left: THREE.Vector3, leftCell: HexCell,
        right: THREE.Vector3, rightCell: HexCell
    ) {
        let b = 1 / (leftCell.elevation - beginCell.elevation);
        if (b < 0) {
            b = -b;
        }
        const boundary = new THREE.Vector3().copy(HexMetrics.perturb(begin))
            .lerp(HexMetrics.perturb(left), b);
        const boundaryColor = new Color().copy(beginCell.color).lerp(leftCell.color, b);

        this.triangulateBoundaryTriangle(right, rightCell, begin, beginCell, boundary, boundaryColor);

        if (leftCell.getEdgeTypeWithOtherCell(rightCell) == HexEdgeType.Slope) {
            this.triangulateBoundaryTriangle(left, leftCell, right, rightCell, boundary, boundaryColor);
        } else {
            this.addTriangleUnperturbed(HexMetrics.perturb(left), HexMetrics.perturb(right), boundary);
            this.addTriangleColor(leftCell.color, rightCell.color, boundaryColor);
        }
    }

    private triangulateBoundaryTriangle(begin: THREE.Vector3, beginCell: HexCell,
                                        left: THREE.Vector3, leftCell: HexCell,
                                        boundary: THREE.Vector3, boundaryColor: Color) {
        let v2 = HexMetrics.perturb(HexMetrics.terraceLerp(begin, left, 1));
        let c2 = HexMetrics.terraceLerpColor(beginCell.color, leftCell.color, 1);

        this.addTriangleUnperturbed(HexMetrics.perturb(begin), v2, boundary);
        this.addTriangleColor(beginCell.color, c2, boundaryColor);

        for (let i = 2; i < HexMetrics.terraceSteps; i++) {
            const v1 = v2;
            const c1 = c2;
            v2 = HexMetrics.perturb(HexMetrics.terraceLerp(begin, left, i));
            c2 = HexMetrics.terraceLerpColor(beginCell.color, leftCell.color, i);
            this.addTriangleUnperturbed(v1, v2, boundary);
            this.addTriangleColor(c1, c2, boundaryColor);
        }

        this.addTriangleUnperturbed(v2, HexMetrics.perturb(left), boundary);
        this.addTriangleColor(c2, leftCell.color, boundaryColor);
    }

    triangulateEdgeTerraces(begin: EdgeVertices, beginCell: HexCell,
                            end: EdgeVertices, endCell: HexCell) {
        let e2 = EdgeVertices.terraceLerp(begin, end, 1);
        let c2 = HexMetrics.terraceLerpColor(beginCell.color, endCell.color, 1);

        this.triangulateEdgeStrip(begin, beginCell.color, e2, c2);

        for (let i = 2; i < HexMetrics.terraceSteps; i++) {
            const e1 = e2.clone();
            const c1 = c2;
            e2 = EdgeVertices.terraceLerp(begin, end, i);
            c2 = HexMetrics.terraceLerpColor(beginCell.color.clone(), endCell.color.clone(), i);
            this.triangulateEdgeStrip(e1, c1, e2, c2);
        }

        this.triangulateEdgeStrip(e2, c2, end, endCell.color);
    }

    private addTriangleColor(c1: THREE.Color, c2: THREE.Color, c3: THREE.Color) {
        this.addColor(c1);
        this.addColor(c2);
        this.addColor(c3);
    }

    private addTriangleColorSingle(color: THREE.Color) {
        this.addTriangleColor(color, color, color);
    }

    addTriangle(v1: THREE.Vector3, v2: THREE.Vector3, v3: THREE.Vector3) {
        const vertexIndex = HexMesh.meshVertices.length / 3;
        this.addVertices(HexMetrics.perturb(v1), HexMetrics.perturb(v2), HexMetrics.perturb(v3));
        HexMesh.meshTriangles.push(vertexIndex);
        HexMesh.meshTriangles.push(vertexIndex + 1);
        HexMesh.meshTriangles.push(vertexIndex + 2);
    }

    addTriangleUnperturbed(v1: THREE.Vector3, v2: THREE.Vector3, v3: THREE.Vector3) {
        const vertexIndex = HexMesh.meshVertices.length / 3;
        this.addVertices(v1, v2, v3);
        HexMesh.meshTriangles.push(vertexIndex);
        HexMesh.meshTriangles.push(vertexIndex + 1);
        HexMesh.meshTriangles.push(vertexIndex + 2);
    }

    addQuad(v1: THREE.Vector3, v2: THREE.Vector3, v3: THREE.Vector3, v4: THREE.Vector3) {
        const vertexIndex = HexMesh.meshVertices.length / 3;
        this.addVertices(HexMetrics.perturb(v1), HexMetrics.perturb(v2), HexMetrics.perturb(v3), HexMetrics.perturb(v4));
        HexMesh.meshTriangles.push(vertexIndex);
        HexMesh.meshTriangles.push(vertexIndex + 2);
        HexMesh.meshTriangles.push(vertexIndex + 1);
        HexMesh.meshTriangles.push(vertexIndex + 1);
        HexMesh.meshTriangles.push(vertexIndex + 2);
        HexMesh.meshTriangles.push(vertexIndex + 3);
    }

    addQuadColor4v(c1: THREE.Color, c2: THREE.Color, c3: THREE.Color, c4: THREE.Color) {
        this.addColor(c1);
        this.addColor(c2);
        this.addColor(c3);
        this.addColor(c4);
    }

    addQuadColor1v(c: THREE.Color) {
        this.addQuadColor2v(c, c);
    }

    addQuadColor2v(c1: THREE.Color, c2: THREE.Color) {
        this.addQuadColor4v(c1, c1, c2, c2);
    }

    private addColor(color1: THREE.Color) {
        HexMesh.meshColors.push(color1.r, color1.g, color1.b);
    }

    addVertex(v: THREE.Vector3) {
        HexMesh.meshVertices.push(v.x, v.y, v.z);
    }

    addVertices(...vertices: Array<THREE.Vector3>) {
        vertices.forEach(v => this.addVertex(v));
    }

    private triangulateWithRiver(direction: HexDirection, cell: HexCell, center: THREE.Vector3, e: EdgeVertices) {
        let centerL: THREE.Vector3;
        let centerR: THREE.Vector3;
        if (cell.hasRiverThroughEdge(HexDirectionUtils.opposite(direction))) {
            const offsetL = HexMetrics.getFirstSolidCorner(HexDirectionUtils.previous(direction)).multiplyScalar(0.25);
            centerL = center.clone().add(offsetL);
            const offsetR = HexMetrics.getSecondSolidCorner(HexDirectionUtils.next(direction)).multiplyScalar(0.25);
            centerR = center.clone().add(offsetR);
        } else if (cell.hasRiverThroughEdge(HexDirectionUtils.next(direction))) {
            centerL = center;
            centerR = Vec3.lerp(center, e.v5, 2 / 3);
        } else if (cell.hasRiverThroughEdge(HexDirectionUtils.previous(direction))) {
            centerL = Vec3.lerp(center, e.v1, 2 / 3);
            centerR = center;
        } else if (cell.hasRiverThroughEdge(HexDirectionUtils.next2(direction))) {
            centerL = center;
            const offsetR = HexMetrics.getSolidEdgeMiddle(HexDirectionUtils.next(direction)).multiplyScalar(0.5 * HexMetrics.innerToOuter);
            centerR = center.clone().add(offsetR);
        } else {
            const offsetL = HexMetrics.getSolidEdgeMiddle(HexDirectionUtils.previous(direction)).multiplyScalar(0.5 * HexMetrics.innerToOuter);
            centerL = center.clone().add(offsetL);
            centerR = center;
        }
        center = Vec3.lerp(centerL, centerR, 0.5);
        const m = new EdgeVertices(
            Vec3.lerp(centerL, e.v1, 0.5),
            Vec3.lerp(centerR, e.v5, 0.5),
            1 / 6
        );
        m.v3.y = center.y = e.v3.y;

        this.triangulateEdgeStrip(m, cell.color, e, cell.color);

        this.addTriangle(centerL, m.v1, m.v2);
        this.addTriangleColorSingle(cell.color);

        this.addQuad(centerL, center, m.v2, m.v3);
        this.addQuadColor1v(cell.color);
        this.addQuad(center, centerR, m.v3, m.v4);
        this.addQuadColor1v(cell.color);

        this.addTriangle(centerR, m.v4, m.v5);
        this.addTriangleColorSingle(cell.color);
    }

    // @ts-ignore
    private triangulateWithRiverBeginOrEnd(direction: HexDirection, cell: HexCell, center: THREE.Vector3, e: EdgeVertices) {
        const m = new EdgeVertices(
            Vec3.lerp(center, e.v1, 0.5),
            Vec3.lerp(center, e.v5, 0.5),
        );

        m.v3.y = e.v3.y;

        this.triangulateEdgeStrip(m, cell.color, e, cell.color);
        this.triangulateEdgeFan(center, m, cell.color);
    }

    private triangulateAdjacentToRiver(direction: HexDirection, cell: HexCell, center: THREE.Vector3, e: EdgeVertices) {
        if (cell.hasRiverThroughEdge(HexDirectionUtils.next(direction))) {
            if (cell.hasRiverThroughEdge(HexDirectionUtils.previous(direction))) {
                const centerOffset = HexMetrics.getSolidEdgeMiddle(direction).multiplyScalar(HexMetrics.innerToOuter * 0.5);
                center = center.clone().add(centerOffset);
            } else if (cell.hasRiverThroughEdge(HexDirectionUtils.previous2(direction))) {
                const centerOffset = HexMetrics.getFirstSolidCorner(direction).multiplyScalar(0.25);
                center = center.clone().add(centerOffset);
            }
        } else if (cell.hasRiverThroughEdge(HexDirectionUtils.previous(direction)) && cell.hasRiverThroughEdge(HexDirectionUtils.next2(direction))) {
            const centerOffset = HexMetrics.getSecondSolidCorner(direction).multiplyScalar(0.25);
            center = center.clone().add(centerOffset);
        }
        const m = new EdgeVertices(
            Vec3.lerp(center, e.v1, 0.5),
            Vec3.lerp(center, e.v5, 0.5)
        );

        this.triangulateEdgeStrip(m, cell.color, e, cell.color);
        this.triangulateEdgeFan(center, m, cell.color);
    }
}