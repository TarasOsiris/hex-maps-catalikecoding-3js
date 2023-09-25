import * as THREE from "three";
import vertexShaderCode from "../shaders/riverVertex.glsl";
import fragmentShaderCode from "../shaders/riverFragment.glsl";

export class HexMaterials {
    static readonly terrainMaterial = new THREE.MeshStandardMaterial({
        vertexColors: true,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
    });

    static readonly wireframeMaterial = new THREE.MeshBasicMaterial({wireframe: true, color: 0x000000});
    static readonly debugMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
    });
    static readonly fontMaterial = new THREE.MeshBasicMaterial({color: 0x000000});

    static readonly riverShaderMaterial = new THREE.ShaderMaterial({
        vertexShader: vertexShaderCode,
        fragmentShader: fragmentShaderCode,
    });
}
