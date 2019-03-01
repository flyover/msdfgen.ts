import { Vector2, Point2, Bounds2 } from "./Vector2";
import { EdgeColor } from "./EdgeColor";
import { nonZeroSign } from "./arithmetics";
import { SignedDistance } from "./SignedDistance";
import { solveQuadratic, solveCubic } from "./equation-solver";

type Ref<T> = [T];
function refnew<T>(val: T): Ref<T> { return [val]; }
function refget<T>(ref: Ref<T>): T { return ref[0]; }
function refset<T>(ref: Ref<T>, val: T): Ref<T> { ref[0] = val; return ref; }

function pointBounds(p: Readonly<Point2>, bounds: Bounds2): void {
    if (p.x < bounds.l) bounds.l = p.x;
    if (p.y < bounds.b) bounds.b = p.y;
    if (p.x > bounds.r) bounds.r = p.x;
    if (p.y > bounds.t) bounds.t = p.y;
}

// Parameters for iterative search of closest point on a cubic Bezier curve. Increase for higher precision.
const MSDFGEN_CUBIC_SEARCH_STARTS: number = 4;
const MSDFGEN_CUBIC_SEARCH_STEPS: number = 4;

/// An abstract edge segment.
export abstract class EdgeSegment {
    public color: EdgeColor = EdgeColor.WHITE;

    constructor(edgeColor: EdgeColor = EdgeColor.WHITE) { this.color = edgeColor; }
    /// Creates a copy of the edge segment.
    abstract clone(): EdgeSegment;
    /// Returns the point on the edge specified by the parameter (between 0 and 1).
    abstract point(param: number): Point2;
    /// Returns the direction the edge has at the point specified by the parameter.
    // virtual Vector2 direction(double param) const = 0;
    abstract direction(param: number): Vector2;
    /// Returns the minimum signed distance between origin and the edge.
    // virtual SignedDistance signedDistance(Point2 origin, double &param) const = 0;
    abstract signedDistance(origin: Readonly<Point2>, param: Ref<number>): SignedDistance;
    /// Converts a previously retrieved signed distance from origin to pseudo-distance.
    public distanceToPseudoDistance(distance: SignedDistance, origin: Point2, param: number): void {
        if (param < 0) {
            const dir: Vector2 = this.direction(0).normalize();
            // Vector2 aq = origin-point(0);
            const aq: Vector2 = origin.sub(this.point(0));
            const ts: number = Vector2.dotProduct(aq, dir);
            if (ts < 0) {
                const pseudoDistance: number = Vector2.crossProduct(aq, dir);
                if (Math.abs(pseudoDistance) <= Math.abs(distance.distance)) {
                    distance.distance = pseudoDistance;
                    distance.dot = 0;
                }
            }
        } else if (param > 1) {
            const dir: Vector2 = this.direction(1).normalize();
            // Vector2 bq = origin-point(1);
            const bq: Vector2 = origin.sub(this.point(1));
            const ts: number = Vector2.dotProduct(bq, dir);
            if (ts > 0) {
                const pseudoDistance: number = Vector2.crossProduct(bq, dir);
                if (Math.abs(pseudoDistance) <= Math.abs(distance.distance)) {
                    distance.distance = pseudoDistance;
                    distance.dot = 0;
                }
            }
        }
    }
    /// Adjusts the bounding box to fit the edge segment.
    // virtual void bounds(double &l, double &b, double &r, double &t) const = 0;
    abstract bounds(bounds: Bounds2): void;

    /// Moves the start point of the edge segment.
    // virtual void moveStartPoint(Point2 to) = 0;
    abstract moveStartPoint(to: Point2): void;
    /// Moves the end point of the edge segment.
    // virtual void moveEndPoint(Point2 to) = 0;
    abstract moveEndPoint(to: Point2): void;
    /// Splits the edge segments into thirds which together represent the original edge.
    // virtual void splitInThirds(EdgeSegment *&part1, EdgeSegment *&part2, EdgeSegment *&part3) const = 0;
    abstract splitInThirds(): [ EdgeSegment, EdgeSegment, EdgeSegment ];
}

