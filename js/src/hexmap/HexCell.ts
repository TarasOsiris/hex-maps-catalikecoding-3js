import * as THREE from "three";
import {ColorUtils} from "../lib/ColorUtils";

export class HexCell extends THREE.Mesh {

    constructor() {
        const geometry = new THREE.PlaneGeometry(10, 10)
        const material = new THREE.MeshBasicMaterial({color: ColorUtils.randomColor(), wireframe: false})
        super(geometry, material);
        this.rotateX(-Math.PI/2)
    }
}