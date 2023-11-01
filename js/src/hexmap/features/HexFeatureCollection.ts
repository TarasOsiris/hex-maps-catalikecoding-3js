import { CubeFeature } from "./CubeFeature";

export class HexFeatureCollection {
    private readonly _prefabs: CubeFeature[];

    constructor(...prefabs: CubeFeature[]) {
        this._prefabs = prefabs;
    }

    pick(choice: number) {
        return this._prefabs[Math.floor(choice * this._prefabs.length)];
    }
}
