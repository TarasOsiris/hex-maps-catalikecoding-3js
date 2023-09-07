import * as THREE from "three";

export class ColorUtils {

    static copy(color: THREE.Color): THREE.Color {
        return new THREE.Color().copy(color)
    }

    static randomColor(): THREE.Color {
        const r = Math.random();
        const g = Math.random();
        const b = Math.random();

        return new THREE.Color(r, g, b);
    }
}