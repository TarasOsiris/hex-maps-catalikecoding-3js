import * as THREE from "three";
import {Helpers} from "../Helpers";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

export abstract class FullScreenScene extends THREE.Scene {
    mainCamera!: THREE.PerspectiveCamera;
    renderer!: THREE.WebGLRenderer;
    axesHelper!: THREE.AxesHelper
    gui: GUI = new GUI()

    debugControls = {
        axesVisible: true,
        axesSize: 15,
    }
    private mouseDownListener?: (mouseCoordinate: THREE.Vector2) => void;

    init(debug: boolean = false) {
        const canvas = document.querySelector<HTMLCanvasElement>('canvas.webgl')!!
        const size = new THREE.Vector2(window.innerWidth, window.innerHeight)

        window.addEventListener('resize', () => {
            size.set(window.innerWidth, window.innerHeight)

            this.mainCamera.aspect = size.width / size.height
            this.mainCamera.updateProjectionMatrix()
            this.updateRenderer(size);
        })

        window.addEventListener('mousedown', event => {
            if (!this.mouseDownListener) return
            // Calculate normalized mouse coordinates (-1 to 1) based on canvas size
            const normalizedMouseCoordinates = new THREE.Vector2()
            normalizedMouseCoordinates.x = (event.clientX / window.innerWidth) * 2 - 1;
            normalizedMouseCoordinates.y = -(event.clientY / window.innerHeight) * 2 + 1;
            this.mouseDownListener(normalizedMouseCoordinates)
        })

        Helpers.addFullScreenToggle(canvas)
        this.createMainCamera(size);

        this.onInit()

        if (debug) {
            this.drawDebugUi();
        }

        this.renderer = new THREE.WebGLRenderer({canvas: canvas})
        this.updateRenderer(size)

        new OrbitControls(this.mainCamera, canvas)
    }

    setOnMouseDownListener(mouseDownListener: (mouseCoordinate: THREE.Vector2) => void) {
        this.mouseDownListener = mouseDownListener;

    }

    private createMainCamera(size: THREE.Vector2) {
        this.mainCamera = new THREE.PerspectiveCamera(75, size.width / size.height, 0.1, 500)
        this.mainCamera.position.z = 3
        this.add(this.mainCamera)
    }

    abstract onInit();

    private updateRenderer(size: THREE.Vector2) {
        this.renderer.setSize(size.width, size.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    update() {
        this.mainCamera.updateProjectionMatrix();
        this.renderer.render(this, this.mainCamera);
    }

    private drawDebugUi() {
        this.axesHelper = new THREE.AxesHelper(this.debugControls.axesSize)
        this.add(this.axesHelper)

        let folder = this.gui.addFolder("Axes");
        folder.add(this.debugControls, 'axesVisible').name("Is Visible")
            .onChange(() => {
                this.axesHelper.visible = !this.axesHelper.visible
            })
        folder.add(this.debugControls, 'axesSize').name("Size")
            .min(1).max(50).step(0.5)
            .onFinishChange((value: number) => {
                this.remove(this.axesHelper)
                this.axesHelper.dispose()
                this.axesHelper = new THREE.AxesHelper(value)
                this.add(this.axesHelper)
            })

        this.gui.addFolder("Orbit controls")
        this.gui.add(this, 'test')
    }

    test() {
        this.axesHelper.visible = !this.axesHelper.visible
    }
}
