import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {SimpleMeshDataScene} from "./experiments/SimpleMeshDataScene";
import {HexMapScene} from "./hexmap/HexMapScene";
import {FullScreenScene} from "./lib/scene/FullScreenScene";

const canvas = document.querySelector<HTMLCanvasElement>('canvas.webgl')!!
const scene = new THREE.Scene()

const loadingManager = new THREE.LoadingManager()
const loader = new THREE.TextureLoader(loadingManager);
const colorTexture = loader.load('door/color.jpg');
const alphaTexture = loader.load('door/alpha.jpg');
const heightTexture = loader.load('door/height.jpg');
const normalTexture = loader.load('door/normal.jpg');
const ambientOcclusionTexture = loader.load('door/ambientOcclusion.jpg');
const metalnessTexture = loader.load('door/metalness.jpg');
const roughnessTexture = loader.load('door/roughness.jpg');

/**
 * Object
 */
const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2)
const material = new THREE.MeshBasicMaterial({
    map: colorTexture,
    // color: 0xff0000,
    wireframe: false,

})
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

window.addEventListener('dblclick', () => {
    // @ts-ignore
    const fullScreenElement = document.fullscreenElement || document.webkitFullscreenElement

    if (!fullScreenElement) {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen()
        } else { // @ts-ignore
            if (canvas.webkitRequestFullscreen) {
                // @ts-ignore
                canvas.webkitRequestFullscreen()
            }
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen()
        } else { // @ts-ignore
            if (document.webkitExitFullscreen) {
                // @ts-ignore
                document.webkitExitFullscreen()
            }
        }
    }
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    // controls.update()


    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

// let scene = new HexMapScene()
// scene.init(true)
// const tick = () => {
//     scene.update()
//     // scene.orbitals.update()
//     window.requestAnimationFrame(tick)
// }
//
// tick()