import * as isaac from "isaac";

export class HexHash {
	a: number = 0;
	b: number = 0;

	public static Create(): HexHash {
		const hash = new HexHash();
		hash.a = isaac.random();
		hash.b = isaac.random();
		return hash;
	}
}