/// A line segment.
export class LinearSegment extends EdgeSegment {
    public readonly p: [ Point2, Point2 ] = [ new Point2(), new Point2() ];

    constructor(p0: Readonly<Point2>, p1: Readonly<Point2>, edgeColor: EdgeColor = EdgeColor.WHITE) {
        super(edgeColor);
        this.p[0].set(p0.x, p0.y);
        this.p[1].set(p1.x, p1.y);
    }
    public clone(): LinearSegment {
        return new LinearSegment(this.p[0], this.p[1], this.color);
    }
    public point(param: number): Point2 {
        const p = this.p;
        const mix = Vector2.mix;
        return mix(p[0], p[1], param);
    }
    public direction(param: number): Vector2 {
        const p = this.p;
        // return p[1]-p[0];
        return p[1].sub(p[0]);
    }
    public signedDistance(origin: Readonly<Point2>, param: Ref<number>): SignedDistance {
        const p = this.p;
        // Vector2 aq = origin-p[0];
        const aq: Vector2 = origin.sub(p[0]);
        // Vector2 ab = p[1]-p[0];
        const ab: Vector2 = p[1].sub(p[0]);
        refset(param, Vector2.dotProduct(aq, ab)/Vector2.dotProduct(ab, ab));
        // Vector2 eq = p[param > .5]-origin;
        const eq: Vector2 = p[refget(param) > .5 ? 1 : 0].sub(origin);
        const endpointDistance: number = eq.length();
        if (refget(param) > 0 && refget(param) < 1) {
            const orthoDistance: number = Vector2.dotProduct(ab.getOrthonormal(false), aq);
            if (Math.abs(orthoDistance) < endpointDistance) {
                return new SignedDistance(orthoDistance, 0);
            }
        }
        return new SignedDistance(nonZeroSign(Vector2.crossProduct(aq, ab))*endpointDistance, Math.abs(Vector2.dotProduct(ab.normalize(), eq.normalize())));
    }
    public bounds(bounds: Bounds2): void {
        pointBounds(this.p[0], bounds);
        pointBounds(this.p[1], bounds);
    }

    public moveStartPoint(to: Point2): void {
        // p[0] = to;
        this.p[0].copy(to);
    }
    public moveEndPoint(to: Point2): void {
        // p[1] = to;
        this.p[1].copy(to);
    }
    public splitInThirds(): [ EdgeSegment, EdgeSegment, EdgeSegment ] {
        return [
            new LinearSegment(this.p[0], this.point(1/3.), this.color),
            new LinearSegment(this.point(1/3.), this.point(2/3.), this.color),
            new LinearSegment(this.point(2/3.), this.p[1], this.color),
        ];
    }
}

/// A quadratic Bezier curve.
export class QuadraticSegment extends EdgeSegment {
    public readonly p: [ Point2, Point2, Point2 ] = [ new Point2(), new Point2(), new Point2() ];

