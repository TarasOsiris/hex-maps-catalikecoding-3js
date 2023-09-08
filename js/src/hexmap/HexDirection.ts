export enum HexDirection {
    NE, E, SE, SW, W, NW,
}

export class HexDirectionUtils {
    static opposite(direction: HexDirection): HexDirection {
        return direction < 3 ? (direction + 3) : (direction - 3);
    }

    static previous(direction: HexDirection): HexDirection {
        return direction == HexDirection.NE ? HexDirection.NW : (direction - 1);
    }

    static next(direction: HexDirection): HexDirection {
        return direction == HexDirection.NW ? HexDirection.NE : (direction + 1);
    }
}