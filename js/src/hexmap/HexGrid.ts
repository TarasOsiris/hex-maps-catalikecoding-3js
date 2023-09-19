import {HexCell} from "./HexCell";
import * as THREE from "three";
import {HexMetrics} from "./HexMetrics";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";
import {Font} from "three/examples/jsm/loaders/FontLoader";
import {HexCoordinates} from "./HexCoordinates";
import {HexMapScene} from "./scenes/HexMapScene";
import {HexDirection} from "./HexDirection";
import {HexGridChunk} from "./HexGridChunk";
import GUI from "lil-gui";

export class HexGrid {
    chunkCountX = 3;
    chunkCountZ = 4;
    cellCountX = this.chunkCountX * HexMetrics.chunkSizeX;
    cellCountZ = this.chunkCountZ * HexMetrics.chunkSizeZ;

    private readonly chunksGroup = new THREE.Group();

    private cells: Array<HexCell> = [];
    private chunks: Array<HexGridChunk> = [];

    private fontMat = new THREE.MeshBasicMaterial({color: 0x000000, wireframe: false});
    private meshMat = new THREE.MeshStandardMaterial({wireframe: false, vertexColors: true}); // TODO extract-optimize
    private readonly font!: Font;

    private defaultColor: THREE.Color = new THREE.Color(1, 1, 1);

    constructor(scene: HexMapScene, font: Font, gui: GUI) {
        this.font = font;

        this.createChunks();
        this.createCells();
        this.refreshDirty();

        scene.add(this.chunksGroup);

        gui.add(this.meshMat, 'wireframe');
    }

    refreshDirty() {
        this.chunks.forEach(ch => {
            if (ch.dirty) {
                ch.refresh();
            }
        });
    }

    createCells() {
        this.cells = new Array<HexCell>(this.cellCountX * this.cellCountZ);
        for (let z = 0, i = 0; z < this.cellCountZ; z++) {
            for (let x = 0; x < this.cellCountX; x++) {
                this.createCell(x, z, i++);
            }
        }
    }

    createChunks() {
        this.chunks = new Array<HexGridChunk>(this.chunkCountX * this.chunkCountZ);

        for (let z = 0, i = 0; z < this.chunkCountZ; z++) {
            for (let x = 0; x < this.chunkCountX; x++) {
                const chunk = this.chunks[i++] = new HexGridChunk(this.meshMat);
                this.chunksGroup.add(chunk);
            }
        }
    }

    getCell(position: THREE.Vector3) {
        const coordinates = HexCoordinates.fromPosition(position);
        const index = coordinates.x + coordinates.z * this.cellCountX + Math.floor(coordinates.z / 2);
        return this.cells[index];
    }

    private createCell(x: number, z: number, i: number) {
        const invertedZ = -z;
        const position = new THREE.Vector3();
        position.x = (x + z * 0.5 - Math.floor(z / 2)) * (HexMetrics.innerRadius * 2);
        position.y = 0;
        position.z = invertedZ * (HexMetrics.outerRadius * 1.5);

        const cell = this.cells[i] = new HexCell(HexCoordinates.fromOffsetCoordinates(x, z));
        this.setNeighbors(cell, x, z, i);
        cell.position.set(position.x, position.y, position.z);
        cell.color = this.defaultColor;
        cell.textMesh = this.createDebugText(cell, position);
        cell.elevation = 0;

        this.addCellToChunk(x, z, cell);
    }

    addCellToChunk(x: number, z: number, cell: HexCell) {
        const chunkX = Math.floor(x / HexMetrics.chunkSizeX);
        const chunkZ = Math.floor(z / HexMetrics.chunkSizeZ);
        const chunkIndex = chunkX + chunkZ * this.chunkCountX;
        const chunk = this.chunks[chunkIndex]!;

        const localX = x - chunkX * HexMetrics.chunkSizeX;
        const localZ = z - chunkZ * HexMetrics.chunkSizeZ;
        const localIndex = localX + localZ * HexMetrics.chunkSizeX;
        chunk.addCell(localIndex, cell);
    }

    private setNeighbors(cell: HexCell, x: number, z: number, i: number) {
        if (x > 0) {
            cell.setNeighbor(HexDirection.W, this.cells[i - 1]!);
        }
        if (z > 0) {
            if ((z & 1) == 0) {
                cell.setNeighbor(HexDirection.SE, this.cells[i - this.cellCountX]!);
                if (x > 0) {
                    cell.setNeighbor(HexDirection.SW, this.cells[i - this.cellCountX - 1]!);
                }
            } else {
                cell.setNeighbor(HexDirection.SW, this.cells[i - this.cellCountX]!);
                if (x < this.cellCountX - 1) {
                    cell.setNeighbor(HexDirection.SE, this.cells[i - this.cellCountX + 1]!);
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
        }).center().rotateX(-Math.PI / 2);
        const textMesh = new THREE.Mesh(textGeometry, this.fontMat);
        textMesh.position.set(position.x, position.y + 0.05, position.z);
        return textMesh;
    }

    getCellByCoords(coordinates: HexCoordinates) {
        const z = coordinates.z;
        if (z < 0 || z >= this.cellCountZ) {
            return null;
        }
        const x = Math.floor(coordinates.x + z / 2);
        if (x < 0 || x >= this.cellCountX) {
            return null;
        }
        const index = x + z * this.cellCountX;
        return this.cells[index];
    }

    showLabels(show: boolean) {
        this.cells.forEach(cell => cell.textMesh.visible = show);
    }
}