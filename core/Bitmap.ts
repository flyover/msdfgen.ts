import { mix } from "./arithmetics";

/// A floating-point pixel.
export class Float {
    a: number = 0;
    constructor();
    constructor(a: number);
    constructor(copy: Readonly<FloatRGB>);
    constructor(...args: any[]) {
        if (args.length === 1) {
            if (typeof args[0] === "number") {
                this.a = args[0];
            } else {
                this.a = args[0].a;
            }
        }
    }
    public copy(other: Readonly<Float>): this {
        this.a = other.a;
        return this;
    }
    public static mix(a: Readonly<Float>, b: Readonly<Float>, weight: number): Float {
        const out: Float = new Float();
        out.a = mix(a.a, b.a, weight);
        return out;
    }
}

/// A floating-point RGB pixel.
export class FloatRGB {
    r: number = 0;
    g: number = 0;
    b: number = 0;
    constructor();
    constructor(r: number, g: number, b: number);
    constructor(copy: Readonly<FloatRGB>);
    constructor(...args: any[]) {
        if (args.length === 3) {
            this.r = args[0];
            this.g = args[1];
            this.b = args[2];
        } else if (args.length === 1) {
            this.r = args[0].r;
            this.g = args[0].g;
            this.b = args[0].b;
        }
    }
    public copy(other: Readonly<FloatRGB>): this {
        this.r = other.r;
        this.g = other.g;
        this.b = other.b;
        return this;
    }
    public static mix(a: Readonly<FloatRGB>, b: Readonly<FloatRGB>, weight: number): FloatRGB {
        const out: FloatRGB = new FloatRGB();
        out.r = mix(a.r, b.r, weight);
        out.g = mix(a.g, b.g, weight);
        out.b = mix(a.b, b.b, weight);
        return out;
    }
}

/// A 2D image bitmap.
export class Bitmap<T> {
    private w: number = 0;
    private h: number = 0;
    private content: T[] = [];

    constructor(private readonly ctor: { new(copy?: T): T }, w: number = 0, h: number = 0) {
        this.w = w;
        this.h = h;
        for (let i = 0; i < w * h; ++i) {
            this.content[i] = new ctor();
        }
    }

    // Bitmap<T> & operator=(const Bitmap<T> &orig);
    public copy(other: Readonly<Bitmap<T>>): this {
        const w: number = other.width();
        const h: number = other.height();
        this.w = w;
        this.h = h;
        for (let y = 0; y < h; ++y) {
            for (let x = 0; x < w; ++x) {
                this.content[y * this.w + x] = new this.ctor(other.getAt(x, y));
            }
        }
        return this;
    }
    /// Bitmap width in pixels.
    public width(): number { return this.w; }
    /// Bitmap height in pixels.
    public height(): number { return this.h; }
    // T & operator()(int x, int y);
    // const T & operator()(int x, int y) const;
    public getAt(x: number, y: number): T {
        return this.content[y * this.w + x];
    }
}

export class BitmapFloat extends Bitmap<Float> {
    constructor(w: number = 0, h: number = 0) {
        super(Float, w, h);
    }
}

export class BitmapFloatRGB extends Bitmap<FloatRGB> {
    constructor(w: number = 0, h: number = 0) {
        super(FloatRGB, w, h);
    }
}
