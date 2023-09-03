import * as THREE from "three";
import {HexCell} from "./HexCell";
import {BoxGeometry, BufferGeometry, Mesh} from "three";
import {HexMetrics} from "./HexMetrics";

export class HexMesh extends THREE.Mesh {

    meshGeometry: THREE.BufferGeometry = new BufferGeometry()
    meshVertices: Array<THREE.Vector3> = new Array<THREE.Vector3>()
    meshTriangles: Array<number> = new Array<number>()

    constructor() {
        const geometry = new THREE.PlaneGeometry(10, 10)
        const material = new THREE.MeshBasicMaterial({color: 0xffff00, wireframe: false})
        super(geometry, material);
    }

    triangulate(cells: Array<HexCell>, scene: THREE.Scene) {
        this.meshVertices = []
        this.meshTriangles = []
        this.meshGeometry = new BufferGeometry()
        for (let i = 0; i < cells.length; i++) {
            this.triangulateCell(cells[i])
        }

        const flatennedVertices: number[] = []
        this.meshVertices.forEach(vertex => {
            let mesh = new Mesh(new BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({color: 0xff0000}));
            mesh.position.set(vertex.x, vertex.y, vertex.z)
            scene.add(mesh)
            flatennedVertices.push(vertex.x, vertex.y, vertex.z);
        })
        this.meshGeometry.setIndex(this.meshTriangles)
        this.meshGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(flatennedVertices), 3));
        this.meshGeometry.computeVertexNormals()
        this.geometry = this.meshGeometry
        this.geometry = new BoxGeometry(1,1,1)
    }

    triangulateCell(cell: HexCell) {
        const center = new THREE.Vector3()
        center.copy(cell.position)

        // TODO
        // this.addTriangle(
        //     center,
        //     center.add(HexMetrics.corners[0]),
        //     center.add(HexMetrics.corners[1])
        // )
    }

    addTriangle(v1: THREE.Vector3, v2: THREE.Vector3, v3: THREE.Vector3) {
        const vertexIndex = this.meshVertices.length;
        this.meshVertices.push(v1);
        this.meshVertices.push(v2);
        this.meshVertices.push(v3);
        this.meshTriangles.push(vertexIndex);
        this.meshTriangles.push(vertexIndex + 1);
        this.meshTriangles.push(vertexIndex + 2);
    }
}