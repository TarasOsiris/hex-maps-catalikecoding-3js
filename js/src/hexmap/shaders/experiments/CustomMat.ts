// @ts-nocheck
import {Color, ShaderMaterial, TangentSpaceNormalMap, Vector2} from "three";
import tVertex from "../experiments/testVertex.glsl";
import tFragment from "../experiments/testFragment.glsl";
export class CustomMat extends ShaderMaterial {
    constructor() {
        super({vertexShader: tVertex, fragmentShader: tFragment});
        this.isMeshStandardMaterial = true;

        this.defines = { 'STANDARD': '' };

        this.type = 'MeshStandardMaterial';

        this.color = new Color( 0xffffff ); // diffuse
        this.roughness = 1.0;
        this.metalness = 0.0;

        this.map = null;

        this.lightMap = null;
        this.lightMapIntensity = 1.0;

        this.aoMap = null;
        this.aoMapIntensity = 1.0;

        this.emissive = new Color( 0x000000 );
        this.emissiveIntensity = 1.0;
        this.emissiveMap = null;

        this.bumpMap = null;
        this.bumpScale = 1;

        this.normalMap = null;
        this.normalMapType = TangentSpaceNormalMap;
        this.normalScale = new Vector2( 1, 1 );

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

        this.setValues( {vertexShader: tVertex, fragmentShader: tFragment} );
    }
}
