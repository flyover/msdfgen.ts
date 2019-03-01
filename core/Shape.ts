
import { Contour } from "./Contour";
import { Point2, Bounds2 } from "./Vector2";
import { EdgeHolder } from "./EdgeHolder";

/// Vector shape representation.
export class Shape {
    /// The list of contours the shape consists of.
    public readonly contours: Contour[] = [];
    /// Specifies whether the shape uses bottom-to-top (false) or top-to-bottom (true) Y coordinates.
    public inverseYAxis: boolean = false;

    constructor() {}
    /// Adds a contour.
    public addContour(contour: Contour): void;
    /// Adds a blank contour and returns its reference.
    public addContour(): Contour;

    public addContour(...args: any[]): any {
        if (args.length === 1) {
            const contour: Contour = args[0];
            this.contours.push(contour);
            return;
        } else {
            const contour: Contour = new Contour();
            this.contours.push(contour);
            return contour;
        }
    }
    /// Normalizes the shape geometry for distance field generation.
    public normalize(): void {
        for (const contour of this.contours) {
            if (contour.edges.length === 1) {
                // EdgeSegment *parts[3] = { };
                // contour->edges[0]->splitInThirds(parts[0], parts[1], parts[2]);
                // contour->edges.clear();
                // contour->edges.push_back(EdgeHolder(parts[0]));
                // contour->edges.push_back(EdgeHolder(parts[1]));
                // contour->edges.push_back(EdgeHolder(parts[2]));
                const parts = contour.edges[0].splitInThirds();
                contour.edges.length = 0;
                contour.edges.push(new EdgeHolder(parts[0]));
                contour.edges.push(new EdgeHolder(parts[1]));
                contour.edges.push(new EdgeHolder(parts[2]));
            }
        }
    }
    /// Performs basic checks to determine if the object represents a valid shape.
    public validate(): boolean {
        for (const contour of this.contours) {
            if (contour.edges.length > 0) {
                let corner: Point2 = contour.edges[contour.edges.length - 1].point(1);
                for (const edge of contour.edges) {
                    if (!edge.validate()) {
                        return false;
                    }
                    if (edge.point(0).ne(corner)) {
                        return false;
                    }
                    corner = edge.point(1);
                }
            }
        }
        return true;
    }
    /// Computes the shape's bounding box.
    public bounds(bounds: Bounds2 = new Bounds2()): Bounds2 {
        for (const contour of this.contours) {
            contour.bounds(bounds);
        }
        return bounds;
    }
}
