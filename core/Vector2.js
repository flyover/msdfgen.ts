System.register(["./arithmetics"], function (exports_1, context_1) {
    "use strict";
    var arithmetics_1, Vector2, Point2, Bounds2;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (arithmetics_1_1) {
                arithmetics_1 = arithmetics_1_1;
            }
        ],
        execute: function () {
            /**
            * A 2-dimensional euclidean vector with double precision.
            * Implementation based on the Vector2 template from Artery Engine.
            * @author Viktor Chlumsky
            */
            Vector2 = class Vector2 {
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
                    out.x = arithmetics_1.mix(a.x, b.x, weight);
                    out.y = arithmetics_1.mix(a.y, b.y, weight);
                    return out;
                }
            };
            exports_1("Vector2", Vector2);
            /// A vector may also represent a point, which shall be differentiated semantically using the alias Point2.
            Point2 = class Point2 extends Vector2 {
            };
            exports_1("Point2", Point2);
            Bounds2 = class Bounds2 {
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
            };
            exports_1("Bounds2", Bounds2);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmVjdG9yMi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlZlY3RvcjIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7WUFPQTs7OztjQUlFO1lBQ0YsVUFBQSxNQUFhLE9BQU87Z0JBT2hCLFlBQVksR0FBRyxJQUFXO29CQU5uQixNQUFDLEdBQVcsQ0FBQyxDQUFDO29CQUNkLE1BQUMsR0FBVyxDQUFDLENBQUM7b0JBTWpCLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7d0JBQ25CLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQzdCO3lCQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7d0JBQzFCLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNqQixJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDcEI7Z0JBQ0wsQ0FBQztnQkFDTSxJQUFJLENBQUMsS0FBd0I7b0JBQ2hDLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQUMsT0FBTyxJQUFJLENBQUM7Z0JBQ3BELENBQUM7Z0JBQ0QsNEJBQTRCO2dCQUNyQixLQUFLO29CQUNSLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMzQixDQUFDO2dCQUNELDJDQUEyQztnQkFDcEMsR0FBRyxDQUFDLENBQVMsRUFBRSxDQUFTO29CQUMzQixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDM0IsQ0FBQztnQkFDRCxnQ0FBZ0M7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