import {FullScreenScene} from "../../lib/scene/FullScreenScene";
import {HexGrid} from "../HexGrid";
import {Vector3} from "../../lib/math/Vector3";
import * as THREE from "three";
import {BoxGeometry, CameraHelper, MeshBasicMaterial} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {or} from "three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements";
import {HexMetrics} from "../HexMetrics";

export class HexMapScene extends FullScreenScene {

    raycaster = new THREE.Raycaster()

    private colors: Array<THREE.Color> = new Array<THREE.Color>(
        new THREE.Color(1, 0, 0),
        new THREE.Color(0, 1, 0),
        new THREE.Color(0, 0, 1),
    )
    private activeColor: THREE.Color = new THREE.Color(0, 1, 0)

    onInit() {
        // SceneUtils.addDefaultCube(this)
        let grid = new HexGrid(this, this.gui, mesh => {
            let boundingBox = mesh.geometry.boundingBox!!;
            let center = boundingBox.getCenter(new THREE.Vector3());

            let orbitControls = new OrbitControls(this.mainCamera, this.canvas);
            orbitControls.target = center

            this.mainCamera.position.set(center.x, 120, center.z)
            this.mainCamera.lookAt(center)
        })

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