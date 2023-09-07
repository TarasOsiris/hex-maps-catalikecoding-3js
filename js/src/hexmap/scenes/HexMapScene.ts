import {FullScreenScene} from "../../lib/scene/FullScreenScene";
import {HexGrid} from "../HexGrid";
import {Vector3} from "../../lib/math/Vector3";
import * as THREE from "three";

export class HexMapScene extends FullScreenScene {

    raycaster = new THREE.Raycaster()

    private colors: Array<THREE.Color> = new Array<THREE.Color>(
        new THREE.Color(1, 0, 0),
        new THREE.Color(0, 1, 0),
        new THREE.Color(1, 0, 1),
    )
    private activeColor: THREE.Color = new THREE.Color(0, 1, 0)

    onInit() {
        this.mainCamera.position.set(0, 100, 0)
        this.mainCamera.lookAt(Vector3.zero)

        // SceneUtils.addDefaultCube(this)
        let grid = new HexGrid(this, this.gui)

        this.handleMouseClicks(grid)

        let folder = this.gui.addFolder("Colors");
        this.colors.forEach((_, idx) => {
            folder.addColor(this.colors, idx.toString())
        })
        folder.add(this, 'selectTestColor')
    }

    private handleMouseClicks(grid: HexGrid) {
        this.setOnMouseDownListener(mouseCoordinate => {
            this.raycaster.setFromCamera(mouseCoordinate, this.mainCamera)
            const intersects = this.raycaster.intersectObjects(this.children)
            if (intersects.length > 0) {
                grid.colorCell(intersects[0].point, this.activeColor);
            }
        })
    }

    selectTestColor() {
        this.selectColor(2)
    }

    selectColor(index: number) {
        this.activeColor = this.colors[index]
    }
}