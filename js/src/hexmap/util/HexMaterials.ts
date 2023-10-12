import tVertex from "../rendering/shaders/roadStandardVertex.glsl";
import tFragment from "../rendering/shaders/roadStandardFragment.glsl";
import {Color, MeshBasicMaterial, MeshStandardMaterial, ShaderMaterial, Texture} from "three";
import {RoadMaterial, RoadUniforms} from "../rendering/RoadMaterial";
import {RiverMaterial, RiverUniforms} from "../rendering/RiverMaterial";
import {WaterMaterial, WaterUniforms} from "../rendering/WaterMaterial";
import {WaterShoreMaterial} from "../rendering/WaterShoreMaterial";

export class HexMaterials {
    static readonly terrainMaterial = new MeshStandardMaterial({
        vertexColors: true,
        polygonOffset: true,
        polygonOffsetFactor: 2,
        polygonOffsetUnits: 2
    });

    // TODO inline when possible
    private static riverUniforms: RiverUniforms;
    private static waterUniforms: WaterUniforms;
    private static roadUniforms: RoadUniforms;

    static riverMaterial: RiverMaterial;
    static waterMaterial: WaterMaterial;
    static waterShoreMaterial: WaterShoreMaterial;
    static roadMaterial: RoadMaterial;

    static createMaterials(noiseTexture: Texture) {
        this.createRiverMaterial(noiseTexture);
        this.createWaterMaterial(noiseTexture);
        this.createRoadMaterial(noiseTexture);
    }

    static createRiverMaterial(noiseTexture: Texture) {
        this.riverUniforms = {
            time: {value: 0},
            noiseTexture: {value: noiseTexture}
        };
        this.riverMaterial = new RiverMaterial(this.riverUniforms);
    }

    static createWaterMaterial(noiseTexture: Texture) {
        this.waterUniforms = {
            time: {value: 0},
            waterColor: {value: new Color(0x4069ff)},
            noiseTexture: {value: noiseTexture}
        };
        this.waterMaterial = new WaterMaterial(this.waterUniforms);
        this.waterShoreMaterial = new WaterShoreMaterial(this.waterUniforms);
    }


    static createRoadMaterial(noiseTexture: Texture) {
        this.roadUniforms = {
            roadColor: {value: new Color(0xff0000)},
            noiseTexture: {value: noiseTexture}
        };
        this.roadMaterial = new RoadMaterial(this.roadUniforms);
    }

    static updateTime(elapsedTime: number) {
        if (this.riverMaterial) {
            // @ts-ignore
            this.riverMaterial.updateTime(elapsedTime);
        }
        if (this.waterMaterial) {
            // @ts-ignore
            this.waterMaterial.updateTime(elapsedTime);
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
