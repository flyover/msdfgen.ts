System.register(["./EdgeHolder", "./arithmetics"], function (exports_1, context_1) {
    "use strict";
    var EdgeHolder_1, arithmetics_1, Contour;
    var __moduleName = context_1 && context_1.id;
    function shoelace(a, b) {
        return (b.x - a.x) * (a.y + b.y);
    }
    return {
        setters: [
            function (EdgeHolder_1_1) {
                EdgeHolder_1 = EdgeHolder_1_1;
            },
            function (arithmetics_1_1) {
                arithmetics_1 = arithmetics_1_1;
            }
        ],
        execute: function () {
            /// A single closed contour of a shape.
            Contour = class Contour {
                constructor() {
                    /// The sequence of edges that make up the contour.
                    this.edges = [];
                }
                addEdge(...args) {
                    if (args.length === 1) {
                        this.edges.push(args[0] instanceof EdgeHolder_1.EdgeHolder ? args[0] : new EdgeHolder_1.EdgeHolder(args[0]));
                        return;
                    }
                    else {
                        const edge = new EdgeHolder_1.EdgeHolder();
                        this.edges.push(edge);
                        return edge;
                    }
                }
                /// Computes the bounding box of the contour.
                bounds(bounds) {
                    for (const edge of this.edges) {
                        edge.bounds(bounds);
                    }
                }
                /// Computes the winding of the contour. Returns 1 if positive, -1 if negative.
                winding() {
                    if (this.edges.length === 0) {
                        return 0;
                    }
                    let total = 0;
                    if (this.edges.length === 1) {
                        const a = this.edges[0].point(0);
                        const b = this.edges[0].point(1 / 3.);
                        const c = this.edges[0].point(2 / 3.);
                        total += shoelace(a, b);
                        total += shoelace(b, c);
                        total += shoelace(c, a);
                    }
                    else if (this.edges.length === 2) {
                        const a = this.edges[0].point(0);
                        const b = this.edges[0].point(.5);
                        const c = this.edges[1].point(0);
                        const d = this.edges[1].point(.5);
                        total += shoelace(a, b);
                        total += shoelace(b, c);
                        total += shoelace(c, d);
                        total += shoelace(d, a);
                    }
                    else {
                        let prev = this.edges[this.edges.length - 1].point(0);
                        for (const edge of this.edges) {
                            const cur = edge.point(0);
                            total += shoelace(prev, cur);
                            prev = cur;
                        }
                    }
                    return arithmetics_1.sign(total);
                }
            };
            exports_1("Contour", Contour);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udG91ci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNvbnRvdXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUtBLFNBQVMsUUFBUSxDQUFDLENBQW1CLEVBQUUsQ0FBbUI7UUFDdEQsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0IsQ0FBQzs7Ozs7Ozs7Ozs7WUFFRCx1Q0FBdUM7WUFDdkMsVUFBQSxNQUFhLE9BQU87Z0JBQXBCO29CQUNJLG1EQUFtRDtvQkFDbkMsVUFBSyxHQUFpQixFQUFFLENBQUM7Z0JBeUQ3QyxDQUFDO2dCQWhEVSxPQUFPLENBQUMsR0FBRyxJQUFXO29CQUN6QixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO3dCQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFlBQVksdUJBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLHVCQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDbkYsT0FBTztxQkFDVjt5QkFBTTt3QkFDSCxNQUFNLElBQUksR0FBZSxJQUFJLHVCQUFVLEVBQUUsQ0FBQzt3QkFDMUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ3RCLE9BQU8sSUFBSSxDQUFDO3FCQUNmO2dCQUNMLENBQUM7Z0JBQ0QsNkNBQTZDO2dCQUN0QyxNQUFNLENBQUMsTUFBZTtvQkFDekIsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO3dCQUMzQixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3FCQUN2QjtnQkFDTCxDQUFD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