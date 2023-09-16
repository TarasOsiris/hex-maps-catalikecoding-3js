import * as THREE from "three";
import {MathUtil} from "../lib/math/MathUtil";
import {MathUtils, PerspectiveCamera} from "three";
import {HexGrid} from "./HexGrid";

export class HexMapCamera extends THREE.Object3D {
    scrollSensitivity = 0.001
    zoom: number = 1
    stickMinZoom = -250
    stickMaxZoom = -45
    swivelMinZoom = 90
    swivelMaxZoom = 45
    moveSpeedMinZoom = 400
    moveSpeedMaxZoom = 100

    swivel: THREE.Object3D
    stick: THREE.Object3D
    private _grid: HexGrid;

    constructor(mainCamera: PerspectiveCamera, grid: HexGrid) {
        super();
        this._grid = grid;
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

    adjustPosition(xDelta: number, zDelta: number, dt: number) {
        const damping = Math.max(Math.abs(xDelta), Math.abs(zDelta)); // TODO currently it does nothing, delta is always in range [-1;1] implement Unity axis system?
        const distance = MathUtils.lerp(this.moveSpeedMinZoom, this.moveSpeedMaxZoom, this.zoom) * dt * damping
        const direction = new THREE.Vector3(xDelta, 0, zDelta).normalize();
        let vector3 = direction.multiplyScalar(distance);
        const newPosition = this.clampPosition(this.position.clone().add(vector3));
        this.position.set(newPosition.x, newPosition.y, newPosition.z)
    }

    clampPosition(position: THREE.Vector3) {
        return position
    }
}