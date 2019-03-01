System.register(["./Vector2", "./EdgeColor", "./arithmetics", "./SignedDistance", "./equation-solver"], function (exports_1, context_1) {
    "use strict";
    var Vector2_1, EdgeColor_1, arithmetics_1, SignedDistance_1, equation_solver_1, MSDFGEN_CUBIC_SEARCH_STARTS, MSDFGEN_CUBIC_SEARCH_STEPS, EdgeSegment, LinearSegment, QuadraticSegment, CubicSegment;
    var __moduleName = context_1 && context_1.id;
    function refnew(val) { return [val]; }
    function refget(ref) { return ref[0]; }
    function refset(ref, val) { ref[0] = val; return ref; }
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
    return {
        setters: [
            function (Vector2_1_1) {
                Vector2_1 = Vector2_1_1;
            },
            function (EdgeColor_1_1) {
                EdgeColor_1 = EdgeColor_1_1;
            },
            function (arithmetics_1_1) {
                arithmetics_1 = arithmetics_1_1;
            },
            function (SignedDistance_1_1) {
                SignedDistance_1 = SignedDistance_1_1;
            },
            function (equation_solver_1_1) {
                equation_solver_1 = equation_solver_1_1;
            }
        ],
        execute: function () {
            // Parameters for iterative search of closest point on a cubic Bezier curve. Increase for higher precision.
            MSDFGEN_CUBIC_SEARCH_STARTS = 4;
            MSDFGEN_CUBIC_SEARCH_STEPS = 4;
            /// An abstract edge segment.
            EdgeSegment = class EdgeSegment {
                constructor(edgeColor = EdgeColor_1.EdgeColor.WHITE) {
                    this.color = EdgeColor_1.EdgeColor.WHITE;
                    this.color = edgeColor;
                }
                /// Converts a previously retrieved signed distance from origin to pseudo-distance.
                distanceToPseudoDistance(distance, origin, param) {
                    if (param < 0) {
                        const dir = this.direction(0).normalize();
                        // Vector2 aq = origin-point(0);
                        const aq = origin.sub(this.point(0));
                        const ts = Vector2_1.Vector2.dotProduct(aq, dir);
                        if (ts < 0) {
                            const pseudoDistance = Vector2_1.Vector2.crossProduct(aq, dir);
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
                        const ts = Vector2_1.Vector2.dotProduct(bq, dir);
                        if (ts > 0) {
                            const pseudoDistance = Vector2_1.Vector2.crossProduct(bq, dir);
                            if (Math.abs(pseudoDistance) <= Math.abs(distance.distance)) {
                                distance.distance = pseudoDistance;
                                distance.dot = 0;
                            }
                        }
                    }
                }
            };
            exports_1("EdgeSegment", EdgeSegment);
            /// A line segment.
            LinearSegment = class LinearSegment extends EdgeSegment {
                constructor(p0, p1, edgeColor = EdgeColor_1.EdgeColor.WHITE) {
                    super(edgeColor);
                    this.p = [new Vector2_1.Point2(), new Vector2_1.Point2()];
                    this.p[0].set(p0.x, p0.y);
                    this.p[1].set(p1.x, p1.y);
                }
                clone() {
                    return new LinearSegment(this.p[0], this.p[1], this.color);
                }
                point(param) {
                    const p = this.p;
                    const mix = Vector2_1.Vector2.mix;
                    return mix(p[0], p[1], param);
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
                    refset(param, Vector2_1.Vector2.dotProduct(aq, ab) / Vector2_1.Vector2.dotProduct(ab, ab));
                    // Vector2 eq = p[param > .5]-origin;
                    const eq = p[refget(param) > .5 ? 1 : 0].sub(origin);
                    const endpointDistance = eq.length();
                    if (refget(param) > 0 && refget(param) < 1) {
                        const orthoDistance = Vector2_1.Vector2.dotProduct(ab.getOrthonormal(false), aq);
                        if (Math.abs(orthoDistance) < endpointDistance) {
                            return new SignedDistance_1.SignedDistance(orthoDistance, 0);
                        }
                    }
                    return new SignedDistance_1.SignedDistance(arithmetics_1.nonZeroSign(Vector2_1.Vector2.crossProduct(aq, ab)) * endpointDistance, Math.abs(Vector2_1.Vector2.dotProduct(ab.normalize(), eq.normalize())));
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
            };
            exports_1("LinearSegment", LinearSegment);
            /// A quadratic Bezier curve.
            QuadraticSegment = class QuadraticSegment extends EdgeSegment {
                constructor(p0, p1, p2, edgeColor = EdgeColor_1.EdgeColor.WHITE) {
                    super(edgeColor);
                    this.p = [new Vector2_1.Point2(), new Vector2_1.Point2(), new Vector2_1.Point2()];
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
                    const mix = Vector2_1.Vector2.mix;
                    return mix(mix(p[0], p[1], param), mix(p[1], p[2], param), param);
                }
                direction(param) {
                    const p = this.p;
                    const mix = Vector2_1.Vector2.mix;
                    // return mix(p[1]-p[0], p[2]-p[1], param);
                    return mix(p[1].sub(p[0]), p[2].sub(p[1]), param);
                }
                signedDistance(origin, param) {
                    const p = this.p;
                    const dotProduct = Vector2_1.Vector2.dotProduct;
                    const crossProduct = Vector2_1.Vector2.crossProduct;
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
                    const solutions = equation_solver_1.solveCubic(t, a, b, c, d);
                    let minDistance = arithmetics_1.nonZeroSign(crossProduct(ab, qa)) * qa.length(); // distance from A
                    // param = -dotProduct(qa, ab)/dotProduct(ab, ab);
                    refset(param, -dotProduct(qa, ab) / dotProduct(ab, ab));
                    {
                        // double distance = nonZeroSign(crossProduct(p[2]-p[1], p[2]-origin))*(p[2]-origin).length(); // distance from B
                        const distance = arithmetics_1.nonZeroSign(crossProduct(p[2].sub(p[1]), p[2].sub(origin))) * (p[2].sub(origin)).length(); // distance from B
                        if (Math.abs(distance) < Math.abs(minDistance)) {
                            minDistance = distance;
                            // param = dotProduct(origin-p[1], p[2]-p[1])/dotProduct(p[2]-p[1], p[2]-p[1]);
                            refset(param, dotProduct(origin.sub(p[1]), p[2].sub(p[1])) / dotProduct(p[2].sub(p[1]), p[2].sub(p[1])));
                        }
                    }
                    for (let i = 0; i < solutions; ++i) {
                        if (t[i] > 0 && t[i] < 1) {
                            // Point2 endpoint = p[0]+2*t[i]*ab+t[i]*t[i]*br;
                            const endpoint = new Vector2_1.Point2();
                            endpoint.x = p[0].x + 2 * t[i] * ab.x + t[i] * t[i] * br.x;
                            endpoint.y = p[0].y + 2 * t[i] * ab.y + t[i] * t[i] * br.y;
                            // double distance = nonZeroSign(crossProduct(p[2]-p[0], endpoint-origin))*(endpoint-origin).length();
                            const distance = arithmetics_1.nonZeroSign(crossProduct(p[2].sub(p[0]), endpoint.sub(origin))) * (endpoint.sub(origin)).length();
                            if (Math.abs(distance) <= Math.abs(minDistance)) {
                                minDistance = distance;
                                refset(param, t[i]);
                            }
                        }
                    }
                    if (refget(param) >= 0 && refget(param) <= 1)
                        return new SignedDistance_1.SignedDistance(minDistance, 0);
                    if (refget(param) < .5)
                        return new SignedDistance_1.SignedDistance(minDistance, Math.abs(dotProduct(ab.normalize(), qa.normalize())));
                    else
                        return new SignedDistance_1.SignedDistance(minDistance, Math.abs(dotProduct((p[2].sub(p[1])).normalize(), (p[2].sub(origin)).normalize())));
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
                    const origP1 = new Vector2_1.Vector2().copy(p[1]);
                    // p[1] += crossProduct(p[0]-p[1], to-p[0])/crossProduct(p[0]-p[1], p[2]-p[1])*(p[2]-p[1]);
                    p[1].addeq(Vector2_1.Vector2.muls(Vector2_1.Vector2.crossProduct(p[0].sub(p[1]), to.sub(p[0])) / Vector2_1.Vector2.crossProduct(p[0].sub(p[1]), p[2].sub(p[1])), p[2].sub(p[1])));
                    // p[0] = to;
                    p[0].copy(to);
                    // if (dotProduct(origSDir, p[0]-p[1]) < 0)
                    //     p[1] = origP1;
                    if (Vector2_1.Vector2.dotProduct(origSDir, p[0].sub(p[1])) < 0) {
                        p[1].copy(origP1);
                    }
                }
                moveEndPoint(to) {
                    const p = this.p;
                    // Vector2 origEDir = p[2]-p[1];
                    const origEDir = p[2].sub(p[1]);
                    // Point2 origP1 = p[1];
                    const origP1 = new Vector2_1.Vector2().copy(p[1]);
                    // p[1] += crossProduct(p[2]-p[1], to-p[2])/crossProduct(p[2]-p[1], p[0]-p[1])*(p[0]-p[1]);
                    p[1].addeq(Vector2_1.Vector2.muls(Vector2_1.Vector2.crossProduct(p[2].sub(p[1]), to.sub(p[2])) / Vector2_1.Vector2.crossProduct(p[2].sub(p[1]), p[0].sub(p[1])), p[0].sub(p[1])));
                    // p[2] = to;
                    p[2].copy(to);
                    // if (dotProduct(origEDir, p[2]-p[1]) < 0)
                    //     p[1] = origP1;
                    if (Vector2_1.Vector2.dotProduct(origEDir, p[2].sub(p[1])) < 0) {
                        p[1].copy(origP1);
                    }
                }
                splitInThirds() {
                    const p = this.p;
                    const mix = Vector2_1.Vector2.mix;
                    return [
                        new QuadraticSegment(p[0], mix(p[0], p[1], 1 / 3.), this.point(1 / 3.), this.color),
                        new QuadraticSegment(this.point(1 / 3.), mix(mix(p[0], p[1], 5 / 9.), mix(p[1], p[2], 4 / 9.), .5), this.point(2 / 3.), this.color),
                        new QuadraticSegment(this.point(2 / 3.), mix(p[1], p[2], 2 / 3.), p[2], this.color),
                    ];
                }
            };
            exports_1("QuadraticSegment", QuadraticSegment);
            /// A cubic Bezier curve.
            CubicSegment = class CubicSegment extends EdgeSegment {
                constructor(p0, p1, p2, p3, edgeColor = EdgeColor_1.EdgeColor.WHITE) {
                    super(edgeColor);
                    this.p = [new Vector2_1.Point2(), new Vector2_1.Point2(), new Vector2_1.Point2(), new Vector2_1.Point2()];
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
                    const mix = Vector2_1.Vector2.mix;
                    // Vector2 p12 = mix(p[1], p[2], param);
                    const p12 = mix(p[1], p[2], param);
                    // return mix(mix(mix(p[0], p[1], param), p12, param), mix(p12, mix(p[2], p[3], param), param), param);
                    return mix(mix(mix(p[0], p[1], param), p12, param), mix(p12, mix(p[2], p[3], param), param), param);
                }
                direction(param) {
                    const p = this.p;
                    const mix = Vector2_1.Vector2.mix;
                    // Vector2 tangent = mix(mix(p[1]-p[0], p[2]-p[1], param), mix(p[2]-p[1], p[3]-p[2], param), param);
                    const tangent = mix(mix(p[1].sub(p[0]), p[2].sub(p[1]), param), mix(p[2].sub(p[1]), p[3].sub(p[2]), param), param);
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
                    const dotProduct = Vector2_1.Vector2.dotProduct;
                    const crossProduct = Vector2_1.Vector2.crossProduct;
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
                    let minDistance = arithmetics_1.nonZeroSign(crossProduct(epDir, qa)) * qa.length(); // distance from A
                    refset(param, -dotProduct(qa, epDir) / dotProduct(epDir, epDir));
                    {
                        epDir = this.direction(1);
                        // double distance = nonZeroSign(crossProduct(epDir, p[3]-origin))*(p[3]-origin).length(); // distance from B
                        const distance = arithmetics_1.nonZeroSign(crossProduct(epDir, p[3].sub(origin))) * (p[3].sub(origin)).length(); // distance from B
                        if (Math.abs(distance) < Math.abs(minDistance)) {
                            minDistance = distance;
                            // param = dotProduct(origin+epDir-p[3], epDir)/dotProduct(epDir, epDir);
                            refset(param, dotProduct(origin.add(epDir).sub(p[3]), epDir) / dotProduct(epDir, epDir));
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
                            const distance = arithmetics_1.nonZeroSign(crossProduct(this.direction(t), qpt)) * qpt.length();
                            if (Math.abs(distance) < Math.abs(minDistance)) {
                                minDistance = distance;
                                refset(param, t);
                            }
                            if (step === MSDFGEN_CUBIC_SEARCH_STEPS)
                                break;
                            // Improve t
                            // Vector2 d1 = 3*as*t*t+6*br*t+3*ab;
                            const d1 = new Vector2_1.Vector2();
                            d1.x = 3 * as.x * t * t + 6 * br.x * t + 3 * ab.x;
                            d1.y = 3 * as.y * t * t + 6 * br.y * t + 3 * ab.y;
                            // Vector2 d2 = 6*as*t+6*br;
                            const d2 = new Vector2_1.Vector2();
                            d2.x = 6 * as.x * t + 6 * br.x;
                            d2.y = 6 * as.y * t + 6 * br.y;
                            t -= dotProduct(qpt, d1) / (dotProduct(d1, d1) + dotProduct(qpt, d2));
                            if (t < 0 || t > 1)
                                break;
                        }
                    }
                    if (refget(param) >= 0 && refget(param) <= 1)
                        return new SignedDistance_1.SignedDistance(minDistance, 0);
                    if (refget(param) < .5)
                        return new SignedDistance_1.SignedDistance(minDistance, Math.abs(dotProduct(this.direction(0).normalize(), qa.normalize())));
                    else
                        return new SignedDistance_1.SignedDistance(minDistance, Math.abs(dotProduct(this.direction(1).normalize(), (p[3].sub(origin)).normalize())));
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
                    solutions = equation_solver_1.solveQuadratic(params, a2.x, a1.x, a0.x);
                    for (let i = 0; i < solutions; ++i)
                        if (params[i] > 0 && params[i] < 1)
                            pointBounds(this.point(params[i]), bounds);
                    solutions = equation_solver_1.solveQuadratic(params, a2.y, a1.y, a0.y);
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
                    const mix = Vector2_1.Vector2.mix;
                    return [
                        new CubicSegment(p[0], p[0] === p[1] ? p[0] : mix(p[0], p[1], 1 / 3.), mix(mix(p[0], p[1], 1 / 3.), mix(p[1], p[2], 1 / 3.), 1 / 3.), this.point(1 / 3.), this.color),
                        new CubicSegment(this.point(1 / 3.), mix(mix(mix(p[0], p[1], 1 / 3.), mix(p[1], p[2], 1 / 3.), 1 / 3.), mix(mix(p[1], p[2], 1 / 3.), mix(p[2], p[3], 1 / 3.), 1 / 3.), 2 / 3.), mix(mix(mix(p[0], p[1], 2 / 3.), mix(p[1], p[2], 2 / 3.), 2 / 3.), mix(mix(p[1], p[2], 2 / 3.), mix(p[2], p[3], 2 / 3.), 2 / 3.), 1 / 3.), this.point(2 / 3.), this.color),
                        new CubicSegment(this.point(2 / 3.), mix(mix(p[1], p[2], 2 / 3.), mix(p[2], p[3], 2 / 3.), 2 / 3.), p[2] === p[3] ? p[3] : mix(p[2], p[3], 2 / 3.), p[3], this.color),
                    ];
                }
            };
            exports_1("CubicSegment", CubicSegment);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRnZS1zZWdtZW50cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImVkZ2Utc2VnbWVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQU9BLFNBQVMsTUFBTSxDQUFJLEdBQU0sSUFBWSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFNBQVMsTUFBTSxDQUFJLEdBQVcsSUFBTyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckQsU0FBUyxNQUFNLENBQUksR0FBVyxFQUFFLEdBQU0sSUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRTdFLFNBQVMsV0FBVyxDQUFDLENBQW1CLEVBQUUsTUFBZTtRQUNyRCxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7WUFBRSxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDO1lBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQztZQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7WUFBRSxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFFRCwyR0FBMkc7WUFDckcsMkJBQTJCLEdBQVcsQ0FBQyxDQUFDO1lBQ3hDLDBCQUEwQixHQUFXLENBQUMsQ0FBQztZQUU3Qyw2QkFBNkI7WUFDN0IsY0FBQSxNQUFzQixXQUFXO2dCQUc3QixZQUFZ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QUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDMUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDaEQsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQzdCO3lCQUFNO3dCQUNILElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUMxQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDMUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQzdCO2dCQUNMLENBQUM7Z0JBQ00sS0FBSztvQkFDUixPQUFPLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM3RSxDQUFDO2dCQUNNLEtBQUssQ0FBQyxLQUFhO29CQUN0QixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUNqQixN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RSxDQUFDLEdBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxFQUMzSCxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUMsRUFBRSxDQUFDLEVBQzNILElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7d0JBQ2pDLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQztxQkFDOUosQ0FBQztnQkFDTixDQUFDO2FBQ0osQ0FBQSJ9