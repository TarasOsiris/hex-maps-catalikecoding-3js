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

    static previous2(direction: HexDirection): HexDirection {
        direction -= 2;
        return direction >= HexDirection.NE ? direction : (direction + 6);
    }

    static next2(direction: HexDirection): HexDirection {
        direction += 2;
        return direction <= HexDirection.NW ? direction : (direction - 6);
    }
}