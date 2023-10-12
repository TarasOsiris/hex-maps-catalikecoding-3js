import * as THREE from "three";
import {Helpers} from "../Helpers";
import GUI from "lil-gui";

export abstract class FullScreenScene extends THREE.Scene {
    canvas!: HTMLCanvasElement;
    mainCamera!: THREE.PerspectiveCamera;
    renderer!: THREE.WebGLRenderer;
    axesHelper!: THREE.AxesHelper;
    gui: GUI = new GUI({title: "=== Inspector ===", closeFolders: false});

    debugControls = {
        axesVisible: true,
        axesSize: 15,
    };
    private _mouseDownListener?: (mouseCoordinate: THREE.Vector2) => void;
    private _mouseDragListener?: (mouseCoordinate: THREE.Vector2) => void;
    private _mouseWheelListener?: (delta: number) => void;
    private _keysListener?: (deltaX: number, deltaZ: number, deltaRotation: number) => void;

    private arrowKeysPressed = new Set<string>();
    private rotateKeysPressed = new Set<string>();
    protected isMousePressed = false;

    init(debug: boolean = false) {
        this.canvas = document.querySelector<HTMLCanvasElement>('canvas.webgl')!;
        const size = new THREE.Vector2(window.innerWidth, window.innerHeight);

        window.addEventListener('resize', () => {
            size.set(window.innerWidth, window.innerHeight);

            this.mainCamera.aspect = size.width / size.height;
            this.mainCamera.updateProjectionMatrix();
            this.updateRenderer(size);
        });

        window.addEventListener('mousedown', event => {
            if (!this._mouseDownListener) return;

            this.isMousePressed = true;
            this._mouseDownListener(this.calculateNormalizedCoordinates(event));
        });
        window.addEventListener('mouseup', () => {
            this.isMousePressed = false;
        });
        window.addEventListener('mousemove', event => {
            if (this._mouseDragListener != null && this.isMousePressed) {
                this._mouseDragListener(this.calculateNormalizedCoordinates(event));
            }
        });
        window.addEventListener('wheel', event => {
            if (!this._mouseWheelListener) return;
            this._mouseWheelListener(event.deltaY);
        });
        window.addEventListener('keydown', event => {
            const key = event.key;
            switch (key) {
                case 'w':
                case 'ArrowUp':
                case 'a':
                case 'ArrowLeft':
                case 's':
                case 'ArrowDown':
                case 'd':
                case 'ArrowRight':
                    this.arrowKeysPressed.add(event.key);
                    break;
                case 'q':
                case 'e':
                case '.':
                case ',':
                    this.rotateKeysPressed.add(event.key);
                    break;
            }
            this.updateKeysInput();
        });
        window.addEventListener('keyup', event => {
            if (this.arrowKeysPressed.has(event.key)) {
                this.arrowKeysPressed.delete(event.key);
            }
            if (this.rotateKeysPressed.has(event.key)) {
                this.rotateKeysPressed.delete(event.key);
            }
            this.updateKeysInput();
        });

        Helpers.addFullScreenToggle(this.canvas);
        this.createMainCamera(size);

        this.onInit();

        if (debug) {
            this.drawDebugUi();
        }

        this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.updateRenderer(size);
    }

    private calculateNormalizedCoordinates(event: MouseEvent) {
        // Calculate normalized mouse coordinates (-1 to 1) based on canvas size
        const normalizedMouseCoordinates = new THREE.Vector2();
        normalizedMouseCoordinates.x = (event.clientX / window.innerWidth) * 2 - 1;
        normalizedMouseCoordinates.y = -(event.clientY / window.innerHeight) * 2 + 1;
        return normalizedMouseCoordinates;
    }

    private updateKeysInput() {
        let xDelta = 0;
        let zDelta = 0;

        if (this.arrowKeysPressed.has('w') || this.arrowKeysPressed.has('ArrowUp')) {
            zDelta = -1;
        } else if (this.arrowKeysPressed.has('s') || this.arrowKeysPressed.has('ArrowDown')) {
            zDelta = 1;
        }
        if (this.arrowKeysPressed.has('a') || this.arrowKeysPressed.has('ArrowLeft')) {
            xDelta = -1;
        } else if (this.arrowKeysPressed.has('d') || this.arrowKeysPressed.has('ArrowRight')) {
            xDelta = 1;
        }

        let rotationDelta = 0;
        if (this.rotateKeysPressed.has('q') || this.rotateKeysPressed.has(',')) {
            rotationDelta = -1;
        } else if (this.rotateKeysPressed.has('e') || this.rotateKeysPressed.has('.')) {
            rotationDelta = 1;
        }

        if (this._keysListener) {
            this._keysListener(xDelta, zDelta, rotationDelta);
        }
    }

    set mouseWheelListener(value: (delta: number) => void) {
        this._mouseWheelListener = value;
    }

    set mouseDownListener(value: (mouseCoordinate: THREE.Vector2) => void) {
        this._mouseDownListener = value;
    }

    set mouseDragListener(value: (mouseCoordinate: THREE.Vector2) => void) {
        this._mouseDragListener = value;
    }

    set keysListener(value: (deltaX: number, deltaZ: number, deltaRotation: number) => void) {
        this._keysListener = value;
    }

    private createMainCamera(size: THREE.Vector2) {
        this.mainCamera = new THREE.PerspectiveCamera(75, size.width / size.height, 0.1, 500);
        this.mainCamera.position.z = 3;
    }

    abstract onInit(): void;

    private updateRenderer(size: THREE.Vector2) {
        this.renderer.setSize(size.width, size.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    update(_dt: number) {
        this.mainCamera.updateProjectionMatrix();
        this.renderer.render(this, this.mainCamera);
    }

    private drawDebugUi() {
        this.axesHelper = new THREE.AxesHelper(this.debugControls.axesSize);
        this.add(this.axesHelper);

        // const folder = this.gui.addFolder("Axes").close();
        // folder.add(this.debugControls, 'axesVisible').name("Is Visible")
        //     .onChange(() => {
        //         this.axesHelper.visible = !this.axesHelper.visible;
        //     });
        // folder.add(this.debugControls, 'axesSize').name("Size")
        //     .min(1).max(50).step(0.5)
        //     .onFinishChange((value: number) => {
        //         this.remove(this.axesHelper);
        //         this.axesHelper.dispose();
        //         this.axesHelper = new THREE.AxesHelper(value);
        //         this.add(this.axesHelper);
        //     });
    }

    test() {
        this.axesHelper.visible = !this.axesHelper.visible;
    }
}
