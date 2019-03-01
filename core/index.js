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
System.register(["./arithmetics", "./Bitmap", "./Contour", "./edge-coloring", "./edge-segments", "./EdgeColor", "./EdgeHolder", "./equation-solver", "./Shape", "./SignedDistance", "./Vector2", "./render-sdf", "./msdfgen"], function (exports_1, context_1) {
    "use strict";
    var MSDFGEN_VERSION;
    var __moduleName = context_1 && context_1.id;
    var exportedNames_1 = {
        "VERSION": true,
        "MSDFGEN_VERSION": true
    };
    function exportStar_1(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default" && !exportedNames_1.hasOwnProperty(n)) exports[n] = m[n];
        }
        exports_1(exports);
    }
    return {
        setters: [
            function (arithmetics_1_1) {
                exportStar_1(arithmetics_1_1);
            },
            function (Bitmap_1_1) {
                exportStar_1(Bitmap_1_1);
            },
            function (Contour_1_1) {
                exportStar_1(Contour_1_1);
            },
            function (edge_coloring_1_1) {
                exportStar_1(edge_coloring_1_1);
            },
            function (edge_segments_1_1) {
                exportStar_1(edge_segments_1_1);
            },
            function (EdgeColor_1_1) {
                exportStar_1(EdgeColor_1_1);
            },
            function (EdgeHolder_1_1) {
                exportStar_1(EdgeHolder_1_1);
            },
            function (equation_solver_1_1) {
                exportStar_1(equation_solver_1_1);
            },
            function (Shape_1_1) {
                exportStar_1(Shape_1_1);
            },
            function (SignedDistance_1_1) {
                exportStar_1(SignedDistance_1_1);
            },
            function (Vector2_1_1) {
                exportStar_1(Vector2_1_1);
            },
            function (render_sdf_1_1) {
                exportStar_1(render_sdf_1_1);
            },
            function (msdfgen_1_1) {
                exportStar_1(msdfgen_1_1);
            }
        ],
        execute: function () {
            exports_1("MSDFGEN_VERSION", MSDFGEN_VERSION = "1.5");
            exports_1("VERSION", MSDFGEN_VERSION);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7O0dBWUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBZ0JILDZCQUFhLGVBQWUsR0FBVyxLQUFLLEVBQUMifQ==