import * as THREE from "three";
import {MathUtils, PerspectiveCamera} from "three";
import {MathUtil} from "../lib/math/MathUtil";
import {HexGrid} from "./HexGrid";
import {HexMetrics} from "./HexMetrics";

export class HexMapCamera extends THREE.Object3D {
    scrollSensitivity = 0.001
    zoom: number = 1
    stickMinZoom = -250
    stickMaxZoom = -45
    swivelMinZoom = 90
    swivelMaxZoom = 45
    moveSpeedMinZoom = 400
    moveSpeedMaxZoom = 100
    rotationSpeed = 180

    swivel: THREE.Object3D
    stick: THREE.Object3D
    private _grid: HexGrid;
    private rotationAngle = 0

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
        direction.applyEuler(this.rotation) // In Unity this is done as Vector3 direction = transform.localRotation * new Vector3(xDelta, 0f, zDelta).normalized;
        const positionDelta = direction.multiplyScalar(distance);
        const newPosition = this.clampPosition(this.position.clone().add(positionDelta));
        this.position.set(newPosition.x, newPosition.y, newPosition.z)
    }

    clampPosition(position: THREE.Vector3) {
        const xMax = (this._grid.chunkCountX * HexMetrics.chunkSizeX - 1) * (2 * HexMetrics.innerRadius)
        position.x = MathUtil.clamp(position.x, 0, xMax)

        const zMax = (this._grid.chunkCountZ * HexMetrics.chunkSizeZ - 1) * (1.5 * HexMetrics.outerRadius)
        position.z = MathUtil.clamp(position.z, -zMax, 0)

        return position
    }

    adjustRotation(rotationDelta: number, dt: number) {
        this.rotationAngle += rotationDelta * this.rotationSpeed * dt
        if (this.rotationAngle < 0) {
            this.rotationAngle += 360;
        } else if (this.rotationAngle >= 360) {
            this.rotationAngle -= 360;
        }
        this.rotation.set(0, MathUtils.degToRad(this.rotationAngle), 0)
    }
}