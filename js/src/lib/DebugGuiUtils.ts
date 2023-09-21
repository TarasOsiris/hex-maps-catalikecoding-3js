import Stats from "three/examples/jsm/libs/stats.module";

export class DebugGuiUtils {
    private static fpsStats: Stats;
    private static memStats: Stats;
    private static msStats: Stats;

    public static addStats() {
        this.fpsStats = new Stats();
        this.fpsStats.showPanel(0);
        this.fpsStats.dom.style.cssText = 'position:absolute;top:0px;left:0px;';
        document.body.appendChild(this.fpsStats.dom);

        this.memStats = new Stats();
        this.memStats.showPanel(2);
        this.memStats.dom.style.cssText = 'position:absolute;top:0px;left:80px;';
        document.body.appendChild(this.memStats.dom);

        this.msStats = new Stats();
        this.msStats.showPanel(1);
        this.msStats.dom.style.cssText = 'position:absolute;top:40px;left:0px;';
        document.body.appendChild(this.msStats.dom);
    }

    public static updateStats() {
        this.fpsStats.update();
        this.memStats.update();
        this.msStats.update();
    }
}