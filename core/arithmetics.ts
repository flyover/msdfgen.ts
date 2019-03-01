/// Returns the smaller of the arguments.
export function min(a: number, b: number): number {
    return b < a ? b : a;
}

/// Returns the larger of the arguments.
export function max(a: number, b: number): number {
    return a < b ? b : a;
}

/// Returns the middle out of three values
export function median(a: number, b: number, c: number): number {
    return max(min(a, b), min(max(a, b), c));
}

/// Returns the weighted average of a and b.
export function mix(a: number, b: number, weight: number): number {
    return (1-weight)*a+weight*b;
}

/// Clamps the number to the interval from lo to hi.
export function clamp(n: number, lo: number = 0, hi: number = 1): number {
    return n < lo ? lo : hi < n ? hi : n;
}

/// Returns 1 for positive values, -1 for negative values, and 0 for zero.
export function sign(n: number): -1 | 1 | 0 {
    return n < 0 ? -1 : 0 < n ? 1 : 0;
}

/// Returns 1 for non-negative values and -1 for negative values.
export function nonZeroSign(n: number): -1 | 1 {
    return n < 0 ? -1 : 1;
}
