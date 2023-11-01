import {BoxGeometry, Material, Mesh, Vector3} from "three";
import {HexMaterials} from "../util/HexMaterials";

export class CubeFeature extends Mesh {
	private static readonly geometry = new BoxGeometry(1, 1, 1);

	constructor(scale: Vector3, material: Material) {
		super(CubeFeature.geometry, material);
		this.castShadow = true;
		if (scale) { // not available when calling .clone() to copy the object
			this.scale.set(scale.x, scale.y, scale.z);
		}
		this.position.setY(this.scale.y * 0.5);
	}

	public static createUrban(xScale: number, yScale: number, zScale: number): CubeFeature {
		return new CubeFeature(new Vector3(xScale, yScale, zScale), HexMaterials.urbanFeatureMaterial);
	}

	public static createFarm(xScale: number, zScale: number): CubeFeature {
		return new CubeFeature(new Vector3(xScale, 0.1, zScale), HexMaterials.farmFeatureMaterial);
	}

	public static createPlant(xScale: number, yScale: number, zScale: number): CubeFeature {
		return new CubeFeature(new Vector3(xScale, yScale, zScale), HexMaterials.plantFeatureMaterial);
	}
}
