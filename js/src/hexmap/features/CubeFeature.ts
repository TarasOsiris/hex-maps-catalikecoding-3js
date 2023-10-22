import {BoxGeometry, Mesh, MeshStandardMaterial} from "three";

export class CubeFeature extends Mesh {
    private static readonly geometry = new BoxGeometry(1,1,1);
    private static readonly material = new MeshStandardMaterial({color: 'red'});
    constructor() {
        super(CubeFeature.geometry, CubeFeature.material);
        this.castShadow = true;
        this.scale.set(3,3,3);
        this.position.setY(this.scale.y * 0.5);
    }
}
