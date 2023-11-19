import { Group, Scene, Vector3 } from "three";
import { CubeFeature } from "./CubeFeature";
import { HexMetrics } from "../HexMetrics";
import { Vec3 } from "../../lib/math/Vec3";
import { HexCell } from "../HexCell";
import { HexFeatureCollection } from "./HexFeatureCollection";
import { HexMesh } from "../HexMesh";
import { HexMaterials } from "../util/HexMaterials";
import { EdgeVertices } from "../EdgeVertices";

export class HexFeatureManager {
	private _scene: Scene;
	private readonly _container: Group;
	private readonly _walls: HexMesh;

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
		this._walls = new HexMesh(HexMaterials.urbanFeatureMaterial, false, false, false, false);
		this._walls.castShadow = true;
		this._scene = scene;
		this._container = new Group();
		this._container.name = "Features container";
		this._scene.add(this._container);
		this._scene.add(this._walls);
		this._walls.wireframeCopy.visible = false;
	}

	clear(): void {
		if (this._container) {
			this._container.clear();
		}
		this._walls.clearAll();
	}

	apply(): void {
		this._walls.apply();
	}

	addFeature(cell: HexCell, position: Vector3) {
		const hash = HexMetrics.sampleHashGrid(position);
		let prefab = this.pickPrefab(
			this.urbanCollections, cell.urbanLevel, hash.a, hash.d
		);
		let otherPrefab = this.pickPrefab(
			this.farmCollections, cell.farmLevel, hash.b, hash.d
		);

		let usedHash = hash.a;
		if (prefab) {
			if (otherPrefab && hash.b < hash.a) {
				prefab = otherPrefab;
				usedHash = hash.b;
			}
		} else if (otherPrefab) {
			prefab = otherPrefab;
			usedHash = hash.b;
		}
		otherPrefab = this.pickPrefab(
			this.plantCollections, cell.plantLevel, hash.c, hash.d
		);
		if (prefab) {
			if (otherPrefab && hash.c < usedHash) {
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

	addWall(
		near: EdgeVertices, nearCell: HexCell,
		far: EdgeVertices, farCell: HexCell,
		hasRiver: boolean, hasRoad: boolean) {
		if (nearCell.walled != farCell.walled) {
			this.addWallSegment(near.v1, far.v1, near.v2, far.v2);
			if (hasRiver || hasRoad) {
				// leave a gap
			} else {
				this.addWallSegment(near.v2, far.v2, near.v3, far.v3);
				this.addWallSegment(near.v3, far.v3, near.v4, far.v4);
			}
			this.addWallSegment(near.v4, far.v4, near.v5, far.v5);
		}
	}

	addWallThreeCells(
		c1: Vector3, cell1: HexCell,
		c2: Vector3, cell2: HexCell,
		c3: Vector3, cell3: HexCell) {
		if (cell1.walled) {
			if (cell2.walled) {
				if (!cell3.walled) {
					this.addWallSegmentThreeCells(c3, cell3, c1, cell1, c2, cell2);
				}
			} else if (cell3.walled) {
				this.addWallSegmentThreeCells(c2, cell2, c3, cell3, c1, cell1);
			} else {
				this.addWallSegmentThreeCells(c1, cell1, c2, cell2, c3, cell3);
			}
		} else if (cell2.walled) {
			if (cell3.walled) {
				this.addWallSegmentThreeCells(c1, cell1, c2, cell2, c3, cell3);
			} else {
				this.addWallSegmentThreeCells(c2, cell2, c3, cell3, c1, cell1);
			}
		} else if (cell3.walled) {
			this.addWallSegmentThreeCells(c3, cell3, c1, cell1, c2, cell2);
		}
	}

	// @ts-ignore
	addWallSegmentThreeCells(pivot: Vector3, pivotCell: HexCell,
	                         // @ts-ignore
	                         left: Vector3, leftCell: HexCell,
	                         // @ts-ignore
	                         right: Vector3, rightCell: HexCell): void {
		this.addWallSegment(pivot, left, pivot, right);
	}

	addWallSegment(nearLeft: Vector3, farLeft: Vector3,
	               nearRight: Vector3, farRight: Vector3) {
		nearLeft = HexMetrics.perturb(nearLeft);
		farLeft = HexMetrics.perturb(farLeft);
		nearRight = HexMetrics.perturb(nearRight);
		farRight = HexMetrics.perturb(farRight);

		const left = HexMetrics.wallLerp(nearLeft, farLeft);
		const right = HexMetrics.wallLerp(nearRight, farRight);

		const leftThicknessOffset =
			HexMetrics.wallThicknessOffset(nearLeft, farLeft);
		const rightThicknessOffset =
			HexMetrics.wallThicknessOffset(nearRight, farRight);
		const leftTop = left.y + HexMetrics.wallHeight;
		const rightTop = right.y + HexMetrics.wallHeight;

		let v1: Vector3;
		let v2: Vector3;
		let v3: Vector3;
		let v4: Vector3;

		v1 = left.clone().sub(leftThicknessOffset);
		v3 = left.clone().sub(leftThicknessOffset);
		v2 = right.clone().sub(rightThicknessOffset);
		v4 = right.clone().sub(rightThicknessOffset);
		v3.y = leftTop;
		v4.y = rightTop;
		this._walls.addQuadUnperturbed(v1, v2, v3, v4);

		const t1 = v3.clone();
		const t2 = v4.clone();

		v1 = left.clone().add(leftThicknessOffset);
		v3 = left.clone().add(leftThicknessOffset);
		v2 = right.clone().add(rightThicknessOffset);
		v4 = right.clone().add(rightThicknessOffset);
		v3.y = leftTop;
		v4.y = rightTop;
		this._walls.addQuadUnperturbed(v2, v1, v4, v3);

		this._walls.addQuadUnperturbed(t1, t2, v3, v4);
	}
}
