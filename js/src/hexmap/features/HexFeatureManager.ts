import {Group, Scene, Vector3} from "three";
import {CubeFeature} from "./CubeFeature";
import {HexMetrics} from "../HexMetrics";
import {Vec3} from "../../lib/math/Vec3";

export class HexFeatureManager {
    private _scene: Scene;
    private _container: Group;

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

    addFeature(position: Vector3) {
        const instance = new CubeFeature();
        this._scene.add(instance);

        position = position.clone();

        const worldPos = HexMetrics.perturb(position);
        instance.position.copy(Vec3.add(worldPos, instance.position));
        this._container.attach(instance);
    }
}
