import {FullScreenScene} from "../../lib/scene/FullScreenScene";
import {HexGrid} from "../HexGrid";
import {HexCell} from "../HexCell";
import {ColorUtils} from "../../lib/ColorUtils";
import {Font, FontLoader} from "three/examples/jsm/loaders/FontLoader";
import {HexMapCamera} from "../HexMapCamera";
import {HexCoordinates} from "../HexCoordinates";
import {HexSceneUtils} from "../util/HexSceneUtils";
import {OptionalToggle} from "../util/OptionalToggle";
import {Nullable} from "../../lib/types/Types";
import {HexDirection, HexDirectionUtils} from "../HexDirection";
import {ColliderLayers} from "../ColliderLayers";
import {HexMaterials} from "../util/HexMaterials";
import {
    AmbientLight,
    Color,
    DirectionalLight,
    LoadingManager, Mesh,
    PerspectiveCamera,
    Raycaster, SphereGeometry,
    TextureLoader, Vector2,
    Vector3
} from "three";
import {CustomMat} from "../shaders/experiments/CustomMat";

export class HexMapScene extends FullScreenScene {

    private hexGrid!: HexGrid;
    private raycaster = new Raycaster();
    private loadingManager = new LoadingManager();
    private fontLoader = new FontLoader(this.loadingManager);
    private textureLoader = new TextureLoader(this.loadingManager);

    private font!: Font;

    private inspectorControls = {
        selectedColorIndex: -1,
        applyElevation: true,
        applyWaterLevel: true,
        activeElevation: 0,
        activeWaterLevel: 0,
        brushSize: 0,
        showLabels: false,
        riverMode: OptionalToggle.Ignore.valueOf(),
        roadMode: OptionalToggle.Yes.valueOf(),
        wireframe: false,
        showRivers: true
    };

    private colors: Array<Color> = new Array<Color>(ColorUtils.red, ColorUtils.green, new Color(0x548af9),);

    hexMapCamera!: HexMapCamera;

    private input = {xDelta: 0, zDelta: 0, rotationDelta: 0};
    private _isReady: boolean = false;

    private _isDrag = false;
    private _dragDirection: Nullable<HexDirection> = null;
    private _previousCell: Nullable<HexCell> = null;

    onInit() {
        this.loadingManager.onLoad = () => {
            this.onLoadingFinished();
            this._isReady = true;
        };
        this.textureLoader.load('/textures/noise.png', (tex) => {
            HexSceneUtils.processNoiseTexture(tex);
            HexMaterials.createMaterials(tex);
        });
        this.fontLoader.load('/fonts/roboto.json', (font) => {
            this.font = font;
        });

        const folder = this.gui.addFolder("Colors");
        folder.add(this, 'clearColor').name('Clear');
        folder.add(this, 'selectTestColor1').name('Red');
        folder.add(this, 'selectTestColor2').name('Green');
        folder.add(this, 'selectTestColor3').name('Blue');
        this.gui.add(this.inspectorControls, 'activeElevation').name('Cell elevation').min(0).max(6).step(1);
        this.gui.add(this.inspectorControls, 'applyElevation').name('Apply elevation?');
        this.gui.add(this.inspectorControls, 'activeWaterLevel').name('Cell water level').min(0).max(6).step(1);
        this.gui.add(this.inspectorControls, 'applyWaterLevel').name('Apply water level?');
        this.gui.add(this.inspectorControls, 'brushSize').name('Brush Size').min(0).max(4).step(1);
        this.gui.add(this.inspectorControls, 'showLabels').name('Labels').onChange(() => {
            this.showLabels(this.inspectorControls.showLabels);
        });
        const toggleOptions = {
            "Ignore": OptionalToggle.Ignore.valueOf(),
            "Yes": OptionalToggle.Yes.valueOf(),
            "No": OptionalToggle.No.valueOf()
        };
        this.gui.add(this.inspectorControls, 'riverMode', toggleOptions).name('River');
        this.gui.add(this.inspectorControls, 'roadMode', toggleOptions).name('Road');

        this.gui.add(this.inspectorControls, 'wireframe').onChange((value: boolean) => {
            this.hexGrid.showWireframe(value);
        });
        this.gui.add(this.inspectorControls, 'showRivers').onChange((value: boolean) => {
            this.hexGrid.showRivers(value);
        });
    }

    private showLabels(show: boolean) {
        this.hexGrid.showLabels(show);
    }

    update(dt: number) {
        if (!this._isReady) return;
        if (this.input.xDelta != 0 || this.input.zDelta != null) {
            this.hexMapCamera.adjustPosition(this.input.xDelta, this.input.zDelta, dt);
        }
        if (this.input.rotationDelta != 0) {
            this.hexMapCamera.adjustRotation(this.input.rotationDelta, dt);
        }

        if (!this.isMousePressed) {
            this._previousCell = null;
        }

        super.update(dt);
    }


