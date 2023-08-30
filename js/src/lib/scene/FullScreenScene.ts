import * as THREE from "three";
import {Helpers} from "../Helpers";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

export class FullScreenScene extends THREE.Scene {
    mainCamera!: THREE.PerspectiveCamera;
    renderer!: THREE.WebGLRenderer;
    axesHelper!: THREE.AxesHelper

    debugControls = {
        showAxesHelper: true,
        axesSize: 1
    }

    init(debug: boolean = false) {
        const canvas = document.querySelector<HTMLCanvasElement>('canvas.webgl')!!
        const size = new THREE.Vector2(window.innerWidth, window.innerHeight)

        window.addEventListener('resize', () => {
            size.set(window.innerWidth, window.innerHeight)

            this.mainCamera.aspect = size.width / size.height
            this.mainCamera.updateProjectionMatrix()
            this.updateRenderer(size);
        })

        Helpers.addFullScreenToggle(canvas)
        this.createMainCamera(size);

        this.onAddElements()

        if (debug) {
            this.drawDebugUi();
        }

        this.renderer = new THREE.WebGLRenderer({canvas: canvas})
        this.updateRenderer(size)

        new OrbitControls(this.mainCamera, canvas)
    }

    private createMainCamera(size: THREE.Vector2) {
        this.mainCamera = new THREE.PerspectiveCamera(75, size.width / size.height, 0.1, 200)
        this.mainCamera.position.z = 3
        this.add(this.mainCamera)
    }

    onAddElements() {
        // TODO make abstract class + methods
    }

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

        const gui = new GUI();

        let folder = gui.addFolder("Axes");
        folder.add(this.debugControls, 'showAxesHelper').name("Is Visible")
            .onChange(() => {
                this.axesHelper.visible = !this.axesHelper.visible
            })
        folder.add(this.debugControls, 'axesSize').name("Size")
            .min(1).max(10).step(0.5)
            .onFinishChange(() => {
                this.remove(this.axesHelper)
                this.axesHelper.dispose()
                this.axesHelper = new THREE.AxesHelper(this.debugControls.axesSize)
                this.add(this.axesHelper)
            })

        gui.addFolder("Orbit controls")
    }
}
