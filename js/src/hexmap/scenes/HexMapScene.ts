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
    DirectionalLight,
    LoadingManager, PerspectiveCamera,
    Raycaster, TextureLoader, Vector2,
    Vector3
} from "three";
import {HexMapSceneEditor} from "./HexMapSceneEditor";

export class HexMapScene extends FullScreenScene {

    private _hexGrid!: HexGrid;
    private _raycaster = new Raycaster();
    private _loadingManager = new LoadingManager();
    private _fontLoader = new FontLoader(this._loadingManager);
    private _textureLoader = new TextureLoader(this._loadingManager);

    private font!: Font;

    private _editor!: HexMapSceneEditor;

    hexMapCamera!: HexMapCamera;

    private input = {xDelta: 0, zDelta: 0, rotationDelta: 0};
    private _isReady: boolean = false;

    private _isDrag = false;
    private _dragDirection: Nullable<HexDirection> = null;
    private _previousCell: Nullable<HexCell> = null;

    onInit() {
        this._loadingManager.onLoad = () => {
            this.onLoadingFinished();
            this._isReady = true;
        };
        this._textureLoader.load('/textures/noise.png', (tex) => {
            HexSceneUtils.processNoiseTexture(tex);
            HexMaterials.createMaterials(tex);
        });
        this._fontLoader.load('/fonts/roboto.json', (font) => {
            this.font = font;
        });

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
        this._hexGrid = new HexGrid(this, this.font);

        this.mainCamera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.3, 1000);
        this.hexMapCamera = new HexMapCamera(this.mainCamera, this._hexGrid);
        this.add(this.hexMapCamera);

        this.addLighting(new Vector3());
        this.handleInput(this._hexGrid);

        this.createEditor();

        // TODO make proper rendering for everything
        // const material = new CustomMat();
        // const sphere = new Mesh(new SphereGeometry(10), material);
        // console.log(material.uniforms);
        // this.add(sphere);
    }

    private createEditor() {
        this._editor = new HexMapSceneEditor(this.gui, this._hexGrid);
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
            this._raycaster.layers.set(ColliderLayers.Collidable);
            this._raycaster.setFromCamera(mouseCoordinate, this.mainCamera);
            const intersects = this._raycaster.intersectObjects(this.children);
            if (intersects.length > 0 && intersects[0]!.object.type == 'Mesh') {
                const currentCell = grid.getCell(intersects[0].point);
                if (this._previousCell && this._previousCell != currentCell) {
                    this.validateDrag(currentCell);
                } else {
                    this._isDrag = false;
                }
                this.editCells(currentCell);
                this._hexGrid.refreshDirty();
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

        const brushSize = this._editor.brushSize;
        for (let r = 0, z = centerZ - brushSize; z <= centerZ; z++, r++) {
            for (let x = centerX - r; x <= centerX + brushSize; x++) {
                this.editCell(this._hexGrid.getCellByCoords(new HexCoordinates(x, z)));
            }
        }
        for (let r = 0, z = centerZ + brushSize; z > centerZ; z--, r++) {
            for (let x = centerX - brushSize; x <= centerX + r; x++) {
                this.editCell(this._hexGrid.getCellByCoords(new HexCoordinates(x, z)));
            }
        }
    }

    editCell(cell: null | HexCell) {
        if (cell) {
            const applyColor = this._editor.selectedColorIndex >= 0;
            if (applyColor) {
                cell.color = this._editor.colors[this._editor.selectedColorIndex].clone();
            }
            if (this._editor.applyElevation) {
                cell.elevation = this._editor.activeElevation;
            }
            if (this._editor.applyWaterLevel) {
                cell.waterLevel = this._editor.activeWaterLevel;
            }
            if (this._editor.riverMode == OptionalToggle.No) {
                cell.removeRiver();
            }
            if (this._editor.roadMode == OptionalToggle.No) {
                cell.removeRoads();
            }

            if (this._isDrag) {
                const otherCell = cell.getNeighbor(HexDirectionUtils.opposite(this._dragDirection!));
                if (otherCell) {
                    if (this._editor.riverMode == OptionalToggle.Yes) {
                        otherCell.setOutgoingRiver(this._dragDirection!);
                    }
                    if (this._editor.roadMode == OptionalToggle.Yes) {
                        otherCell.addRoad(this._dragDirection!);
                    }
                }
            }
        }
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
