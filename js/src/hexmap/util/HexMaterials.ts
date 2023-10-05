import riverVertex from "../shaders/riverVertex.glsl";
import riverFragment from "../shaders/riverFragment.glsl";
import waterVertex from "../shaders/waterVertex.glsl";
import waterFragment from "../shaders/waterFragment.glsl";
import roadVertex from "../shaders/roadVertex.glsl";
import roadFragment from "../shaders/roadFragment.glsl";
import tVertex from "../shaders/experiments/testVertex.glsl";
import tFragment from "../shaders/experiments/testFragment.glsl";
import {Color, Material, MeshBasicMaterial, MeshStandardMaterial, ShaderMaterial, Texture} from "three";
import {RoadMaterial} from "../materials/RoadMaterial";

export class HexMaterials {
    static noiseTexture: Texture;

    static readonly terrainMaterial = new MeshStandardMaterial({
        vertexColors: true,
        polygonOffset: true,
        polygonOffsetFactor: 2,
        polygonOffsetUnits: 2
    });

    private static riverUniforms: { time: { value: number }; noiseTexture: { value: Texture } };
    private static waterUniforms: { waterColor: { value: Color }; noiseTexture: { value: Texture } };
    private static roadUniforms: { roadColor: { value: Color }; noiseTexture: { value: Texture } };

    static riverMaterial: Material;
    static waterMaterial: Material;
    static roadMaterial: Material;

    static createMaterials(noiseTexture: Texture) {
        this.createRiverMaterial(noiseTexture);
        this.createWaterMaterial(noiseTexture);
        this.createRoadMaterial(noiseTexture, false);
    }

    static createRiverMaterial(noiseTexture: Texture) {
        this.riverUniforms = this.createRiverUniforms(noiseTexture);
        this.riverMaterial = new ShaderMaterial({
            vertexShader: riverVertex,
            fragmentShader: riverFragment,
            uniforms: HexMaterials.riverUniforms,
            transparent: true,
        });
    }

    static createRiverUniforms(noiseTexture: Texture) {
        return {
            time: {value: 1.0},
            noiseTexture: {value: noiseTexture}
        };
    }

    static createWaterMaterial(noiseTexture: Texture) {
        this.waterUniforms = this.createWaterUniforms(noiseTexture);
        this.waterMaterial = new ShaderMaterial({
            vertexShader: waterVertex,
            fragmentShader: waterFragment,
            uniforms: this.waterUniforms,
            transparent: true,
        });
    }

    static createWaterUniforms(noiseTexture: Texture) {
        return {
            waterColor: {value: new Color(0x4069ff)},
            noiseTexture: {value: noiseTexture}
        };
    }

    static createRoadMaterial(noiseTexture: Texture, experimental: boolean = false) {
        this.roadUniforms = this.createRoadUniforms(noiseTexture);
        if (experimental) {
            this.roadMaterial = new RoadMaterial();
        } else {
            this.roadMaterial = new ShaderMaterial({
                vertexShader: roadVertex,
                fragmentShader: roadFragment,

                polygonOffset: true,
                polygonOffsetFactor: 1,
                polygonOffsetUnits: 1,
                uniforms: this.roadUniforms,
                transparent: true,
            });
        }
    }

    static createRoadUniforms(noiseTexture: Texture) {
        return {
            roadColor: {value: new Color(0xff0000)},
            noiseTexture: {value: noiseTexture}
        };
    }

    static updateTime(elapsedTime: number) {
        if (this.riverUniforms) {
            this.riverUniforms.time.value = elapsedTime;
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