    constructor(p0: Readonly<Point2>, p1: Readonly<Point2>, p2: Readonly<Point2>, edgeColor: EdgeColor = EdgeColor.WHITE) {
        super(edgeColor);
        if (p1.eq(p0) || p1.eq(p2)) {
            this.p[0].set(p0.x, p0.y);
            this.p[1].set(0.5*(p0.x+p2.x), 0.5*(p0.y+p2.y));
            this.p[2].set(p2.x, p2.y);
        } else {
            this.p[0].set(p0.x, p0.y);
            this.p[1].set(p1.x, p1.y);
            this.p[2].set(p2.x, p2.y);
        }
    }
    public clone(): QuadraticSegment {
        return new QuadraticSegment(this.p[0], this.p[1], this.p[2], this.color);
    }
    public point(param: number): Point2 {
        const p = this.p;
        const mix = Vector2.mix;
        return mix(mix(p[0], p[1], param), mix(p[1], p[2], param), param);
    }
    public direction(param: number): Vector2 {
        const p = this.p;
        const mix = Vector2.mix;
        // return mix(p[1]-p[0], p[2]-p[1], param);
        return mix(p[1].sub(p[0]), p[2].sub(p[1]), param);
    }
    public signedDistance(origin: Readonly<Point2>, param: Ref<number>): SignedDistance {
        const p = this.p;
        const dotProduct = Vector2.dotProduct;
        const crossProduct = Vector2.crossProduct;
        // Vector2 qa = p[0]-origin;
        const qa = p[0].sub(origin);
        // Vector2 ab = p[1]-p[0];
        const ab = p[1].sub(p[0]);
        // Vector2 br = p[0]+p[2]-p[1]-p[1];
        const br = p[0].add(p[2]).sub(p[1]).sub(p[1]);
        const a: number = dotProduct(br, br);
        const b: number = 3*dotProduct(ab, br);
        const c: number = 2*dotProduct(ab, ab)+dotProduct(qa, br);
        const d: number = dotProduct(qa, ab);
        // double t[3];
        const t: [number, number, number] = [ 0, 0, 0 ];
        const solutions = solveCubic(t, a, b, c, d);

        let minDistance = nonZeroSign(crossProduct(ab, qa))*qa.length(); // distance from A
        // param = -dotProduct(qa, ab)/dotProduct(ab, ab);
        refset(param, -dotProduct(qa, ab)/dotProduct(ab, ab));
        {
            // double distance = nonZeroSign(crossProduct(p[2]-p[1], p[2]-origin))*(p[2]-origin).length(); // distance from B
            const distance = nonZeroSign(crossProduct(p[2].sub(p[1]), p[2].sub(origin)))*(p[2].sub(origin)).length(); // distance from B
            if (Math.abs(distance) < Math.abs(minDistance)) {
                minDistance = distance;
                // param = dotProduct(origin-p[1], p[2]-p[1])/dotProduct(p[2]-p[1], p[2]-p[1]);
                refset(param, dotProduct(origin.sub(p[1]), p[2].sub(p[1]))/dotProduct(p[2].sub(p[1]), p[2].sub(p[1])));
            }
        }
        for (let i = 0; i < solutions; ++i) {
            if (t[i] > 0 && t[i] < 1) {
                // Point2 endpoint = p[0]+2*t[i]*ab+t[i]*t[i]*br;
                const endpoint = new Point2();
                endpoint.x = p[0].x+2*t[i]*ab.x+t[i]*t[i]*br.x;
                endpoint.y = p[0].y+2*t[i]*ab.y+t[i]*t[i]*br.y;
                // double distance = nonZeroSign(crossProduct(p[2]-p[0], endpoint-origin))*(endpoint-origin).length();
                const distance = nonZeroSign(crossProduct(p[2].sub(p[0]), endpoint.sub(origin)))*(endpoint.sub(origin)).length();
                if (Math.abs(distance) <= Math.abs(minDistance)) {
                    minDistance = distance;
                    refset(param, t[i]);
                }
            }
        }

        if (refget(param) >= 0 && refget(param) <= 1)
            return new SignedDistance(minDistance, 0);
        if (refget(param) < .5)
            return new SignedDistance(minDistance, Math.abs(dotProduct(ab.normalize(), qa.normalize())));
        else
            return new SignedDistance(minDistance, Math.abs(dotProduct((p[2].sub(p[1])).normalize(), (p[2].sub(origin)).normalize())));
    }
    public bounds(bounds: Bounds2): void {
        const p = this.p;
        pointBounds(p[0], bounds);
        pointBounds(p[2], bounds);
        // Vector2 bot = (p[1]-p[0])-(p[2]-p[1]);
        const bot: Vector2 = p[1].sub(p[0]).sub(p[2].sub(p[1]));
        if (bot.x) {
            const param: number = (p[1].x-p[0].x)/bot.x;
            if (param > 0 && param < 1)
                pointBounds(this.point(param), bounds);
        }
        if (bot.y) {
            const param: number = (p[1].y-p[0].y)/bot.y;
            if (param > 0 && param < 1)
                pointBounds(this.point(param), bounds);
        }
    }

