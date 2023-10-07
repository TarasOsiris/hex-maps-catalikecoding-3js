import waterVertex from "../shaders/waterVertex.glsl";
import waterFragment from "../shaders/waterFragment.glsl";
import tVertex from "../rendering/shaders/roadStandartVertex.glsl";
import tFragment from "../rendering/shaders/roadStandardFragment.glsl";
import {Color, Material, MeshBasicMaterial, MeshStandardMaterial, ShaderMaterial, Texture} from "three";
import {RoadMaterial, RoadUniforms} from "../rendering/RoadMaterial";
import {RiverMaterial, RiverUniforms} from "../rendering/RiverMaterial";

export type WaterUniforms = { waterColor: { value: Color }; noiseTexture: { value: Texture } };

export class HexMaterials {
    static readonly terrainMaterial = new MeshStandardMaterial({
        vertexColors: true,
        polygonOffset: true,
        polygonOffsetFactor: 2,
        polygonOffsetUnits: 2
    });

    private static riverUniforms: RiverUniforms;
    private static waterUniforms: WaterUniforms;
    private static roadUniforms: RoadUniforms;

    static riverMaterial: Material;
    static waterMaterial: Material;
    static roadMaterial: Material;

    static createMaterials(noiseTexture: Texture) {
        this.createRiverMaterial(noiseTexture);
        this.createWaterMaterial(noiseTexture);
        this.createRoadMaterial(noiseTexture);
    }

    static createRiverMaterial(noiseTexture: Texture) {
        this.riverUniforms = {
            time: {value: 1.0},
            noiseTexture: {value: noiseTexture}
        };
        this.riverMaterial = new RiverMaterial(this.riverUniforms);
    }

    static createWaterMaterial(noiseTexture: Texture) {
        this.waterUniforms = {
            waterColor: {value: new Color(0x4069ff)},
            noiseTexture: {value: noiseTexture}
        };
        this.waterMaterial = new ShaderMaterial({
            vertexShader: waterVertex,
            fragmentShader: waterFragment,
            uniforms: this.waterUniforms,
            transparent: true,
        });
    }

    static createRoadMaterial(noiseTexture: Texture) {
        this.roadUniforms = {
            roadColor: {value: new Color(0xff0000)},
            noiseTexture: {value: noiseTexture}
        };
        this.roadMaterial = new RoadMaterial(this.roadUniforms);
    }

    static updateTime(elapsedTime: number) {
        if (this.riverUniforms) {
            this.riverUniforms.time.value = elapsedTime;
        }
        if (this.riverMaterial) {
            // @ts-ignore
            this.riverMaterial.uniforms.time.value = elapsedTime;
        }
    }

    static readonly wireframeMaterial = new MeshBasicMaterial({
        wireframe: true,
        color: 0x000000,
    });
    static readonly debugMaterial = new MeshBasicMaterial({
        color: 0xff0000,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
    });
    static readonly fontMaterial = new MeshBasicMaterial({color: 0xff0000});

    static testMat = new ShaderMaterial({
        vertexShader: tVertex, fragmentShader: tFragment,
        defines: {'STANDARD': ''},
    });
}
