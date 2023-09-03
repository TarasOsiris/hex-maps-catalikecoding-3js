import {HexCell} from "./HexCell";
import * as THREE from "three";
import {HexMetrics} from "./HexMetrics";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";
import {Font, FontLoader} from "three/examples/jsm/loaders/FontLoader";
import {HexMesh} from "./HexMesh";
import {Scene} from "three";
import GUI from "lil-gui";

export class HexGrid {
    width: number = 6;
    height: number = 6;

    private readonly cellsGroup: THREE.Group = new THREE.Group()

    private cells: Array<HexCell> = [];
    private hexMesh: HexMesh

    // text
    private fontLoader: FontLoader = new FontLoader()
    private fontMat = new THREE.MeshBasicMaterial({color: 0x000000});
    private font!: Font;

    constructor(scene: THREE.Scene, gui: GUI) {
        this.hexMesh = new HexMesh(gui)
        this.initCells(scene)
        scene.add(this.cellsGroup)
    }

    initCells(scene: THREE.Scene) {
        this.fontLoader.load('/fonts/roboto.json', (font) => {
            this.font = font
            this.cells = new Array(this.width * this.height)
            for (let z = 0, i = 0; z < this.height; z++) {
                for (let x = 0; x < this.width; x++) {
                    this.createCell(x, z, i++);
                }
            }

            this.hexMesh.triangulate(this.cells)
            scene.add(this.hexMesh)
        })
    }

    private createCell(x: number, z: number, i: number) {
        const cell = this.cells[i] = new HexCell()
        this.cellsGroup.add(cell)

        let invertedZ = -z;
        let position = new THREE.Vector3()
        position.x = (x + z * 0.5 - Math.floor(z / 2)) * (HexMetrics.innerRadius * 2);
        position.y = 0;
        position.z = invertedZ * (HexMetrics.outerRadius * 1.5)

        cell.position.set(position.x, position.y, position.z)
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