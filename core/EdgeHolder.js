System.register([], function (exports_1, context_1) {
    "use strict";
    var EdgeHolder;
    var __moduleName = context_1 && context_1.id;
    function refnew(val) { return [val]; }
    function refget(ref) { return ref[0]; }
    function refset(ref, val) { ref[0] = val; return ref; }
    return {
        setters: [],
        execute: function () {
            /// Container for a single edge of dynamic type.
            EdgeHolder = class EdgeHolder {
                constructor(edgeSegment = null) {
                    this.edgeSegment = edgeSegment;
                }
                get _edgeSegment() {
                    if (this.edgeSegment === null) {
                        throw new Error();
                    }
                    return this.edgeSegment;
                }
                validate() {
                    return this.edgeSegment !== null;
                }
                get color() { return this._edgeSegment.color; }
                set color(value) { this._edgeSegment.color = value; }
                copy(other) {
                    this.edgeSegment = other.edgeSegment && other.edgeSegment.clone();
                    return this;
                }
                /// Creates a copy of the edge segment.
                // public clone(): EdgeSegment;
                clone() {
                    return new EdgeHolder(this.edgeSegment && this.edgeSegment.clone());
                }
                /// Returns the point on the edge specified by the parameter (between 0 and 1).
                point(param) {
                    return this._edgeSegment.point(param);
                }
                /// Returns the direction the edge has at the point specified by the parameter.
                // virtual Vector2 direction(double param) const = 0;
                direction(param) {
                    return this._edgeSegment.direction(param);
                }
                /// Returns the minimum signed distance between origin and the edge.
                // virtual SignedDistance signedDistance(Point2 origin, double &param) const = 0;
                signedDistance(origin, param) {
                    return this._edgeSegment.signedDistance(origin, param);
                }
                /// Converts a previously retrieved signed distance from origin to pseudo-distance.
                distanceToPseudoDistance(distance, origin, param) {
                    this._edgeSegment.distanceToPseudoDistance(distance, origin, param);
                }
                /// Adjusts the bounding box to fit the edge segment.
                // virtual void bounds(double &l, double &b, double &r, double &t) const = 0;
                bounds(bounds) {
                    this._edgeSegment.bounds(bounds);
                }
                /// Moves the start point of the edge segment.
                // virtual void moveStartPoint(Point2 to) = 0;
                moveStartPoint(to) {
                    this._edgeSegment.moveStartPoint(to);
                }
                /// Moves the end point of the edge segment.
                // virtual void moveEndPoint(Point2 to) = 0;
                moveEndPoint(to) {
                    this._edgeSegment.moveEndPoint(to);
                }
                /// Splits the edge segments into thirds which together represent the original edge.
                // virtual void splitInThirds(EdgeSegment *&part1, EdgeSegment *&part2, EdgeSegment *&part3) const = 0;
                splitInThirds() {
                    return this._edgeSegment.splitInThirds();
                }
            };
            exports_1("EdgeHolder", EdgeHolder);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRWRnZUhvbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkVkZ2VIb2xkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQU9BLFNBQVMsTUFBTSxDQUFJLEdBQU0sSUFBWSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFNBQVMsTUFBTSxDQUFJLEdBQVcsSUFBTyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckQsU0FBUyxNQUFNLENBQUksR0FBVyxFQUFFLEdBQU0sSUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDOzs7O1lBRTdFLGdEQUFnRDtZQUNoRCxhQUFBLE1BQWEsVUFBVTtnQkFDbkIsWUFBbUIsY0FBa0MsSUFBSTtvQkFBdEMsZ0JBQVcsR0FBWCxXQUFXLENBQTJCO2dCQUFHLENBQUM7Z0JBQzdELElBQVksWUFBWTtvQkFDcEIsSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLElBQUksRUFBRTt3QkFBRSxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7cUJBQUU7b0JBQ3JELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztnQkFDNUIsQ0FBQztnQkFFTSxRQUFRO29CQUNYLE9BQU8sSUFBSSxDQUFDLFdBQVcsS0FBSyxJQUFJLENBQUM7Z0JBQ3JDLENBQUM7Z0JBRUQsSUFBVyxLQUFLLEtBQWdCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNqRSxJQUFXLEtBQUssQ0FBQyxLQUFnQixJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBRWhFLElBQUksQ0FBQyxLQUEyQjtvQkFDbkMsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsV0FBVyxJQUFJLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ2xFLE9BQU8sSUFBSSxDQUFDO2dCQUNoQixDQUFDO2dCQUVELHVDQUF1QztnQkFDdkMsK0JBQStCO2dCQUN4QixLQUFLO29CQUNSLE9BQU8sSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7Z0JBQ3hFLENBQUM7Z0JBQ0QsK0VBQStFO2dCQUN4RSxLQUFLLENBQUMsS0FBYTtvQkFDdEIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDMUMsQ0FBQztnQkFDRCwrRUFBK0U7Z0JBQy9FLHFEQUFxRDtnQkFDOUMsU0FBUyxDQUFDLEtBQWE7b0JBQzFCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzlDLENBQUM7Z0JBQ0Qsb0VBQW9FO2dCQUNwRSxpRkFBaUY7Z0JBQzFFLGNBQWMsQ0FBQyxNQUF3QixFQUFFLEtBQWtCO29CQUM5RCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDM0QsQ0FBQztnQkFDRCxtRkFBbUY7Z0JBQzVFLHdCQUF3QixDQUFDLFFBQXdCLEVBQUUsTUFBYyxFQUFFLEtBQWE7b0JBQ25GLElBQUksQ0FBQyxZQUFZLENBQUMsd0JBQXdCLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDeEUsQ0FBQztnQkFDRCxxREFBcUQ7Z0JBQ3JELDZFQUE2RTtnQkFDdEUsTUFBTSxDQUFDLE1BQWU7b0JBQ3pCLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNyQyxDQUFDO2dCQUVELDhDQUE4QztnQkFDOUMsOENBQThDO2dCQUN2QyxjQUFjLENBQUMsRUFBVTtvQkFDNUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3pDLENBQUM7Z0JBQ0QsNENBQTRDO2dCQUM1Qyw0Q0FBNEM7Z0JBQ3JDLFlBQVksQ0FBQyxFQUFVO29CQUMxQixJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDdkMsQ0FBQztnQkFDRCxvRkFBb0Y7Z0JBQ3BGLHVHQUF1RztnQkFDaEcsYUFBYTtvQkFDaEIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUM3QyxDQUFDO2FBQ0osQ0FBQSJ9