
import { Vector2, Point2 } from "./Vector2";
import { Float, FloatRGB, Bitmap } from "./Bitmap";
import { Shape } from "./Shape";
import { median } from "./arithmetics";
import { EdgeHolder } from "./EdgeHolder";
import { SignedDistance } from "./SignedDistance";
import { EdgeColor } from "./EdgeColor";
import { Contour } from "./Contour";

type Ref<T> = [T];
function refnew<T>(val: T): Ref<T> { return [val]; }
function refget<T>(ref: Ref<T>): T { return ref[0]; }
function refset<T>(ref: Ref<T>, val: T): Ref<T> { ref[0] = val; return ref; }

class MultiDistance {
  public r: number = 0;
  public g: number = 0;
  public b: number = 0;
  public med: number = 0;
  public copy(other: MultiDistance): this {
    this.r = other.r;
    this.g = other.g;
    this.b = other.b;
    this.med = other.med;
    return this;
  }
}

function pixelClash(a: Readonly<FloatRGB>, b: Readonly<FloatRGB>, threshold: number): boolean {
  // Only consider pair where both are on the inside or both are on the outside
  const aIn: boolean = (a.r > .5 ? 1 : 0) + (a.g > .5 ? 1 : 0) + (a.b > .5 ? 1 : 0) >= 2;
  const bIn: boolean = (b.r > .5 ? 1 : 0) + (b.g > .5 ? 1 : 0) + (b.b > .5 ? 1 : 0) >= 2;
  if (aIn !== bIn) { return false; }
  // If the change is 0 <-> 1 or 2 <-> 3 channels and not 1 <-> 1 or 2 <-> 2, it is not a clash
  if ((a.r > .5 && a.g > .5 && a.b > .5) || (a.r < .5 && a.g < .5 && a.b < .5)
    || (b.r > .5 && b.g > .5 && b.b > .5) || (b.r < .5 && b.g < .5 && b.b < .5)) {
    return false;
  }
  // Find which color is which: _a, _b = the changing channels, _c = the remaining one
  let aa: number, ab: number, ba: number, bb: number, ac: number, bc: number;
  if ((a.r > .5) !== (b.r > .5) && (a.r < .5) !== (b.r < .5)) {
    aa = a.r, ba = b.r;
    if ((a.g > .5) !== (b.g > .5) && (a.g < .5) !== (b.g < .5)) {
      ab = a.g, bb = b.g;
      ac = a.b, bc = b.b;
    } else if ((a.b > .5) !== (b.b > .5) && (a.b < .5) !== (b.b < .5)) {
      ab = a.b, bb = b.b;
      ac = a.g, bc = b.g;
    } else {
      return false; // this should never happen
    }
  } else if ((a.g > .5) !== (b.g > .5) && (a.g < .5) !== (b.g < .5)
    && (a.b > .5) !== (b.b > .5) && (a.b < .5) !== (b.b < .5)) {
    aa = a.g, ba = b.g;
    ab = a.b, bb = b.b;
    ac = a.r, bc = b.r;
  } else {
    return false;
  }
  // Find if the channels are in fact discontinuous
  return (Math.abs(aa - ba) >= threshold)
    && (Math.abs(ab - bb) >= threshold)
    && Math.abs(ac - .5) >= Math.abs(bc - .5); // Out of the pair, only flag the pixel farther from a shape edge
}

export function msdfErrorCorrection(output: Bitmap<FloatRGB>, threshold: Readonly<Vector2>): void {
  const clashes: { x: number, y: number }[] = [];
  const w: number = output.width(), h: number = output.height();
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
    const pixel: FloatRGB = output.getAt(clash.x, clash.y);
    const med: number = median(pixel.r, pixel.g, pixel.b);
    pixel.r = pixel.g = pixel.b = med;
  }
}

