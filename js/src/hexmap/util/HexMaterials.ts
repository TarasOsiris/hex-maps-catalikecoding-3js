import * as THREE from "three";

export class HexMaterials {
    static readonly terrainMaterial = new THREE.MeshStandardMaterial({
        vertexColors: true,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
    });

    static readonly wireframeMaterial = new THREE.MeshBasicMaterial({wireframe: true, color: 0x000000});
    static readonly riverMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
    static readonly fontMaterial = new THREE.MeshBasicMaterial({color: 0x000000});

}