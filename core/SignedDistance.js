System.register([], function (exports_1, context_1) {
    "use strict";
    var SignedDistance;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            /// Represents a signed distance and alignment, which together can be compared to uniquely determine the closest edge segment.
            SignedDistance = class SignedDistance {
                constructor(distance = -1e240, dot = 1) {
                    this.distance = distance;
                    this.dot = dot;
                }
                copy(other) {
                    this.distance = other.distance;
                    this.dot = other.dot;
                    return this;
                }
                static lt(a, b) {
                    return Math.abs(a.distance) < Math.abs(b.distance) || (Math.abs(a.distance) === Math.abs(b.distance) && a.dot < b.dot);
                }
                static gt(a, b) {
                    return Math.abs(a.distance) > Math.abs(b.distance) || (Math.abs(a.distance) === Math.abs(b.distance) && a.dot > b.dot);
                }
                static le(a, b) {
                    return Math.abs(a.distance) < Math.abs(b.distance) || (Math.abs(a.distance) === Math.abs(b.distance) && a.dot <= b.dot);
                }
                static ge(a, b) {
                    return Math.abs(a.distance) > Math.abs(b.distance) || (Math.abs(a.distance) === Math.abs(b.distance) && a.dot >= b.dot);
                }
            };
            SignedDistance.INFINITE = new SignedDistance(-1e240, 1);
            exports_1("SignedDistance", SignedDistance);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2lnbmVkRGlzdGFuY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJTaWduZWREaXN0YW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O1lBQUEsOEhBQThIO1lBQzlILGlCQUFBLE1BQWEsY0FBYztnQkFHdkIsWUFBbUIsV0FBbUIsQ0FBQyxLQUFLLEVBQVMsTUFBYyxDQUFDO29CQUFqRCxhQUFRLEdBQVIsUUFBUSxDQUFpQjtvQkFBUyxRQUFHLEdBQUgsR0FBRyxDQUFZO2dCQUFHLENBQUM7Z0JBRWpFLElBQUksQ0FBQyxLQUFxQjtvQkFDN0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO29CQUMvQixJQUFJLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7b0JBQ3JCLE9BQU8sSUFBSSxDQUFDO2dCQUNoQixDQUFDO2dCQUVNLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBMkIsRUFBRSxDQUEyQjtvQkFDckUsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMzSCxDQUFDO2dCQUVNLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBMkIsRUFBRSxDQUEyQjtvQkFDckUsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMzSCxDQUFDO2dCQUVNLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBMkIsRUFBRSxDQUEyQjtvQkFDckUsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM1SCxDQUFDO2dCQUVNLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBMkIsRUFBRSxDQUEyQjtvQkFDckUsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM1SCxDQUFDO2FBQ0osQ0FBQTtZQXpCMEIsdUJBQVEsR0FBNkIsSUFBSSxjQUFjLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMifQ==