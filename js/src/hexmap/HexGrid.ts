import {HexCell} from "./HexCell";
import * as THREE from "three";
import {HexMetrics} from "./HexMetrics";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";
import {Font, FontLoader} from "three/examples/jsm/loaders/FontLoader";
import {HexMesh} from "./HexMesh";

export class HexGrid {
    width: number = 6;
    height: number = 6;

    private cells: Array<HexCell> = [];
    private hexMesh = new HexMesh();

    private readonly cellsGroup: THREE.Group = new THREE.Group()

    // text
    private fontLoader: FontLoader = new FontLoader()
    private fontMat = new THREE.MeshBasicMaterial({color: 0x000000});
    private font!: Font;

    constructor(scene: THREE.Scene) {
        this.initCells()
        scene.add(this.cellsGroup)

        this.hexMesh.triangulate(this.cells)
        scene.add(this.hexMesh)
    }

    initCells() {
        this.fontLoader.load('/fonts/roboto.json', (font) => {
            this.font = font
            this.cells = new Array(this.width * this.height)
            for (let z = 0, i = 0; z < this.height; z++) {
                for (let x = 0; x < this.width; x++) {
                    this.createCell(x, z, i++);
                }
            }
        })
    }

    private createCell(x: number, z: number, i: number) {
        let invertedZ = -z;
        let position = new THREE.Vector3()
        position.x = (x + z * 0.5 - Math.floor(z / 2)) * (HexMetrics.innerRadius * 2);
        position.y = 0;
        position.z = invertedZ * (HexMetrics.outerRadius * 1.5)

        const cell = this.cells[i] = new HexCell()
        cell.position.set(position.x, position.y, position.z)
        this.cellsGroup.add(cell)
        this.createDebugText(x, z, position);
    }

    private createDebugText(x: number, z: number, position: THREE.Vector3) {
        const textGeometry = new TextGeometry(`${x}\n${z}`, {font: this.font, size: 2, height: 0.02,});
        const textMesh = new THREE.Mesh(textGeometry, this.fontMat);
        textMesh.position.set(position.x, position.y, position.z)
        textMesh.rotateX(-Math.PI / 2)
        this.cellsGroup.add(textMesh);
    }
}