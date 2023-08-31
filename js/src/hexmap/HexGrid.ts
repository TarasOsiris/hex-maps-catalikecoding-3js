import {HexCell} from "./HexCell";
import * as THREE from "three";
import {HexMetrics} from "./HexMetrics";

export class HexGrid {
    width: number = 6;
    height: number = 6;

    private cells: Array<HexCell> = [];

    private readonly group: THREE.Group

    constructor(scene: THREE.Scene) {
        this.group = new THREE.Group()
        this.initCells()
        scene.add(this.group)
    }

    initCells() {
        this.cells = new Array(this.width * this.height)
        for (let z = 0, i = 0; z < this.height; z++) {
            for (let x = 0; x < this.width; x++) {
                this.createCell(x, z, i++);
            }
        }
    }

    private createCell(x: number, z: number, i: number) {
        let position = new THREE.Vector3()
        position.x = x * (HexMetrics.innerRadius * 2);
        position.y = 0;
        position.z = z * (HexMetrics.outerRadius * 1.5)

        const cell = this.cells[i] = new HexCell()
        cell.position.set(position.x, position.y, position.z)
        this.group.add(cell)
        console.log(position)
    }
}