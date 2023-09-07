import * as THREE from "three";
import {HexCoordinates} from "./HexCoordinates";
import {HexDirection, HexDirectionUtils} from "./HexDirection";

export class HexCell extends THREE.Object3D {

    coordinates: HexCoordinates;
    color: THREE.Color
    neighbors: Array<HexCell> = new Array<HexCell>(6)

    constructor(coordinates: HexCoordinates) {
        super();
        this.coordinates = coordinates;
    }

    public getNeighbor(direction: HexDirection) {
        return this.neighbors[direction as number]
    }

    public setNeighbor(direction: HexDirection, cell: HexCell) {
        this.neighbors[direction as number] = cell
        cell.neighbors[HexDirectionUtils.opposite(direction) as number] = this
    }
}