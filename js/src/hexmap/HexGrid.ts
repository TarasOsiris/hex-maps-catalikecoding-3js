import {HexCell} from "./HexCell";
import * as THREE from "three";
import {HexMetrics} from "./HexMetrics";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";
import {Font} from "three/examples/jsm/loaders/FontLoader";
import {HexMesh} from "./HexMesh";
import GUI from "lil-gui";
import {HexCoordinates} from "./HexCoordinates";
import {HexMapScene} from "./scenes/HexMapScene";
import {HexDirection} from "./HexDirection";

export class HexGrid {
    width: number = 6;
    height: number = 6;

    private readonly cellsGroup: THREE.Group = new THREE.Group()

    private cells: Array<HexCell> = [];
    hexMesh: HexMesh

    private fontMat = new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true});
    private readonly font!: Font;

    private defaultColor: THREE.Color = new THREE.Color(1, 1, 1)

    constructor(scene: HexMapScene, font: Font, gui: GUI) {
        this.font = font
        this.hexMesh = new HexMesh()
        this.initCells(scene)
        scene.add(this.cellsGroup)
        gui.addFolder("HexMesh").add(this.hexMesh.material, 'wireframe')
    }

    initCells(scene: HexMapScene) {
        this.cells = new Array<HexCell>(this.width * this.height)
        for (let z = 0, i = 0; z < this.height; z++) {
            for (let x = 0; x < this.width; x++) {
                this.createCell(x, z, i++);
            }
        }

        this.hexMesh.triangulate(this.cells)
        scene.add(this.hexMesh)
    }

    getCell(position: THREE.Vector3) {
        position = this.cellsGroup.worldToLocal(position)
        const coordinates = HexCoordinates.fromPosition(position)
        const index = coordinates.x + coordinates.z * this.width + Math.floor(coordinates.z / 2);
        return this.cells[index]
    }

    refresh() {
        this.hexMesh.triangulate(this.cells)
    }

    private createCell(x: number, z: number, i: number) {
        const invertedZ = -z;
        const position = new THREE.Vector3()
        position.x = (x + z * 0.5 - Math.floor(z / 2)) * (HexMetrics.innerRadius * 2);
        position.y = 0;
        position.z = invertedZ * (HexMetrics.outerRadius * 1.5)

        const cell = this.cells[i] = new HexCell(HexCoordinates.fromOffsetCoordinates(x, z))
        this.cellsGroup.add(cell)
        cell.position.set(position.x, position.y, position.z)
        cell.color = this.defaultColor

        cell.textMesh = this.createDebugText(cell, position)
        cell.textMesh.visible = false

        this.setNeighbors(cell, x, z, i);
    }

    private setNeighbors(cell: HexCell, x: number, z: number, i: number) {
        if (x > 0) {
            cell.setNeighbor(HexDirection.W, this.cells[i - 1])
        }
        if (z > 0) {
            if ((z & 1) == 0) {
                cell.setNeighbor(HexDirection.SE, this.cells[i - this.width])
                if (x > 0) {
                    cell.setNeighbor(HexDirection.SW, this.cells[i - this.width - 1])
                }
            } else {
                cell.setNeighbor(HexDirection.SW, this.cells[i - this.width])
                if (x < this.width - 1) {
                    cell.setNeighbor(HexDirection.SE, this.cells[i - this.width + 1]);
                }
            }
        }
    }

    private createDebugText(cell: HexCell, position: THREE.Vector3) {
        // TODO optimize?
        const textGeometry = new TextGeometry(cell.coordinates.toStringOnSeparateLines(), {
            font: this.font,
            size: 2,
            height: 0.2,
        });
        textGeometry.center()
        const textMesh = new THREE.Mesh(textGeometry, this.fontMat);
        textMesh.position.set(position.x, position.y + 0.05, position.z)
        textMesh.rotateX(-Math.PI / 2)
        this.cellsGroup.add(textMesh);
        return textMesh
    }
}