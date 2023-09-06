import * as THREE from "three";
import {HexCoordinates} from "./HexCoordinates";

export class HexCell extends THREE.Object3D {

    coordinates: HexCoordinates;
    color: THREE.Color

    constructor(coordinates: HexCoordinates) {
        super();
        this.coordinates = coordinates;
    }
}