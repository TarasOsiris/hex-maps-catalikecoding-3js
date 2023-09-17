import * as THREE from "three";

export class ColorUtils {
    static white = new THREE.Color('white');
    static black = new THREE.Color('black');

    static red = new THREE.Color('red');
    static green = new THREE.Color('green');
    static blue = new THREE.Color('blue');

    static randomColor(): THREE.Color {
        return new THREE.Color(Math.random(), Math.random(), Math.random());
    }
}