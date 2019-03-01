import { Vector2 } from "./Vector2";
import { EdgeColor } from "./EdgeColor";
import { Shape } from "./Shape";
import { EdgeSegment } from "./edge-segments";
import { EdgeHolder } from "./EdgeHolder";

type Ref<T> = [T];
function refnew<T>(val: T): Ref<T> { return [val]; }
function refget<T>(ref: Ref<T>): T { return ref[0]; }
function refset<T>(ref: Ref<T>, val: T): Ref<T> { ref[0] = val; return ref; }

function isCorner(aDir: Readonly<Vector2>, bDir: Readonly<Vector2>, crossThreshold: number): boolean {
    return Vector2.dotProduct(aDir, bDir) <= 0 || Math.abs(Vector2.crossProduct(aDir, bDir)) > crossThreshold;
}

function switchColor(color: Ref<EdgeColor>, seed: Ref<number>, banned: EdgeColor = EdgeColor.BLACK): void {
    const combined: EdgeColor = refget(color)&banned;
    if (combined === EdgeColor.RED || combined === EdgeColor.GREEN || combined === EdgeColor.BLUE) {
        refset(color, combined^EdgeColor.WHITE);
        return;
    }
    if (refget(color) === EdgeColor.BLACK || refget(color) === EdgeColor.WHITE) {
        // static const EdgeColor start[3] = { CYAN, MAGENTA, YELLOW };
        const start: EdgeColor[] = [ EdgeColor.CYAN, EdgeColor.MAGENTA, EdgeColor.YELLOW ];
        refset(color, start[refget(seed)%3]);
        refset(seed, refget(seed) / 3);
        return;
    }
    const shifted: number = refget(color)<<(1+(refget(seed)&1));
    refset(color, (shifted|shifted>>3)&EdgeColor.WHITE);
    refset(seed, refget(seed) >> 1);
}

/** Assigns colors to edges of the shape in accordance to the multi-channel distance field technique.
 *  May split some edges if necessary.
 *  angleThreshold specifies the maximum angle (in radians) to be considered a corner, for example 3 (~172 degrees).
 *  Values below 1/2 PI will be treated as the external angle.
 */
export function edgeColoringSimple(shape: Shape, angleThreshold: number, _seed: number = 0): void {
    const seed: Ref<number> = refnew(_seed);
    const crossThreshold: number = Math.sin(angleThreshold);
    const corners: number[] = [];
    for (const contour of shape.contours) {
        // Identify corners
        corners.length = 0;
        if (contour.edges.length > 0) {
            let prevDirection: Vector2 = contour.edges[contour.edges.length - 1].direction(1);
            let index: number = 0;
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
                edge.color = EdgeColor.WHITE;
            }
        }
        // "Teardrop" case
        else if (corners.length === 1) {
            const colors: Ref<EdgeColor>[] = [ refnew(EdgeColor.WHITE), refnew(EdgeColor.WHITE), refnew(EdgeColor.WHITE) ];
            // switchColor(colors[0], seed);
            switchColor(colors[0], seed);
            // switchColor(colors[2] = colors[0], seed);
            switchColor(refset(colors[2], refget(colors[0])), seed);
            const corner: number = corners[0];
            if (contour.edges.length >= 3) {
                const m: number = contour.edges.length;
                for (let i = 0; i < m; ++i) {
                    // contour->edges[(corner+i)%m]->color = (colors+1)[int(3+2.875*i/(m-1)-1.4375+.5)-3];
                    contour.edges[(corner+i)%m].color = refget(colors[1+Math.floor(3+2.875*i/(m-1)-1.4375+.5)-3]);
                }
            } else if (contour.edges.length >= 1) {
                // Less than three edge segments for three colors => edges must be split
                // EdgeSegment *parts[7] = { };
                const parts: EdgeSegment[] = [];
                // contour->edges[0]->splitInThirds(parts[0+3*corner], parts[1+3*corner], parts[2+3*corner]);
                [ parts[0+3*corner], parts[1+3*corner], parts[2+3*corner] ] = contour.edges[0].splitInThirds();
                if (contour.edges.length >= 2) {
                    // contour->edges[1]->splitInThirds(parts[3-3*corner], parts[4-3*corner], parts[5-3*corner]);
                    [ parts[3-3*corner], parts[4-3*corner], parts[5-3*corner] ] = contour.edges[1].splitInThirds();
                    parts[0].color = parts[1].color = refget(colors[0]);
                    parts[2].color = parts[3].color = refget(colors[1]);
                    parts[4].color = parts[5].color = refget(colors[2]);
                } else {
                    parts[0].color = refget(colors[0]);
                    parts[1].color = refget(colors[1]);
                    parts[2].color = refget(colors[2]);
                }
                contour.edges.length = 0;
                for (let i = 0; parts[i]; ++i) {
                    contour.edges.push(new EdgeHolder(parts[i]));
                }
            }
        }
        // Multiple corners
        else {
            const cornerCount: number = corners.length;
            let spline: number = 0;
            const start: number = corners[0];
            const m: number = contour.edges.length;
            const color: Ref<EdgeColor> = refnew(EdgeColor.WHITE);
            // switchColor(color, seed);
            switchColor(color, seed);
            let initialColor: EdgeColor = refget(color);
            for (let i = 0; i < m; ++i) {
                const index: number = (start+i)%m;
                if (spline+1 < cornerCount && corners[spline+1] === index) {
                    ++spline;
                    // switchColor(color, seed, EdgeColor((spline === cornerCount-1)*initialColor));
                    switchColor(color, seed, ((spline === cornerCount-1) ? 1 : 0)*initialColor);
                }
                contour.edges[index].color = refget(color);
            }
        }
    }
}
