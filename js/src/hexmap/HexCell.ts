import * as THREE from "three";
import {HexCoordinates} from "./HexCoordinates";
import {HexDirection, HexDirectionUtils} from "./HexDirection";
import {HexMetrics} from "./HexMetrics";
import {HexEdgeType} from "./HexEdgeType";
import {HexGridChunk} from "./HexGridChunk";
import {Color} from "three";

export class HexCell extends THREE.Object3D {
    coordinates: HexCoordinates;
    private _elevation: number = Number.MIN_SAFE_INTEGER;
    private _color = new THREE.Color()
    neighbors: Array<HexCell> = new Array<HexCell>(6)
    textMesh!: THREE.Mesh;
    chunk!: HexGridChunk

    constructor(coordinates: HexCoordinates) {
        super();
        this.coordinates = coordinates;
    }

    set elevation(value: number) {
        if (this._elevation == value) {
            return
        }
        this._elevation = value;
        const position = this.position.clone()
        position.y = value * HexMetrics.elevationStep
        position.y += (HexMetrics.sampleNoise(position).y * 2 - 1) * HexMetrics.elevationPerturbStrength
        this.position.set(position.x, position.y, position.z)
        this.textMesh.position.set(this.textMesh.position.x, position.y, this.textMesh.position.z)
        this.refresh()
    }

    get elevation(): number {
        return this._elevation;
    }

    get color(): Color {
        return this._color;
    }

    set color(value: Color) {
        if (this.color.equals(value)) {
            return
        }
        this._color = value;
        this.refresh()
    }

    get cellPosition(): THREE.Vector3 {
        return this.position
    }

    public getNeighbor(direction: HexDirection) {
        return this.neighbors[direction as number]
    }

    public setNeighbor(direction: HexDirection, cell: HexCell) {
        this.neighbors[direction as number] = cell
        cell.neighbors[HexDirectionUtils.opposite(direction) as number] = this
    }

    getEdgeType(direction: HexDirection): HexEdgeType {
        return HexMetrics.getEdgeType(this.elevation, this.neighbors[direction as number]!.elevation)
    }

    getEdgeTypeWithOtherCell(otherCell: HexCell): HexEdgeType {
        return HexMetrics.getEdgeType(this.elevation, otherCell.elevation)
    }

    refresh() {
        if (this.chunk) {
            this.chunk.markDirty()
            for (let i = 0; i < this.neighbors.length; i++) {
                const neighbor = this.neighbors[i];
                if (neighbor != null && neighbor.chunk != this.chunk) {
                    neighbor.chunk.markDirty();
                }
            }
        }
    }
}