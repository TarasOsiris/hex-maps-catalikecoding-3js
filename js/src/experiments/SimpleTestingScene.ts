import * as THREE from "three";
import {FullScreenScene} from "../lib/scene/FullScreenScene";

import vertexShaderCode from "../shaders/vertex.glsl";
import fragmentShaderCode from "../shaders/fragment.glsl";

export class SimpleTestingScene extends FullScreenScene {

    uniforms = {
        time: {type: "f", value: 1.0},
        resolution: {type: "v2", value: new THREE.Vector2()}
    };

    onInit() {

        const material = new THREE.ShaderMaterial({
            vertexShader: vertexShaderCode,
            fragmentShader: fragmentShaderCode,
            uniforms: this.uniforms
        });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
        this.add(mesh);
    }

    startTime = Date.now();

    update(_dt: number) {
        const elapsedMilliseconds = Date.now() - this.startTime;
        const elapsedSeconds = elapsedMilliseconds / 1000;
        this.uniforms.time.value = 60 * elapsedSeconds;
        super.update(_dt);
    }
}
