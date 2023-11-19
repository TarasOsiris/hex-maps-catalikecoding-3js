import {HexCell} from "./HexCell";
import {HexMesh} from "./HexMesh";
import {HexMetrics} from "./HexMetrics";
import {HexDirection, HexDirectionUtils} from "./HexDirection";
import {EdgeVertices} from "./EdgeVertices";
import {Vec3} from "../lib/math/Vec3";
import {HexEdgeType} from "./HexEdgeType";
import {HexMaterials} from "./util/HexMaterials";
import {Color, Object3D, Scene, Vector2, Vector3} from "three";
import {MeshType} from "./scenes/HexMapSceneEditor";
import {HexFeatureManager} from "./features/HexFeatureManager";

export class HexGridChunk extends Object3D {
	readonly cells: Array<HexCell> = [];

	terrain: HexMesh;
	rivers: HexMesh;
	roads: HexMesh;
	water: HexMesh;
	waterShore: HexMesh;
	estuaries: HexMesh;
	dirty = true;

	features: HexFeatureManager;
	private readonly _scene: Scene;

	constructor(scene: Scene) {
		super();
		this._scene = scene;
		this.cells = new Array<HexCell>(HexMetrics.chunkSizeX * HexMetrics.chunkSizeZ);

		this.terrain = new HexMesh(HexMaterials.terrainMaterial, true, true, false);
		this.terrain.castShadow = true;
		this.terrain.receiveShadow = true;

		this.roads = new HexMesh(HexMaterials.roadMaterial, false, false, true);
		this.roads.receiveShadow = true;

		this.rivers = new HexMesh(HexMaterials.riverMaterial, false, false, true);
		this.rivers.receiveShadow = true;
		// TODO there is this issue where the rivers are not drawn at all below the water
		this.rivers.renderOrder = 0;

		this.water = new HexMesh(HexMaterials.waterMaterial, false, false, false);
		this.water.receiveShadow = true;
		this.water.renderOrder = 0;

		this.waterShore = new HexMesh(HexMaterials.waterShoreMaterial, false, false, true, true);
		this.waterShore.receiveShadow = true;
		this.waterShore.renderOrder = 0;

		this.estuaries = new HexMesh(HexMaterials.estuariesMaterial, false, false, true, true);
		this.estuaries.receiveShadow = true;
		this.estuaries.renderOrder = 0;

		this.features = new HexFeatureManager(this._scene);

		this.add(this.terrain, this.roads, this.water, this.waterShore, this.rivers, this.estuaries);
	}

	refresh() {
		this.terrain.clearAll();
		this.rivers.clearAll();
		this.roads.clearAll();
		this.water.clearAll();
		this.waterShore.clearAll();
		this.estuaries.clearAll();
		this.features.clear();
		for (const cell of this.cells) {
			this.triangulateCell(cell);
		}
		this.terrain.apply();
		this.rivers.apply();
		this.roads.apply();
		this.water.apply();
		this.waterShore.apply();
		this.estuaries.apply();
		this.features.apply();

		this.dirty = false;
	}

	markDirty() {
		this.dirty = true;
	}

	addCell(index: number, cell: HexCell) {
		this.cells[index] = cell;
		cell.chunk = this;
		this.add(cell, cell.textMesh);
	}

	triangulateCell(cell: HexCell) {
		for (let d = HexDirection.NE; d <= HexDirection.NW; d++) {
			this.triangulateSector(d, cell);
		}
		if (!cell.isUnderwater && !cell.hasRiver && !cell.hasRoads) {
			this.features.addFeature(cell, cell.position);
		}
	}

	private triangulateSector(direction: HexDirection, cell: HexCell) {
		const center = cell.cellPosition.clone();
		const e = new EdgeVertices(
			Vec3.add(center, HexMetrics.getFirstSolidCorner(direction)),
			Vec3.add(center, HexMetrics.getSecondSolidCorner(direction))
		);

		if (cell.hasRiver) {
			if (cell.hasRiverThroughEdge(direction)) {
				e.v3.y = cell.streamBedY;
				if (cell.hasRiverBeginOrEnd) {
					this.triangulateWithRiverBeginOrEnd(cell, center, e);
				} else {
					this.triangulateWithRiver(direction, cell, center, e);
				}
			} else {
				this.triangulateAdjacentToRiver(direction, cell, center, e);
			}
		} else {
			this.triangulateWithoutRiver(direction, cell, center, e);
			if (!cell.isUnderwater && !cell.hasRoadThroughEdge(direction)) {
				this.features.addFeature(cell, Vec3.addMany(center, e.v1, e.v5).multiplyScalar(1 / 3));
			}
		}

		if (direction <= HexDirection.SE) {
			const neighbor = cell.getNeighbor(direction);
			if (neighbor == null) {
				return;
			}
			this.triangulateConnection(direction, cell, e);
		}

		if (cell.isUnderwater) {
			this.triangulateWater(direction, cell, center);
		}
	}

