import {FullScreenScene} from "../lib/scene/FullScreenScene";
import {HexGrid} from "./HexGrid";

export class HexMapScene extends FullScreenScene {

    onAddElements() {
        super.onAddElements();
        // SceneUtils.addDefaultCube(this)
        let grid = new HexGrid(this)

    }
}