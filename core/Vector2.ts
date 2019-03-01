import { mix } from "./arithmetics";

export interface XY {
    x: number;
    y: number;
}

/**
* A 2-dimensional euclidean vector with double precision.
* Implementation based on the Vector2 template from Artery Engine.
* @author Viktor Chlumsky
*/
export class Vector2 implements XY {
    public x: number = 0;
    public y: number = 0;

    constructor();
    constructor(val: number);
    constructor(x: number, y: number);
    constructor(...args: any[]) {
        if (args.length === 1) {
            this.x = this.y = args[0];
        } else if (args.length === 2) {
            this.x = args[0];
            this.y = args[1];
        }
    }
    public copy(other: Readonly<Vector2>): this {
        this.x = other.x; this.y = other.y; return this;
    }
    /// Sets the vector to zero.
    public reset(): void {
        this.x = 0; this.y = 0;
    }
    /// Sets individual elements of the vector.
    public set(x: number, y: number): void {
        this.x = x; this.y = y;
    }
    /// Returns the vector's length.
    public length(): number {
        return Math.sqrt(this.x*this.x+this.y*this.y);
    }
    /// Returns the angle of the vector in radians (atan2).
    public direction(): number {
        return Math.atan2(this.y, this.x);
    }
    /// Returns the normalized vector - one that has the same direction but unit length.
    public normalize(allowZero: boolean = false): Vector2 {
        const len: number = this.length();
        if (len === 0) {
            return new Vector2(0, allowZero ? 0 : 1);
        }
        return new Vector2(this.x/len, this.y/len);
    }
    /// Returns a vector with the same length that is orthogonal to this one.
    public getOrthogonal(polarity: boolean = true): Vector2 {
        return polarity ? new Vector2(-this.y, this.x) : new Vector2(this.y, -this.x);
    }
    /// Returns a vector with unit length that is orthogonal to this one.
    public getOrthonormal(polarity: boolean = true, allowZero: boolean = false): Vector2 {
        const len: number = this.length();
        if (len === 0)
            return polarity ? new Vector2(0, !allowZero ? 1 : 0) : new Vector2(0, -(!allowZero ? 1 : 0));
        return polarity ? new Vector2(-this.y/len, this.x/len) : new Vector2(this.y/len, -this.x/len);
    }
    /// Returns a vector projected along this one.
    public project(vector: Readonly<Vector2>, positive: boolean = false): Vector2 {
        const n: Vector2 = this.normalize(true);
        const t: number = Vector2.dotProduct(vector, n);
        if (positive && t <= 0)
            return new Vector2();
        // return t*n;
        // return Vector2.mul(t, n);
        return n.mulseq(t); // reuse n
    }
    public isnotzero(): this | null {
        return this.x || this.y ? this : null;
    }
    public iszero(): boolean {
        return !this.x && !this.y;
    }
    public eq(other: Readonly<Vector2>): boolean {
        return this.x === other.x && this.y === other.y;
    }
    public ne(other: Readonly<Vector2>): boolean {
        return this.x !== other.x && this.y !== other.y;
    }
    public pos(): Vector2 {
        return this;
    }
    public neg(): Vector2 {
        return new Vector2(-this.x, -this.y);
    }
    public add(other: Readonly<Vector2>): Vector2 {
        return new Vector2(this.x+other.x, this.y+other.y);
    }
    public sub(other: Readonly<Vector2>): Vector2 {
        return new Vector2(this.x-other.x, this.y-other.y);
    }
    public mul(other: Readonly<Vector2>): Vector2 {
        return new Vector2(this.x*other.x, this.y*other.y);
    }
    public div(other: Readonly<Vector2>): Vector2 {
        return new Vector2(this.x/other.x, this.y/other.y);
    }
    public muls(value: number): Vector2 {
        return new Vector2(this.x*value, this.y*value);
    }
    public divs(value: number): Vector2 {
        return new Vector2(this.x/value, this.y/value);
    }
    public addeq(other: Readonly<Vector2>): this {
        this.x += other.x; this.y += other.y;
        return this;
    }
    public subeq(other: Readonly<Vector2>): this {
        this.x -= other.x; this.y -= other.y;
        return this;
    }
    public muleq(other: Readonly<Vector2>): this {
        this.x *= other.x; this.y *= other.y;
        return this;
    }
    public diveq(other: Readonly<Vector2>): this {
        this.x /= other.x; this.y /= other.y;
        return this;
    }
    public mulseq(value: number): Vector2 {
        this.x *= value; this.y *= value;
        return this;
    }
    public divseq(value: number): Vector2 {
        this.x /= value; this.y /= value;
        return this;
    }
    /// Dot product of two vectors.
    public static dotProduct(a: Readonly<Vector2>, b: Readonly<Vector2>): number {
        return a.x*b.x+a.y*b.y;
    }
    /// A special version of the cross product for 2D vectors (returns scalar value).
    public static crossProduct(a: Readonly<Vector2>, b: Readonly<Vector2>): number {
        return a.x*b.y-a.y*b.x;
    }
    public static muls(value: number, vector: Readonly<Vector2>): Vector2 {
        return new Vector2(value*vector.x, value*vector.y);
    }
    public static divs(value: number, vector: Readonly<Vector2>): Vector2 {
        return new Vector2(value/vector.x, value/vector.y);
    }
    public static mix(a: Readonly<Vector2>, b: Readonly<Vector2>, weight: number): Vector2 {
        const out: Vector2 = new Vector2();
        out.x = mix(a.x, b.x, weight);
        out.y = mix(a.y, b.y, weight);
        return out;
    }
}

/// A vector may also represent a point, which shall be differentiated semantically using the alias Point2.
export class Point2 extends Vector2 {}

export class Bounds2 {
    public l: number = +Number.MAX_VALUE;
    public b: number = +Number.MAX_VALUE;
    public r: number = -Number.MAX_VALUE;
    public t: number = -Number.MAX_VALUE;
    public get w(): number {
        return this.l <= this.r ? this.r - this.l : 0;
    }
    public get h(): number {
        return this.b <= this.t ? this.t - this.b : 0;
    }
    public validate(): boolean {
        return this.l <= this.r && this.b <= this.t;
    }
}
