System.register(["./Contour", "./Vector2", "./EdgeHolder"], function (exports_1, context_1) {
    "use strict";
    var Contour_1, Vector2_1, EdgeHolder_1, Shape;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (Contour_1_1) {
                Contour_1 = Contour_1_1;
            },
            function (Vector2_1_1) {
                Vector2_1 = Vector2_1_1;
            },
            function (EdgeHolder_1_1) {
                EdgeHolder_1 = EdgeHolder_1_1;
            }
        ],
        execute: function () {
            /// Vector shape representation.
            Shape = class Shape {
                constructor() {
                    /// The list of contours the shape consists of.
                    this.contours = [];
                    /// Specifies whether the shape uses bottom-to-top (false) or top-to-bottom (true) Y coordinates.
                    this.inverseYAxis = false;
                }
                addContour(...args) {
                    if (args.length === 1) {
                        const contour = args[0];
                        this.contours.push(contour);
                        return;
                    }
                    else {
                        const contour = new Contour_1.Contour();
                        this.contours.push(contour);
                        return contour;
                    }
                }
                /// Normalizes the shape geometry for distance field generation.
                normalize() {
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
                            contour.edges.push(new EdgeHolder_1.EdgeHolder(parts[0]));
                            contour.edges.push(new EdgeHolder_1.EdgeHolder(parts[1]));
                            contour.edges.push(new EdgeHolder_1.EdgeHolder(parts[2]));
                        }
                    }
                }
                /// Performs basic checks to determine if the object represents a valid shape.
                validate() {
                    for (const contour of this.contours) {
                        if (contour.edges.length > 0) {
                            let corner = contour.edges[contour.edges.length - 1].point(1);
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
                bounds(bounds = new Vector2_1.Bounds2()) {
                    for (const contour of this.contours) {
                        contour.bounds(bounds);
                    }
                    return bounds;
                }
            };
            exports_1("Shape", Shape);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2hhcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTaGFwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztZQUtBLGdDQUFnQztZQUNoQyxRQUFBLE1BQWEsS0FBSztnQkFNZDtvQkFMQSwrQ0FBK0M7b0JBQy9CLGFBQVEsR0FBYyxFQUFFLENBQUM7b0JBQ3pDLGlHQUFpRztvQkFDMUYsaUJBQVksR0FBWSxLQUFLLENBQUM7Z0JBRXRCLENBQUM7Z0JBTVQsVUFBVSxDQUFDLEdBQUcsSUFBVztvQkFDNUIsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTt3QkFDbkIsTUFBTSxPQUFPLEdBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNqQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDNUIsT0FBTztxQkFDVjt5QkFBTTt3QkFDSCxNQUFNLE9BQU8sR0FBWSxJQUFJLGlCQUFPLEVBQUUsQ0FBQzt3QkFDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQzVCLE9BQU8sT0FBTyxDQUFDO3FCQUNsQjtnQkFDTCxDQUFDO2dCQUNELGdFQUFnRTtnQkFDekQsU0FBUztvQkFDWixLQUFLLE1BQU0sT0FBTyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7d0JBQ2pDLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOzRCQUM1QiwrQkFBK0I7NEJBQy9CLGtFQUFrRTs0QkFDbEUsMEJBQTBCOzRCQUMxQixrREFBa0Q7NEJBQ2xELGtEQUFrRDs0QkFDbEQsa0RBQWtEOzRCQUNsRCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDOzRCQUMvQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7NEJBQ3pCLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksdUJBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUM3QyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLHVCQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDN0MsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSx1QkFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2hEO3FCQUNKO2dCQUNMLENBQUM7Z0JBQ0QsOEVBQThFO2dCQUN2RSxRQUFRO29CQUNYLEtBQUssTUFBTSxPQUFPLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTt3QkFDakMsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7NEJBQzFCLElBQUksTUFBTSxHQUFXLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUN0RSxLQUFLLE1BQU0sSUFBSSxJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUU7Z0NBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUU7b0NBQ2xCLE9BQU8sS0FBSyxDQUFDO2lDQUNoQjtnQ0FDRCxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFO29DQUMxQixPQUFPLEtBQUssQ0FBQztpQ0FDaEI7Z0NBQ0QsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7NkJBQzFCO3lCQUNKO3FCQUNKO29CQUNELE9BQU8sSUFBSSxDQUFDO2dCQUNoQixDQUFDO2dCQUNELHNDQUFzQztnQkFDL0IsTUFBTSxDQUFDLFNBQWtCLElBQUksaUJBQU8sRUFBRTtvQkFDekMsS0FBSyxNQUFNLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO3dCQUNqQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3FCQUMxQjtvQkFDRCxPQUFPLE1BQU0sQ0FBQztnQkFDbEIsQ0FBQzthQUNKLENBQUEifQ==