import * as THREE from "three";

export class BufferGeometryUtils {
    static setPosition(geometry: THREE.BufferGeometry, vertices: Array<number>) {
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    }

    static setColor(geometry: THREE.BufferGeometry, colors: Array<number>) {
        geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
    }

    static setUVs(geometry: THREE.BufferGeometry, uvs: Array<number>, suffix: string = '') {
        geometry.setAttribute('uv' + suffix, new THREE.BufferAttribute(new Float32Array(uvs), 2));
    }
}
