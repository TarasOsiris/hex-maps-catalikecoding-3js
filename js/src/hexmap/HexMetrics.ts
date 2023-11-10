import {Color, MathUtils, Vector2, Vector3, Vector4} from "three";
import {HexDirection} from "./HexDirection";
import {HexEdgeType} from "./HexEdgeType";
import {Vec3} from "../lib/math/Vec3";
import * as isaac from "isaac";
import {HexHash} from "./features/HexHash";

export class HexMetrics {
	static readonly outerRadius = 10;
	static readonly outerToInner = 0.866025404;
	static readonly innerToOuter = 1 / this.outerToInner;
	static readonly innerRadius = this.outerRadius * this.outerToInner;
	static readonly solidFactor = 0.8;
	static readonly waterFactor = 0.6;
	static readonly blendFactor = 1 - this.solidFactor;
	static readonly waterBlendFactor = 1 - this.waterFactor;

	static readonly elevationStep = 3;
	static readonly terracesPerSlope = 2;
	static readonly terraceSteps = HexMetrics.terracesPerSlope * 2 + 1;

	private static invZ = -1;

	static readonly cellPerturbStrength = 4; // 4
	static readonly elevationPerturbStrength = 1.5; // 1.5

	private static noise: Array<Color>;
	private static noiseTextureSize = 512;
	public static noiseScale = 0.003;

	public static readonly hashGridSize = 256;
	public static readonly hashGridScale = 0.25;
	private static readonly featureThresholds: number[][] = [
		[0.0, 0.0, 0.4],
		[0.0, 0.4, 0.6],
		[0.4, 0.6, 0.8],
	];

	private static _hashGrid: Array<HexHash>;

	static readonly chunkSizeX = 5;
	static readonly chunkSizeZ = 5;

	static readonly streamBedElevationOffset = -1.75;

	static readonly waterElevationOffset = -0.5;

	static readonly wallHeight = 3;

	private static corners = [
		new Vector3(0, 0, HexMetrics.invZ * this.outerRadius),
		new Vector3(this.innerRadius, 0, HexMetrics.invZ * 0.5 * this.outerRadius),
		new Vector3(this.innerRadius, 0, HexMetrics.invZ * -0.5 * this.outerRadius),
		new Vector3(0, 0, HexMetrics.invZ * -this.outerRadius),
		new Vector3(-this.innerRadius, 0, HexMetrics.invZ * -0.5 * this.outerRadius),
		new Vector3(-this.innerRadius, 0, HexMetrics.invZ * 0.5 * this.outerRadius),
		new Vector3(0, 0, HexMetrics.invZ * this.outerRadius),
	];

	public static getFirstCorner(direction: HexDirection): Vector3 {
		return HexMetrics.corners[direction]!.clone();
	}

	public static getSecondCorner(direction: HexDirection): Vector3 {
		return HexMetrics.corners[direction + 1]!.clone();
	}

	public static getFirstSolidCorner(direction: HexDirection): Vector3 {
		return Vec3.mulScalar(HexMetrics.corners[direction], this.solidFactor);
	}

	public static getSecondSolidCorner(direction: HexDirection): Vector3 {
		return Vec3.mulScalar(HexMetrics.corners[direction + 1], this.solidFactor);
	}

	public static getFirstWaterCorner(direction: HexDirection): Vector3 {
		return Vec3.mulScalar(HexMetrics.corners[direction], this.waterFactor);
	}

	public static getSecondWaterCorner(direction: HexDirection): Vector3 {
		return Vec3.mulScalar(HexMetrics.corners[direction + 1], this.waterFactor);
	}

	public static getSolidEdgeMiddle(direction: HexDirection): Vector3 {
		const cornersSum = this.corners[direction].clone().add(this.corners[direction + 1]);
		return cornersSum.multiplyScalar(0.5 * this.solidFactor);
	}

	public static getBridge(direction: HexDirection) {
		const corner1 = this.getFirstCorner(direction);
		const corner2 = this.getSecondCorner(direction);
		return corner1.add(corner2).multiplyScalar(this.blendFactor);
	}

	public static getWaterBridge(direction: HexDirection) {
		const corner1 = this.getFirstCorner(direction);
		const corner2 = this.getSecondCorner(direction);
		return corner1.add(corner2).multiplyScalar(this.waterBlendFactor);
	}

	static readonly horizontalTerraceStepSize = 1 / HexMetrics.terraceSteps;
	static readonly verticalTerraceStepSize = 1 / (HexMetrics.terracesPerSlope + 1);

	public static terraceLerp(a: Vector3, b: Vector3, step: number): Vector3 {
		const h = step * this.horizontalTerraceStepSize;
		const result = a.clone();
		result.x += (b.x - a.x) * h;
		result.z += (b.z - a.z) * h;
		const v = Math.floor(((step + 1) / 2)) * HexMetrics.verticalTerraceStepSize;
		result.y += (b.y - a.y) * v;
		return result;
	}

	public static terraceLerpColor(a: Color, b: Color, step: number) {
		const h = step * HexMetrics.horizontalTerraceStepSize;
		return new Color().lerpColors(a, b, h);
	}

	public static getEdgeType(elevation1: number, elevation2: number): HexEdgeType {
		if (elevation1 == elevation2) {
			return HexEdgeType.Flat;
		}
		const delta = elevation2 - elevation1;
		if (delta == 1 || delta == -1) {
			return HexEdgeType.Slope;
		}
		return HexEdgeType.Cliff;
	}

	public static setNoise(noise: Array<Color>, size: number) {
		HexMetrics.noise = noise;
		HexMetrics.noiseTextureSize = size;
		this.initializeHashGrid(1234);
	}

	public static sampleNoise(position: Vector3): Vector4 {
		const x = position.x * this.noiseScale;
		const z = -position.z * this.noiseScale;
		const wrappedUVs = this.wrapToUV(new Vector2(x, z));

		const xInd = Math.floor(MathUtils.lerp(0, this.noiseTextureSize - 1, wrappedUVs.x));
		const zInd = Math.floor(MathUtils.lerp(0, this.noiseTextureSize - 1, wrappedUVs.y));

		const color = this.noise[xInd * this.noiseTextureSize + zInd]!;
		return new Vector4(color.r, color.g, color.b, 0);
	}

	private static wrapToUV(texCoord: Vector2) {
		const integerPart = new Vector2(Math.floor(texCoord.x), Math.floor(texCoord.y));
		return texCoord.clone().sub(integerPart);
	}

	static perturb(position: Vector3): Vector3 {
		const result = position.clone();
		const sample = HexMetrics.sampleNoise(position);
		result.x += (sample.x * 2 - 1) * HexMetrics.cellPerturbStrength;
		result.z += (sample.z * 2 - 1) * HexMetrics.cellPerturbStrength;
		return result;
	}

	public static initializeHashGrid(seed: number) {
		this._hashGrid = new Array<HexHash>(this.hashGridSize * this.hashGridSize);
		isaac.seed(seed);
		for (let i = 0; i < this._hashGrid.length; i++) {
			this._hashGrid[i] = HexHash.Create();
		}
		isaac.reset();
	}

	public static sampleHashGrid(position: Vector3): HexHash {
		let x = Math.floor(position.x * this.hashGridScale) % this.hashGridSize;
		if (x < 0) {
			x += this.hashGridSize;
		}
		let z = Math.floor(position.z * this.hashGridScale) % this.hashGridSize;
		if (z < 0) {
			z += this.hashGridSize;
		}
		return this._hashGrid[x + z * this.hashGridSize];
	}

	public static getFeatureThresholds(level: number) {
		return this.featureThresholds[level];
	}
}
