System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    /// Returns the smaller of the arguments.
    function min(a, b) {
        return b < a ? b : a;
    }
    exports_1("min", min);
    /// Returns the larger of the arguments.
    function max(a, b) {
        return a < b ? b : a;
    }
    exports_1("max", max);
    /// Returns the middle out of three values
    function median(a, b, c) {
        return max(min(a, b), min(max(a, b), c));
    }
    exports_1("median", median);
    /// Returns the weighted average of a and b.
    function mix(a, b, weight) {
        return (1 - weight) * a + weight * b;
    }
    exports_1("mix", mix);
    /// Clamps the number to the interval from lo to hi.
    function clamp(n, lo = 0, hi = 1) {
        return n < lo ? lo : hi < n ? hi : n;
    }
    exports_1("clamp", clamp);
    /// Returns 1 for positive values, -1 for negative values, and 0 for zero.
    function sign(n) {
        return n < 0 ? -1 : 0 < n ? 1 : 0;
    }
    exports_1("sign", sign);
    /// Returns 1 for non-negative values and -1 for negative values.
    function nonZeroSign(n) {
        return n < 0 ? -1 : 1;
    }
    exports_1("nonZeroSign", nonZeroSign);
    return {
        setters: [],
        execute: function () {
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJpdGhtZXRpY3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhcml0aG1ldGljcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFBQSx5Q0FBeUM7SUFDekMsU0FBZ0IsR0FBRyxDQUFDLENBQVMsRUFBRSxDQUFTO1FBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDekIsQ0FBQzs7SUFFRCx3Q0FBd0M7SUFDeEMsU0FBZ0IsR0FBRyxDQUFDLENBQVMsRUFBRSxDQUFTO1FBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDekIsQ0FBQzs7SUFFRCwwQ0FBMEM7SUFDMUMsU0FBZ0IsTUFBTSxDQUFDLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUztRQUNsRCxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0MsQ0FBQzs7SUFFRCw0Q0FBNEM7SUFDNUMsU0FBZ0IsR0FBRyxDQUFDLENBQVMsRUFBRSxDQUFTLEVBQUUsTUFBYztRQUNwRCxPQUFPLENBQUMsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxHQUFDLENBQUMsR0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7O0lBRUQsb0RBQW9EO0lBQ3BELFNBQWdCLEtBQUssQ0FBQyxDQUFTLEVBQUUsS0FBYSxDQUFDLEVBQUUsS0FBYSxDQUFDO1FBQzNELE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QyxDQUFDOztJQUVELDBFQUEwRTtJQUMxRSxTQUFnQixJQUFJLENBQUMsQ0FBUztRQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN0QyxDQUFDOztJQUVELGlFQUFpRTtJQUNqRSxTQUFnQixXQUFXLENBQUMsQ0FBUztRQUNqQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUIsQ0FBQyJ9