/// Represents a signed distance and alignment, which together can be compared to uniquely determine the closest edge segment.
export class SignedDistance {
    public static readonly INFINITE: Readonly<SignedDistance> = new SignedDistance(-1e240, 1);

    constructor(public distance: number = -1e240, public dot: number = 1) {}

    public copy(other: SignedDistance): this {
        this.distance = other.distance;
        this.dot = other.dot;
        return this;
    }

    public static lt(a: Readonly<SignedDistance>, b: Readonly<SignedDistance>): boolean {
        return Math.abs(a.distance) < Math.abs(b.distance) || (Math.abs(a.distance) === Math.abs(b.distance) && a.dot < b.dot);
    }

    public static gt(a: Readonly<SignedDistance>, b: Readonly<SignedDistance>): boolean {
        return Math.abs(a.distance) > Math.abs(b.distance) || (Math.abs(a.distance) === Math.abs(b.distance) && a.dot > b.dot);
    }

    public static le(a: Readonly<SignedDistance>, b: Readonly<SignedDistance>): boolean {
        return Math.abs(a.distance) < Math.abs(b.distance) || (Math.abs(a.distance) === Math.abs(b.distance) && a.dot <= b.dot);
    }

    public static ge(a: Readonly<SignedDistance>, b: Readonly<SignedDistance>): boolean {
        return Math.abs(a.distance) > Math.abs(b.distance) || (Math.abs(a.distance) === Math.abs(b.distance) && a.dot >= b.dot);
    }
}
