System.register(["./Vector2", "./arithmetics", "./SignedDistance", "./EdgeColor"], function (exports_1, context_1) {
    "use strict";
    var Vector2_1, arithmetics_1, SignedDistance_1, EdgeColor_1, Type, MultiDistance, EdgePoint;
    var __moduleName = context_1 && context_1.id;
    function refnew(val) { return [val]; }
    function refget(ref) { return ref[0]; }
    function refset(ref, val) { ref[0] = val; return ref; }
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
            const med = arithmetics_1.median(pixel.r, pixel.g, pixel.b);
            pixel.r = pixel.g = pixel.b = med;
        }
    }
    exports_1("msdfErrorCorrection", msdfErrorCorrection);
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
                    const dummy = refnew(0);
                    const p = new Vector2_1.Point2();
                    p.x = (x + .5) / scale.x - translate.x;
                    p.y = (y + .5) / scale.y - translate.y;
                    let negDist = -SignedDistance_1.SignedDistance.INFINITE.distance;
                    let posDist = SignedDistance_1.SignedDistance.INFINITE.distance;
                    let winding = 0;
                    for (let i = 0; i < contourCount; ++i) {
                        const contour = shape.contours[i];
                        const minDistance = new SignedDistance_1.SignedDistance();
                        for (const edge of contour.edges) {
                            const distance = edge.signedDistance(p, dummy);
                            if (SignedDistance_1.SignedDistance.lt(distance, minDistance)) {
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
                    let sd = SignedDistance_1.SignedDistance.INFINITE.distance;
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
    exports_1("generateSDF", generateSDF);
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
                    const p = new Vector2_1.Point2();
                    p.x = (x + .5) / scale.x - translate.x;
                    p.y = (y + .5) / scale.y - translate.y;
                    let sd = SignedDistance_1.SignedDistance.INFINITE.distance;
                    let negDist = -SignedDistance_1.SignedDistance.INFINITE.distance;
                    let posDist = SignedDistance_1.SignedDistance.INFINITE.distance;
                    let winding = 0;
                    for (let i = 0; i < contourCount; ++i) {
                        const contour = shape.contours[i];
                        const minDistance = new SignedDistance_1.SignedDistance();
                        let nearEdge = null;
                        let nearParam = 0;
                        for (const edge of contour.edges) {
                            const param = refnew(0);
                            const distance = edge.signedDistance(p, param);
                            if (SignedDistance_1.SignedDistance.lt(distance, minDistance)) {
                                minDistance.copy(distance);
                                nearEdge = edge;
                                nearParam = refget(param);
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
                    let psd = SignedDistance_1.SignedDistance.INFINITE.distance;
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
    exports_1("generatePseudoSDF", generatePseudoSDF);
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
                    const p = new Vector2_1.Point2();
                    p.x = (x + .5) / scale.x - translate.x;
                    p.y = (y + .5) / scale.y - translate.y;
                    const sr = new EdgePoint();
                    const sg = new EdgePoint();
                    const sb = new EdgePoint();
                    sr.nearEdge = sg.nearEdge = sb.nearEdge = null;
                    sr.nearParam = sg.nearParam = sb.nearParam = 0;
                    let d = Math.abs(SignedDistance_1.SignedDistance.INFINITE.distance);
                    let negDist = -SignedDistance_1.SignedDistance.INFINITE.distance;
                    let posDist = SignedDistance_1.SignedDistance.INFINITE.distance;
                    let winding = 0;
                    for (let i = 0; i < contourCount; ++i) {
                        const contour = shape.contours[i];
                        const r = new EdgePoint();
                        const g = new EdgePoint();
                        const b = new EdgePoint();
                        r.nearEdge = g.nearEdge = b.nearEdge = null;
                        r.nearParam = g.nearParam = b.nearParam = 0;
                        for (const edge of contour.edges) {
                            const param = refnew(0);
                            const distance = edge.signedDistance(p, param);
                            // if (edge.color&EdgeColor.RED && distance < r.minDistance) {
                            if (edge.color & EdgeColor_1.EdgeColor.RED && SignedDistance_1.SignedDistance.lt(distance, r.minDistance)) {
                                r.minDistance.copy(distance);
                                r.nearEdge = edge;
                                r.nearParam = refget(param);
                            }
                            // if (edge.color&EdgeColor.GREEN && distance < g.minDistance) {
                            if (edge.color & EdgeColor_1.EdgeColor.GREEN && SignedDistance_1.SignedDistance.lt(distance, g.minDistance)) {
                                g.minDistance.copy(distance);
                                g.nearEdge = edge;
                                g.nearParam = refget(param);
                            }
                            // if (edge.color&EdgeColor.BLUE && distance < b.minDistance) {
                            if (edge.color & EdgeColor_1.EdgeColor.BLUE && SignedDistance_1.SignedDistance.lt(distance, b.minDistance)) {
                                b.minDistance.copy(distance);
                                b.nearEdge = edge;
                                b.nearParam = refget(param);
                            }
                        }
                        // if (r.minDistance < sr.minDistance) {
                        if (SignedDistance_1.SignedDistance.lt(r.minDistance, sr.minDistance)) {
                            sr.copy(r);
                            sr.nearEdge = r.nearEdge; // HACK
                        }
                        // if (g.minDistance < sg.minDistance) {
                        if (SignedDistance_1.SignedDistance.lt(g.minDistance, sg.minDistance)) {
                            sg.copy(g);
                            sg.nearEdge = g.nearEdge; // HACK
                        }
                        // if (b.minDistance < sb.minDistance) {
                        if (SignedDistance_1.SignedDistance.lt(b.minDistance, sb.minDistance)) {
                            sb.copy(b);
                            sb.nearEdge = b.nearEdge; // HACK
                        }
                        let medMinDistance = Math.abs(arithmetics_1.median(r.minDistance.distance, g.minDistance.distance, b.minDistance.distance));
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
                        medMinDistance = arithmetics_1.median(r.minDistance.distance, g.minDistance.distance, b.minDistance.distance);
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
                    msd.r = msd.g = msd.b = msd.med = SignedDistance_1.SignedDistance.INFINITE.distance;
                    if (posDist >= 0 && Math.abs(posDist) <= Math.abs(negDist)) {
                        msd.med = SignedDistance_1.SignedDistance.INFINITE.distance;
                        winding = 1;
                        for (let i = 0; i < contourCount; ++i) {
                            if (windings[i] > 0 && contourSD[i].med > msd.med && Math.abs(contourSD[i].med) < Math.abs(negDist)) {
                                msd.copy(contourSD[i]);
                            }
                        }
                    }
                    else if (negDist <= 0 && Math.abs(negDist) <= Math.abs(posDist)) {
                        msd.med = -SignedDistance_1.SignedDistance.INFINITE.distance;
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
                    if (arithmetics_1.median(sr.minDistance.distance, sg.minDistance.distance, sb.minDistance.distance) === msd.med) {
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
            const threshold = new Vector2_1.Vector2();
            threshold.x = edgeThreshold / (scale.x * range);
            threshold.y = edgeThreshold / (scale.y * range);
            msdfErrorCorrection(output, threshold);
        }
    }
    exports_1("generateMSDF", generateMSDF);
    function generateSDF_legacy(output, shape, range, scale, translate) {
        throw new Error();
    }
    exports_1("generateSDF_legacy", generateSDF_legacy);
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
    exports_1("generatePseudoSDF_legacy", generatePseudoSDF_legacy);
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
    exports_1("generateMSDF_legacy", generateMSDF_legacy);
    return {
        setters: [
            function (Vector2_1_1) {
                Vector2_1 = Vector2_1_1;
            },
            function (arithmetics_1_1) {
                arithmetics_1 = arithmetics_1_1;
            },
            function (SignedDistance_1_1) {
                SignedDistance_1 = SignedDistance_1_1;
            },
            function (EdgeColor_1_1) {
                EdgeColor_1 = EdgeColor_1_1;
            }
        ],
        execute: function () {
            (function (Type) {
                Type["SDF"] = "sdf";
                Type["PSDF"] = "psdf";
                Type["MSDF"] = "msdf";
            })(Type || (Type = {}));
            exports_1("Type", Type);
            MultiDistance = class MultiDistance {
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
            };
            EdgePoint = class EdgePoint {
                constructor() {
                    this.minDistance = new SignedDistance_1.SignedDistance();
                    this.nearEdge = null;
                    this.nearParam = 0;
                }
                copy(other) {
                    this.minDistance.copy(other.minDistance);
                    this.nearEdge = other.nearEdge;
                    this.nearParam = other.nearParam;
                    return this;
                }
            };
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXNkZmdlbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1zZGZnZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVdBLFNBQVMsTUFBTSxDQUFJLEdBQU0sSUFBWSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFNBQVMsTUFBTSxDQUFJLEdBQVcsSUFBTyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckQsU0FBUyxNQUFNLENBQUksR0FBVyxFQUFFLEdBQU0sSUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBc0I3RSxTQUFTLFVBQVUsQ0FBQyxDQUFxQixFQUFFLENBQXFCLEVBQUUsU0FBaUI7UUFDakYsNkVBQTZFO1FBQzdFLE1BQU0sR0FBRyxHQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2RixNQUFNLEdBQUcsR0FBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkYsSUFBSSxHQUFHLEtBQUssR0FBRyxFQUFFO1lBQUUsT0FBTyxLQUFLLENBQUM7U0FBRTtRQUNsQyw2RkFBNkY7UUFDN0YsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztlQUN2RSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFO1lBQzdFLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFDRCxvRkFBb0Y7UUFDcEYsSUFBSSxFQUFVLEVBQUUsRUFBVSxFQUFFLEVBQVUsRUFBRSxFQUFVLEVBQUUsRUFBVSxFQUFFLEVBQVUsQ0FBQztRQUMzRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRTtZQUMxRCxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQixJQUFJLENBQUMsQ0FBQyxDQUFD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