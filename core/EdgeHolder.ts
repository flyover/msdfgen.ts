
import { EdgeSegment } from "./edge-segments";
import { EdgeColor } from "./EdgeColor";
import { Vector2, Point2, Bounds2 } from "./Vector2";
import { SignedDistance } from "./SignedDistance";

type Ref<T> = [T];
function refnew<T>(val: T): Ref<T> { return [val]; }
function refget<T>(ref: Ref<T>): T { return ref[0]; }
function refset<T>(ref: Ref<T>, val: T): Ref<T> { ref[0] = val; return ref; }

/// Container for a single edge of dynamic type.
export class EdgeHolder {
    constructor(public edgeSegment: EdgeSegment | null = null) {}
    private get _edgeSegment(): EdgeSegment {
        if (this.edgeSegment === null) { throw new Error(); }
        return this.edgeSegment;
    }

    public validate(): boolean {
        return this.edgeSegment !== null;
    }

    public get color(): EdgeColor { return this._edgeSegment.color; }
    public set color(value: EdgeColor) { this._edgeSegment.color = value; }

    public copy(other: Readonly<EdgeHolder>): this {
        this.edgeSegment = other.edgeSegment && other.edgeSegment.clone();
        return this;
    }

    /// Creates a copy of the edge segment.
    // public clone(): EdgeSegment;
    public clone(): EdgeHolder {
        return new EdgeHolder(this.edgeSegment && this.edgeSegment.clone());
    }
    /// Returns the point on the edge specified by the parameter (between 0 and 1).
    public point(param: number): Point2 {
        return this._edgeSegment.point(param);
    }
    /// Returns the direction the edge has at the point specified by the parameter.
    // virtual Vector2 direction(double param) const = 0;
    public direction(param: number): Vector2 {
        return this._edgeSegment.direction(param);
    }
    /// Returns the minimum signed distance between origin and the edge.
    // virtual SignedDistance signedDistance(Point2 origin, double &param) const = 0;
    public signedDistance(origin: Readonly<Point2>, param: Ref<number>): SignedDistance {
        return this._edgeSegment.signedDistance(origin, param);
    }
    /// Converts a previously retrieved signed distance from origin to pseudo-distance.
    public distanceToPseudoDistance(distance: SignedDistance, origin: Point2, param: number): void {
        this._edgeSegment.distanceToPseudoDistance(distance, origin, param);
    }
    /// Adjusts the bounding box to fit the edge segment.
    // virtual void bounds(double &l, double &b, double &r, double &t) const = 0;
    public bounds(bounds: Bounds2): void {
        this._edgeSegment.bounds(bounds);
    }

    /// Moves the start point of the edge segment.
    // virtual void moveStartPoint(Point2 to) = 0;
    public moveStartPoint(to: Point2): void {
        this._edgeSegment.moveStartPoint(to);
    }
    /// Moves the end point of the edge segment.
    // virtual void moveEndPoint(Point2 to) = 0;
    public moveEndPoint(to: Point2): void {
        this._edgeSegment.moveEndPoint(to);
    }
    /// Splits the edge segments into thirds which together represent the original edge.
    // virtual void splitInThirds(EdgeSegment *&part1, EdgeSegment *&part2, EdgeSegment *&part3) const = 0;
    public splitInThirds(): [ EdgeSegment, EdgeSegment, EdgeSegment ] {
        return this._edgeSegment.splitInThirds();
    }
}