    public moveStartPoint(to: Point2): void {
        const p = this.p;
        // Vector2 origSDir = p[0]-p[1];
        const origSDir: Vector2 = p[0].sub(p[1]);
        // Point2 origP1 = p[1];
        const origP1: Point2 = new Vector2().copy(p[1]);
        // p[1] += crossProduct(p[0]-p[1], to-p[0])/crossProduct(p[0]-p[1], p[2]-p[1])*(p[2]-p[1]);
        p[1].addeq(Vector2.muls(Vector2.crossProduct(p[0].sub(p[1]), to.sub(p[0])) / Vector2.crossProduct(p[0].sub(p[1]), p[2].sub(p[1])), p[2].sub(p[1])));
        // p[0] = to;
        p[0].copy(to);
        // if (dotProduct(origSDir, p[0]-p[1]) < 0)
        //     p[1] = origP1;
        if (Vector2.dotProduct(origSDir, p[0].sub(p[1])) < 0) {
            p[1].copy(origP1);
        }
    }
    public moveEndPoint(to: Point2): void {
        const p = this.p;
        // Vector2 origEDir = p[2]-p[1];
        const origEDir: Vector2 = p[2].sub(p[1]);
        // Point2 origP1 = p[1];
        const origP1: Point2 = new Vector2().copy(p[1]);
        // p[1] += crossProduct(p[2]-p[1], to-p[2])/crossProduct(p[2]-p[1], p[0]-p[1])*(p[0]-p[1]);
        p[1].addeq(Vector2.muls(Vector2.crossProduct(p[2].sub(p[1]), to.sub(p[2])) / Vector2.crossProduct(p[2].sub(p[1]), p[0].sub(p[1])), p[0].sub(p[1])));
        // p[2] = to;
        p[2].copy(to);
        // if (dotProduct(origEDir, p[2]-p[1]) < 0)
        //     p[1] = origP1;
        if (Vector2.dotProduct(origEDir, p[2].sub(p[1])) < 0) {
            p[1].copy(origP1);
        }
    }
    public splitInThirds(): [ EdgeSegment, EdgeSegment, EdgeSegment ] {
        const p = this.p;
        const mix = Vector2.mix;
        return [
            new QuadraticSegment(p[0], mix(p[0], p[1], 1/3.), this.point(1/3.), this.color),
            new QuadraticSegment(this.point(1/3.), mix(mix(p[0], p[1], 5/9.), mix(p[1], p[2], 4/9.), .5), this.point(2/3.), this.color),
            new QuadraticSegment(this.point(2/3.), mix(p[1], p[2], 2/3.), p[2], this.color),
        ];
    }
}

/// A cubic Bezier curve.
export class CubicSegment extends EdgeSegment {
    public readonly p: [ Point2, Point2, Point2, Point2 ] = [ new Point2(), new Point2(), new Point2(), new Point2() ];

