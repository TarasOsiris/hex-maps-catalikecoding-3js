import * as THREE from "three";
import riverVertex from "../shaders/riverVertex.glsl";
import riverFragment from "../shaders/riverFragment.glsl";
import roadVertex from "../shaders/roadVertex.glsl";
import roadFragment from "../shaders/roadFragment.glsl";
import {IUniform} from "three/src/renderers/shaders/UniformsLib";

export class HexMaterials {
    static noiseTexture: THREE.Texture;

    static readonly terrainMaterial = new THREE.MeshStandardMaterial({
        vertexColors: true,
        polygonOffset: true,
        polygonOffsetFactor: 2,
        polygonOffsetUnits: 2
    });

    static riverUniforms: { [uniform: string]: IUniform };
    static riverShaderMaterial: THREE.Material;
    static roadShaderMaterial: THREE.Material = new THREE.ShaderMaterial({
        vertexShader: roadVertex,
        fragmentShader: roadFragment,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
    });

    static createRiverUniforms(noiseTexture: THREE.Texture) {
        return {
            time: {value: 1.0},
            noiseTexture: {value: noiseTexture}
        };
    }

    static createRiverMaterial(noiseTexture: THREE.Texture) {
        this.riverUniforms = this.createRiverUniforms(noiseTexture);
        this.riverShaderMaterial = new THREE.ShaderMaterial({
            vertexShader: riverVertex,
            fragmentShader: riverFragment,
            uniforms: HexMaterials.riverUniforms,
            transparent: true,
        });
    }

    static updateTime(elapsedTime: number) {
        if (this.riverUniforms) {
            this.riverUniforms.time.value = elapsedTime;
        }
    }

    static readonly wireframeMaterial = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0x000000,
    });
    static readonly debugMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
    });
    static readonly fontMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
}
