import {MathUtils} from "three";

export class MathUtil {
    /**
     * Clamps the given value between the given minimum float and maximum values. Returns the given value if it is within the minimum and maximum range.
     * @param value
     * @param min Minimum value
     * @param max Maximum value
     */
    public static clamp(value: number, min: number, max: number) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Clamps value between 0 and 1 and returns value.
     * @param value
     */
    public static clamp01(value: number) {
        return MathUtils.clamp(value, 0, 1)
    }

    public static degToRad(degrees: number) {
        return degrees * (Math.PI / 180)
    }
}