import * as THREE from "three";
import {Helpers} from "../Helpers";
import {SceneUtils} from "../SceneUtils";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

export class FullScreenScene extends THREE.Scene {
    mainCamera!: THREE.PerspectiveCamera;
    renderer!: THREE.WebGLRenderer;

    init() {
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

        SceneUtils.addDefaultCube(this)
        this.onAddElements()


        this.renderer = new THREE.WebGLRenderer({canvas: canvas})
        this.updateRenderer(size)

        new OrbitControls(this.mainCamera, canvas)
    }

    private createMainCamera(size: THREE.Vector2) {
        this.mainCamera = new THREE.PerspectiveCamera(75, size.width / size.height, 0.1, 100)
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
}
