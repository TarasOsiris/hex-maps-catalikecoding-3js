import * as isaac from "isaac";

export class HexHash {
    a: number = 0;
    b: number = 0;
    c: number = 0;

    public static Create(): HexHash {
        const hash = new HexHash();
        hash.a = isaac.random() * 0.999;
        hash.b = isaac.random() * 0.999;
        hash.c = isaac.random() * 0.999;
        return hash;
    }
}
