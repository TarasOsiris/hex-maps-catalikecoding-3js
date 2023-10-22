import {Scene, Vector3} from "three";
import {CubeFeature} from "./CubeFeature";

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
        instance.position.copy(position);
        instance.position.setY(instance.position.y + instance.scale.y * 0.5);
        this._scene.add(instance);
    }
}
