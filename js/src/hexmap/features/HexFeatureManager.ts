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

	private readonly farmCollections: HexFeatureCollection[] = Array.of(
		new HexFeatureCollection(
			CubeFeature.createFarm(2.5, 2.5),
			CubeFeature.createFarm(3.5, 2),
		),
		new HexFeatureCollection(
			CubeFeature.createFarm(1.75, 1.75),
			CubeFeature.createFarm(2.5, 1.25),
		),
		new HexFeatureCollection(
			CubeFeature.createFarm(1, 1),
			CubeFeature.createFarm(1.5, 0.75),
		)
	);

	// TODO finish this!
	private readonly plantCollections: HexFeatureCollection[] = Array.of(
		new HexFeatureCollection(
			CubeFeature.createPlant(1.25, 4.5, 1.25),
			CubeFeature.createPlant(1.5, 3, 1.5),
		),
		new HexFeatureCollection(
			CubeFeature.createPlant(0.75, 3, 0.75),
			CubeFeature.createPlant(1, 1.5, 1),
		),
		new HexFeatureCollection(
			CubeFeature.createPlant(0.5, 1.5, 0.5),
			CubeFeature.createPlant(0.75, 1, 0.75),
		)
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
		let prefab = this.pickPrefab(this.urbanCollections, cell.urbanLevel, hash.a, hash.d);
		const otherPrefab = this.pickPrefab(this.farmCollections, cell.farmLevel, hash.b, hash.d);

		if (prefab) {
			if (otherPrefab && hash.b < hash.a) {
				prefab = otherPrefab;
			}
		} else if (otherPrefab) {
			prefab = otherPrefab;
		} else {
			return;
		}
		const instance = prefab.clone();
		this._scene.add(instance);

		position = position.clone();

		const worldPos = HexMetrics.perturb(position);
		instance.position.copy(Vec3.add(worldPos, instance.position));
		instance.rotation.set(0, 360 * hash.e, 0);
		this._container.attach(instance);
	}

	pickPrefab(collection: HexFeatureCollection[], level: number, hash: number, choice: number) {
		if (level > 0) {
			const thresholds = HexMetrics.getFeatureThresholds(level - 1);
			for (let i = 0; i < thresholds.length; i++) {
				if (hash < thresholds[i]) {
					return collection[i].pick(choice);
				}
			}
		}
		return null;
	}
}
