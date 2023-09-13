import * as THREE from "three";
import {HexCell} from "./HexCell";
import {HexMesh} from "./HexMesh";
import {HexMetrics} from "./HexMetrics";

export class HexGridChunk extends THREE.Object3D {
    readonly cells: Array<HexCell> = [];

    hexMesh = new HexMesh()
    dirty = true

    constructor() {
        super();
        this.add(this.hexMesh)
        this.cells = new Array<HexCell>(HexMetrics.chunkSizeX * HexMetrics.chunkSizeZ)
    }

    refresh() {
        this.hexMesh.triangulate(this.cells)
        this.dirty = false
    }

    markDirty() {
        this.dirty = true
    }

    addCell(index: number, cell: HexCell) {
        this.cells[index] = cell
        cell.chunk = this
        this.add(cell, cell.textMesh)
    }
}