    constructor(p0: Readonly<Point2>, p1: Readonly<Point2>, p2: Readonly<Point2>, p3: Readonly<Point2>, edgeColor: EdgeColor = EdgeColor.WHITE) {
        super(edgeColor);
        this.p[0].set(p0.x, p0.y);
        this.p[1].set(p1.x, p1.y);
        this.p[2].set(p2.x, p2.y);
        this.p[3].set(p3.x, p3.y);
    }
    public clone(): CubicSegment {
        return new CubicSegment(this.p[0], this.p[1], this.p[2], this.p[3], this.color);
    }
    public point(param: number): Point2 {
        const p = this.p;
        const mix = Vector2.mix;
        // Vector2 p12 = mix(p[1], p[2], param);
        const p12: Vector2 = mix(p[1], p[2], param);
        // return mix(mix(mix(p[0], p[1], param), p12, param), mix(p12, mix(p[2], p[3], param), param), param);
        return mix(mix(mix(p[0], p[1], param), p12, param), mix(p12, mix(p[2], p[3], param), param), param);
    }
    public direction(param: number): Vector2 {
        const p = this.p;
        const mix = Vector2.mix;
        // Vector2 tangent = mix(mix(p[1]-p[0], p[2]-p[1], param), mix(p[2]-p[1], p[3]-p[2], param), param);
        const tangent: Vector2 = mix(mix(p[1].sub(p[0]), p[2].sub(p[1]), param), mix(p[2].sub(p[1]), p[3].sub(p[2]), param), param);
        // if (!tangent) {
        if (tangent.iszero()) {
            // if (param === 0) return p[2]-p[0];
            if (param === 0) return p[2].sub(p[0]);
            // if (param === 1) return p[3]-p[1];
            if (param === 1) return p[3].sub(p[1]);
        }
        return tangent;
    }
    public signedDistance(origin: Readonly<Point2>, param: Ref<number>): SignedDistance {
        const p = this.p;
        const dotProduct = Vector2.dotProduct;
        const crossProduct = Vector2.crossProduct;
        // Vector2 qa = p[0]-origin;
        const qa = p[0].sub(origin);
        // Vector2 ab = p[1]-p[0];
        const ab = p[1].sub(p[0]);
        // Vector2 br = p[2]-p[1]-ab;
        const br = p[2].sub(p[1]).sub(ab);
        // Vector2 as = (p[3]-p[2])-(p[2]-p[1])-br;
        const as = p[3].sub(p[2]).sub(p[2].sub(p[1])).sub(br);

        // Vector2 epDir = direction(0);
        let epDir = this.direction(0);
        // double minDistance = nonZeroSign(crossProduct(epDir, qa))*qa.length(); // distance from A
        let minDistance = nonZeroSign(crossProduct(epDir, qa))*qa.length(); // distance from A
        refset(param, -dotProduct(qa, epDir)/dotProduct(epDir, epDir));
        {
            epDir = this.direction(1);
            // double distance = nonZeroSign(crossProduct(epDir, p[3]-origin))*(p[3]-origin).length(); // distance from B
            const distance = nonZeroSign(crossProduct(epDir, p[3].sub(origin)))*(p[3].sub(origin)).length(); // distance from B
            if (Math.abs(distance) < Math.abs(minDistance)) {
                minDistance = distance;
                // param = dotProduct(origin+epDir-p[3], epDir)/dotProduct(epDir, epDir);
                refset(param, dotProduct(origin.add(epDir).sub(p[3]), epDir)/dotProduct(epDir, epDir));
            }
        }
        // Iterative minimum distance search
        for (let i = 0; i <= MSDFGEN_CUBIC_SEARCH_STARTS; ++i) {
            // double t = (double) i/MSDFGEN_CUBIC_SEARCH_STARTS;
            let t = i/MSDFGEN_CUBIC_SEARCH_STARTS;
            for (let step = 0;; ++step) {
                // Vector2 qpt = point(t)-origin;
                const qpt = this.point(t).sub(origin);
                // double distance = nonZeroSign(crossProduct(direction(t), qpt))*qpt.length();
                const distance = nonZeroSign(crossProduct(this.direction(t), qpt))*qpt.length();
                if (Math.abs(distance) < Math.abs(minDistance)) {
                    minDistance = distance;
                    refset(param, t);
                }
                if (step === MSDFGEN_CUBIC_SEARCH_STEPS)
                    break;
                // Improve t
                // Vector2 d1 = 3*as*t*t+6*br*t+3*ab;
                const d1 = new Vector2();
                d1.x = 3*as.x*t*t+6*br.x*t+3*ab.x;
                d1.y = 3*as.y*t*t+6*br.y*t+3*ab.y;
                // Vector2 d2 = 6*as*t+6*br;
                const d2 = new Vector2();
                d2.x = 6*as.x*t+6*br.x;
                d2.y = 6*as.y*t+6*br.y;
                t -= dotProduct(qpt, d1)/(dotProduct(d1, d1)+dotProduct(qpt, d2));
                if (t < 0 || t > 1)
                    break;
            }
        }

        if (refget(param) >= 0 && refget(param) <= 1)
            return new SignedDistance(minDistance, 0);
        if (refget(param) < .5)
            return new SignedDistance(minDistance, Math.abs(dotProduct(this.direction(0).normalize(), qa.normalize())));
        else
            return new SignedDistance(minDistance, Math.abs(dotProduct(this.direction(1).normalize(), (p[3].sub(origin)).normalize())));
    }
    public bounds(bounds: Bounds2): void {
        const p = this.p;
        pointBounds(p[0], bounds);
        pointBounds(p[3], bounds);
        // const a0: Vector2 = p[1]-p[0];
        const a0: Vector2 = p[1].sub(p[0]);
        // const a1: Vector2 = 2*(p[2]-p[1]-a0);
        const a1: Vector2 = p[2].sub(p[1]).sub(a0).mulseq(2);
        // const a2: Vector2 = p[3]-3*p[2]+3*p[1]-p[0];
        const a2: Vector2 = p[3].sub(p[2].muls(3)).add(p[1].muls(3)).sub(p[0]);
        const params: [number, number] = [ 0, 0 ];
        let solutions: number;
        solutions = solveQuadratic(params, a2.x, a1.x, a0.x);
        for (let i = 0; i < solutions; ++i)
            if (params[i] > 0 && params[i] < 1)
                pointBounds(this.point(params[i]), bounds);
        solutions = solveQuadratic(params, a2.y, a1.y, a0.y);
        for (let i = 0; i < solutions; ++i)
            if (params[i] > 0 && params[i] < 1)
                pointBounds(this.point(params[i]), bounds);
    }