export function generateSDF(output: Bitmap<Float>, shape: Readonly<Shape>, range: number, scale: Readonly<Vector2>, translate: Readonly<Vector2>): void {
  const contourCount: number = shape.contours.length;
  const w: number = output.width(), h: number = output.height();
  const windings: number[] = [];
  for (const contour of shape.contours) {
    windings.push(contour.winding());
  }

  {
    const contourSD: number[] = [];
    // contourSD.resize(contourCount);
    for (let i = 0; i < contourCount; ++i) {
      contourSD[i] = 0;
    }
    for (let y = 0; y < h; ++y) {
      const row: number = shape.inverseYAxis ? h - y - 1 : y;
      for (let x = 0; x < w; ++x) {
        const dummy: Ref<number> = refnew(0);
        const p: Point2 = new Point2();
        p.x = (x + .5) / scale.x - translate.x;
        p.y = (y + .5) / scale.y - translate.y;
        let negDist: number = -SignedDistance.INFINITE.distance;
        let posDist: number = SignedDistance.INFINITE.distance;
        let winding: number = 0;

        for (let i = 0; i < contourCount; ++i) {
          const contour: Contour = shape.contours[i];
          const minDistance: SignedDistance = new SignedDistance();
          for (const edge of contour.edges) {
            const distance: SignedDistance = edge.signedDistance(p, dummy);
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

        let sd: number = SignedDistance.INFINITE.distance;
        if (posDist >= 0 && Math.abs(posDist) <= Math.abs(negDist)) {
          sd = posDist;
          winding = 1;
          for (let i = 0; i < contourCount; ++i)
            if (windings[i] > 0 && contourSD[i] > sd && Math.abs(contourSD[i]) < Math.abs(negDist))
              sd = contourSD[i];
        } else if (negDist <= 0 && Math.abs(negDist) <= Math.abs(posDist)) {
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
        const pixel: Float = output.getAt(x, row);
        pixel.a = sd / range + .5;
      }
    }
  }
}

export function generatePseudoSDF(output: Bitmap<Float>, shape: Readonly<Shape>, range: number, scale: Readonly<Vector2>, translate: Readonly<Vector2>): void {
  const contourCount: number = shape.contours.length;
  const w: number = output.width(), h: number = output.height();
  const windings: number[] = [];
  for (const contour of shape.contours) {
    windings.push(contour.winding());
  }

  {
    const contourSD: number[] = [];
    // contourSD.resize(contourCount);
    for (let i = 0; i < contourCount; ++i) {
      contourSD[i] = 0;
    }
    for (let y = 0; y < h; ++y) {
      const row: number = shape.inverseYAxis ? h - y - 1 : y;
      for (let x = 0; x < w; ++x) {
        const p: Point2 = new Point2();
        p.x = (x + .5) / scale.x - translate.x;
        p.y = (y + .5) / scale.y - translate.y;
        let sd: number = SignedDistance.INFINITE.distance;
        let negDist: number = -SignedDistance.INFINITE.distance;
        let posDist: number = SignedDistance.INFINITE.distance;
        let winding: number = 0;

        for (let i = 0; i < contourCount; ++i) {
          const contour: Contour = shape.contours[i];
          const minDistance: SignedDistance = new SignedDistance();
          let nearEdge: EdgeHolder | null = null;
          let nearParam: number = 0;
          for (const edge of contour.edges) {
            const param: Ref<number> = refnew(0);
            const distance: SignedDistance = edge.signedDistance(p, param);
            if (SignedDistance.lt(distance, minDistance)) {
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

        let psd: number = SignedDistance.INFINITE.distance;
        if (posDist >= 0 && Math.abs(posDist) <= Math.abs(negDist)) {
          psd = posDist;
          winding = 1;
          for (let i = 0; i < contourCount; ++i)
            if (windings[i] > 0 && contourSD[i] > psd && Math.abs(contourSD[i]) < Math.abs(negDist))
              psd = contourSD[i];
        } else if (negDist <= 0 && Math.abs(negDist) <= Math.abs(posDist)) {
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
        const pixel: Float = output.getAt(x, row);
        pixel.a = sd / range + .5;
      }
    }
  }
}

class EdgePoint {
  public readonly minDistance: SignedDistance = new SignedDistance();
  public nearEdge: Readonly<EdgeHolder> | null = null;
  public nearParam: number = 0;
  public copy(other: EdgePoint): this {
    this.minDistance.copy(other.minDistance);
    this.nearEdge = other.nearEdge;
    this.nearParam = other.nearParam;
    return this;
  }
}

export function generateMSDF(output: Bitmap<FloatRGB>, shape: Readonly<Shape>, range: number, scale: Readonly<Vector2>, translate: Readonly<Vector2>, edgeThreshold: number = 1.00000001): void {
  const contourCount: number = shape.contours.length;
  const w: number = output.width(), h: number = output.height();
  const windings: number[] = [];
  for (const contour of shape.contours) {
    windings.push(contour.winding());
  }

  {
    const contourSD: MultiDistance[] = [];
    // contourSD.resize(contourCount);
    for (let i = 0; i < contourCount; ++i) {
      contourSD[i] = new MultiDistance();
    }
    for (let y = 0; y < h; ++y) {
      const row: number = shape.inverseYAxis ? h - y - 1 : y;
      for (let x = 0; x < w; ++x) {
        const p: Point2 = new Point2();
        p.x = (x + .5) / scale.x - translate.x;
        p.y = (y + .5) / scale.y - translate.y;

        const sr: EdgePoint = new EdgePoint();
        const sg: EdgePoint = new EdgePoint();
        const sb: EdgePoint = new EdgePoint();
        sr.nearEdge = sg.nearEdge = sb.nearEdge = null;
        sr.nearParam = sg.nearParam = sb.nearParam = 0;
        let d: number = Math.abs(SignedDistance.INFINITE.distance);
        let negDist: number = -SignedDistance.INFINITE.distance;
        let posDist: number = SignedDistance.INFINITE.distance;
        let winding: number = 0;

        for (let i = 0; i < contourCount; ++i) {
          const contour: Contour = shape.contours[i];
          const r: EdgePoint = new EdgePoint();
          const g: EdgePoint = new EdgePoint();
          const b: EdgePoint = new EdgePoint();
          r.nearEdge = g.nearEdge = b.nearEdge = null;
          r.nearParam = g.nearParam = b.nearParam = 0;

          for (const edge of contour.edges) {
            const param: Ref<number> = refnew(0);
            const distance: SignedDistance = edge.signedDistance(p, param);
            // if (edge.color&EdgeColor.RED && distance < r.minDistance) {
            if (edge.color & EdgeColor.RED && SignedDistance.lt(distance, r.minDistance)) {
              r.minDistance.copy(distance);
              r.nearEdge = edge;
              r.nearParam = refget(param);
            }
            // if (edge.color&EdgeColor.GREEN && distance < g.minDistance) {
            if (edge.color & EdgeColor.GREEN && SignedDistance.lt(distance, g.minDistance)) {
              g.minDistance.copy(distance);
              g.nearEdge = edge;
              g.nearParam = refget(param);
            }
            // if (edge.color&EdgeColor.BLUE && distance < b.minDistance) {
            if (edge.color & EdgeColor.BLUE && SignedDistance.lt(distance, b.minDistance)) {
              b.minDistance.copy(distance);
              b.nearEdge = edge;
              b.nearParam = refget(param);
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

          let medMinDistance: number = Math.abs(median(r.minDistance.distance, g.minDistance.distance, b.minDistance.distance));
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

        const msd: MultiDistance = new MultiDistance();
        msd.r = msd.g = msd.b = msd.med = SignedDistance.INFINITE.distance;
        if (posDist >= 0 && Math.abs(posDist) <= Math.abs(negDist)) {
          msd.med = SignedDistance.INFINITE.distance;
          winding = 1;
          for (let i = 0; i < contourCount; ++i) {
            if (windings[i] > 0 && contourSD[i].med > msd.med && Math.abs(contourSD[i].med) < Math.abs(negDist)) {
              msd.copy(contourSD[i]);
            }
          }
        } else if (negDist <= 0 && Math.abs(negDist) <= Math.abs(posDist)) {
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
        const pixel: FloatRGB = output.getAt(x, row);
        pixel.r = msd.r / range + .5;
        pixel.g = msd.g / range + .5;
        pixel.b = msd.b / range + .5;
      }
    }
  }

  if (edgeThreshold > 0) {
    const threshold: Vector2 = new Vector2();
    threshold.x = edgeThreshold / (scale.x * range);
    threshold.y = edgeThreshold / (scale.y * range);
    msdfErrorCorrection(output, threshold);
  }
}

export function generateSDF_legacy(output: Bitmap<Float>, shape: Readonly<Shape>, range: number, scale: Readonly<Vector2>, translate: Readonly<Vector2>): void {
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

export function generatePseudoSDF_legacy(output: Bitmap<Float>, shape: Readonly<Shape>, range: number, scale: Readonly<Vector2>, translate: Readonly<Vector2>): void {
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

export function generateMSDF_legacy(output: Bitmap<FloatRGB>, shape: Readonly<Shape>, range: number, scale: Readonly<Vector2>, translate: Readonly<Vector2>, edgeThreshold: number = 1.00000001): void {
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
