import {FullScreenScene} from "../../lib/scene/FullScreenScene";
import {HexGrid} from "../HexGrid";
import * as THREE from "three";
import {HexCell} from "../HexCell";
import {ColorUtils} from "../../lib/ColorUtils";
import {Font, FontLoader} from "three/examples/jsm/loaders/FontLoader";
import {Texture} from "three";
import {HexMetrics} from "../HexMetrics";
import {HexMapCamera} from "../HexMapCamera";
import {HexCoordinates} from "../HexCoordinates";

export class HexMapScene extends FullScreenScene {

    private hexGrid!: HexGrid;
    raycaster = new THREE.Raycaster()
    private loadingManager = new THREE.LoadingManager()
    private fontLoader: FontLoader = new FontLoader(this.loadingManager)
    private textureLoader: THREE.TextureLoader = new THREE.TextureLoader(this.loadingManager)

    private font!: Font
    private noiseTexture!: Texture

    private inspectorControls = {
        selectedColorIndex: 0,
        applyElevation: true,
        activeElevation: 3,
        brushSize: 2,
        showUI: true
    }

    private colors: Array<THREE.Color> = new Array<THREE.Color>(ColorUtils.red, ColorUtils.green, new THREE.Color(0x548af9),)

    hexMapCamera!: HexMapCamera

    private input = {xDelta: 0, zDelta: 0, rotationDelta: 0}
    private _isReady: boolean = false;

    onInit() {
        this.loadingManager.onLoad = () => {
            this.onLoadingFinished()
            this._isReady = true
        }
        this.textureLoader.load('/textures/noise.png', (tex) => {
            this.noiseTexture = tex
        })
        this.fontLoader.load('/fonts/roboto.json', (font) => {
            this.font = font
        })

        const folder = this.gui.addFolder("Colors");
        folder.add(this, 'clearColor').name('Clear')
        folder.add(this, 'selectTestColor1').name('Red')
        folder.add(this, 'selectTestColor2').name('Green')
        folder.add(this, 'selectTestColor3').name('Blue')
        this.gui.add(this.inspectorControls, 'activeElevation').name('Cell elevation').min(0).max(6).step(1)
        this.gui.add(this.inspectorControls, 'applyElevation').name('Apply elevation?')
        this.gui.add(this.inspectorControls, 'brushSize').name('Brush Size').min(0).max(4).step(1)
        this.gui.add(this.inspectorControls, 'showUI').name('Labels').onChange(() => {
            this.hexGrid.showLabels(this.inspectorControls.showUI)
        })
    }

    update(dt: number) {
        if (!this._isReady) return
        if (this.input.xDelta != 0 || this.input.zDelta != null) {
            this.hexMapCamera.adjustPosition(this.input.xDelta, this.input.zDelta, dt)
        }
        if (this.input.rotationDelta != 0) {
            this.hexMapCamera.adjustRotation(this.input.rotationDelta, dt)
        }

        super.update(dt);
    }

    private processNoiseTexture() {
        // TODO refactor
        this.noiseTexture.generateMipmaps = false
        this.noiseTexture.minFilter = THREE.LinearFilter
        this.noiseTexture.magFilter = THREE.LinearFilter
        this.noiseTexture.colorSpace = "srgb-linear"
        this.noiseTexture.needsUpdate = true // TODO do we need this?

        const canvas = document.createElement('canvas');
        document.body.appendChild(canvas)
        canvas.width = this.noiseTexture.image.width;
        canvas.height = this.noiseTexture.image.height;

        const context = canvas.getContext('2d')!;
        context.drawImage(this.noiseTexture.image, 0, 0);

        const data = context.getImageData(0, 0, canvas.width, canvas.height).data;

        const colors: THREE.Color[] = [];

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i] / 255;
            const g = data[i + 1] / 255;
            const b = data[i + 2] / 255;

            colors.push(new THREE.Color(r, g, b));
        }
        // TODO make sure it's correctly disposed
        document.body.removeChild(canvas)

        HexMetrics.noise = colors
    }

    private onLoadingFinished() {
        this.processNoiseTexture();

        this.hexGrid = new HexGrid(this, this.font)
        // const boundingBox = this.hexGrid.hexMesh.geometry.boundingBox!;
        // const center = boundingBox.getCenter(new THREE.Vector3());

        // const orbitControls = new OrbitControls(this.mainCamera, this.canvas);

        this.mainCamera.near = 0.3
        this.mainCamera.far = 1000
        this.mainCamera.fov = 60

        this.hexMapCamera = new HexMapCamera(this.mainCamera, this.hexGrid)
        this.add(this.hexMapCamera)

        this.addLighting(new THREE.Vector3());
        this.handleInput(this.hexGrid)
    }

    private addLighting(center: THREE.Vector3) {
        const ambientLight = new THREE.AmbientLight(ColorUtils.white, 1);
        this.add(ambientLight)
        const directionalLight = new THREE.DirectionalLight(ColorUtils.white, 1.5);
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
        // const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 10, 0xff0000);
        // this.add(directionalLightHelper)
    }

    private handleInput(grid: HexGrid) {
        this.mouseDownListener = mouseCoordinate => {
            this.raycaster.setFromCamera(mouseCoordinate, this.mainCamera)
            const intersects = this.raycaster.intersectObjects(this.children)
            if (intersects.length > 0) {
                if (intersects[0]!.object.type != 'Mesh' /* Can also use name */) {
                    return
                }
                const cell = grid.getCell(intersects[0].point);
                this.editCells(cell);
                this.hexGrid.refreshDirty()
            }
        }
        this.mouseWheelListener = zoomDelta => this.hexMapCamera.adjustZoom(zoomDelta)
        this.keysListener = (deltaX, deltaZ, deltaRotation) => {
            this.input.xDelta = deltaX
            this.input.zDelta = deltaZ
            this.input.rotationDelta = deltaRotation
        }
    }

    editCells(center: HexCell) {
        const centerX = center.coordinates.x
        const centerZ = center.coordinates.z

        const brushSize = this.inspectorControls.brushSize;
        for (let r = 0, z = centerZ - brushSize; z <= centerZ; z++, r++) {
            for (let x = centerX - r; x <= centerX + brushSize; x++) {
                this.editCell(this.hexGrid.getCellByCoords(new HexCoordinates(x, z)));
            }
        }
        for (let r = 0, z = centerZ + brushSize; z > centerZ; z--, r++) {
            for (let x = centerX - brushSize; x <= centerX + r; x++) {
                this.editCell(this.hexGrid.getCellByCoords(new HexCoordinates(x, z)));
            }
        }
    }

    editCell(cell: null | HexCell) {
        if (cell) {
            const applyColor = this.inspectorControls.selectedColorIndex >= 0
            if (applyColor) {
                cell.color = this.colors[this.inspectorControls.selectedColorIndex].clone()
            }
            if (this.inspectorControls.applyElevation) {
                cell.elevation = this.inspectorControls.activeElevation
            }
        }
    }

    clearColor() {
        this.inspectorControls.selectedColorIndex = -1
    }

    selectTestColor1() {
        this.inspectorControls.selectedColorIndex = 0
        console.log(this.inspectorControls.selectedColorIndex)
    }

    selectTestColor2() {
        this.inspectorControls.selectedColorIndex = 1
    }

    selectTestColor3() {
        this.inspectorControls.selectedColorIndex = 2
    }
}