	private triangulateWithoutRiver(direction: HexDirection, cell: HexCell, center: Vector3, e: EdgeVertices) {
		this.triangulateEdgeFan(center, e, cell.color.clone());
		if (cell.hasRoads) {
			const interpolators = this.getRoadInterpolators(direction, cell);
			this.triangulateRoad(center,
				Vec3.lerp(center, e.v1, interpolators.x),
				Vec3.lerp(center, e.v5, interpolators.y),
				e, cell.hasRoadThroughEdge(direction)
			);
		}
	}

	private triangulateEdgeFan(center: Vector3, edge: EdgeVertices, color: Color) {
		this.terrain.addTriangle(center, edge.v1, edge.v2);
		this.terrain.addTriangleColorSingle(color);
		this.terrain.addTriangle(center, edge.v2, edge.v3);
		this.terrain.addTriangleColorSingle(color);
		this.terrain.addTriangle(center, edge.v3, edge.v4);
		this.terrain.addTriangleColorSingle(color);
		this.terrain.addTriangle(center, edge.v4, edge.v5);
		this.terrain.addTriangleColorSingle(color);
	}

	triangulateEdgeStrip(
		e1: EdgeVertices, c1: Color,
		e2: EdgeVertices, c2: Color,
		hasRoad: boolean = false
	) {
		this.terrain.addQuad(e1.v1, e1.v2, e2.v1, e2.v2);
		this.terrain.addQuadColor2v(c1, c2);
		this.terrain.addQuad(e1.v2, e1.v3, e2.v2, e2.v3);
		this.terrain.addQuadColor2v(c1, c2);
		this.terrain.addQuad(e1.v3, e1.v4, e2.v3, e2.v4);
		this.terrain.addQuadColor2v(c1, c2);
		this.terrain.addQuad(e1.v4, e1.v5, e2.v4, e2.v5);
		this.terrain.addQuadColor2v(c1, c2);

		if (hasRoad) {
			this.triangulateRoadSegment(e1.v2, e1.v3, e1.v4, e2.v2, e2.v3, e2.v4);
		}
	}

	private triangulateConnection(direction: HexDirection, cell: HexCell, e1: EdgeVertices) {
		const neighbor = cell.getNeighbor(direction) ?? cell;

		const bridge = HexMetrics.getBridge(direction);
		bridge.y = neighbor.position.y - cell.position.y;
		const e2 = new EdgeVertices(
			Vec3.add(e1.v1, bridge),
			Vec3.add(e1.v5, bridge)
		);

		const hasRiver = cell.hasRiverThroughEdge(direction);
		const hasRoad = cell.hasRoadThroughEdge(direction);

		if (hasRiver) {
			e2.v3.y = neighbor.streamBedY;

			if (!cell.isUnderwater) {
				if (!neighbor.isUnderwater) {
					this.triangulateRiverQuad(e1.v2, e1.v4, e2.v2, e2.v4,
						cell.riverSurfaceY, neighbor.riverSurfaceY, 0.8,
						cell.hasIncomingRiver && cell.incomingRiver == direction
					);
				} else if (cell.elevation > neighbor.waterLevel) {
					this.triangulateWaterfallInWater(
						e1.v2, e1.v4, e2.v2, e2.v4,
						cell.riverSurfaceY, neighbor.riverSurfaceY,
						neighbor.waterSurfaceY
					);
				}
			} else if (!neighbor.isUnderwater && neighbor.elevation > cell.waterLevel) {
				this.triangulateWaterfallInWater(
					e2.v4, e2.v2, e1.v4, e1.v2,
					neighbor.riverSurfaceY, cell.riverSurfaceY,
					cell.waterSurfaceY
				);
			}
		}

		if (cell.getEdgeType(direction) == HexEdgeType.Slope) {
			this.triangulateEdgeTerraces(e1, cell, e2, neighbor, hasRoad);
		} else {
			this.triangulateEdgeStrip(e1, cell.color, e2, neighbor.color, hasRoad);
		}

		this.features.addWall(e1, cell, e2, neighbor, hasRiver, hasRoad);

		const nextDirection = HexDirectionUtils.next(direction);
		const nextNeighbor = cell.getNeighbor(nextDirection);
		if (direction <= HexDirection.E && nextNeighbor != null) {
			const v5 = Vec3.add(e1.v5, HexMetrics.getBridge(nextDirection));
			v5.y = nextNeighbor.cellPosition.y;

			if (cell.elevation <= neighbor.elevation) {
				if (cell.elevation <= nextNeighbor.elevation) {
					this.triangulateCorner(e1.v5, cell, e2.v5, neighbor, v5, nextNeighbor);
				} else {
					this.triangulateCorner(v5, nextNeighbor, e1.v5, cell, e2.v5, neighbor);
				}
			} else if (neighbor.elevation <= nextNeighbor.elevation) {
				this.triangulateCorner(e2.v5, neighbor, v5, nextNeighbor, e1.v5, cell);
			} else {
				this.triangulateCorner(v5, nextNeighbor, e1.v5, cell, e2.v5, neighbor);
			}
		}
	}

