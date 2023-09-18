import * as THREE from "three";
import {HexMetrics} from "../HexMetrics";

export class HexSceneUtils {
    static processNoiseTexture(tex: THREE.Texture) {
        tex.generateMipmaps = false;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.colorSpace = "srgb-linear";

        const canvas = new OffscreenCanvas(tex.image.width, tex.image.height)
        canvas.width = tex.image.width;
        canvas.height = tex.image.height;

        const context= canvas.getContext('2d')!;
        context.drawImage(tex.image, 0, 0);

        const data = context.getImageData(0, 0, canvas.width, canvas.height).data;

        const colors: THREE.Color[] = [];

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i] / 255;
            const g = data[i + 1] / 255;
            const b = data[i + 2] / 255;

            colors.push(new THREE.Color(r, g, b));
        }
        HexMetrics.noise = colors;
    }
}