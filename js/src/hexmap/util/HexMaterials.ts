import * as THREE from "three";

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

    static readonly vertexShader: string = `
        uniform float time;
        uniform vec2 resolution;
        
        void main() {
            gl_Position = vec4( position, 1.0 );
        }
    `;

    static readonly fragmentShader: string = `
        uniform float time;
        uniform vec2 resolution;
        
        void main() {
            float x = mod(time + gl_FragCoord.x, 20.) < 10. ? 1. : 0.;
            float y = mod(time + gl_FragCoord.y, 20.) < 10. ? 1. : 0.;
            gl_FragColor = vec4(vec3(min(x, y)), 1.);
        }
    `;

    static readonly customShaderMaterial = new THREE.ShaderMaterial({
        vertexShader: this.vertexShader,
        fragmentShader: this.fragmentShader,
    });
}
