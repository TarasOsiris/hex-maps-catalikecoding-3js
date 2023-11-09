import * as THREE from "three";
import {HexMetrics} from "./HexMetrics";
import {BufferGeometryUtils} from "../lib/BufferGeometryUtils";
import {ListPool} from "./util/ListPool";
import {ColliderLayers} from "./ColliderLayers";
import {HexMaterials} from "./util/HexMaterials";

export class HexMesh extends THREE.Mesh {

    meshVertices!: Array<number>;
    meshTriangles!: Array<number>;
    meshColors!: Array<number>;
    meshUVs!: Array<number>;
    meshUV2s!: Array<number>;

    static verticesPool = new ListPool<number>();
    static trianglesPool = new ListPool<number>();
    static colorsPool = new ListPool<number>();
    static uvsPool = new ListPool<number>();

    readonly wireframeCopy: THREE.Mesh;
    private readonly _useColors: boolean;
    private readonly _useUVCoordinates: boolean;
    private readonly _useUV2Coordinates: boolean;

    constructor(material: THREE.Material,
                useCollider: boolean,
                useColors: boolean,
                useUVCoordinates: boolean,
                useUV2Coordinates: boolean = false,
    ) {
        const geometry = new THREE.BufferGeometry();
        material.side = THREE.BackSide;
        super(geometry, material);
        this._useColors = useColors;
        this._useUVCoordinates = useUVCoordinates;
        this._useUV2Coordinates = useUV2Coordinates;

        this.name = "Hex mesh";
        if (useCollider) {
            this.layers.enable(ColliderLayers.Collidable);
        }

        this.wireframeCopy = new THREE.Mesh(geometry, HexMaterials.wireframeMaterial);
        this.add(this.wireframeCopy);
        this.wireframeCopy.name = "Wireframe mesh copy";
    }

    clearAll() {
        this.meshVertices = HexMesh.verticesPool.get();
        this.meshTriangles = HexMesh.trianglesPool.get();
        if (this._useColors) {
            this.meshColors = HexMesh.colorsPool.get();
        }
        if (this._useUVCoordinates) {
            this.meshUVs = HexMesh.uvsPool.get();
        }
        if (this._useUV2Coordinates) {
            this.meshUV2s = HexMesh.uvsPool.get();
        }
    }

    apply() {
        const meshGeometry = new THREE.BufferGeometry();

        meshGeometry.setIndex(this.meshTriangles);
        HexMesh.trianglesPool.add(this.meshTriangles);

        BufferGeometryUtils.setPosition(meshGeometry, this.meshVertices);
        HexMesh.verticesPool.add(this.meshVertices);

        if (this._useColors) {
            BufferGeometryUtils.setColor(meshGeometry, this.meshColors);
            HexMesh.colorsPool.add(this.meshColors);
        }
        if (this._useUVCoordinates) {
            BufferGeometryUtils.setUVs(meshGeometry, this.meshUVs);
            HexMesh.uvsPool.add(this.meshUVs);
        }
        if (this._useUV2Coordinates) {
            BufferGeometryUtils.setUVs(meshGeometry, this.meshUV2s, 'Second');
            HexMesh.uvsPool.add(this.meshUV2s);
        }

        meshGeometry.computeVertexNormals();
        this.geometry = meshGeometry;
        this.wireframeCopy.geometry = meshGeometry;
    }

    addTriangleColor(c1: THREE.Color, c2: THREE.Color, c3: THREE.Color) {
        this.addColor(c1);
        this.addColor(c2);
        this.addColor(c3);
    }

    addTriangleColorSingle(color: THREE.Color) {
        this.addTriangleColor(color, color, color);
    }

    addTriangle(v1: THREE.Vector3, v2: THREE.Vector3, v3: THREE.Vector3) {
        const vertexIndex = this.meshVertices.length / 3;
        this.addVertices(HexMetrics.perturb(v1), HexMetrics.perturb(v2), HexMetrics.perturb(v3));
        this.meshTriangles.push(vertexIndex);
        this.meshTriangles.push(vertexIndex + 1);
        this.meshTriangles.push(vertexIndex + 2);
    }

    addTriangleUnperturbed(v1: THREE.Vector3, v2: THREE.Vector3, v3: THREE.Vector3) {
        const vertexIndex = this.meshVertices.length / 3;
        this.addVertices(v1, v2, v3);
        this.meshTriangles.push(vertexIndex);
        this.meshTriangles.push(vertexIndex + 1);
        this.meshTriangles.push(vertexIndex + 2);
    }

