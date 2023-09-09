import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import {HexMapScene} from "./hexmap/scenes/HexMapScene";

// THREE.ColorManagement.enabled = false
//
// /**
//  * Base
//  */
// // Debug
// const gui = new dat.GUI()
//
// // Canvas
// const canvas = document.querySelector('canvas.webgl')
//
// // Scene
// const scene = new THREE.Scene()
//
// /**
//  * Lights
//  */
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
// scene.add(ambientLight)
//
// const pointLight = new THREE.PointLight(0xffffff, 50)
// pointLight.position.x = 2
// pointLight.position.y = 3
// pointLight.position.z = 4
// pointLight.castShadow = true
// pointLight.shadow.mapSize.width = 2048
// pointLight.shadow.mapSize.height = 2048
// scene.add(pointLight)
//
// /**
//  * Objects
//  */
// // Material
// const material = new THREE.MeshStandardMaterial()
// material.roughness = 0.4
//
// // Objects
// const sphere = new THREE.Mesh(
//     new THREE.SphereGeometry(0.5, 32, 32),
//     material
// )
// sphere.castShadow = true
// sphere.position.x = - 1.5
//
// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(0.75, 0.75, 0.75),
//     material
// )
// cube.castShadow = true
//
// const torus = new THREE.Mesh(
//     new THREE.TorusGeometry(0.3, 0.2, 32, 64),
//     material
// )
// torus.position.x = 1.5
// torus.castShadow = true
//
// const plane = new THREE.Mesh(
//     new THREE.PlaneGeometry(5, 5),
//     material
// )
// plane.receiveShadow = true
// plane.rotation.x = - Math.PI * 0.5
// plane.position.y = - 0.65
//
// scene.add(sphere, cube, torus, plane)
//
// /**
//  * Sizes
//  */
// const sizes = {
//     width: window.innerWidth,
//     height: window.innerHeight
// }
//
// window.addEventListener('resize', () =>
// {
//     // Update sizes
//     sizes.width = window.innerWidth
//     sizes.height = window.innerHeight
//
//     // Update camera
//     camera.aspect = sizes.width / sizes.height
//     camera.updateProjectionMatrix()
//
//     // Update renderer
//     renderer.setSize(sizes.width, sizes.height)
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
// })
//
// /**
//  * Camera
//  */
// // Base camera
// const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
// camera.position.x = 1
// camera.position.y = 1
// camera.position.z = 2
// scene.add(camera)
//
// // Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true
//
// /**
//  * Renderer
//  */
// const renderer = new THREE.WebGLRenderer({
//     canvas: canvas
// })
// renderer.shadowMap.enabled = true
// renderer.outputColorSpace = THREE.LinearSRGBColorSpace
// renderer.setSize(sizes.width, sizes.height)
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
//
// /**
//  * Animate
//  */
// const clock = new THREE.Clock()
//
// const tick = () =>
// {
//     const elapsedTime = clock.getElapsedTime()
//
//     // Update objects
//     sphere.rotation.y = 0.1 * elapsedTime
//     cube.rotation.y = 0.1 * elapsedTime
//     torus.rotation.y = 0.1 * elapsedTime
//
//     sphere.rotation.x = 0.15 * elapsedTime
//     cube.rotation.x = 0.15 * elapsedTime
//     torus.rotation.x = 0.15 * elapsedTime
//
//     // Update controls
//     controls.update()
//
//     // Render
//     renderer.render(scene, camera)
//
//     // Call tick again on the next frame
//     window.requestAnimationFrame(tick)
// }
//
// tick()

let scene = new HexMapScene()
scene.init(true)
const tick = () => {
    scene.update()
    // scene.orbitals.update()
    window.requestAnimationFrame(tick)
}

tick()