(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.msdfgen = {}));
}(this, function (exports) { 'use strict';

    /// Returns the smaller of the arguments.
    function min(a, b) {
        return b < a ? b : a;
    }
    /// Returns the larger of the arguments.
    function max(a, b) {
        return a < b ? b : a;
    }
    /// Returns the middle out of three values
    function median(a, b, c) {
        return max(min(a, b), min(max(a, b), c));
    }
    /// Returns the weighted average of a and b.
    function mix(a, b, weight) {
        return (1 - weight) * a + weight * b;
    }
    /// Clamps the number to the interval from lo to hi.
    function clamp(n, lo = 0, hi = 1) {
        return n < lo ? lo : hi < n ? hi : n;
    }
    /// Returns 1 for positive values, -1 for negative values, and 0 for zero.
    function sign(n) {
        return n < 0 ? -1 : 0 < n ? 1 : 0;
    }
    /// Returns 1 for non-negative values and -1 for negative values.
    function nonZeroSign(n) {
        return n < 0 ? -1 : 1;
    }

    /// A floating-point pixel.
    class Float {
        constructor(...args) {
            this.a = 0;
            if (args.length === 1) {
                if (typeof args[0] === "number") {
                    this.a = args[0];
                }
                else {
                    this.a = args[0].a;
                }
            }
        }
        copy(other) {
            this.a = other.a;
            return this;
        }
        static mix(a, b, weight) {
            const out = new Float();
            out.a = mix(a.a, b.a, weight);
            return out;
        }
    }
    /// A floating-point RGB pixel.
    class FloatRGB {
        constructor(...args) {
            this.r = 0;
            this.g = 0;
            this.b = 0;
            if (args.length === 3) {
                this.r = args[0];
                this.g = args[1];
                this.b = args[2];
            }
            else if (args.length === 1) {
                this.r = args[0].r;
                this.g = args[0].g;
                this.b = args[0].b;
            }
        }
        copy(other) {
            this.r = other.r;
            this.g = other.g;
            this.b = other.b;
            return this;
        }
        static mix(a, b, weight) {
            const out = new FloatRGB();
            out.r = mix(a.r, b.r, weight);
            out.g = mix(a.g, b.g, weight);
            out.b = mix(a.b, b.b, weight);
            return out;
        }
    }
    /// A 2D image bitmap.
    class Bitmap {
        constructor(ctor, w = 0, h = 0) {
            this.ctor = ctor;
            this.w = 0;
            this.h = 0;
            this.content = [];
            this.w = w;
            this.h = h;
            for (let i = 0; i < w * h; ++i) {
                this.content[i] = new ctor();
            }
        }
        // Bitmap<T> & operator=(const Bitmap<T> &orig);
        copy(other) {
            const w = other.width();
            const h = other.height();
            this.w = w;
            this.h = h;
            for (let y = 0; y < h; ++y) {
                for (let x = 0; x < w; ++x) {
                    this.content[y * this.w + x] = new this.ctor(other.getAt(x, y));
                }
            }
            return this;
        }
        /// Bitmap width in pixels.
        width() { return this.w; }
        /// Bitmap height in pixels.
        height() { return this.h; }
        // T & operator()(int x, int y);
        // const T & operator()(int x, int y) const;
        getAt(x, y) {
            return this.content[y * this.w + x];
        }
    }
    class BitmapFloat extends Bitmap {
        constructor(w = 0, h = 0) {
            super(Float, w, h);
        }
    }
    class BitmapFloatRGB extends Bitmap {
        constructor(w = 0, h = 0) {
            super(FloatRGB, w, h);
        }
    }

    /// Container for a single edge of dynamic type.
    class EdgeHolder {
        constructor(edgeSegment = null) {
            this.edgeSegment = edgeSegment;
        }
        get _edgeSegment() {
            if (this.edgeSegment === null) {
                throw new Error();
            }
            return this.edgeSegment;
        }
        validate() {
            return this.edgeSegment !== null;
        }
        get color() { return this._edgeSegment.color; }
        set color(value) { this._edgeSegment.color = value; }
        copy(other) {
            this.edgeSegment = other.edgeSegment && other.edgeSegment.clone();
            return this;
        }
        /// Creates a copy of the edge segment.
        // public clone(): EdgeSegment;
        clone() {
            return new EdgeHolder(this.edgeSegment && this.edgeSegment.clone());
        }
        /// Returns the point on the edge specified by the parameter (between 0 and 1).
        point(param) {
            return this._edgeSegment.point(param);
        }
        /// Returns the direction the edge has at the point specified by the parameter.
        // virtual Vector2 direction(double param) const = 0;
        direction(param) {
            return this._edgeSegment.direction(param);
        }
        /// Returns the minimum signed distance between origin and the edge.
        // virtual SignedDistance signedDistance(Point2 origin, double &param) const = 0;
        signedDistance(origin, param) {
            return this._edgeSegment.signedDistance(origin, param);
        }
        /// Converts a previously retrieved signed distance from origin to pseudo-distance.
        distanceToPseudoDistance(distance, origin, param) {
            this._edgeSegment.distanceToPseudoDistance(distance, origin, param);
        }
        /// Adjusts the bounding box to fit the edge segment.
        // virtual void bounds(double &l, double &b, double &r, double &t) const = 0;
        bounds(bounds) {
            this._edgeSegment.bounds(bounds);
        }
        /// Moves the start point of the edge segment.
        // virtual void moveStartPoint(Point2 to) = 0;
        moveStartPoint(to) {
            this._edgeSegment.moveStartPoint(to);
        }
        /// Moves the end point of the edge segment.
        // virtual void moveEndPoint(Point2 to) = 0;
        moveEndPoint(to) {
            this._edgeSegment.moveEndPoint(to);
        }
        /// Splits the edge segments into thirds which together represent the original edge.
        // virtual void splitInThirds(EdgeSegment *&part1, EdgeSegment *&part2, EdgeSegment *&part3) const = 0;
        splitInThirds() {
            return this._edgeSegment.splitInThirds();
        }
    }

    function shoelace(a, b) {
        return (b.x - a.x) * (a.y + b.y);
    }
    /// A single closed contour of a shape.
    class Contour {
        constructor() {
            /// The sequence of edges that make up the contour.
            this.edges = [];
        }
        addEdge(...args) {
            if (args.length === 1) {
                this.edges.push(args[0] instanceof EdgeHolder ? args[0] : new EdgeHolder(args[0]));
                return;
            }
            else {
                const edge = new EdgeHolder();
                this.edges.push(edge);
                return edge;
            }
        }
        /// Computes the bounding box of the contour.
        bounds(bounds) {
            for (const edge of this.edges) {
                edge.bounds(bounds);
            }
        }
        /// Computes the winding of the contour. Returns 1 if positive, -1 if negative.
        winding() {
            if (this.edges.length === 0) {
                return 0;
            }
            let total = 0;
            if (this.edges.length === 1) {
                const a = this.edges[0].point(0);
                const b = this.edges[0].point(1 / 3.);
                const c = this.edges[0].point(2 / 3.);
                total += shoelace(a, b);
                total += shoelace(b, c);
                total += shoelace(c, a);
            }
            else if (this.edges.length === 2) {
                const a = this.edges[0].point(0);
                const b = this.edges[0].point(.5);
                const c = this.edges[1].point(0);
                const d = this.edges[1].point(.5);
                total += shoelace(a, b);
                total += shoelace(b, c);
                total += shoelace(c, d);
                total += shoelace(d, a);
            }
            else {
                let prev = this.edges[this.edges.length - 1].point(0);
                for (const edge of this.edges) {
                    const cur = edge.point(0);
                    total += shoelace(prev, cur);
                    prev = cur;
                }
            }
            return sign(total);
        }
    }

    /**
    * A 2-dimensional euclidean vector with double precision.
    * Implementation based on the Vector2 template from Artery Engine.
    * @author Viktor Chlumsky
    */
    class Vector2 {
        constructor(...args) {
            this.x = 0;
            this.y = 0;
            if (args.length === 1) {
                this.x = this.y = args[0];
            }
            else if (args.length === 2) {
                this.x = args[0];
                this.y = args[1];
            }
        }
        copy(other) {
            this.x = other.x;
            this.y = other.y;
            return this;
        }
        /// Sets the vector to zero.
        reset() {
            this.x = 0;
            this.y = 0;
        }
        /// Sets individual elements of the vector.
        set(x, y) {
            this.x = x;
            this.y = y;
        }
        /// Returns the vector's length.
        length() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }
        /// Returns the angle of the vector in radians (atan2).
        direction() {
            return Math.atan2(this.y, this.x);
        }
        /// Returns the normalized vector - one that has the same direction but unit length.
        normalize(allowZero = false) {
            const len = this.length();
            if (len === 0) {
                return new Vector2(0, allowZero ? 0 : 1);
            }
            return new Vector2(this.x / len, this.y / len);
        }
        /// Returns a vector with the same length that is orthogonal to this one.
        getOrthogonal(polarity = true) {
            return polarity ? new Vector2(-this.y, this.x) : new Vector2(this.y, -this.x);
        }
        /// Returns a vector with unit length that is orthogonal to this one.
        getOrthonormal(polarity = true, allowZero = false) {
            const len = this.length();
            if (len === 0)
                return polarity ? new Vector2(0, !allowZero ? 1 : 0) : new Vector2(0, -(!allowZero ? 1 : 0));
            return polarity ? new Vector2(-this.y / len, this.x / len) : new Vector2(this.y / len, -this.x / len);
        }
        /// Returns a vector projected along this one.
        project(vector, positive = false) {
            const n = this.normalize(true);
            const t = Vector2.dotProduct(vector, n);
            if (positive && t <= 0)
                return new Vector2();
            // return t*n;
            // return Vector2.mul(t, n);
            return n.mulseq(t); // reuse n
        }
        isnotzero() {
            return this.x || this.y ? this : null;
        }
        iszero() {
            return !this.x && !this.y;
        }
        eq(other) {
            return this.x === other.x && this.y === other.y;
        }
        ne(other) {
            return this.x !== other.x && this.y !== other.y;
        }
        pos() {
            return this;
        }
        neg() {
            return new Vector2(-this.x, -this.y);
        }
        add(other) {
            return new Vector2(this.x + other.x, this.y + other.y);
        }
        sub(other) {
            return new Vector2(this.x - other.x, this.y - other.y);
        }
        mul(other) {
            return new Vector2(this.x * other.x, this.y * other.y);
        }
        div(other) {
            return new Vector2(this.x / other.x, this.y / other.y);
        }
        muls(value) {
            return new Vector2(this.x * value, this.y * value);
        }
        divs(value) {
            return new Vector2(this.x / value, this.y / value);
        }
        addeq(other) {
            this.x += other.x;
            this.y += other.y;
            return this;
        }
        subeq(other) {
            this.x -= other.x;
            this.y -= other.y;
            return this;
        }
        muleq(other) {
            this.x *= other.x;
            this.y *= other.y;
            return this;
        }
        diveq(other) {
            this.x /= other.x;
            this.y /= other.y;
            return this;
        }
        mulseq(value) {
            this.x *= value;
            this.y *= value;
            return this;
        }
        divseq(value) {
            this.x /= value;
            this.y /= value;
            return this;
        }
        /// Dot product of two vectors.
        static dotProduct(a, b) {
            return a.x * b.x + a.y * b.y;
        }
        /// A special version of the cross product for 2D vectors (returns scalar value).
        static crossProduct(a, b) {
            return a.x * b.y - a.y * b.x;
        }
        static muls(value, vector) {
            return new Vector2(value * vector.x, value * vector.y);
        }
        static divs(value, vector) {
            return new Vector2(value / vector.x, value / vector.y);
        }
        static mix(a, b, weight) {
            const out = new Vector2();
            out.x = mix(a.x, b.x, weight);
            out.y = mix(a.y, b.y, weight);
            return out;
        }
    }
    /// A vector may also represent a point, which shall be differentiated semantically using the alias Point2.
    class Point2 extends Vector2 {
    }
    class Bounds2 {
        constructor() {
            this.l = +Number.MAX_VALUE;
            this.b = +Number.MAX_VALUE;
            this.r = -Number.MAX_VALUE;
            this.t = -Number.MAX_VALUE;
        }
        get w() {
            return this.l <= this.r ? this.r - this.l : 0;
        }
        get h() {
            return this.b <= this.t ? this.t - this.b : 0;
        }
        validate() {
            return this.l <= this.r && this.b <= this.t;
        }
    }

    /// Edge color specifies which color channels an edge belongs to.
    (function (EdgeColor) {
        EdgeColor[EdgeColor["BLACK"] = 0] = "BLACK";
        EdgeColor[EdgeColor["RED"] = 1] = "RED";
        EdgeColor[EdgeColor["GREEN"] = 2] = "GREEN";
        EdgeColor[EdgeColor["YELLOW"] = 3] = "YELLOW";
        EdgeColor[EdgeColor["BLUE"] = 4] = "BLUE";
        EdgeColor[EdgeColor["MAGENTA"] = 5] = "MAGENTA";
        EdgeColor[EdgeColor["CYAN"] = 6] = "CYAN";
        EdgeColor[EdgeColor["WHITE"] = 7] = "WHITE";
    })(exports.EdgeColor || (exports.EdgeColor = {}));

    function refnew$1(val) { return [val]; }
    function refget$1(ref) { return ref[0]; }
    function refset$1(ref, val) { ref[0] = val; return ref; }
    function isCorner(aDir, bDir, crossThreshold) {
        return Vector2.dotProduct(aDir, bDir) <= 0 || Math.abs(Vector2.crossProduct(aDir, bDir)) > crossThreshold;
    }
    function switchColor(color, seed, banned = exports.EdgeColor.BLACK) {
        const combined = refget$1(color) & banned;
        if (combined === exports.EdgeColor.RED || combined === exports.EdgeColor.GREEN || combined === exports.EdgeColor.BLUE) {
            refset$1(color, combined ^ exports.EdgeColor.WHITE);
            return;
        }
        if (refget$1(color) === exports.EdgeColor.BLACK || refget$1(color) === exports.EdgeColor.WHITE) {
            // static const EdgeColor start[3] = { CYAN, MAGENTA, YELLOW };
            const start = [exports.EdgeColor.CYAN, exports.EdgeColor.MAGENTA, exports.EdgeColor.YELLOW];
            refset$1(color, start[refget$1(seed) % 3]);
            refset$1(seed, refget$1(seed) / 3);
            return;
        }
        const shifted = refget$1(color) << (1 + (refget$1(seed) & 1));
        refset$1(color, (shifted | shifted >> 3) & exports.EdgeColor.WHITE);
        refset$1(seed, refget$1(seed) >> 1);
    }
    /** Assigns colors to edges of the shape in accordance to the multi-channel distance field technique.
     *  May split some edges if necessary.
     *  angleThreshold specifies the maximum angle (in radians) to be considered a corner, for example 3 (~172 degrees).
     *  Values below 1/2 PI will be treated as the external angle.
     */
    function edgeColoringSimple(shape, angleThreshold, _seed = 0) {
        const seed = refnew$1(_seed);
        const crossThreshold = Math.sin(angleThreshold);
        const corners = [];
        for (const contour of shape.contours) {
            // Identify corners
            corners.length = 0;
            if (contour.edges.length > 0) {
                let prevDirection = contour.edges[contour.edges.length - 1].direction(1);
                let index = 0;
                for (const edge of contour.edges) {
                    if (isCorner(prevDirection.normalize(), edge.direction(0).normalize(), crossThreshold)) {
                        corners.push(index);
                        prevDirection = edge.direction(1);
                    }
                    index++;
                }
            }
            // Smooth contour
            if (corners.length === 0) {
                for (const edge of contour.edges) {
                    edge.color = exports.EdgeColor.WHITE;
                }
            }
            // "Teardrop" case
            else if (corners.length === 1) {
                const colors = [refnew$1(exports.EdgeColor.WHITE), refnew$1(exports.EdgeColor.WHITE), refnew$1(exports.EdgeColor.WHITE)];
                // switchColor(colors[0], seed);
                switchColor(colors[0], seed);
                // switchColor(colors[2] = colors[0], seed);
                switchColor(refset$1(colors[2], refget$1(colors[0])), seed);
                const corner = corners[0];
                if (contour.edges.length >= 3) {
                    const m = contour.edges.length;
                    for (let i = 0; i < m; ++i) {
                        // contour->edges[(corner+i)%m]->color = (colors+1)[int(3+2.875*i/(m-1)-1.4375+.5)-3];
                        contour.edges[(corner + i) % m].color = refget$1(colors[1 + Math.floor(3 + 2.875 * i / (m - 1) - 1.4375 + .5) - 3]);
                    }
                }
                else if (contour.edges.length >= 1) {
                    // Less than three edge segments for three colors => edges must be split
                    // EdgeSegment *parts[7] = { };
                    const parts = [];
                    // contour->edges[0]->splitInThirds(parts[0+3*corner], parts[1+3*corner], parts[2+3*corner]);
                    [parts[0 + 3 * corner], parts[1 + 3 * corner], parts[2 + 3 * corner]] = contour.edges[0].splitInThirds();
                    if (contour.edges.length >= 2) {
                        // contour->edges[1]->splitInThirds(parts[3-3*corner], parts[4-3*corner], parts[5-3*corner]);
                        [parts[3 - 3 * corner], parts[4 - 3 * corner], parts[5 - 3 * corner]] = contour.edges[1].splitInThirds();
                        parts[0].color = parts[1].color = refget$1(colors[0]);
                        parts[2].color = parts[3].color = refget$1(colors[1]);
                        parts[4].color = parts[5].color = refget$1(colors[2]);
                    }
                    else {
                        parts[0].color = refget$1(colors[0]);
                        parts[1].color = refget$1(colors[1]);
                        parts[2].color = refget$1(colors[2]);
                    }
                    contour.edges.length = 0;
                    for (let i = 0; parts[i]; ++i) {
                        contour.edges.push(new EdgeHolder(parts[i]));
                    }
                }
            }
            // Multiple corners
            else {
                const cornerCount = corners.length;
                let spline = 0;
                const start = corners[0];
                const m = contour.edges.length;
                const color = refnew$1(exports.EdgeColor.WHITE);
                // switchColor(color, seed);
                switchColor(color, seed);
                let initialColor = refget$1(color);
                for (let i = 0; i < m; ++i) {
                    const index = (start + i) % m;
                    if (spline + 1 < cornerCount && corners[spline + 1] === index) {
                        ++spline;
                        // switchColor(color, seed, EdgeColor((spline === cornerCount-1)*initialColor));
                        switchColor(color, seed, ((spline === cornerCount - 1) ? 1 : 0) * initialColor);
                    }
                    contour.edges[index].color = refget$1(color);
                }
            }
        }
    }

    /// Represents a signed distance and alignment, which together can be compared to uniquely determine the closest edge segment.
    class SignedDistance {
        constructor(distance = -1e240, dot = 1) {
            this.distance = distance;
            this.dot = dot;
        }
        copy(other) {
            this.distance = other.distance;
            this.dot = other.dot;
            return this;
        }
        static lt(a, b) {
            return Math.abs(a.distance) < Math.abs(b.distance) || (Math.abs(a.distance) === Math.abs(b.distance) && a.dot < b.dot);
        }
        static gt(a, b) {
            return Math.abs(a.distance) > Math.abs(b.distance) || (Math.abs(a.distance) === Math.abs(b.distance) && a.dot > b.dot);
        }
        static le(a, b) {
            return Math.abs(a.distance) < Math.abs(b.distance) || (Math.abs(a.distance) === Math.abs(b.distance) && a.dot <= b.dot);
        }
        static ge(a, b) {
            return Math.abs(a.distance) > Math.abs(b.distance) || (Math.abs(a.distance) === Math.abs(b.distance) && a.dot >= b.dot);
        }
    }
    SignedDistance.INFINITE = new SignedDistance(-1e240, 1);

    // ax^2 + bx + c = 0
    function solveQuadratic(x, a, b, c) {
        if (Math.abs(a) < 1e-14) {
            if (Math.abs(b) < 1e-14) {
                if (c === 0)
                    return -1;
                return 0;
            }
            x[0] = -c / b;
            return 1;
        }
        let dscr = b * b - 4 * a * c;
        if (dscr > 0) {
            dscr = Math.sqrt(dscr);
            x[0] = (-b + dscr) / (2 * a);
            x[1] = (-b - dscr) / (2 * a);
            return 2;
        }
        else if (dscr === 0) {
            x[0] = -b / (2 * a);
            return 1;
        }
        else
            return 0;
    }
    function solveCubicNormed(x, a, b, c) {
        const a2 = a * a;
        let q = (a2 - 3 * b) / 9;
        const r = (a * (2 * a2 - 9 * b) + 27 * c) / 54;
        const r2 = r * r;
        const q3 = q * q * q;
        let A, B;
        if (r2 < q3) {
            let t = r / Math.sqrt(q3);
            if (t < -1)
                t = -1;
            if (t > 1)
                t = 1;
            t = Math.acos(t);
            a /= 3;
            q = -2 * Math.sqrt(q);
            x[0] = q * Math.cos(t / 3) - a;
            x[1] = q * Math.cos((t + 2 * Math.PI) / 3) - a;
            x[2] = q * Math.cos((t - 2 * Math.PI) / 3) - a;
            return 3;
        }
        else {
            A = -Math.pow(Math.abs(r) + Math.sqrt(r2 - q3), 1 / 3.);
            if (r < 0)
                A = -A;
            B = A === 0 ? 0 : q / A;
            a /= 3;
            x[0] = (A + B) - a;
            x[1] = -0.5 * (A + B) - a;
            x[2] = 0.5 * Math.sqrt(3.) * (A - B);
            if (Math.abs(x[2]) < 1e-14)
                return 2;
            return 1;
        }
    }
    // ax^3 + bx^2 + cx + d = 0
    function solveCubic(x, a, b, c, d) {
        if (Math.abs(a) < 1e-14) {
            const x2 = [0, 0];
            const r = solveQuadratic(x2, b, c, d);
            x[0] = x2[0];
            x[1] = x2[1];
            x[2] = 0;
            return r;
        }
        return solveCubicNormed(x, b / a, c / a, d / a);
    }

    function refget$2(ref) { return ref[0]; }
    function refset$2(ref, val) { ref[0] = val; return ref; }
    function pointBounds(p, bounds) {
        if (p.x < bounds.l)
            bounds.l = p.x;
        if (p.y < bounds.b)
            bounds.b = p.y;
        if (p.x > bounds.r)
            bounds.r = p.x;
        if (p.y > bounds.t)
            bounds.t = p.y;
    }
    // Parameters for iterative search of closest point on a cubic Bezier curve. Increase for higher precision.
    const MSDFGEN_CUBIC_SEARCH_STARTS = 4;
    const MSDFGEN_CUBIC_SEARCH_STEPS = 4;
    /// An abstract edge segment.
    class EdgeSegment {
        constructor(edgeColor = exports.EdgeColor.WHITE) {
            this.color = exports.EdgeColor.WHITE;
            this.color = edgeColor;
        }
        /// Converts a previously retrieved signed distance from origin to pseudo-distance.
        distanceToPseudoDistance(distance, origin, param) {
            if (param < 0) {
                const dir = this.direction(0).normalize();
                // Vector2 aq = origin-point(0);
                const aq = origin.sub(this.point(0));
                const ts = Vector2.dotProduct(aq, dir);
                if (ts < 0) {
                    const pseudoDistance = Vector2.crossProduct(aq, dir);
                    if (Math.abs(pseudoDistance) <= Math.abs(distance.distance)) {
                        distance.distance = pseudoDistance;
                        distance.dot = 0;
                    }
                }
            }
            else if (param > 1) {
                const dir = this.direction(1).normalize();
                // Vector2 bq = origin-point(1);
                const bq = origin.sub(this.point(1));
                const ts = Vector2.dotProduct(bq, dir);
                if (ts > 0) {
                    const pseudoDistance = Vector2.crossProduct(bq, dir);
                    if (Math.abs(pseudoDistance) <= Math.abs(distance.distance)) {
                        distance.distance = pseudoDistance;
                        distance.dot = 0;
                    }
                }
            }
        }
    }
    /// A line segment.
    class LinearSegment extends EdgeSegment {
        constructor(p0, p1, edgeColor = exports.EdgeColor.WHITE) {
            super(edgeColor);
            this.p = [new Point2(), new Point2()];
            this.p[0].set(p0.x, p0.y);
            this.p[1].set(p1.x, p1.y);
        }
        clone() {
            return new LinearSegment(this.p[0], this.p[1], this.color);
        }
        point(param) {
            const p = this.p;
            const mix$$1 = Vector2.mix;
            return mix$$1(p[0], p[1], param);
        }
        direction(param) {
            const p = this.p;
            // return p[1]-p[0];
            return p[1].sub(p[0]);
        }
        signedDistance(origin, param) {
            const p = this.p;
            // Vector2 aq = origin-p[0];
            const aq = origin.sub(p[0]);
            // Vector2 ab = p[1]-p[0];
            const ab = p[1].sub(p[0]);
            refset$2(param, Vector2.dotProduct(aq, ab) / Vector2.dotProduct(ab, ab));
            // Vector2 eq = p[param > .5]-origin;
            const eq = p[refget$2(param) > .5 ? 1 : 0].sub(origin);
            const endpointDistance = eq.length();
            if (refget$2(param) > 0 && refget$2(param) < 1) {
                const orthoDistance = Vector2.dotProduct(ab.getOrthonormal(false), aq);
                if (Math.abs(orthoDistance) < endpointDistance) {
                    return new SignedDistance(orthoDistance, 0);
                }
            }
            return new SignedDistance(nonZeroSign(Vector2.crossProduct(aq, ab)) * endpointDistance, Math.abs(Vector2.dotProduct(ab.normalize(), eq.normalize())));
        }
        bounds(bounds) {
            pointBounds(this.p[0], bounds);
            pointBounds(this.p[1], bounds);
        }
        moveStartPoint(to) {
            // p[0] = to;
            this.p[0].copy(to);
        }
        moveEndPoint(to) {
            // p[1] = to;
            this.p[1].copy(to);
        }
        splitInThirds() {
            return [
                new LinearSegment(this.p[0], this.point(1 / 3.), this.color),
                new LinearSegment(this.point(1 / 3.), this.point(2 / 3.), this.color),
                new LinearSegment(this.point(2 / 3.), this.p[1], this.color),
            ];
        }
    }
    /// A quadratic Bezier curve.
    class QuadraticSegment extends EdgeSegment {
        constructor(p0, p1, p2, edgeColor = exports.EdgeColor.WHITE) {
            super(edgeColor);
            this.p = [new Point2(), new Point2(), new Point2()];
            if (p1.eq(p0) || p1.eq(p2)) {
                this.p[0].set(p0.x, p0.y);
                this.p[1].set(0.5 * (p0.x + p2.x), 0.5 * (p0.y + p2.y));
                this.p[2].set(p2.x, p2.y);
            }
            else {
                this.p[0].set(p0.x, p0.y);
                this.p[1].set(p1.x, p1.y);
                this.p[2].set(p2.x, p2.y);
            }
        }
        clone() {
            return new QuadraticSegment(this.p[0], this.p[1], this.p[2], this.color);
        }
        point(param) {
            const p = this.p;
            const mix$$1 = Vector2.mix;
            return mix$$1(mix$$1(p[0], p[1], param), mix$$1(p[1], p[2], param), param);
        }
        direction(param) {
            const p = this.p;
            const mix$$1 = Vector2.mix;
            // return mix(p[1]-p[0], p[2]-p[1], param);
            return mix$$1(p[1].sub(p[0]), p[2].sub(p[1]), param);
        }
        signedDistance(origin, param) {
            const p = this.p;
            const dotProduct = Vector2.dotProduct;
            const crossProduct = Vector2.crossProduct;
            // Vector2 qa = p[0]-origin;
            const qa = p[0].sub(origin);
            // Vector2 ab = p[1]-p[0];
            const ab = p[1].sub(p[0]);
            // Vector2 br = p[0]+p[2]-p[1]-p[1];
            const br = p[0].add(p[2]).sub(p[1]).sub(p[1]);
            const a = dotProduct(br, br);
            const b = 3 * dotProduct(ab, br);
            const c = 2 * dotProduct(ab, ab) + dotProduct(qa, br);
            const d = dotProduct(qa, ab);
            // double t[3];
            const t = [0, 0, 0];
            const solutions = solveCubic(t, a, b, c, d);
            let minDistance = nonZeroSign(crossProduct(ab, qa)) * qa.length(); // distance from A
            // param = -dotProduct(qa, ab)/dotProduct(ab, ab);
            refset$2(param, -dotProduct(qa, ab) / dotProduct(ab, ab));
            {
                // double distance = nonZeroSign(crossProduct(p[2]-p[1], p[2]-origin))*(p[2]-origin).length(); // distance from B
                const distance = nonZeroSign(crossProduct(p[2].sub(p[1]), p[2].sub(origin))) * (p[2].sub(origin)).length(); // distance from B
                if (Math.abs(distance) < Math.abs(minDistance)) {
                    minDistance = distance;
                    // param = dotProduct(origin-p[1], p[2]-p[1])/dotProduct(p[2]-p[1], p[2]-p[1]);
                    refset$2(param, dotProduct(origin.sub(p[1]), p[2].sub(p[1])) / dotProduct(p[2].sub(p[1]), p[2].sub(p[1])));
                }
            }
            for (let i = 0; i < solutions; ++i) {
                if (t[i] > 0 && t[i] < 1) {
                    // Point2 endpoint = p[0]+2*t[i]*ab+t[i]*t[i]*br;
                    const endpoint = new Point2();
                    endpoint.x = p[0].x + 2 * t[i] * ab.x + t[i] * t[i] * br.x;
                    endpoint.y = p[0].y + 2 * t[i] * ab.y + t[i] * t[i] * br.y;
                    // double distance = nonZeroSign(crossProduct(p[2]-p[0], endpoint-origin))*(endpoint-origin).length();
                    const distance = nonZeroSign(crossProduct(p[2].sub(p[0]), endpoint.sub(origin))) * (endpoint.sub(origin)).length();
                    if (Math.abs(distance) <= Math.abs(minDistance)) {
                        minDistance = distance;
                        refset$2(param, t[i]);
                    }
                }
            }
            if (refget$2(param) >= 0 && refget$2(param) <= 1)
                return new SignedDistance(minDistance, 0);
            if (refget$2(param) < .5)
                return new SignedDistance(minDistance, Math.abs(dotProduct(ab.normalize(), qa.normalize())));
            else
                return new SignedDistance(minDistance, Math.abs(dotProduct((p[2].sub(p[1])).normalize(), (p[2].sub(origin)).normalize())));
        }
        bounds(bounds) {
            const p = this.p;
            pointBounds(p[0], bounds);
            pointBounds(p[2], bounds);
            // Vector2 bot = (p[1]-p[0])-(p[2]-p[1]);
            const bot = p[1].sub(p[0]).sub(p[2].sub(p[1]));
            if (bot.x) {
                const param = (p[1].x - p[0].x) / bot.x;
                if (param > 0 && param < 1)
                    pointBounds(this.point(param), bounds);
            }
            if (bot.y) {
                const param = (p[1].y - p[0].y) / bot.y;
                if (param > 0 && param < 1)
                    pointBounds(this.point(param), bounds);
            }
        }
        moveStartPoint(to) {
            const p = this.p;
            // Vector2 origSDir = p[0]-p[1];
            const origSDir = p[0].sub(p[1]);
            // Point2 origP1 = p[1];
            const origP1 = new Vector2().copy(p[1]);
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
        moveEndPoint(to) {
            const p = this.p;
            // Vector2 origEDir = p[2]-p[1];
            const origEDir = p[2].sub(p[1]);
            // Point2 origP1 = p[1];
            const origP1 = new Vector2().copy(p[1]);
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
        splitInThirds() {
            const p = this.p;
            const mix$$1 = Vector2.mix;
            return [
                new QuadraticSegment(p[0], mix$$1(p[0], p[1], 1 / 3.), this.point(1 / 3.), this.color),
                new QuadraticSegment(this.point(1 / 3.), mix$$1(mix$$1(p[0], p[1], 5 / 9.), mix$$1(p[1], p[2], 4 / 9.), .5), this.point(2 / 3.), this.color),
                new QuadraticSegment(this.point(2 / 3.), mix$$1(p[1], p[2], 2 / 3.), p[2], this.color),
            ];
        }
    }
    /// A cubic Bezier curve.
    class CubicSegment extends EdgeSegment {
        constructor(p0, p1, p2, p3, edgeColor = exports.EdgeColor.WHITE) {
            super(edgeColor);
            this.p = [new Point2(), new Point2(), new Point2(), new Point2()];
            this.p[0].set(p0.x, p0.y);
            this.p[1].set(p1.x, p1.y);
            this.p[2].set(p2.x, p2.y);
            this.p[3].set(p3.x, p3.y);
        }
        clone() {
            return new CubicSegment(this.p[0], this.p[1], this.p[2], this.p[3], this.color);
        }
        point(param) {
            const p = this.p;
            const mix$$1 = Vector2.mix;
            // Vector2 p12 = mix(p[1], p[2], param);
            const p12 = mix$$1(p[1], p[2], param);
            // return mix(mix(mix(p[0], p[1], param), p12, param), mix(p12, mix(p[2], p[3], param), param), param);
            return mix$$1(mix$$1(mix$$1(p[0], p[1], param), p12, param), mix$$1(p12, mix$$1(p[2], p[3], param), param), param);
        }
        direction(param) {
            const p = this.p;
            const mix$$1 = Vector2.mix;
            // Vector2 tangent = mix(mix(p[1]-p[0], p[2]-p[1], param), mix(p[2]-p[1], p[3]-p[2], param), param);
            const tangent = mix$$1(mix$$1(p[1].sub(p[0]), p[2].sub(p[1]), param), mix$$1(p[2].sub(p[1]), p[3].sub(p[2]), param), param);
            // if (!tangent) {
            if (tangent.iszero()) {
                // if (param === 0) return p[2]-p[0];
                if (param === 0)
                    return p[2].sub(p[0]);
                // if (param === 1) return p[3]-p[1];
                if (param === 1)
                    return p[3].sub(p[1]);
            }
            return tangent;
        }
        signedDistance(origin, param) {
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
            let minDistance = nonZeroSign(crossProduct(epDir, qa)) * qa.length(); // distance from A
            refset$2(param, -dotProduct(qa, epDir) / dotProduct(epDir, epDir));
            {
                epDir = this.direction(1);
                // double distance = nonZeroSign(crossProduct(epDir, p[3]-origin))*(p[3]-origin).length(); // distance from B
                const distance = nonZeroSign(crossProduct(epDir, p[3].sub(origin))) * (p[3].sub(origin)).length(); // distance from B
                if (Math.abs(distance) < Math.abs(minDistance)) {
                    minDistance = distance;
                    // param = dotProduct(origin+epDir-p[3], epDir)/dotProduct(epDir, epDir);
                    refset$2(param, dotProduct(origin.add(epDir).sub(p[3]), epDir) / dotProduct(epDir, epDir));
                }
            }
            // Iterative minimum distance search
            for (let i = 0; i <= MSDFGEN_CUBIC_SEARCH_STARTS; ++i) {
                // double t = (double) i/MSDFGEN_CUBIC_SEARCH_STARTS;
                let t = i / MSDFGEN_CUBIC_SEARCH_STARTS;
                for (let step = 0;; ++step) {
                    // Vector2 qpt = point(t)-origin;
                    const qpt = this.point(t).sub(origin);
                    // double distance = nonZeroSign(crossProduct(direction(t), qpt))*qpt.length();
                    const distance = nonZeroSign(crossProduct(this.direction(t), qpt)) * qpt.length();
                    if (Math.abs(distance) < Math.abs(minDistance)) {
                        minDistance = distance;
                        refset$2(param, t);
                    }
                    if (step === MSDFGEN_CUBIC_SEARCH_STEPS)
                        break;
                    // Improve t
                    // Vector2 d1 = 3*as*t*t+6*br*t+3*ab;
                    const d1 = new Vector2();
                    d1.x = 3 * as.x * t * t + 6 * br.x * t + 3 * ab.x;
                    d1.y = 3 * as.y * t * t + 6 * br.y * t + 3 * ab.y;
                    // Vector2 d2 = 6*as*t+6*br;
                    const d2 = new Vector2();
                    d2.x = 6 * as.x * t + 6 * br.x;
                    d2.y = 6 * as.y * t + 6 * br.y;
                    t -= dotProduct(qpt, d1) / (dotProduct(d1, d1) + dotProduct(qpt, d2));
                    if (t < 0 || t > 1)
                        break;
                }
            }
            if (refget$2(param) >= 0 && refget$2(param) <= 1)
                return new SignedDistance(minDistance, 0);
            if (refget$2(param) < .5)
                return new SignedDistance(minDistance, Math.abs(dotProduct(this.direction(0).normalize(), qa.normalize())));
            else
                return new SignedDistance(minDistance, Math.abs(dotProduct(this.direction(1).normalize(), (p[3].sub(origin)).normalize())));
        }
        bounds(bounds) {
            const p = this.p;
            pointBounds(p[0], bounds);
            pointBounds(p[3], bounds);
            // const a0: Vector2 = p[1]-p[0];
            const a0 = p[1].sub(p[0]);
            // const a1: Vector2 = 2*(p[2]-p[1]-a0);
            const a1 = p[2].sub(p[1]).sub(a0).mulseq(2);
            // const a2: Vector2 = p[3]-3*p[2]+3*p[1]-p[0];
            const a2 = p[3].sub(p[2].muls(3)).add(p[1].muls(3)).sub(p[0]);
            const params = [0, 0];
            let solutions;
            solutions = solveQuadratic(params, a2.x, a1.x, a0.x);
            for (let i = 0; i < solutions; ++i)
                if (params[i] > 0 && params[i] < 1)
                    pointBounds(this.point(params[i]), bounds);
            solutions = solveQuadratic(params, a2.y, a1.y, a0.y);
            for (let i = 0; i < solutions; ++i)
                if (params[i] > 0 && params[i] < 1)
                    pointBounds(this.point(params[i]), bounds);
        }
        moveStartPoint(to) {
            const p = this.p;
            // p[1] += to-p[0];
            p[1].addeq(to.sub(p[0]));
            // p[0] = to;
            p[0].copy(to);
        }
        moveEndPoint(to) {
            const p = this.p;
            // p[2] += to-p[3];
            p[2].addeq(to.sub(p[3]));
            // p[3] = to;
            p[3].copy(to);
        }
        splitInThirds() {
            const p = this.p;
            const mix$$1 = Vector2.mix;
            return [
                new CubicSegment(p[0], p[0] === p[1] ? p[0] : mix$$1(p[0], p[1], 1 / 3.), mix$$1(mix$$1(p[0], p[1], 1 / 3.), mix$$1(p[1], p[2], 1 / 3.), 1 / 3.), this.point(1 / 3.), this.color),
                new CubicSegment(this.point(1 / 3.), mix$$1(mix$$1(mix$$1(p[0], p[1], 1 / 3.), mix$$1(p[1], p[2], 1 / 3.), 1 / 3.), mix$$1(mix$$1(p[1], p[2], 1 / 3.), mix$$1(p[2], p[3], 1 / 3.), 1 / 3.), 2 / 3.), mix$$1(mix$$1(mix$$1(p[0], p[1], 2 / 3.), mix$$1(p[1], p[2], 2 / 3.), 2 / 3.), mix$$1(mix$$1(p[1], p[2], 2 / 3.), mix$$1(p[2], p[3], 2 / 3.), 2 / 3.), 1 / 3.), this.point(2 / 3.), this.color),
                new CubicSegment(this.point(2 / 3.), mix$$1(mix$$1(p[1], p[2], 2 / 3.), mix$$1(p[2], p[3], 2 / 3.), 2 / 3.), p[2] === p[3] ? p[3] : mix$$1(p[2], p[3], 2 / 3.), p[3], this.color),
            ];
        }
    }

    /// Vector shape representation.
    class Shape {
        constructor() {
            /// The list of contours the shape consists of.
            this.contours = [];
            /// Specifies whether the shape uses bottom-to-top (false) or top-to-bottom (true) Y coordinates.
            this.inverseYAxis = false;
        }
        addContour(...args) {
            if (args.length === 1) {
                const contour = args[0];
                this.contours.push(contour);
                return;
            }
            else {
                const contour = new Contour();
                this.contours.push(contour);
                return contour;
            }
        }
        /// Normalizes the shape geometry for distance field generation.
        normalize() {
            for (const contour of this.contours) {
                if (contour.edges.length === 1) {
                    // EdgeSegment *parts[3] = { };
                    // contour->edges[0]->splitInThirds(parts[0], parts[1], parts[2]);
                    // contour->edges.clear();
                    // contour->edges.push_back(EdgeHolder(parts[0]));
                    // contour->edges.push_back(EdgeHolder(parts[1]));
                    // contour->edges.push_back(EdgeHolder(parts[2]));
                    const parts = contour.edges[0].splitInThirds();
                    contour.edges.length = 0;
                    contour.edges.push(new EdgeHolder(parts[0]));
                    contour.edges.push(new EdgeHolder(parts[1]));
                    contour.edges.push(new EdgeHolder(parts[2]));
                }
            }
        }
        /// Performs basic checks to determine if the object represents a valid shape.
        validate() {
            for (const contour of this.contours) {
                if (contour.edges.length > 0) {
                    let corner = contour.edges[contour.edges.length - 1].point(1);
                    for (const edge of contour.edges) {
                        if (!edge.validate()) {
                            return false;
                        }
                        if (edge.point(0).ne(corner)) {
                            return false;
                        }
                        corner = edge.point(1);
                    }
                }
            }
            return true;
        }
        /// Computes the shape's bounding box.
        bounds(bounds = new Bounds2()) {
            for (const contour of this.contours) {
                contour.bounds(bounds);
            }
            return bounds;
        }
    }

    function sample(bitmap, pos) {
        const w = bitmap.width();
        const h = bitmap.height();
        const x = pos.x * w - .5;
        const y = pos.y * h - .5;
        let l = Math.floor(x);
        let b = Math.floor(y);
        let r = l + 1;
        let t = b + 1;
        const lr = x - l;
        const bt = y - b;
        l = clamp(l, w - 1), r = clamp(r, w - 1);
        b = clamp(b, h - 1), t = clamp(t, h - 1);
        const mix$$1 = FloatRGB.mix;
        return mix$$1(mix$$1(bitmap.getAt(l, b), bitmap.getAt(r, b), lr), mix$$1(bitmap.getAt(l, t), bitmap.getAt(r, t), lr), bt);
    }
    function distVal(dist, pxRange) {
        if (!pxRange) {
            return dist > .5 ? 1 : 0;
        }
        return clamp((dist - .5) * pxRange + .5);
    }
    /// Reconstructs the shape's appearance into output from the distance field sdf.
    // void renderSDF(Bitmap<float> &output, const Bitmap<float> &sdf, double pxRange = 0);
    // void renderSDF(Bitmap<FloatRGB> &output, const Bitmap<float> &sdf, double pxRange = 0);
    // void renderSDF(Bitmap<float> &output, const Bitmap<FloatRGB> &sdf, double pxRange = 0);
    // void renderSDF(Bitmap<FloatRGB> &output, const Bitmap<FloatRGB> &sdf, double pxRange = 0);
    // void renderSDF(Bitmap<FloatRGB> &output, const Bitmap<FloatRGB> &sdf, double pxRange) {
    function renderSDF(output, sdf, pxRange = 0) {
        const w = output.width();
        const h = output.height();
        pxRange *= (w + h) / (sdf.width() + sdf.height());
        for (let y = 0; y < h; ++y)
            for (let x = 0; x < w; ++x) {
                // FloatRGB s = sample(sdf, Point2((x+.5)/w, (y+.5)/h));
                const s = sample(sdf, new Point2((x + .5) / w, (y + .5) / h));
                // output(x, y).r = distVal(s.r, pxRange);
                // output(x, y).g = distVal(s.g, pxRange);
                // output(x, y).b = distVal(s.b, pxRange);
                output.getAt(x, y).r = distVal(s.r, pxRange);
                output.getAt(x, y).g = distVal(s.g, pxRange);
                output.getAt(x, y).b = distVal(s.b, pxRange);
            }
    }
    /// Snaps the values of the floating-point bitmaps into one of the 256 values representable in a standard 8-bit bitmap.
    // void simulate8bit(Bitmap<float> &bitmap);
    // void simulate8bit(Bitmap<FloatRGB> &bitmap);

    function refnew$3(val) { return [val]; }
    function refget$3(ref) { return ref[0]; }
    class MultiDistance {
        constructor() {
            this.r = 0;
            this.g = 0;
            this.b = 0;
            this.med = 0;
        }
        copy(other) {
            this.r = other.r;
            this.g = other.g;
            this.b = other.b;
            this.med = other.med;
            return this;
        }
    }
    function pixelClash(a, b, threshold) {
        // Only consider pair where both are on the inside or both are on the outside
        const aIn = (a.r > .5 ? 1 : 0) + (a.g > .5 ? 1 : 0) + (a.b > .5 ? 1 : 0) >= 2;
        const bIn = (b.r > .5 ? 1 : 0) + (b.g > .5 ? 1 : 0) + (b.b > .5 ? 1 : 0) >= 2;
        if (aIn !== bIn) {
            return false;
        }
        // If the change is 0 <-> 1 or 2 <-> 3 channels and not 1 <-> 1 or 2 <-> 2, it is not a clash
        if ((a.r > .5 && a.g > .5 && a.b > .5) || (a.r < .5 && a.g < .5 && a.b < .5)
            || (b.r > .5 && b.g > .5 && b.b > .5) || (b.r < .5 && b.g < .5 && b.b < .5)) {
            return false;
        }
        // Find which color is which: _a, _b = the changing channels, _c = the remaining one
        let aa, ab, ba, bb, ac, bc;
        if ((a.r > .5) !== (b.r > .5) && (a.r < .5) !== (b.r < .5)) {
            aa = a.r, ba = b.r;
            if ((a.g > .5) !== (b.g > .5) && (a.g < .5) !== (b.g < .5)) {
                ab = a.g, bb = b.g;
                ac = a.b, bc = b.b;
            }
            else if ((a.b > .5) !== (b.b > .5) && (a.b < .5) !== (b.b < .5)) {
                ab = a.b, bb = b.b;
                ac = a.g, bc = b.g;
            }
            else {
                return false; // this should never happen
            }
        }
        else if ((a.g > .5) !== (b.g > .5) && (a.g < .5) !== (b.g < .5)
            && (a.b > .5) !== (b.b > .5) && (a.b < .5) !== (b.b < .5)) {
            aa = a.g, ba = b.g;
            ab = a.b, bb = b.b;
            ac = a.r, bc = b.r;
        }
        else {
            return false;
        }
        // Find if the channels are in fact discontinuous
        return (Math.abs(aa - ba) >= threshold)
            && (Math.abs(ab - bb) >= threshold)
            && Math.abs(ac - .5) >= Math.abs(bc - .5); // Out of the pair, only flag the pixel farther from a shape edge
    }
    function msdfErrorCorrection(output, threshold) {
        const clashes = [];
        const w = output.width(), h = output.height();
        for (let y = 0; y < h; ++y) {
            for (let x = 0; x < w; ++x) {
                if ((x > 0 && pixelClash(output.getAt(x, y), output.getAt(x - 1, y), threshold.x))
                    || (x < w - 1 && pixelClash(output.getAt(x, y), output.getAt(x + 1, y), threshold.x))
                    || (y > 0 && pixelClash(output.getAt(x, y), output.getAt(x, y - 1), threshold.y))
                    || (y < h - 1 && pixelClash(output.getAt(x, y), output.getAt(x, y + 1), threshold.y))) {
                    clashes.push({ x, y });
                }
            }
        }
        for (const clash of clashes) {
            const pixel = output.getAt(clash.x, clash.y);
            const med = median(pixel.r, pixel.g, pixel.b);
            pixel.r = pixel.g = pixel.b = med;
        }
    }
    function generateSDF(output, shape, range, scale, translate) {
        const contourCount = shape.contours.length;
        const w = output.width(), h = output.height();
        const windings = [];
        for (const contour of shape.contours) {
            windings.push(contour.winding());
        }
        {
            const contourSD = [];
            // contourSD.resize(contourCount);
            for (let i = 0; i < contourCount; ++i) {
                contourSD[i] = 0;
            }
            for (let y = 0; y < h; ++y) {
                const row = shape.inverseYAxis ? h - y - 1 : y;
                for (let x = 0; x < w; ++x) {
                    const dummy = refnew$3(0);
                    const p = new Point2();
                    p.x = (x + .5) / scale.x - translate.x;
                    p.y = (y + .5) / scale.y - translate.y;
                    let negDist = -SignedDistance.INFINITE.distance;
                    let posDist = SignedDistance.INFINITE.distance;
                    let winding = 0;
                    for (let i = 0; i < contourCount; ++i) {
                        const contour = shape.contours[i];
                        const minDistance = new SignedDistance();
                        for (const edge of contour.edges) {
                            const distance = edge.signedDistance(p, dummy);
                            if (SignedDistance.lt(distance, minDistance)) {
                                minDistance.copy(distance);
                            }
                        }
                        contourSD[i] = minDistance.distance;
                        if (windings[i] > 0 && minDistance.distance >= 0 && Math.abs(minDistance.distance) < Math.abs(posDist)) {
                            posDist = minDistance.distance;
                        }
                        if (windings[i] < 0 && minDistance.distance <= 0 && Math.abs(minDistance.distance) < Math.abs(negDist)) {
                            negDist = minDistance.distance;
                        }
                    }
                    let sd = SignedDistance.INFINITE.distance;
                    if (posDist >= 0 && Math.abs(posDist) <= Math.abs(negDist)) {
                        sd = posDist;
                        winding = 1;
                        for (let i = 0; i < contourCount; ++i)
                            if (windings[i] > 0 && contourSD[i] > sd && Math.abs(contourSD[i]) < Math.abs(negDist))
                                sd = contourSD[i];
                    }
                    else if (negDist <= 0 && Math.abs(negDist) <= Math.abs(posDist)) {
                        sd = negDist;
                        winding = -1;
                        for (let i = 0; i < contourCount; ++i)
                            if (windings[i] < 0 && contourSD[i] < sd && Math.abs(contourSD[i]) < Math.abs(posDist))
                                sd = contourSD[i];
                    }
                    for (let i = 0; i < contourCount; ++i)
                        if (windings[i] !== winding && Math.abs(contourSD[i]) < Math.abs(sd))
                            sd = contourSD[i];
                    // output(x, row) = float(sd/range+.5);
                    const pixel = output.getAt(x, row);
                    pixel.a = sd / range + .5;
                }
            }
        }
    }
    function generatePseudoSDF(output, shape, range, scale, translate) {
        const contourCount = shape.contours.length;
        const w = output.width(), h = output.height();
        const windings = [];
        for (const contour of shape.contours) {
            windings.push(contour.winding());
        }
        {
            const contourSD = [];
            // contourSD.resize(contourCount);
            for (let i = 0; i < contourCount; ++i) {
                contourSD[i] = 0;
            }
            for (let y = 0; y < h; ++y) {
                const row = shape.inverseYAxis ? h - y - 1 : y;
                for (let x = 0; x < w; ++x) {
                    const p = new Point2();
                    p.x = (x + .5) / scale.x - translate.x;
                    p.y = (y + .5) / scale.y - translate.y;
                    let sd = SignedDistance.INFINITE.distance;
                    let negDist = -SignedDistance.INFINITE.distance;
                    let posDist = SignedDistance.INFINITE.distance;
                    let winding = 0;
                    for (let i = 0; i < contourCount; ++i) {
                        const contour = shape.contours[i];
                        const minDistance = new SignedDistance();
                        let nearEdge = null;
                        let nearParam = 0;
                        for (const edge of contour.edges) {
                            const param = refnew$3(0);
                            const distance = edge.signedDistance(p, param);
                            if (SignedDistance.lt(distance, minDistance)) {
                                minDistance.copy(distance);
                                nearEdge = edge;
                                nearParam = refget$3(param);
                            }
                        }
                        if (Math.abs(minDistance.distance) < Math.abs(sd)) {
                            sd = minDistance.distance;
                            winding = -windings[i];
                        }
                        if (nearEdge !== null) {
                            nearEdge.distanceToPseudoDistance(minDistance, p, nearParam);
                        }
                        contourSD[i] = minDistance.distance;
                        if (windings[i] > 0 && minDistance.distance >= 0 && Math.abs(minDistance.distance) < Math.abs(posDist)) {
                            posDist = minDistance.distance;
                        }
                        if (windings[i] < 0 && minDistance.distance <= 0 && Math.abs(minDistance.distance) < Math.abs(negDist)) {
                            negDist = minDistance.distance;
                        }
                    }
                    let psd = SignedDistance.INFINITE.distance;
                    if (posDist >= 0 && Math.abs(posDist) <= Math.abs(negDist)) {
                        psd = posDist;
                        winding = 1;
                        for (let i = 0; i < contourCount; ++i)
                            if (windings[i] > 0 && contourSD[i] > psd && Math.abs(contourSD[i]) < Math.abs(negDist))
                                psd = contourSD[i];
                    }
                    else if (negDist <= 0 && Math.abs(negDist) <= Math.abs(posDist)) {
                        psd = negDist;
                        winding = -1;
                        for (let i = 0; i < contourCount; ++i)
                            if (windings[i] < 0 && contourSD[i] < psd && Math.abs(contourSD[i]) < Math.abs(posDist))
                                psd = contourSD[i];
                    }
                    for (let i = 0; i < contourCount; ++i)
                        if (windings[i] !== winding && Math.abs(contourSD[i]) < Math.abs(sd))
                            psd = contourSD[i];
                    // output(x, row) = float(sd/range+.5);
                    const pixel = output.getAt(x, row);
                    pixel.a = sd / range + .5;
                }
            }
        }
    }
    class EdgePoint {
        constructor() {
            this.minDistance = new SignedDistance();
            this.nearEdge = null;
            this.nearParam = 0;
        }
        copy(other) {
            this.minDistance.copy(other.minDistance);
            this.nearEdge = other.nearEdge;
            this.nearParam = other.nearParam;
            return this;
        }
    }
    function generateMSDF(output, shape, range, scale, translate, edgeThreshold = 1.00000001) {
        const contourCount = shape.contours.length;
        const w = output.width(), h = output.height();
        const windings = [];
        for (const contour of shape.contours) {
            windings.push(contour.winding());
        }
        {
            const contourSD = [];
            // contourSD.resize(contourCount);
            for (let i = 0; i < contourCount; ++i) {
                contourSD[i] = new MultiDistance();
            }
            for (let y = 0; y < h; ++y) {
                const row = shape.inverseYAxis ? h - y - 1 : y;
                for (let x = 0; x < w; ++x) {
                    const p = new Point2();
                    p.x = (x + .5) / scale.x - translate.x;
                    p.y = (y + .5) / scale.y - translate.y;
                    const sr = new EdgePoint();
                    const sg = new EdgePoint();
                    const sb = new EdgePoint();
                    sr.nearEdge = sg.nearEdge = sb.nearEdge = null;
                    sr.nearParam = sg.nearParam = sb.nearParam = 0;
                    let d = Math.abs(SignedDistance.INFINITE.distance);
                    let negDist = -SignedDistance.INFINITE.distance;
                    let posDist = SignedDistance.INFINITE.distance;
                    let winding = 0;
                    for (let i = 0; i < contourCount; ++i) {
                        const contour = shape.contours[i];
                        const r = new EdgePoint();
                        const g = new EdgePoint();
                        const b = new EdgePoint();
                        r.nearEdge = g.nearEdge = b.nearEdge = null;
                        r.nearParam = g.nearParam = b.nearParam = 0;
                        for (const edge of contour.edges) {
                            const param = refnew$3(0);
                            const distance = edge.signedDistance(p, param);
                            // if (edge.color&EdgeColor.RED && distance < r.minDistance) {
                            if (edge.color & exports.EdgeColor.RED && SignedDistance.lt(distance, r.minDistance)) {
                                r.minDistance.copy(distance);
                                r.nearEdge = edge;
                                r.nearParam = refget$3(param);
                            }
                            // if (edge.color&EdgeColor.GREEN && distance < g.minDistance) {
                            if (edge.color & exports.EdgeColor.GREEN && SignedDistance.lt(distance, g.minDistance)) {
                                g.minDistance.copy(distance);
                                g.nearEdge = edge;
                                g.nearParam = refget$3(param);
                            }
                            // if (edge.color&EdgeColor.BLUE && distance < b.minDistance) {
                            if (edge.color & exports.EdgeColor.BLUE && SignedDistance.lt(distance, b.minDistance)) {
                                b.minDistance.copy(distance);
                                b.nearEdge = edge;
                                b.nearParam = refget$3(param);
                            }
                        }
                        // if (r.minDistance < sr.minDistance) {
                        if (SignedDistance.lt(r.minDistance, sr.minDistance)) {
                            sr.copy(r);
                            sr.nearEdge = r.nearEdge; // HACK
                        }
                        // if (g.minDistance < sg.minDistance) {
                        if (SignedDistance.lt(g.minDistance, sg.minDistance)) {
                            sg.copy(g);
                            sg.nearEdge = g.nearEdge; // HACK
                        }
                        // if (b.minDistance < sb.minDistance) {
                        if (SignedDistance.lt(b.minDistance, sb.minDistance)) {
                            sb.copy(b);
                            sb.nearEdge = b.nearEdge; // HACK
                        }
                        let medMinDistance = Math.abs(median(r.minDistance.distance, g.minDistance.distance, b.minDistance.distance));
                        if (medMinDistance < d) {
                            d = medMinDistance;
                            winding = -windings[i];
                        }
                        if (r.nearEdge !== null) {
                            r.nearEdge.distanceToPseudoDistance(r.minDistance, p, r.nearParam);
                        }
                        if (g.nearEdge !== null) {
                            g.nearEdge.distanceToPseudoDistance(g.minDistance, p, g.nearParam);
                        }
                        if (b.nearEdge !== null) {
                            b.nearEdge.distanceToPseudoDistance(b.minDistance, p, b.nearParam);
                        }
                        medMinDistance = median(r.minDistance.distance, g.minDistance.distance, b.minDistance.distance);
                        contourSD[i].r = r.minDistance.distance;
                        contourSD[i].g = g.minDistance.distance;
                        contourSD[i].b = b.minDistance.distance;
                        contourSD[i].med = medMinDistance;
                        if (windings[i] > 0 && medMinDistance >= 0 && Math.abs(medMinDistance) < Math.abs(posDist))
                            posDist = medMinDistance;
                        if (windings[i] < 0 && medMinDistance <= 0 && Math.abs(medMinDistance) < Math.abs(negDist))
                            negDist = medMinDistance;
                    }
                    if (sr.nearEdge !== null) {
                        sr.nearEdge.distanceToPseudoDistance(sr.minDistance, p, sr.nearParam);
                    }
                    if (sg.nearEdge !== null) {
                        sg.nearEdge.distanceToPseudoDistance(sg.minDistance, p, sg.nearParam);
                    }
                    if (sb.nearEdge !== null) {
                        sb.nearEdge.distanceToPseudoDistance(sb.minDistance, p, sb.nearParam);
                    }
                    const msd = new MultiDistance();
                    msd.r = msd.g = msd.b = msd.med = SignedDistance.INFINITE.distance;
                    if (posDist >= 0 && Math.abs(posDist) <= Math.abs(negDist)) {
                        msd.med = SignedDistance.INFINITE.distance;
                        winding = 1;
                        for (let i = 0; i < contourCount; ++i) {
                            if (windings[i] > 0 && contourSD[i].med > msd.med && Math.abs(contourSD[i].med) < Math.abs(negDist)) {
                                msd.copy(contourSD[i]);
                            }
                        }
                    }
                    else if (negDist <= 0 && Math.abs(negDist) <= Math.abs(posDist)) {
                        msd.med = -SignedDistance.INFINITE.distance;
                        winding = -1;
                        for (let i = 0; i < contourCount; ++i) {
                            if (windings[i] < 0 && contourSD[i].med < msd.med && Math.abs(contourSD[i].med) < Math.abs(posDist)) {
                                msd.copy(contourSD[i]);
                            }
                        }
                    }
                    for (let i = 0; i < contourCount; ++i) {
                        if (windings[i] !== winding && Math.abs(contourSD[i].med) < Math.abs(msd.med)) {
                            msd.copy(contourSD[i]);
                        }
                    }
                    if (median(sr.minDistance.distance, sg.minDistance.distance, sb.minDistance.distance) === msd.med) {
                        msd.r = sr.minDistance.distance;
                        msd.g = sg.minDistance.distance;
                        msd.b = sb.minDistance.distance;
                    }
                    // output(x, row).r = float(msd.r/range+.5);
                    // output(x, row).g = float(msd.g/range+.5);
                    // output(x, row).b = float(msd.b/range+.5);
                    const pixel = output.getAt(x, row);
                    pixel.r = msd.r / range + .5;
                    pixel.g = msd.g / range + .5;
                    pixel.b = msd.b / range + .5;
                }
            }
        }
        if (edgeThreshold > 0) {
            const threshold = new Vector2();
            threshold.x = edgeThreshold / (scale.x * range);
            threshold.y = edgeThreshold / (scale.y * range);
            msdfErrorCorrection(output, threshold);
        }
    }
    function generateSDF_legacy(output, shape, range, scale, translate) {
        throw new Error();
    }
    // void generateSDF_legacy(Bitmap<float> &output, const Shape &shape, double range, const Vector2 &scale, const Vector2 &translate) {
    //     int w = output.width(), h = output.height();
    // #ifdef MSDFGEN_USE_OPENMP
    //     #pragma omp parallel for
    // #endif
    //     for (int y = 0; y < h; ++y) {
    //         int row = shape.inverseYAxis ? h-y-1 : y;
    //         for (int x = 0; x < w; ++x) {
    //             double dummy;
    //             Point2 p = Vector2(x+.5, y+.5)/scale-translate;
    //             SignedDistance minDistance;
    //             for (std::vector<Contour>::const_iterator contour = shape.contours.begin(); contour !== shape.contours.end(); ++contour)
    //                 for (std::vector<EdgeHolder>::const_iterator edge = contour->edges.begin(); edge !== contour->edges.end(); ++edge) {
    //                     SignedDistance distance = (*edge)->signedDistance(p, dummy);
    //                     if (distance < minDistance)
    //                         minDistance = distance;
    //                 }
    //             output(x, row) = float(minDistance.distance/range+.5);
    //         }
    //     }
    // }
    function generatePseudoSDF_legacy(output, shape, range, scale, translate) {
        throw new Error();
    }
    // void generatePseudoSDF_legacy(Bitmap<float> &output, const Shape &shape, double range, const Vector2 &scale, const Vector2 &translate) {
    //     int w = output.width(), h = output.height();
    // #ifdef MSDFGEN_USE_OPENMP
    //     #pragma omp parallel for
    // #endif
    //     for (int y = 0; y < h; ++y) {
    //         int row = shape.inverseYAxis ? h-y-1 : y;
    //         for (int x = 0; x < w; ++x) {
    //             Point2 p = Vector2(x+.5, y+.5)/scale-translate;
    //             SignedDistance minDistance;
    //             const EdgeHolder *nearEdge = NULL;
    //             double nearParam = 0;
    //             for (std::vector<Contour>::const_iterator contour = shape.contours.begin(); contour !== shape.contours.end(); ++contour)
    //                 for (std::vector<EdgeHolder>::const_iterator edge = contour->edges.begin(); edge !== contour->edges.end(); ++edge) {
    //                     double param;
    //                     SignedDistance distance = (*edge)->signedDistance(p, param);
    //                     if (distance < minDistance) {
    //                         minDistance = distance;
    //                         nearEdge = &*edge;
    //                         nearParam = param;
    //                     }
    //                 }
    //             if (nearEdge)
    //                 (*nearEdge)->distanceToPseudoDistance(minDistance, p, nearParam);
    //             output(x, row) = float(minDistance.distance/range+.5);
    //         }
    //     }
    // }
    function generateMSDF_legacy(output, shape, range, scale, translate, edgeThreshold = 1.00000001) {
        throw new Error();
    }
    // void generateMSDF_legacy(Bitmap<FloatRGB> &output, const Shape &shape, double range, const Vector2 &scale, const Vector2 &translate, double edgeThreshold) {
    //     int w = output.width(), h = output.height();
    // #ifdef MSDFGEN_USE_OPENMP
    //     #pragma omp parallel for
    // #endif
    //     for (int y = 0; y < h; ++y) {
    //         int row = shape.inverseYAxis ? h-y-1 : y;
    //         for (int x = 0; x < w; ++x) {
    //             Point2 p = Vector2(x+.5, y+.5)/scale-translate;
    //             struct {
    //                 SignedDistance minDistance;
    //                 const EdgeHolder *nearEdge;
    //                 double nearParam;
    //             } r, g, b;
    //             r.nearEdge = g.nearEdge = b.nearEdge = NULL;
    //             r.nearParam = g.nearParam = b.nearParam = 0;
    //             for (std::vector<Contour>::const_iterator contour = shape.contours.begin(); contour !== shape.contours.end(); ++contour)
    //                 for (std::vector<EdgeHolder>::const_iterator edge = contour->edges.begin(); edge !== contour->edges.end(); ++edge) {
    //                     double param;
    //                     SignedDistance distance = (*edge)->signedDistance(p, param);
    //                     if ((*edge)->color&RED && distance < r.minDistance) {
    //                         r.minDistance = distance;
    //                         r.nearEdge = &*edge;
    //                         r.nearParam = param;
    //                     }
    //                     if ((*edge)->color&GREEN && distance < g.minDistance) {
    //                         g.minDistance = distance;
    //                         g.nearEdge = &*edge;
    //                         g.nearParam = param;
    //                     }
    //                     if ((*edge)->color&BLUE && distance < b.minDistance) {
    //                         b.minDistance = distance;
    //                         b.nearEdge = &*edge;
    //                         b.nearParam = param;
    //                     }
    //                 }
    //             if (r.nearEdge)
    //                 (*r.nearEdge)->distanceToPseudoDistance(r.minDistance, p, r.nearParam);
    //             if (g.nearEdge)
    //                 (*g.nearEdge)->distanceToPseudoDistance(g.minDistance, p, g.nearParam);
    //             if (b.nearEdge)
    //                 (*b.nearEdge)->distanceToPseudoDistance(b.minDistance, p, b.nearParam);
    //             output(x, row).r = float(r.minDistance.distance/range+.5);
    //             output(x, row).g = float(g.minDistance.distance/range+.5);
    //             output(x, row).b = float(b.minDistance.distance/range+.5);
    //         }
    //     }
    //     if (edgeThreshold > 0)
    //         msdfErrorCorrection(output, edgeThreshold/(scale*range));
    // }

    /*
     * MULTI-CHANNEL SIGNED DISTANCE FIELD GENERATOR v1.5 (2017-07-23)
     * ---------------------------------------------------------------
     * A utility by Viktor Chlumsky, (c) 2014 - 2017
     *
     * The technique used to generate multi-channel distance fields in this code
     * has been developed by Viktor Chlumsky in 2014 for his master's thesis,
     * "Shape Decomposition for Multi-Channel Distance Fields". It provides improved
     * quality of sharp corners in glyphs and other 2D shapes in comparison to monochrome
     * distance fields. To reconstruct an image of the shape, apply the median of three
     * operation on the triplet of sampled distance field values.
     *
     */
    const MSDFGEN_VERSION = "1.5";

    exports.VERSION = MSDFGEN_VERSION;
    exports.MSDFGEN_VERSION = MSDFGEN_VERSION;
    exports.min = min;
    exports.max = max;
    exports.median = median;
    exports.mix = mix;
    exports.clamp = clamp;
    exports.sign = sign;
    exports.nonZeroSign = nonZeroSign;
    exports.Float = Float;
    exports.FloatRGB = FloatRGB;
    exports.Bitmap = Bitmap;
    exports.BitmapFloat = BitmapFloat;
    exports.BitmapFloatRGB = BitmapFloatRGB;
    exports.Contour = Contour;
    exports.edgeColoringSimple = edgeColoringSimple;
    exports.EdgeSegment = EdgeSegment;
    exports.LinearSegment = LinearSegment;
    exports.QuadraticSegment = QuadraticSegment;
    exports.CubicSegment = CubicSegment;
    exports.EdgeHolder = EdgeHolder;
    exports.solveQuadratic = solveQuadratic;
    exports.solveCubic = solveCubic;
    exports.Shape = Shape;
    exports.SignedDistance = SignedDistance;
    exports.Vector2 = Vector2;
    exports.Point2 = Point2;
    exports.Bounds2 = Bounds2;
    exports.renderSDF = renderSDF;
    exports.msdfErrorCorrection = msdfErrorCorrection;
    exports.generateSDF = generateSDF;
    exports.generatePseudoSDF = generatePseudoSDF;
    exports.generateMSDF = generateMSDF;
    exports.generateSDF_legacy = generateSDF_legacy;
    exports.generatePseudoSDF_legacy = generatePseudoSDF_legacy;
    exports.generateMSDF_legacy = generateMSDF_legacy;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
