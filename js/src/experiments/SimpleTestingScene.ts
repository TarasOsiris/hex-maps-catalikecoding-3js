import * as THREE from "three";
import {FullScreenScene} from "../lib/scene/FullScreenScene";

import {AmbientLight, MeshStandardMaterial, ShaderMaterial} from "three";
import vertexShaderCode from "../shaders/testing/testVertex.glsl";
import fragmentShaderCode from "../shaders/testing/testFragment.glsl";

export class SimpleTestingScene extends FullScreenScene {

    uniforms = {
        time: {type: "f", value: 1.0},
        resolution: {type: "v2", value: new THREE.Vector2()}
    };

    onInit() {

        // const material = new THREE.ShaderMaterial({
        //     vertexShader: vertexShaderCode,
        //     fragmentShader: fragmentShaderCode,
        //     uniforms: this.uniforms
        // });

        this.add(new AmbientLight(0xffffff, 1));

        const material = new MeshStandardMaterial({
            transparent: true, opacity: 0.5, color: 0xff0000

        });
        const shaderMaterial = new ShaderMaterial({
            vertexShader: vertexShaderCode,
            fragmentShader: fragmentShaderCode,
            transparent: true,
            opacity: 0.5,
        });
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
        const mesh2 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), shaderMaterial);
        mesh2.position.set(1, 1, 0);
        this.add(mesh);
        this.add(mesh2);
    }

    startTime = Date.now();

    update(_dt: number) {
        const elapsedMilliseconds = Date.now() - this.startTime;
        const elapsedSeconds = elapsedMilliseconds / 1000;
        this.uniforms.time.value = 60 * elapsedSeconds;
        super.update(_dt);
    }
}
