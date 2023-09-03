import {FullScreenScene} from "../lib/scene/FullScreenScene";
import {HexGrid} from "./HexGrid";
import {Vector3} from "../lib/Vector3";

export class HexMapScene extends FullScreenScene {

    onInit() {
        this.mainCamera.position.set(0,100,0)
        this.mainCamera.lookAt(Vector3.zero)

        // SceneUtils.addDefaultCube(this)
        let grid = new HexGrid(this)

    }
}