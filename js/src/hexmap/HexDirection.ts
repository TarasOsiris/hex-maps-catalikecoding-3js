export enum HexDirection {
    NE, E, SE, SW, W, NW,
}

export class HexDirectionUtils {
    static opposite(direction: HexDirection): HexDirection {
        return direction < 3 ? (direction + 3) : (direction - 3);
    }
}