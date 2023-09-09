import {FullScreenScene} from "../../lib/scene/FullScreenScene";
import {HexGrid} from "../HexGrid";
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {HexCell} from "../HexCell";
import {CameraHelper} from "three";

export class HexMapScene extends FullScreenScene {

    private hexGrid!: HexGrid;
    raycaster = new THREE.Raycaster()

    private colors: Array<THREE.Color> = new Array<THREE.Color>(
        new THREE.Color(1, 0, 0),
        new THREE.Color(0, 1, 0),
        new THREE.Color(0, 0, 1),
    )
    private activeColor: THREE.Color = new THREE.Color(0, 1, 0)
    private activeElevation = 3

    onInit() {


        // SceneUtils.addDefaultCube(this)
        this.hexGrid = new HexGrid(this, this.gui, mesh => {
            let boundingBox = mesh.geometry.boundingBox!!;
            let center = boundingBox.getCenter(new THREE.Vector3());

            let orbitControls = new OrbitControls(this.mainCamera, this.canvas);
            orbitControls.target = center

            this.mainCamera.position.set(center.x, 120, center.z)
            this.mainCamera.lookAt(center)
            this.addLighting(center);
        })

        this.handleMouseClicks(this.hexGrid)

        let folder = this.gui.addFolder("Colors");
        this.colors.forEach((_, idx) => {
            folder.addColor(this.colors, idx.toString())
        })
        folder.add(this, 'selectTestColor')
        this.gui.add(this, 'activeElevation').min(0).max(6).step(1)
    }

    private addLighting(center: THREE.Vector3) {
        let ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.add(ambientLight)
        let directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(0, 25, 25)
        directionalLight.castShadow = true
        directionalLight.shadow.mapSize.width = 1024
        directionalLight.shadow.mapSize.height = 1024
        directionalLight.shadow.camera.near = 0.1
        directionalLight.shadow.camera.far = 100
        directionalLight.shadow.camera.top = 100
        directionalLight.shadow.camera.bottom = -10
        directionalLight.shadow.camera.left = -10
        directionalLight.shadow.camera.right = 100
        directionalLight.shadow.camera.lookAt(center)
        // this.add(new CameraHelper(directionalLight.shadow.camera))
        this.add(directionalLight)
        // let directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 10, 0xff0000);
        // this.add(directionalLightHelper)
    }

    private handleMouseClicks(grid: HexGrid) {
        this.setOnMouseDownListener(mouseCoordinate => {
            this.raycaster.setFromCamera(mouseCoordinate, this.mainCamera)
            const intersects = this.raycaster.intersectObjects(this.children)
            if (intersects.length > 0) {
                if (intersects[0].object.type != 'Mesh') {
                    return
                }
                this.editCell(grid.getCell(intersects[0].point));
            }
        })
    }

    editCell(cell: HexCell) {
        cell.color = this.activeColor.clone()
        cell.elevation = this.activeElevation
        this.hexGrid.refresh()
    }

    selectTestColor() {
        this.selectColor(2)
    }

    selectColor(index: number) {
        this.activeColor = this.colors[index]
    }
}