	triangulateCorner(bottom: Vector3, bottomCell: HexCell,
	                  left: Vector3, leftCell: HexCell,
	                  right: Vector3, rightCell: HexCell) {
		const leftEdgeType = bottomCell.getEdgeTypeWithOtherCell(leftCell);
		const rightEdgeType = bottomCell.getEdgeTypeWithOtherCell(rightCell);

		if (leftEdgeType == HexEdgeType.Slope) {
			if (rightEdgeType == HexEdgeType.Slope) {
				this.triangulateCornerTerraces(bottom, bottomCell, left, leftCell, right, rightCell);
			} else if (rightEdgeType == HexEdgeType.Flat) {
				this.triangulateCornerTerraces(left, leftCell, right, rightCell, bottom, bottomCell);
			} else {
				this.triangulateCornerTerracesCliff(bottom, bottomCell, left, leftCell, right, rightCell);
			}
		} else if (rightEdgeType == HexEdgeType.Slope) {
			if (leftEdgeType == HexEdgeType.Flat) {
				this.triangulateCornerTerraces(right, rightCell, bottom, bottomCell, left, leftCell);
			} else {
				this.triangulateCornerCliffTerraces(bottom, bottomCell, left, leftCell, right, rightCell);
			}
		} else if (leftCell.getEdgeTypeWithOtherCell(rightCell) == HexEdgeType.Slope) {
			if (leftCell.elevation < rightCell.elevation) {
				this.triangulateCornerCliffTerraces(right, rightCell, bottom, bottomCell, left, leftCell);
			} else {
				this.triangulateCornerTerracesCliff(left, leftCell, right, rightCell, bottom, bottomCell);
			}
		} else {
			this.terrain.addTriangle(bottom, left, right);
			this.terrain.addTriangleColor(bottomCell.color, leftCell.color, rightCell.color);
		}

		this.features.addWallThreeCells(bottom, bottomCell, left, leftCell, right, rightCell);
	}

	triangulateCornerTerraces(
		begin: Vector3, beginCell: HexCell,
		left: Vector3, leftCell: HexCell,
		right: Vector3, rightCell: HexCell
	) {
		let v3 = HexMetrics.terraceLerp(begin, left, 1);
		let v4 = HexMetrics.terraceLerp(begin, right, 1);
		let c3 = HexMetrics.terraceLerpColor(beginCell.color, leftCell.color, 1);
		let c4 = HexMetrics.terraceLerpColor(beginCell.color, rightCell.color, 1);

		this.terrain.addTriangle(begin, v3, v4);
		this.terrain.addTriangleColor(beginCell.color, c3, c4);

		for (let i = 2; i < HexMetrics.terraceSteps; i++) {
			const v1 = v3;
			const v2 = v4;
			const c1 = c3;
			const c2 = c4;
			v3 = HexMetrics.terraceLerp(begin, left, i);
			v4 = HexMetrics.terraceLerp(begin, right, i);
			c3 = HexMetrics.terraceLerpColor(beginCell.color, leftCell.color, i);
			c4 = HexMetrics.terraceLerpColor(beginCell.color, rightCell.color, i);
			this.terrain.addQuad(v1, v2, v3, v4);
			this.terrain.addQuadColor4v(c1, c2, c3, c4);
		}

		this.terrain.addQuad(v3, v4, left, right);
		this.terrain.addQuadColor4v(c3, c4, leftCell.color, rightCell.color);
	}

	triangulateCornerTerracesCliff(
		begin: Vector3, beginCell: HexCell,
		left: Vector3, leftCell: HexCell,
		right: Vector3, rightCell: HexCell
	) {
		let b = 1 / (rightCell.elevation - beginCell.elevation);
		if (b < 0) {
			b = -b;
		}

		const boundary = HexMetrics.perturb(begin).lerp(HexMetrics.perturb(right), b);
		const boundaryColor = new Color().copy(beginCell.color).lerp(rightCell.color, b);

		this.triangulateBoundaryTriangle(begin, beginCell, left, leftCell, boundary, boundaryColor);

		if (leftCell.getEdgeTypeWithOtherCell(rightCell) == HexEdgeType.Slope) {
			this.triangulateBoundaryTriangle(left, leftCell, right, rightCell, boundary, boundaryColor);
		} else {
			this.terrain.addTriangleUnperturbed(HexMetrics.perturb(left), HexMetrics.perturb(right), boundary);
			this.terrain.addTriangleColor(leftCell.color, rightCell.color, boundaryColor);
		}
	}

