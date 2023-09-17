import {HexMetrics} from "./HexMetrics";

export class HexCoordinates {
    x: number;
    z: number;

    public get y() {
        return -this.x - this.z;
    }

    constructor(x: number, z: number) {
        this.x = x;
        this.z = z;
    }

    public static fromOffsetCoordinates(x: number, z: number) {
        return new HexCoordinates(x - Math.floor(z / 2), z);
    }

    toString(): string {
        return `(${this.x.toString()}, ${this.y.toString()}, ${this.z.toString()})`;
    }

    public toStringOnSeparateLines(): string {
        return `${this.x.toString()}\n${this.y.toString()}\n${this.z.toString()}`;
    }

    static fromPosition(position: THREE.Vector3): HexCoordinates {
        let x = position.x / (HexMetrics.innerRadius * 2);
        let y = -x;

        const invertedZ = -1;
        const offset = (invertedZ * position.z) / (HexMetrics.outerRadius * 3);
        x -= offset;
        y -= offset;

        let iX = Math.round(x);
        const iY = Math.round(y);
        let iZ = Math.round(-x - y);

        if (iX + iY + iZ != 0) {
            const dX = Math.abs(x - iX);
            const dY = Math.abs(y - iY);
            const dZ = Math.abs(-x - y - iZ);

            if (dX > dY && dX > dZ) {
                iX = -iY - iZ;
            } else if (dZ > dY) {
                iZ = -iX - iY;
            }
        }

        return new HexCoordinates(iX, iZ);
    }
}
