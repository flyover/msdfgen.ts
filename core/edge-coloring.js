System.register(["./Vector2", "./EdgeColor", "./EdgeHolder"], function (exports_1, context_1) {
    "use strict";
    var Vector2_1, EdgeColor_1, EdgeHolder_1;
    var __moduleName = context_1 && context_1.id;
    function refnew(val) { return [val]; }
    function refget(ref) { return ref[0]; }
    function refset(ref, val) { ref[0] = val; return ref; }
    function isCorner(aDir, bDir, crossThreshold) {
        return Vector2_1.Vector2.dotProduct(aDir, bDir) <= 0 || Math.abs(Vector2_1.Vector2.crossProduct(aDir, bDir)) > crossThreshold;
    }
    function switchColor(color, seed, banned = EdgeColor_1.EdgeColor.BLACK) {
        const combined = refget(color) & banned;
        if (combined === EdgeColor_1.EdgeColor.RED || combined === EdgeColor_1.EdgeColor.GREEN || combined === EdgeColor_1.EdgeColor.BLUE) {
            refset(color, combined ^ EdgeColor_1.EdgeColor.WHITE);
            return;
        }
        if (refget(color) === EdgeColor_1.EdgeColor.BLACK || refget(color) === EdgeColor_1.EdgeColor.WHITE) {
            // static const EdgeColor start[3] = { CYAN, MAGENTA, YELLOW };
            const start = [EdgeColor_1.EdgeColor.CYAN, EdgeColor_1.EdgeColor.MAGENTA, EdgeColor_1.EdgeColor.YELLOW];
            refset(color, start[refget(seed) % 3]);
            refset(seed, refget(seed) / 3);
            return;
        }
        const shifted = refget(color) << (1 + (refget(seed) & 1));
        refset(color, (shifted | shifted >> 3) & EdgeColor_1.EdgeColor.WHITE);
        refset(seed, refget(seed) >> 1);
    }
    /** Assigns colors to edges of the shape in accordance to the multi-channel distance field technique.
     *  May split some edges if necessary.
     *  angleThreshold specifies the maximum angle (in radians) to be considered a corner, for example 3 (~172 degrees).
     *  Values below 1/2 PI will be treated as the external angle.
     */
    function edgeColoringSimple(shape, angleThreshold, _seed = 0) {
        const seed = refnew(_seed);
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
                    edge.color = EdgeColor_1.EdgeColor.WHITE;
                }
            }
            // "Teardrop" case
            else if (corners.length === 1) {
                const colors = [refnew(EdgeColor_1.EdgeColor.WHITE), refnew(EdgeColor_1.EdgeColor.WHITE), refnew(EdgeColor_1.EdgeColor.WHITE)];
                // switchColor(colors[0], seed);
                switchColor(colors[0], seed);
                // switchColor(colors[2] = colors[0], seed);
                switchColor(refset(colors[2], refget(colors[0])), seed);
                const corner = corners[0];
                if (contour.edges.length >= 3) {
                    const m = contour.edges.length;
                    for (let i = 0; i < m; ++i) {
                        // contour->edges[(corner+i)%m]->color = (colors+1)[int(3+2.875*i/(m-1)-1.4375+.5)-3];
                        contour.edges[(corner + i) % m].color = refget(colors[1 + Math.floor(3 + 2.875 * i / (m - 1) - 1.4375 + .5) - 3]);
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
                        parts[0].color = parts[1].color = refget(colors[0]);
                        parts[2].color = parts[3].color = refget(colors[1]);
                        parts[4].color = parts[5].color = refget(colors[2]);
                    }
                    else {
                        parts[0].color = refget(colors[0]);
                        parts[1].color = refget(colors[1]);
                        parts[2].color = refget(colors[2]);
                    }
                    contour.edges.length = 0;
                    for (let i = 0; parts[i]; ++i) {
                        contour.edges.push(new EdgeHolder_1.EdgeHolder(parts[i]));
                    }
                }
            }
            // Multiple corners
            else {
                const cornerCount = corners.length;
                let spline = 0;
                const start = corners[0];
                const m = contour.edges.length;
                const color = refnew(EdgeColor_1.EdgeColor.WHITE);
                // switchColor(color, seed);
                switchColor(color, seed);
                let initialColor = refget(color);
                for (let i = 0; i < m; ++i) {
                    const index = (start + i) % m;
                    if (spline + 1 < cornerCount && corners[spline + 1] === index) {
                        ++spline;
                        // switchColor(color, seed, EdgeColor((spline === cornerCount-1)*initialColor));
                        switchColor(color, seed, ((spline === cornerCount - 1) ? 1 : 0) * initialColor);
                    }
                    contour.edges[index].color = refget(color);
                }
            }
        }
    }
    exports_1("edgeColoringSimple", edgeColoringSimple);
    return {
        setters: [
            function (Vector2_1_1) {
                Vector2_1 = Vector2_1_1;
            },
            function (EdgeColor_1_1) {
                EdgeColor_1 = EdgeColor_1_1;
            },
            function (EdgeHolder_1_1) {
                EdgeHolder_1 = EdgeHolder_1_1;
            }
        ],
        execute: function () {
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRnZS1jb2xvcmluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImVkZ2UtY29sb3JpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQU9BLFNBQVMsTUFBTSxDQUFJLEdBQU0sSUFBWSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFNBQVMsTUFBTSxDQUFJLEdBQVcsSUFBTyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckQsU0FBUyxNQUFNLENBQUksR0FBVyxFQUFFLEdBQU0sSUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRTdFLFNBQVMsUUFBUSxDQUFDLElBQXVCLEVBQUUsSUFBdUIsRUFBRSxjQUFzQjtRQUN0RixPQUFPLGlCQUFPLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxjQUFjLENBQUM7SUFDOUcsQ0FBQztJQUVELFNBQVMsV0FBVyxDQUFDLEtBQXFCLEVBQUUsSUFBaUIsRUFBRSxTQUFvQixxQkFBUyxDQUFDLEtBQUs7UUFDOUYsTUFBTSxRQUFRLEdBQWMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFDLE1BQU0sQ0FBQztRQUNqRCxJQUFJLFFBQVEsS0FBSyxxQkFBUyxDQUFDLEdBQUcsSUFBSSxRQUFRLEtBQUsscUJBQVMsQ0FBQyxLQUFLLElBQUksUUFBUSxLQUFLLHFCQUFTLENBQUMsSUFBSSxFQUFFO1lBQzNGLE1BQU0sQ0FBQyxLQUFLLEVBQUUsUUFBUSxHQUFDLHFCQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDeEMsT0FBTztTQUNWO1FBQ0QsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUss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