	triangulateCornerCliffTerraces(
		begin: Vector3, beginCell: HexCell,
		left: Vector3, leftCell: HexCell,
		right: Vector3, rightCell: HexCell
	) {
		let b = 1 / (leftCell.elevation - beginCell.elevation);
		if (b < 0) {
			b = -b;
		}
		const boundary = new Vector3().copy(HexMetrics.perturb(begin))
			.lerp(HexMetrics.perturb(left), b);
		const boundaryColor = new Color().copy(beginCell.color).lerp(leftCell.color, b);

		this.triangulateBoundaryTriangle(right, rightCell, begin, beginCell, boundary, boundaryColor);

		if (leftCell.getEdgeTypeWithOtherCell(rightCell) == HexEdgeType.Slope) {
			this.triangulateBoundaryTriangle(left, leftCell, right, rightCell, boundary, boundaryColor);
		} else {
			this.terrain.addTriangleUnperturbed(HexMetrics.perturb(left), HexMetrics.perturb(right), boundary);
			this.terrain.addTriangleColor(leftCell.color, rightCell.color, boundaryColor);
		}
	}

	private triangulateBoundaryTriangle(begin: Vector3, beginCell: HexCell,
	                                    left: Vector3, leftCell: HexCell,
	                                    boundary: Vector3, boundaryColor: Color) {
		let v2 = HexMetrics.perturb(HexMetrics.terraceLerp(begin, left, 1));
		let c2 = HexMetrics.terraceLerpColor(beginCell.color, leftCell.color, 1);

		this.terrain.addTriangleUnperturbed(HexMetrics.perturb(begin), v2, boundary);
		this.terrain.addTriangleColor(beginCell.color, c2, boundaryColor);

		for (let i = 2; i < HexMetrics.terraceSteps; i++) {
			const v1 = v2;
			const c1 = c2;
			v2 = HexMetrics.perturb(HexMetrics.terraceLerp(begin, left, i));
			c2 = HexMetrics.terraceLerpColor(beginCell.color, leftCell.color, i);
			this.terrain.addTriangleUnperturbed(v1, v2, boundary);
			this.terrain.addTriangleColor(c1, c2, boundaryColor);
		}

		this.terrain.addTriangleUnperturbed(v2, HexMetrics.perturb(left), boundary);
		this.terrain.addTriangleColor(c2, leftCell.color, boundaryColor);
	}

	triangulateEdgeTerraces(begin: EdgeVertices, beginCell: HexCell,
	                        end: EdgeVertices, endCell: HexCell, hasRoad: boolean) {
		let e2 = EdgeVertices.terraceLerp(begin, end, 1);
		let c2 = HexMetrics.terraceLerpColor(beginCell.color, endCell.color, 1);

		this.triangulateEdgeStrip(begin, beginCell.color, e2, c2, hasRoad);

		for (let i = 2; i < HexMetrics.terraceSteps; i++) {
			const e1 = e2.clone();
			const c1 = c2;
			e2 = EdgeVertices.terraceLerp(begin, end, i);
			c2 = HexMetrics.terraceLerpColor(beginCell.color, endCell.color, i);
			this.triangulateEdgeStrip(e1, c1, e2, c2, hasRoad);
		}

		this.triangulateEdgeStrip(e2, c2, end, endCell.color, hasRoad);
	}

	private triangulateWithRiver(direction: HexDirection, cell: HexCell, center: Vector3, e: EdgeVertices) {
		let centerL: Vector3;
		let centerR: Vector3;
		if (cell.hasRiverThroughEdge(HexDirectionUtils.opposite(direction))) {
			const offsetL = HexMetrics.getFirstSolidCorner(HexDirectionUtils.previous(direction)).multiplyScalar(0.25);
			centerL = Vec3.add(center, offsetL);
			const offsetR = HexMetrics.getSecondSolidCorner(HexDirectionUtils.next(direction)).multiplyScalar(0.25);
			centerR = Vec3.add(center, offsetR);
		} else if (cell.hasRiverThroughEdge(HexDirectionUtils.next(direction))) {
			centerL = center;
			centerR = Vec3.lerp(center, e.v5, 2 / 3);
		} else if (cell.hasRiverThroughEdge(HexDirectionUtils.previous(direction))) {
			centerL = Vec3.lerp(center, e.v1, 2 / 3);
			centerR = center;
		} else if (cell.hasRiverThroughEdge(HexDirectionUtils.next2(direction))) {
			centerL = center;
			const offsetR = HexMetrics.getSolidEdgeMiddle(HexDirectionUtils.next(direction)).multiplyScalar(0.5 * HexMetrics.innerToOuter);
			centerR = Vec3.add(center, offsetR);
		} else {
			const offsetL = HexMetrics.getSolidEdgeMiddle(HexDirectionUtils.previous(direction)).multiplyScalar(0.5 * HexMetrics.innerToOuter);
			centerL = Vec3.add(center, offsetL);
			centerR = center;
		}
		center = Vec3.lerp(centerL, centerR, 0.5);
		const m = new EdgeVertices(
			Vec3.lerp(centerL, e.v1, 0.5),
			Vec3.lerp(centerR, e.v5, 0.5),
			1 / 6
		);
		m.v3.y = center.y = e.v3.y;

		this.triangulateEdgeStrip(m, cell.color, e, cell.color);

		this.terrain.addTriangle(centerL, m.v1, m.v2);
		this.terrain.addTriangleColorSingle(cell.color);

		this.terrain.addQuad(centerL, center, m.v2, m.v3);
		this.terrain.addQuadColor1v(cell.color);
		this.terrain.addQuad(center, centerR, m.v3, m.v4);
		this.terrain.addQuadColor1v(cell.color);

		this.terrain.addTriangle(centerR, m.v4, m.v5);
		this.terrain.addTriangleColorSingle(cell.color);

		if (!cell.isUnderwater) {
			const reversed = cell.incomingRiver == direction;
			this.triangulateRiverQuadSameY(centerL, centerR, m.v2, m.v4, cell.riverSurfaceY, 0.4, reversed);
			this.triangulateRiverQuadSameY(m.v2, m.v4, e.v2, e.v4, cell.riverSurfaceY, 0.6, reversed);
		}
	}

