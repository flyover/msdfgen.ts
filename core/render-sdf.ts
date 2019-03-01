import { Bitmap, FloatRGB } from "./Bitmap";
import { Point2 } from "./Vector2";
import { clamp } from "./arithmetics";

function sample(bitmap: Bitmap<FloatRGB>, pos: Point2): FloatRGB {
    const w: number = bitmap.width();
    const h: number = bitmap.height();
    const x = pos.x*w-.5;
    const y = pos.y*h-.5;
    let l = Math.floor(x);
    let b = Math.floor(y);
    let r = l+1;
    let t = b+1;
    const lr = x-l;
    const bt = y-b;
    l = clamp(l, w-1), r = clamp(r, w-1);
    b = clamp(b, h-1), t = clamp(t, h-1);
    const mix = FloatRGB.mix;
    return mix(mix(bitmap.getAt(l, b), bitmap.getAt(r, b), lr), mix(bitmap.getAt(l, t), bitmap.getAt(r, t), lr), bt);
}

function distVal(dist: number, pxRange: number): number {
    if (!pxRange) {
        return dist > .5 ? 1 : 0;
    }
    return clamp((dist-.5)*pxRange+.5);
}

/// Reconstructs the shape's appearance into output from the distance field sdf.
// void renderSDF(Bitmap<float> &output, const Bitmap<float> &sdf, double pxRange = 0);
// void renderSDF(Bitmap<FloatRGB> &output, const Bitmap<float> &sdf, double pxRange = 0);
// void renderSDF(Bitmap<float> &output, const Bitmap<FloatRGB> &sdf, double pxRange = 0);
// void renderSDF(Bitmap<FloatRGB> &output, const Bitmap<FloatRGB> &sdf, double pxRange = 0);
// void renderSDF(Bitmap<FloatRGB> &output, const Bitmap<FloatRGB> &sdf, double pxRange) {
export function renderSDF(output: Bitmap<FloatRGB>, sdf: Bitmap<FloatRGB>, pxRange: number = 0): void {
    const w: number = output.width();
    const h: number = output.height();
    pxRange *= (w+h)/(sdf.width()+sdf.height());
    for (let y = 0; y < h; ++y)
        for (let x = 0; x < w; ++x) {
            // FloatRGB s = sample(sdf, Point2((x+.5)/w, (y+.5)/h));
            const s: FloatRGB = sample(sdf, new Point2((x+.5)/w, (y+.5)/h));
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
