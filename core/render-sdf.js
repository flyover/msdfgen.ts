System.register(["./Bitmap", "./Vector2", "./arithmetics"], function (exports_1, context_1) {
    "use strict";
    var Bitmap_1, Vector2_1, arithmetics_1;
    var __moduleName = context_1 && context_1.id;
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
        l = arithmetics_1.clamp(l, w - 1), r = arithmetics_1.clamp(r, w - 1);
        b = arithmetics_1.clamp(b, h - 1), t = arithmetics_1.clamp(t, h - 1);
        const mix = Bitmap_1.FloatRGB.mix;
        return mix(mix(bitmap.getAt(l, b), bitmap.getAt(r, b), lr), mix(bitmap.getAt(l, t), bitmap.getAt(r, t), lr), bt);
    }
    function distVal(dist, pxRange) {
        if (!pxRange) {
            return dist > .5 ? 1 : 0;
        }
        return arithmetics_1.clamp((dist - .5) * pxRange + .5);
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
                const s = sample(sdf, new Vector2_1.Point2((x + .5) / w, (y + .5) / h));
                // output(x, y).r = distVal(s.r, pxRange);
                // output(x, y).g = distVal(s.g, pxRange);
                // output(x, y).b = distVal(s.b, pxRange);
                output.getAt(x, y).r = distVal(s.r, pxRange);
                output.getAt(x, y).g = distVal(s.g, pxRange);
                output.getAt(x, y).b = distVal(s.b, pxRange);
            }
    }
    exports_1("renderSDF", renderSDF);
    return {
        setters: [
            function (Bitmap_1_1) {
                Bitmap_1 = Bitmap_1_1;
            },
            function (Vector2_1_1) {
                Vector2_1 = Vector2_1_1;
            },
            function (arithmetics_1_1) {
                arithmetics_1 = arithmetics_1_1;
            }
        ],
        execute: function () {
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyLXNkZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlbmRlci1zZGYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUlBLFNBQVMsTUFBTSxDQUFDLE1BQXdCLEVBQUUsR0FBVztRQUNqRCxNQUFNLENBQUMsR0FBVyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDakMsTUFBTSxDQUFDLEdBQVcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQztRQUNyQixNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBQyxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0QixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDWixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUMsQ0FBQyxDQUFDO1FBQ1osTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFDLENBQUMsQ0FBQztRQUNmLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBQyxDQUFDLENBQUM7UUFDZixDQUFDLEdBQUcsbUJBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxtQkFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckMsQ0FBQyxHQUFHLG1CQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsbUJBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sR0FBRyxHQUFHLGlCQUFRLENBQUMsR0FBRyxDQUFDO1FBQ3pCLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDckgsQ0FBQztJQUVELFNBQVMsT0FBTyxDQUFDLElBQVksRUFBRSxPQUFlO1FBQzFDLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDVixPQUFPLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzVCO1FBQ0QsT0FBTyxtQkFBSyxDQUFDLENBQUMsSUFBSSxHQUFDLEVBQUUsQ0FBQyxHQUFDLE9BQU8sR0FBQyxFQUFFLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQsZ0ZBQWdGO0lBQ2hGLHVGQUF1RjtJQUN2RiwwRkFBMEY7SUFDMUYsMEZBQTBGO0lBQzFGLDZGQUE2RjtJQUM3RiwwRkFBMEY7SUFDMUYsU0FBZ0IsU0FBUyxDQUFDLE1BQXdCLEVBQUUsR0FBcUIsRUFBRSxVQUFrQixDQUFDO1FBQzFGLE1BQU0sQ0FBQyxHQUFXLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNqQyxNQUFNLENBQUMsR0FBVyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbEMsT0FBTyxJQUFJLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQzVDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3RCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7Z0JBQ3hCLHdEQUF3RDtnQkFDeEQsTUFBTSxDQUFDLEdBQWEsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLGdCQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hFLDBDQUEwQztnQkFDMUMsMENBQTBDO2dCQUMxQywwQ0FBMEM7Z0JBQzFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDN0MsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUM3QyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFDaEQ7SUFDVCxDQUFDIn0=