	private triangulateWithRiverBeginOrEnd(cell: HexCell, center: Vector3, e: EdgeVertices) {
		const m = new EdgeVertices(
			Vec3.lerp(center, e.v1, 0.5),
			Vec3.lerp(center, e.v5, 0.5),
		);

		m.v3.y = e.v3.y;

		this.triangulateEdgeStrip(m, cell.color, e, cell.color);
		this.triangulateEdgeFan(center, m, cell.color);

		if (!cell.isUnderwater) {
			const reversed = cell.hasIncomingRiver;
			this.triangulateRiverQuadSameY(m.v2, m.v4, e.v2, e.v4, cell.riverSurfaceY, 0.6, reversed);

			center.y = m.v2.y = m.v4.y = cell.riverSurfaceY;
			this.rivers.addTriangle(center, m.v2, m.v4);
			if (reversed) {
				this.rivers.addTriangleUV(
					new Vector2(0.5, 0.4), new Vector2(1, 0.2), new Vector2(0, 0.2)
				);
			} else {
				this.rivers.addTriangleUV(
					new Vector2(0.5, 0.4), new Vector2(0, 0.6), new Vector2(1, 0.6)
				);
			}
		}
	}

	private triangulateAdjacentToRiver(direction: HexDirection, cell: HexCell, center: Vector3, e: EdgeVertices) {
		if (cell.hasRoads) {
			this.triangulateRoadAdjacentToRiver(direction, cell, center, e);
		}

		if (cell.hasRiverThroughEdge(HexDirectionUtils.next(direction))) {
			if (cell.hasRiverThroughEdge(HexDirectionUtils.previous(direction))) {
				const centerOffset = HexMetrics.getSolidEdgeMiddle(direction).multiplyScalar(HexMetrics.innerToOuter * 0.5);
				center = Vec3.add(center, centerOffset);
			} else if (cell.hasRiverThroughEdge(HexDirectionUtils.previous2(direction))) {
				const centerOffset = HexMetrics.getFirstSolidCorner(direction).multiplyScalar(0.25);
				center = Vec3.add(center, centerOffset);
			}
		} else if (cell.hasRiverThroughEdge(HexDirectionUtils.previous(direction)) && cell.hasRiverThroughEdge(HexDirectionUtils.next2(direction))) {
			const centerOffset = HexMetrics.getSecondSolidCorner(direction).multiplyScalar(0.25);
			center = Vec3.add(center, centerOffset);
		}
		const m = new EdgeVertices(
			Vec3.lerp(center, e.v1, 0.5),
			Vec3.lerp(center, e.v5, 0.5)
		);

		this.triangulateEdgeStrip(m, cell.color, e, cell.color);
		this.triangulateEdgeFan(center, m, cell.color);

		if (!cell.isUnderwater && !cell.hasRoadThroughEdge(direction)) {
			this.features.addFeature(cell, Vec3.addMany(center, e.v1, e.v5).multiplyScalar(1 / 3));
		}
	}

	showWireframe(show: boolean, type: MeshType) {
		switch (type) {
			case MeshType.Terrain:
				this.terrain.wireframeCopy.visible = show;
				break;
			case MeshType.Roads:
				this.roads.wireframeCopy.visible = show;
				break;
			case MeshType.Rivers:
				this.rivers.wireframeCopy.visible = show;
				break;
			case MeshType.Water:
				this.water.wireframeCopy.visible = show;
				break;
			case MeshType.WaterShore:
				this.waterShore.wireframeCopy.visible = show;
				break;
			case MeshType.Estuaries:
				this.estuaries.wireframeCopy.visible = show;
				break;
		}
	}

