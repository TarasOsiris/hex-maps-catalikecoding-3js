import {FullScreenScene} from "../../lib/scene/FullScreenScene";
import {HexGrid} from "../HexGrid";
import {Vector3} from "../../lib/math/Vector3";
import * as THREE from "three";

export class HexMapScene extends FullScreenScene {

    raycaster = new THREE.Raycaster()

    onInit() {
        this.mainCamera.position.set(0,100,0)
        this.mainCamera.lookAt(Vector3.zero)

        // SceneUtils.addDefaultCube(this)
        let grid = new HexGrid(this, this.gui)

    }
}