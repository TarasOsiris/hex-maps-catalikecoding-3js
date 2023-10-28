import {BoxGeometry, Mesh, MeshStandardMaterial, Vector3} from "three";

export class CubeFeature extends Mesh {
	private static readonly geometry = new BoxGeometry(1, 1, 1);
	private static readonly material = new MeshStandardMaterial({color: 'red'});

	constructor(scale: Vector3) {
		super(CubeFeature.geometry, CubeFeature.material);
		this.castShadow = true;
		if (scale) { // not available when calling .clone() to copy the object
			this.scale.set(scale.x, scale.y, scale.z);
		}
		this.position.setY(this.scale.y * 0.5);
	}
}
