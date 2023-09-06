import * as THREE from "three";
import {Vector3} from "../lib/math/Vector3";
import {Vector2} from "../lib/math/Vector2";
import {VertexNormalsHelper} from "three/examples/jsm/helpers/VertexNormalsHelper";
import * as dat from "lil-gui";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export class SimpleMeshDataScene extends THREE.Scene {
    camera!: THREE.PerspectiveCamera;
    renderer!: THREE.Renderer;
    orbitals!: OrbitControls;

    init(debug: boolean = true) {
        const sizes = {
            width: 800,
            height: 600
        }

        const canvas = document.querySelector<HTMLCanvasElement>('canvas.webgl')!!

        const scene = new THREE.Scene()

        this.camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)

        scene.add(this.camera)

        const axesHelper = new THREE.AxesHelper(2);
        this.add(axesHelper);

        const geometry = new THREE.BufferGeometry();

        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('base-map.png');
        const normalMap = textureLoader.load('normal-map.png');
        console.log(texture)

        const material = new THREE.MeshPhongMaterial({
            polygonOffset: true,
            polygonOffsetFactor: 1, // positive value pushes polygon further away
            polygonOffsetUnits: 1,
            map: texture,
            normalMap: normalMap
        });
// const material = new THREE.MeshBasicMaterial({color: 0xff0000});
        const vertices = new Float32Array([
            ...Vector3.zero, ...Vector3.right, ...Vector3.up, ...new THREE.Vector3(1, 1, 0)
        ]);

        const triangles = [
            0, 1, 2,
            1, 3, 2
        ];

        const normals = new Float32Array([
            ...Vector3.forward, ...Vector3.forward, ...Vector3.forward, ...Vector3.forward
        ]);

        const uvs = new Float32Array([
            ...Vector2.zero, ...Vector2.right, ...Vector2.up, ...Vector2.one
        ]);

        const tangents = new Float32Array([
            1, 0, 0, 1,
            1, 0, 0, 1,
            1, 0, 0, 1,
            1, 0, 0, 1,
        ]);

        geometry.setIndex(triangles);
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
        geometry.setAttribute('tangent', new THREE.BufferAttribute(tangents, 4))
        const mesh = new THREE.Mesh(geometry, material)

// wireframe
        const wireframeMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true});
        const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);
        this.add(wireframeMesh);
        wireframeMesh.position.z = 0.01; // Offset the wireframe mesh

// Cube
// const cube = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), material);
// cube.position.set(0, 1, 0)
// this.add(cube);

        this.add(mesh)

        const helper = new VertexNormalsHelper(mesh, 0.2, 0xff0000);
        this.add(helper);

// LIGHTING
// Add ambient light to enhance the shading
        const ambientLight = new THREE.AmbientLight(0x404040, 3);
        this.add(ambientLight);

        const lightTarget = new THREE.Object3D();
        lightTarget.position.set(0, 0, 0);
        this.add(lightTarget);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Color, Intensity
        directionalLight.position.set(1, 1, 1);
        directionalLight.target = lightTarget
        this.add(directionalLight)
// const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
// this.add(directionalLightHelper);

        if (debug) {
            const gui = new dat.GUI()
            gui.add(mesh.position, 'y', -3, 3, 0.01)
            gui.add(mesh.material, 'wireframe').listen();
        }

        this.orbitals = new OrbitControls(this.camera, canvas)

        this.renderer = new THREE.WebGLRenderer({canvas: canvas})
        this.renderer.setSize(sizes.width, sizes.height)
    }
}