    addQuad(v1: THREE.Vector3, v2: THREE.Vector3, v3: THREE.Vector3, v4: THREE.Vector3) {
        const vertexIndex = this.meshVertices.length / 3;
        this.addVertices(HexMetrics.perturb(v1), HexMetrics.perturb(v2), HexMetrics.perturb(v3), HexMetrics.perturb(v4));
        this.meshTriangles.push(vertexIndex);
        this.meshTriangles.push(vertexIndex + 2);
        this.meshTriangles.push(vertexIndex + 1);
        this.meshTriangles.push(vertexIndex + 1);
        this.meshTriangles.push(vertexIndex + 2);
        this.meshTriangles.push(vertexIndex + 3);
    }

    addQuadUnperturbed(v1: THREE.Vector3, v2: THREE.Vector3, v3: THREE.Vector3, v4: THREE.Vector3) {
        const vertexIndex = this.meshVertices.length / 3;
        this.addVertices(v1, v2, v3, v4);
        this.meshTriangles.push(vertexIndex);
        this.meshTriangles.push(vertexIndex + 2);
        this.meshTriangles.push(vertexIndex + 1);
        this.meshTriangles.push(vertexIndex + 1);
        this.meshTriangles.push(vertexIndex + 2);
        this.meshTriangles.push(vertexIndex + 3);
    }

    addQuadColor4v(c1: THREE.Color, c2: THREE.Color, c3: THREE.Color, c4: THREE.Color) {
        this.addColor(c1);
        this.addColor(c2);
        this.addColor(c3);
        this.addColor(c4);
    }

    addQuadColor1v(c: THREE.Color) {
        this.addQuadColor2v(c, c);
    }

    addQuadColor2v(c1: THREE.Color, c2: THREE.Color) {
        this.addQuadColor4v(c1, c1, c2, c2);
    }

    addColor(color1: THREE.Color) {
        this.meshColors.push(color1.r, color1.g, color1.b);
    }

    addVertex(v: THREE.Vector3) {
        this.meshVertices.push(v.x, v.y, v.z);
    }

    addVertices(...vertices: Array<THREE.Vector3>) {
        vertices.forEach(v => this.addVertex(v));
    }

    addTriangleUV(uv1: THREE.Vector2, uv2: THREE.Vector2, uv3: THREE.Vector2) {
        this.meshUVs.push(uv1.x, uv1.y);
        this.meshUVs.push(uv2.x, uv2.y);
        this.meshUVs.push(uv3.x, uv3.y);
    }

    addQuadUV(uv1: THREE.Vector2, uv2: THREE.Vector2, uv3: THREE.Vector2, uv4: THREE.Vector2) {
        this.meshUVs.push(uv1.x, uv1.y);
        this.meshUVs.push(uv2.x, uv2.y);
        this.meshUVs.push(uv3.x, uv3.y);
        this.meshUVs.push(uv4.x, uv4.y);
    }

    addQuadUVNumbers(uMin: number, uMax: number, vMin: number, vMax: number) {
        this.meshUVs.push(uMin, vMin);
        this.meshUVs.push(uMax, vMin);
        this.meshUVs.push(uMin, vMax);
        this.meshUVs.push(uMax, vMax);
    }

    addTriangleUV2(uv1: THREE.Vector2, uv2: THREE.Vector2, uv3: THREE.Vector2) {
        this.meshUV2s.push(uv1.x, uv1.y);
        this.meshUV2s.push(uv2.x, uv2.y);
        this.meshUV2s.push(uv3.x, uv3.y);
    }

    addQuadUV2(uv1: THREE.Vector2, uv2: THREE.Vector2, uv3: THREE.Vector2, uv4: THREE.Vector2) {
        this.meshUV2s.push(uv1.x, uv1.y);
        this.meshUV2s.push(uv2.x, uv2.y);
        this.meshUV2s.push(uv3.x, uv3.y);
        this.meshUV2s.push(uv4.x, uv4.y);
    }

    addQuadUVNumbers2(uMin: number, uMax: number, vMin: number, vMax: number) {
        this.meshUV2s.push(uMin, vMin);
        this.meshUV2s.push(uMax, vMin);
        this.meshUV2s.push(uMin, vMax);
        this.meshUV2s.push(uMax, vMax);
    }
}
