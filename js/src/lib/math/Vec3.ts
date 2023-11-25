import { Vector3 } from "three";

export class Vec3 {
	static zero = new Vector3(0, 0, 0);
	static one = new Vector3(1, 1, 1);
	static back = new Vector3(0, 0, -1);
	static forward = new Vector3(0, 0, 1);

	static right = new Vector3(1, 0, 0);
	static up = new Vector3(0, 1, 0);

	public static lerp(v1: Vector3, v2: Vector3, alpha: number) {
		return new Vector3().lerpVectors(v1, v2, alpha);
	}

	static add(v1: Vector3, v2: Vector3) {
		return new Vector3().addVectors(v1, v2);
	}

	static sub(v1: Vector3, v2: Vector3) {
		return new Vector3().subVectors(v1, v2);
	}

	static addMany(v: Vector3, ...vectors: Array<Vector3>) {
		const result = v.clone();
		for (const vector of vectors) {
			result.add(vector);
		}
		return result;
	}

	static mul(v1: Vector3, v2: Vector3) {
		return new Vector3().multiplyVectors(v1, v2);
	}

	static mulScalar(v: Vector3, s: number) {
		return v.clone().multiplyScalar(s);
	}
}