    private onLoadingFinished() {
        this.hexGrid = new HexGrid(this, this.font);
        this.setInspectorDefaults();

        this.mainCamera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.3, 1000);
        this.hexMapCamera = new HexMapCamera(this.mainCamera, this.hexGrid);
        this.add(this.hexMapCamera);

        this.addLighting(new Vector3());
        this.handleInput(this.hexGrid);

        // TODO make proper materials for everything
        // const material = new CustomMat();
        // const sphere = new Mesh(new SphereGeometry(10), material);
        // console.log(material.uniforms);
        // this.add(sphere);
    }

    private setInspectorDefaults() {
        this.showLabels(this.inspectorControls.showLabels);
        this.hexGrid.showWireframe(this.inspectorControls.wireframe);
    }

    private addLighting(center: Vector3) {
        const ambientLight = new AmbientLight(ColorUtils.white, 1);
        this.add(ambientLight);
        const directionalLight = new DirectionalLight(ColorUtils.white, 1.5);
        directionalLight.position.set(0, 25, 25);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -10;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.lookAt(center);
        // this.add(new CameraHelper(directionalLight.shadow.camera));
        this.add(directionalLight);
        // TODO fix lighting
        // const directionalLightHelper = new DirectionalLightHelper(directionalLight, 10, 0xff0000);
        // this.add(directionalLightHelper);
    }

    private handleInput(grid: HexGrid) {
        const mouseListener = (mouseCoordinate: Vector2) => {
            this.raycaster.layers.set(ColliderLayers.Collidable);
            this.raycaster.setFromCamera(mouseCoordinate, this.mainCamera);
            const intersects = this.raycaster.intersectObjects(this.children);
            if (intersects.length > 0 && intersects[0]!.object.type == 'Mesh') {
                const currentCell = grid.getCell(intersects[0].point);
                if (this._previousCell && this._previousCell != currentCell) {
                    this.validateDrag(currentCell);
                } else {
                    this._isDrag = false;
                }
                this.editCells(currentCell);
                this.hexGrid.refreshDirty();
                this._previousCell = currentCell;
            } else {
                this._previousCell = null;
            }
        };
        this.mouseDownListener = mouseListener;
        this.mouseDragListener = mouseListener;
        this.mouseWheelListener = zoomDelta => this.hexMapCamera.adjustZoom(zoomDelta);
        this.keysListener = (deltaX, deltaZ, deltaRotation) => {
            this.input.xDelta = deltaX;
            this.input.zDelta = deltaZ;
            this.input.rotationDelta = deltaRotation;
        };
    }

    editCells(center: HexCell) {
        const centerX = center.coordinates.x;
        const centerZ = center.coordinates.z;

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
            const applyColor = this.inspectorControls.selectedColorIndex >= 0;
            if (applyColor) {
                cell.color = this.colors[this.inspectorControls.selectedColorIndex].clone();
            }
            if (this.inspectorControls.applyElevation) {
                cell.elevation = this.inspectorControls.activeElevation;
            }
            if (this.inspectorControls.applyWaterLevel) {
                cell.waterLevel = this.inspectorControls.activeWaterLevel;
            }
            if (this.inspectorControls.riverMode == OptionalToggle.No) {
                cell.removeRiver();
            }
            if (this.inspectorControls.roadMode == OptionalToggle.No) {
                cell.removeRoads();
            }

            if (this._isDrag) {
                const otherCell = cell.getNeighbor(HexDirectionUtils.opposite(this._dragDirection!));
                if (otherCell) {
                    if (this.inspectorControls.riverMode == OptionalToggle.Yes) {
                        otherCell.setOutgoingRiver(this._dragDirection!);
                    }
                    if (this.inspectorControls.roadMode == OptionalToggle.Yes) {
                        otherCell.addRoad(this._dragDirection!);
                    }
                }
            }
        }
    }

    clearColor() {
        this.inspectorControls.selectedColorIndex = -1;
    }

    selectTestColor1() {
        this.inspectorControls.selectedColorIndex = 0;
        console.log(this.inspectorControls.selectedColorIndex);
    }

    selectTestColor2() {
        this.inspectorControls.selectedColorIndex = 1;
    }

    selectTestColor3() {
        this.inspectorControls.selectedColorIndex = 2;
    }

    private validateDrag(currentCell: HexCell) {
        for (this._dragDirection = HexDirection.NE; this._dragDirection <= HexDirection.NW; this._dragDirection++) {
            if (this._previousCell!.getNeighbor(this._dragDirection) == currentCell) {
                this._isDrag = true;
                return;
            }
        }
        this._isDrag = false;
    }
}
