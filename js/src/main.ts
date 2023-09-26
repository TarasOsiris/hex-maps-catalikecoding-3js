import * as THREE from 'three';
// import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
// import * as dat from 'lil-gui'
import {HexMapScene} from "./hexmap/scenes/HexMapScene";
import {DebugGuiUtils} from "./lib/DebugGuiUtils";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {HexMaterials} from "./hexmap/util/HexMaterials";

const scene = new HexMapScene();
scene.init(true);
new OrbitControls(scene.mainCamera, scene.canvas);

const clock = new THREE.Clock(true);


DebugGuiUtils.addStats();

const tick = () => {
    scene.update(clock.getDelta());

    DebugGuiUtils.updateStats();
    HexMaterials.updateTime(clock.elapsedTime);
    // scene.orbitals.update()
    window.requestAnimationFrame(tick);
};

tick();
