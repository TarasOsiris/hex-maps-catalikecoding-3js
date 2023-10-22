import {Scene, Vector3} from "three";
import {CubeFeature} from "./CubeFeature";
import {HexMetrics} from "../HexMetrics";
import {Vec3} from "../../lib/math/Vec3";

export class HexFeatureManager {
    private _scene: Scene;

    constructor(scene: Scene) {
        this._scene = scene;
    }

    clear(): void {
    }

    apply(): void {

    }

    addFeature(position: Vector3) {
        const instance = new CubeFeature();
        this._scene.add(instance);

        position = position.clone();


        const worldPos = HexMetrics.perturb(position);
        instance.position.copy(Vec3.add(worldPos, instance.position));
    }
}
