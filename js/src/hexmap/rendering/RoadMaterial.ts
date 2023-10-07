// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {Color, ShaderLib, ShaderMaterial, TangentSpaceNormalMap, Texture, UniformsUtils, Vector2} from "three";
import tVertex from "./shaders/roadStandartVertex.glsl";
import tFragment from "./shaders/roadStandardFragment.glsl";

export type RoadUniforms = { roadColor: { value: Color }; noiseTexture: { value: Texture } };

export class RoadMaterial extends ShaderMaterial {
    constructor(uniforms: RoadUniforms) {
        super(
            {uniforms: UniformsUtils.merge([uniforms, UniformsUtils.clone(ShaderLib.standard.uniforms)])}
        );
        this.isMeshStandardMaterial = true;

        this.color = new Color(0x00ff00); // diffuse
        this.roughness = 0.5;
        this.metalness = 0.0;

        this.map = null;

        this.lightMap = null;
        this.lightMapIntensity = 1.0;

        this.aoMap = null;
        this.aoMapIntensity = 1.0;

        this.emissive = new Color(0x000000);
        this.emissiveIntensity = 1.0;
        this.emissiveMap = null;

        this.bumpMap = null;
        this.bumpScale = 1;

        this.normalMap = null;
        this.normalMapType = TangentSpaceNormalMap;
        this.normalScale = new Vector2(1, 1);

        this.displacementMap = null;
        this.displacementScale = 1;
        this.displacementBias = 0;

        this.roughnessMap = null;

        this.metalnessMap = null;

        this.alphaMap = null;

        this.envMap = null;
        this.envMapIntensity = 1.0;

        this.wireframe = false;
        this.wireframeLinewidth = 1;
        this.wireframeLinecap = 'round';
        this.wireframeLinejoin = 'round';

        this.flatShading = false;

        this.fog = true;

        // Customs stuff
        this.transparent = true;
        this.polygonOffset = true;
        this.polygonOffsetFactor = 1;
        this.polygonOffsetUnits = 1;
        this.defines = {'STANDARD': '', 'USE_UV': ''};
        this.vertexShader = tVertex;
        this.fragmentShader = tFragment;
    }
}
