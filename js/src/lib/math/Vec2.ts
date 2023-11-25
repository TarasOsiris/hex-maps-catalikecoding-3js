import * as THREE from "three";

export class Vec2 {
	static zero = new THREE.Vector2(0, 0);
	static one = new THREE.Vector2(1, 1);
	static right = new THREE.Vector2(1, 0);
	static up = new THREE.Vector2(0, 1);

	static add(v1: THREE.Vector2, v2: THREE.Vector2) {
		return v1.clone().add(v2);
	}

	static sub(v1: THREE.Vector2, v2: THREE.Vector2) {
		return v1.clone().sub(v2);
	}
}