	triangulateRiverQuad(v1: Vector3, v2: Vector3, v3: Vector3, v4: Vector3,
	                     y1: number, y2: number, v: number, reversed: boolean) {
		v1 = v1.clone();
		v2 = v2.clone();
		v3 = v3.clone();
		v4 = v4.clone();

		v1.y = v2.y = y1;
		v3.y = v4.y = y2;
		this.rivers.addQuad(v1, v2, v3, v4);
		if (reversed) {
			this.rivers.addQuadUVNumbers(1, 0, 0.8 - v, 0.6 - v);
		} else {
			this.rivers.addQuadUVNumbers(0, 1, v, v + 0.2);
		}
	}

	triangulateRiverQuadSameY(v1: Vector3, v2: Vector3, v3: Vector3, v4: Vector3,
	                          y: number, v: number, reversed: boolean) {
		this.triangulateRiverQuad(v1, v2, v3, v4, y, y, v, reversed);
	}

	triangulateRoadSegment(
		v1: Vector3, v2: Vector3, v3: Vector3,
		v4: Vector3, v5: Vector3, v6: Vector3,
	) {
		this.roads.addQuad(v1, v2, v4, v5);
		this.roads.addQuad(v2, v3, v5, v6);
		this.roads.addQuadUVNumbers(0, 1, 0, 0);
		this.roads.addQuadUVNumbers(1, 0, 0, 0);
	}

	triangulateRoad(center: Vector3, mL: Vector3, mR: Vector3, e: EdgeVertices, hasRoadThroughEdge: boolean) {
		if (hasRoadThroughEdge) {
			center = center.clone();
			const mC = Vec3.lerp(mL, mR, 0.5);
			this.triangulateRoadSegment(mL, mC, mR, e.v2, e.v3, e.v4);
			this.roads.addTriangle(center, mL, mC);
			this.roads.addTriangle(center, mC, mR);
			this.roads.addTriangleUV(new Vector2(1, 0), new Vector2(0, 0), new Vector2(1, 0));
			this.roads.addTriangleUV(new Vector2(1, 0), new Vector2(1, 0), new Vector2(0, 0));
		} else {
			this.triangulateRoadEdge(center, mL, mR);
		}
	}

	triangulateRoadEdge(center: Vector3, mL: Vector3, mR: Vector3) {
		this.roads.addTriangle(center, mL, mR);
		this.roads.addTriangleUV(
			new Vector2(1, 0), new Vector2(0, 0), new Vector2(0, 0)
		);
	}

	getRoadInterpolators(direction: HexDirection, cell: HexCell): Vector3 {
		const interpolators = new Vector3();
		if (cell.hasRoadThroughEdge(direction)) {
			interpolators.x = interpolators.y = 0.5;
		} else {
			interpolators.x = cell.hasRoadThroughEdge(HexDirectionUtils.previous(direction)) ? 0.5 : 0.25;
			interpolators.y = cell.hasRoadThroughEdge(HexDirectionUtils.next(direction)) ? 0.5 : 0.25;
		}

		return interpolators;
	}

