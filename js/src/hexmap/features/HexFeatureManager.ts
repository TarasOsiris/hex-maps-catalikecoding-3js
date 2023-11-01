import {Group, Scene, Vector3} from "three";
import {CubeFeature} from "./CubeFeature";
import {HexMetrics} from "../HexMetrics";
import {Vec3} from "../../lib/math/Vec3";
import {HexCell} from "../HexCell";
import {HexFeatureCollection} from "./HexFeatureCollection";

export class HexFeatureManager {
	private _scene: Scene;
	private readonly _container: Group;

	private readonly urbanCollections: HexFeatureCollection[] = Array.of(
		new HexFeatureCollection(
			CubeFeature.createUrban(2, 5, 2),
			CubeFeature.createUrban(3.5, 3, 2),
		),
		new HexFeatureCollection(
			CubeFeature.createUrban(1.5, 2, 1.5),
			CubeFeature.createUrban(2.75, 1.5, 1.5),
		),
		new HexFeatureCollection(
			CubeFeature.createUrban(1, 1, 1),
			CubeFeature.createUrban(1.75, 1, 1),
		),
	);

	constructor(scene: Scene) {
		this._scene = scene;
		this._container = new Group();
		this._container.name = "Features container";
		this._scene.add(this._container);
	}

	clear(): void {
		if (this._container) {
			this._container.clear();
		}
	}

	apply(): void {

	}

	addFeature(cell: HexCell, position: Vector3) {
		const hash = HexMetrics.sampleHashGrid(position);
		const prefab = this.pickPrefab(cell.urbanLevel, hash.a, hash.b);
		if (!prefab) {
			return;
		}
		const instance = prefab.clone();
		this._scene.add(instance);

		position = position.clone();

		const worldPos = HexMetrics.perturb(position);
		instance.position.copy(Vec3.add(worldPos, instance.position));
		instance.rotation.set(0, 360 * hash.c, 0);
		this._container.attach(instance);
	}

	pickPrefab(level: number, hash: number, choice: number) {
		if (level > 0) {
			const thresholds = HexMetrics.getFeatureThresholds(level - 1);
			for (let i = 0; i < thresholds.length; i++) {
				if (hash < thresholds[i]) {
					return this.urbanCollections[i].pick(choice);
				}
			}
		}
		return null;
	}
}
