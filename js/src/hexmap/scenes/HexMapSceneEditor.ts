import GUI from "lil-gui";
import {Color} from "three";
import {ColorUtils} from "../../lib/ColorUtils";
import {OptionalToggle} from "../util/OptionalToggle";
import {HexGrid} from "../HexGrid";

export class HexMapSceneEditor {
    colors = new Array<Color>(ColorUtils.red, ColorUtils.green, ColorUtils.yellow, new Color(0x548af9),);
    selectedColorIndex = -1;
    applyElevation = true;
    applyWaterLevel = true;
    activeElevation = 0;
    activeWaterLevel = 1;
    brushSize = 0;
    showGridLabels = false;
    riverMode = OptionalToggle.Ignore.valueOf();
    roadMode = OptionalToggle.Ignore.valueOf();

    // TODO Implement this
    wireframe = {
        terrain: false,
        roads: false,
        rivers: false,
        water: false,
        shore: false
    };
    showRivers = true;

    colorOptions = {
        clear: -1, red: 0, green: 1, yellow: 2, blue: 3
    } as const;
    toggleOptions = {
        "Ignore": OptionalToggle.Ignore.valueOf(),
        "Yes": OptionalToggle.Yes.valueOf(),
        "No": OptionalToggle.No.valueOf()
    } as const;

    private _hexGrid: HexGrid;

    constructor(gui: GUI, hexGrid: HexGrid) {
        this._hexGrid = hexGrid;
        gui.add(this, 'selectedColorIndex', this.colorOptions).name('Color');
        gui.add(this, 'activeElevation').name('Cell elevation').min(0).max(6).step(1);
        gui.add(this, 'applyElevation').name('Apply elevation?');
        gui.add(this, 'activeWaterLevel').name('Cell water level').min(1).max(6).step(1);
        gui.add(this, 'applyWaterLevel').name('Apply water level?');
        gui.add(this, 'brushSize').name('Brush Size').min(0).max(4).step(1);
        gui.add(this, 'showGridLabels').name('Labels').onChange(() => {
            this.showLabels();
        });
        gui.add(this, 'roadMode', this.toggleOptions).name('Road');
        gui.add(this, 'riverMode', this.toggleOptions).name('River');

        gui.add(this, 'showRivers').onChange((value: boolean) => {
            hexGrid.showRivers(value);
        });
        const wireframes = gui.addFolder('Wireframes').close();
        wireframes.add(this.wireframe, 'terrain').onChange((value: boolean) => {
            hexGrid.showWireframe(value);
        });
    }

    showLabels() {
        this._hexGrid.showLabels(this.showGridLabels);
    }
}
