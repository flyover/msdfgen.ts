import { EdgeHolder } from "./EdgeHolder";
import { sign } from "./arithmetics";
import { Point2, Bounds2 } from "./Vector2";
import { EdgeSegment } from "./edge-segments";

function shoelace(a: Readonly<Point2>, b: Readonly<Point2>): number {
    return (b.x-a.x)*(a.y+b.y);
}

/// A single closed contour of a shape.
export class Contour {
    /// The sequence of edges that make up the contour.
    public readonly edges: EdgeHolder[] = [];

    /// Adds an edge to the contour.
    public addEdge(edge: Readonly<EdgeHolder>): void;
    public addEdge(edge: Readonly<EdgeSegment>): void;

    /// Creates a new edge in the contour and returns its reference.
    public addEdge(): EdgeHolder;

    public addEdge(...args: any[]): any {
        if (args.length === 1) {
            this.edges.push(args[0] instanceof EdgeHolder ? args[0] : new EdgeHolder(args[0]));
            return;
        } else {
            const edge: EdgeHolder = new EdgeHolder();
            this.edges.push(edge);
            return edge;
        }
    }
    /// Computes the bounding box of the contour.
    public bounds(bounds: Bounds2): void {
        for (const edge of this.edges) {
            edge.bounds(bounds);
        }
    }
    /// Computes the winding of the contour. Returns 1 if positive, -1 if negative.
    public winding(): number {
        if (this.edges.length === 0) {
            return 0;
        }
        let total: number = 0;
        if (this.edges.length === 1) {
            const a: Point2 = this.edges[0].point(0);
            const b: Point2 = this.edges[0].point(1/3.);
            const c: Point2 = this.edges[0].point(2/3.);
            total += shoelace(a, b);
            total += shoelace(b, c);
            total += shoelace(c, a);
        } else if (this.edges.length === 2) {
            const a: Point2 = this.edges[0].point(0);
            const b: Point2 = this.edges[0].point(.5);
            const c: Point2 = this.edges[1].point(0);
            const d: Point2 = this.edges[1].point(.5);
            total += shoelace(a, b);
            total += shoelace(b, c);
            total += shoelace(c, d);
            total += shoelace(d, a);
        } else {
            let prev: Point2 = this.edges[this.edges.length-1].point(0);
            for (const edge of this.edges) {
                const cur: Point2 = edge.point(0);
                total += shoelace(prev, cur);
                prev = cur;
            }
        }
        return sign(total);
    }
}
