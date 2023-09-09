import * as THREE from "three";
import {HexCoordinates} from "./HexCoordinates";
import {HexDirection, HexDirectionUtils} from "./HexDirection";
import {HexMetrics} from "./HexMetrics";

export class HexCell extends THREE.Object3D {
    coordinates: HexCoordinates;
    private _elevation: number;
    color: THREE.Color
    neighbors: Array<HexCell> = new Array<HexCell>(6)

    constructor(coordinates: HexCoordinates) {
        super();
        this.coordinates = coordinates;
    }

    set elevation(value: number) {
        this._elevation = value;
        this.position.set(this.position.x, value * HexMetrics.elevationStep, this.position.z)
    }

    get elevation(): number {
        return this._elevation;
    }

    public getNeighbor(direction: HexDirection) {
        return this.neighbors[direction as number]
    }

    public setNeighbor(direction: HexDirection, cell: HexCell) {
        this.neighbors[direction as number] = cell
        cell.neighbors[HexDirectionUtils.opposite(direction) as number] = this
    }
}