	private triangulateRoadAdjacentToRiver(direction: HexDirection, cell: HexCell, center: Vector3, e: EdgeVertices) {
		center = center.clone();
		const hasRoadThroughEdge = cell.hasRoadThroughEdge(direction);
		const previousHasRiver = cell.hasRiverThroughEdge(HexDirectionUtils.previous(direction));
		const nextHasRiver = cell.hasRiverThroughEdge(HexDirectionUtils.next(direction));
		const interpolators = this.getRoadInterpolators(direction, cell);
		const roadCenter = center.clone();

		if (cell.hasRiverBeginOrEnd) {
			const oppositeDirection = HexDirectionUtils.opposite(cell.riverBeginOrEndDirection);
			roadCenter.add(HexMetrics.getSolidEdgeMiddle(oppositeDirection).multiplyScalar(1 / 3));
		} else if (cell.incomingRiver == HexDirectionUtils.opposite(cell.outgoingRiver)) {
			let corner: Vector3;
			if (previousHasRiver) {
				if (
					!hasRoadThroughEdge &&
					!cell.hasRoadThroughEdge(HexDirectionUtils.next(direction))
				) {
					return;
				}
				corner = HexMetrics.getSecondSolidCorner(direction);
			} else {
				if (
					!hasRoadThroughEdge &&
					!cell.hasRoadThroughEdge(HexDirectionUtils.next(direction))
				) {
					return;
				}
				corner = HexMetrics.getFirstSolidCorner(direction);
			}
			const roadCenterOffset = corner.clone().multiplyScalar(0.5);
			roadCenter.add(roadCenterOffset);
			const centerOffset = corner.clone().multiplyScalar(0.25);
			center.add(centerOffset);
		} else if (cell.incomingRiver == HexDirectionUtils.previous(cell.outgoingRiver)) {
			roadCenter.sub(HexMetrics.getSecondCorner(cell.incomingRiver).multiplyScalar(0.2));
		} else if (cell.incomingRiver == HexDirectionUtils.next(cell.outgoingRiver)) {
			roadCenter.sub(HexMetrics.getFirstSolidCorner(cell.incomingRiver).multiplyScalar(0.2));
		} else if (previousHasRiver && nextHasRiver) {
			if (!hasRoadThroughEdge) {
				return;
			}
			const offset = HexMetrics.getSolidEdgeMiddle(direction).multiplyScalar(HexMetrics.innerToOuter);
			roadCenter.add(offset.clone().multiplyScalar(0.7));
			center.add(offset.clone().multiplyScalar(0.5));
		} else {
			let middle: HexDirection;
			if (previousHasRiver) {
				middle = HexDirectionUtils.next(direction);
			} else if (nextHasRiver) {
				middle = HexDirectionUtils.previous(direction);
			} else {
				middle = direction;
			}
			if (
				!cell.hasRoadThroughEdge(middle) &&
				!cell.hasRoadThroughEdge(HexDirectionUtils.previous(middle)) &&
				!cell.hasRoadThroughEdge(HexDirectionUtils.next(middle))
			) {
				return;
			}
			roadCenter.add(HexMetrics.getSolidEdgeMiddle(middle).multiplyScalar(0.25));
		}

		const mL = Vec3.lerp(roadCenter, e.v1, interpolators.x);
		const mR = Vec3.lerp(roadCenter, e.v5, interpolators.y);
		this.triangulateRoad(roadCenter, mL, mR, e, hasRoadThroughEdge);
		if (previousHasRiver) {
			this.triangulateRoadEdge(roadCenter, center, mL);
		}
		if (nextHasRiver) {
			this.triangulateRoadEdge(roadCenter, mR, center);
		}
	}

	triangulateWater(direction: HexDirection, cell: HexCell, center: Vector3) {
		center = center.clone();
		center.y = cell.waterSurfaceY;

		const neighbor = cell.getNeighbor(direction);
		if (neighbor != null && !neighbor.isUnderwater) {
			this.triangulateWaterShore(direction, cell, neighbor, center);
		} else {
			this.triangulateOpenWater(direction, cell, neighbor, center);
		}
	}

	private triangulateOpenWater(direction: HexDirection, cell: HexCell, neighbor: HexCell, center: Vector3) {
		const c1 = Vec3.add(center, HexMetrics.getFirstWaterCorner(direction));
		const c2 = Vec3.add(center, HexMetrics.getSecondWaterCorner(direction));

		this.water.addTriangle(center, c1, c2);

		if (direction <= HexDirection.SE && neighbor != null) {
			const bridge = HexMetrics.getWaterBridge(direction);
			const e1 = Vec3.add(c1, bridge);
			const e2 = Vec3.add(c2, bridge);

			this.water.addQuad(c1, c2, e1, e2);


			if (direction <= HexDirection.E) {
				const next = HexDirectionUtils.next(direction);
				const nextNeighbor = cell.getNeighbor(next);
				if (nextNeighbor == null || !nextNeighbor.isUnderwater) {
					return;
				}
				this.water.addTriangle(
					c2, e2, Vec3.add(c2, HexMetrics.getWaterBridge(next))
				);
			}
		}
	}

