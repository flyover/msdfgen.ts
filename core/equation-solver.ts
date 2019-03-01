
// ax^2 + bx + c = 0
export function solveQuadratic(x: [number, number], a: number, b: number, c: number): number {
    if (Math.abs(a) < 1e-14) {
        if (Math.abs(b) < 1e-14) {
            if (c === 0)
                return -1;
            return 0;
        }
        x[0] = -c/b;
        return 1;
    }
    let dscr: number = b*b-4*a*c;
    if (dscr > 0) {
        dscr = Math.sqrt(dscr);
        x[0] = (-b+dscr)/(2*a);
        x[1] = (-b-dscr)/(2*a);
        return 2;
    } else if (dscr === 0) {
        x[0] = -b/(2*a);
        return 1;
    } else
        return 0;
}

function solveCubicNormed(x: [number, number, number], a: number, b: number, c: number): number {
    const a2: number = a*a;
    let q: number = (a2 - 3*b)/9; 
    const r: number = (a*(2*a2-9*b) + 27*c)/54;
    const r2: number = r*r;
    const q3: number = q*q*q;
    let A: number, B: number;
    if (r2 < q3) {
        let t: number = r/Math.sqrt(q3);
        if (t < -1) t = -1;
        if (t > 1) t = 1;
        t = Math.acos(t);
        a /= 3; q = -2*Math.sqrt(q);
        x[0] = q*Math.cos(t/3)-a;
        x[1] = q*Math.cos((t+2*Math.PI)/3)-a;
        x[2] = q*Math.cos((t-2*Math.PI)/3)-a;
        return 3;
    } else {
        A = -Math.pow(Math.abs(r)+Math.sqrt(r2-q3), 1/3.); 
        if (r < 0) A = -A;
        B = A === 0 ? 0 : q/A;
        a /= 3;
        x[0] = (A+B)-a;
        x[1] = -0.5*(A+B)-a;
        x[2] = 0.5*Math.sqrt(3.)*(A-B);
        if (Math.abs(x[2]) < 1e-14)
            return 2;
        return 1;
    }
}

// ax^3 + bx^2 + cx + d = 0
export function solveCubic(x: [number, number, number], a: number, b: number, c: number, d: number): number {
    if (Math.abs(a) < 1e-14) {
        const x2: [number, number] = [ 0, 0 ];
        const r: number = solveQuadratic(x2, b, c, d);
        x[0] = x2[0];
        x[1] = x2[1];
        x[2] = 0;
        return r;
    }
    return solveCubicNormed(x, b/a, c/a, d/a);
}
