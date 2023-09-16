import * as THREE from "three";
import {MathUtil} from "../lib/math/MathUtil";
import {PerspectiveCamera} from "three";

export class HexMapCamera extends THREE.Object3D {
    scrollSensitivity = 0.001
    zoom: number = 1
    stickMinZoom = -250
    stickMaxZoom = -45
    swivelMinZoom = 90
    swivelMaxZoom = 45

    swivel: THREE.Object3D
    stick: THREE.Object3D

    constructor(mainCamera: PerspectiveCamera) {
        super();
        this.name = "Hex Map Camera"

        this.swivel = new THREE.Object3D()
        this.swivel.name = "Swivel"

        this.stick = new THREE.Object3D()
        this.stick.name = "Stick"

        this.add(this.swivel)
        this.swivel.rotation.set(-MathUtil.degToRad(this.swivelMaxZoom), 0, 0)

        this.swivel.add(this.stick)
        this.stick.position.z = 45
        this.stick.add(mainCamera)
    }

    adjustZoom(delta: number) {
        if (delta == 0) return
        this.zoom += delta * -this.scrollSensitivity
        this.zoom = MathUtil.clamp01(this.zoom)

        const distance = THREE.MathUtils.lerp(this.stickMinZoom, this.stickMaxZoom, this.zoom)
        this.stick.position.set(0, 0, -distance)

        const angle = THREE.MathUtils.lerp(this.swivelMinZoom, this.swivelMaxZoom, this.zoom)
        this.swivel.rotation.set(-MathUtil.degToRad(angle), 0, 0)
    }

    adjustPosition(xDelta: number, zDelta: number) {
        this.position.add(new THREE.Vector3(xDelta, 0, zDelta))
    }
}