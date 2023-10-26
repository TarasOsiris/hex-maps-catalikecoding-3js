import {Group, Scene, Vector3} from "three";
import {CubeFeature} from "./CubeFeature";
import {HexMetrics} from "../HexMetrics";
import {Vec3} from "../../lib/math/Vec3";
import {HexCell} from "../HexCell";

export class HexFeatureManager {
    private _scene: Scene;
    private readonly _container: Group;

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
        if (hash.a >= cell.urbanLevel * 0.25) {
            return;
        }
        const instance = new CubeFeature();
        this._scene.add(instance);

        position = position.clone();

        const worldPos = HexMetrics.perturb(position);
        instance.position.copy(Vec3.add(worldPos, instance.position));
        instance.rotation.set(0, 360 * hash.b, 0);
        this._container.attach(instance);
    }
}