    public moveStartPoint(to: Point2): void {
        const p = this.p;
        // p[1] += to-p[0];
        p[1].addeq(to.sub(p[0]));
        // p[0] = to;
        p[0].copy(to);
    }
    public moveEndPoint(to: Point2): void {
        const p = this.p;
        // p[2] += to-p[3];
        p[2].addeq(to.sub(p[3]));
        // p[3] = to;
        p[3].copy(to);
    }
    public splitInThirds(): [ EdgeSegment, EdgeSegment, EdgeSegment ] {
        const p = this.p;
        const mix = Vector2.mix;
        return [
            new CubicSegment(p[0], p[0] === p[1] ? p[0] : mix(p[0], p[1], 1/3.), mix(mix(p[0], p[1], 1/3.), mix(p[1], p[2], 1/3.), 1/3.), this.point(1/3.), this.color),
            new CubicSegment(this.point(1/3.),
                mix(mix(mix(p[0], p[1], 1/3.), mix(p[1], p[2], 1/3.), 1/3.), mix(mix(p[1], p[2], 1/3.), mix(p[2], p[3], 1/3.), 1/3.), 2/3.),
                mix(mix(mix(p[0], p[1], 2/3.), mix(p[1], p[2], 2/3.), 2/3.), mix(mix(p[1], p[2], 2/3.), mix(p[2], p[3], 2/3.), 2/3.), 1/3.),
                this.point(2/3.), this.color),
            new CubicSegment(this.point(2/3.), mix(mix(p[1], p[2], 2/3.), mix(p[2], p[3], 2/3.), 2/3.), p[2] === p[3] ? p[3] : mix(p[2], p[3], 2/3.), p[3], this.color),
        ];
    }
}