	private triangulateWaterShore(direction: HexDirection, cell: HexCell, neighbor: HexCell, center: Vector3) {
		center = center.clone();
		const e1 = new EdgeVertices(
			Vec3.add(center, HexMetrics.getFirstWaterCorner(direction)),
			Vec3.add(center, HexMetrics.getSecondWaterCorner(direction))
		);
		this.water.addTriangle(center, e1.v1, e1.v2);
		this.water.addTriangle(center, e1.v2, e1.v3);
		this.water.addTriangle(center, e1.v3, e1.v4);
		this.water.addTriangle(center, e1.v4, e1.v5);

		const center2 = neighbor.position.clone();
		center2.y = center.y;
		const e2 = new EdgeVertices(
			Vec3.add(center2, HexMetrics.getSecondSolidCorner(HexDirectionUtils.opposite(direction))),
			Vec3.add(center2, HexMetrics.getFirstSolidCorner(HexDirectionUtils.opposite(direction)))
		);
		if (cell.hasRiverThroughEdge(direction)) {
			this.triangulateEstuary(e1, e2, cell.incomingRiver == direction);
		} else {
			this.waterShore.addQuad(e1.v1, e1.v2, e2.v1, e2.v2);
			this.waterShore.addQuad(e1.v2, e1.v3, e2.v2, e2.v3);
			this.waterShore.addQuad(e1.v3, e1.v4, e2.v3, e2.v4);
			this.waterShore.addQuad(e1.v4, e1.v5, e2.v4, e2.v5);
			this.waterShore.addQuadUVNumbers(0, 0, 0, 1);
			this.waterShore.addQuadUVNumbers(0, 0, 0, 1);
			this.waterShore.addQuadUVNumbers(0, 0, 0, 1);
			this.waterShore.addQuadUVNumbers(0, 0, 0, 1);
		}

		const directionNext = HexDirectionUtils.next(direction);
		const nextNeighbor = cell.getNeighbor(directionNext);
		if (nextNeighbor != null) {
			const nextNeighborPos = nextNeighbor.position.clone();
			const prevDirection = HexDirectionUtils.previous(direction);
			const v3 = Vec3.add(
				nextNeighborPos,
				nextNeighbor.isUnderwater ? HexMetrics.getFirstWaterCorner(prevDirection) : HexMetrics.getFirstSolidCorner(prevDirection)
			);
			v3.y = center.y;
			this.waterShore.addTriangle(e1.v5, e2.v5, v3);
			this.waterShore.addTriangleUV(
				new Vector2(0, 0),
				new Vector2(0, 1),
				new Vector2(0, nextNeighbor.isUnderwater ? 0 : 1)
			);
		}
	}

	triangulateWaterfallInWater(v1: Vector3, v2: Vector3, v3: Vector3, v4: Vector3,
	                            y1: number, y2: number, waterY: number) {
		v1 = v1.clone();
		v2 = v2.clone();
		v3 = v3.clone();
		v4 = v4.clone();
		v1 = HexMetrics.perturb(v1);
		v2 = HexMetrics.perturb(v2);
		v3 = HexMetrics.perturb(v3);
		v4 = HexMetrics.perturb(v4);

		v1.y = v2.y = y1;
		v3.y = v4.y = y2;
		const t = (waterY - y2) / (y1 - y2);
		v3 = Vec3.lerp(v3, v1, t);
		v4 = Vec3.lerp(v4, v2, t);
		this.rivers.addQuadUnperturbed(v1, v2, v3, v4);
		this.rivers.addQuadUVNumbers(0, 1, 0.8, 1);
	}

	private triangulateEstuary(e1: EdgeVertices, e2: EdgeVertices, incomingRiver: boolean) {
		this.waterShore.addTriangle(e2.v1, e1.v2, e1.v1);
		this.waterShore.addTriangle(e2.v5, e1.v5, e1.v4);
		this.waterShore.addTriangleUV(new Vector2(0, 1), new Vector2(0, 0), new Vector2(0, 0));
		this.waterShore.addTriangleUV(new Vector2(0, 1), new Vector2(0, 0), new Vector2(0, 0));

		this.estuaries.addQuad(e2.v1, e1.v2, e2.v2, e1.v3);
		this.estuaries.addTriangle(e1.v3, e2.v2, e2.v4);
		this.estuaries.addQuad(e1.v3, e1.v4, e2.v4, e2.v5);

		this.estuaries.addQuadUV(
			new Vector2(0, 1), new Vector2(0, 0),
			new Vector2(1, 1), new Vector2(0, 0)
		);
		this.estuaries.addTriangleUV(
			new Vector2(0, 0), new Vector2(1, 1), new Vector2(1, 1)
		);
		this.estuaries.addQuadUV(
			new Vector2(0, 0), new Vector2(0, 0),
			new Vector2(1, 1), new Vector2(0, 1)
		);

		if (incomingRiver) {
			this.estuaries.addQuadUV2(
				new Vector2(1.5, 1), new Vector2(0.7, 1.15),
				new Vector2(1, 0.8), new Vector2(0.5, 1.1)
			);
			this.estuaries.addTriangleUV2(
				new Vector2(0.5, 1.1),
				new Vector2(1, 0.8),
				new Vector2(0, 0.8)
			);
			this.estuaries.addQuadUV2(
				new Vector2(0.5, 1.1), new Vector2(0.3, 1.15),
				new Vector2(0, 0.8), new Vector2(-0.5, 1)
			);
		} else {
			this.estuaries.addQuadUV2(
				new Vector2(-0.5, -0.2), new Vector2(0.3, -0.35),
				new Vector2(0, 0), new Vector2(0.5, -0.3)
			);
			this.estuaries.addTriangleUV2(
				new Vector2(0.5, -0.3),
				new Vector2(0, 0),
				new Vector2(1, 0)
			);
			this.estuaries.addQuadUV2(
				new Vector2(0.5, -0.3), new Vector2(0.7, -0.35),
				new Vector2(1, 0), new Vector2(1.5, -0.2)
			);
		}
	}

}
