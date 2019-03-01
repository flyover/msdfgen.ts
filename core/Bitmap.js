System.register(["./arithmetics"], function (exports_1, context_1) {
    "use strict";
    var arithmetics_1, Float, FloatRGB, Bitmap, BitmapFloat, BitmapFloatRGB;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (arithmetics_1_1) {
                arithmetics_1 = arithmetics_1_1;
            }
        ],
        execute: function () {
            /// A floating-point pixel.
            Float = class Float {
                constructor(...args) {
                    this.a = 0;
                    if (args.length === 1) {
                        if (typeof args[0] === "number") {
                            this.a = args[0];
                        }
                        else {
                            this.a = args[0].a;
                        }
                    }
                }
                copy(other) {
                    this.a = other.a;
                    return this;
                }
                static mix(a, b, weight) {
                    const out = new Float();
                    out.a = arithmetics_1.mix(a.a, b.a, weight);
                    return out;
                }
            };
            exports_1("Float", Float);
            /// A floating-point RGB pixel.
            FloatRGB = class FloatRGB {
                constructor(...args) {
                    this.r = 0;
                    this.g = 0;
                    this.b = 0;
                    if (args.length === 3) {
                        this.r = args[0];
                        this.g = args[1];
                        this.b = args[2];
                    }
                    else if (args.length === 1) {
                        this.r = args[0].r;
                        this.g = args[0].g;
                        this.b = args[0].b;
                    }
                }
                copy(other) {
                    this.r = other.r;
                    this.g = other.g;
                    this.b = other.b;
                    return this;
                }
                static mix(a, b, weight) {
                    const out = new FloatRGB();
                    out.r = arithmetics_1.mix(a.r, b.r, weight);
                    out.g = arithmetics_1.mix(a.g, b.g, weight);
                    out.b = arithmetics_1.mix(a.b, b.b, weight);
                    return out;
                }
            };
            exports_1("FloatRGB", FloatRGB);
            /// A 2D image bitmap.
            Bitmap = class Bitmap {
                constructor(ctor, w = 0, h = 0) {
                    this.ctor = ctor;
                    this.w = 0;
                    this.h = 0;
                    this.content = [];
                    this.w = w;
                    this.h = h;
                    for (let i = 0; i < w * h; ++i) {
                        this.content[i] = new ctor();
                    }
                }
                // Bitmap<T> & operator=(const Bitmap<T> &orig);
                copy(other) {
                    const w = other.width();
                    const h = other.height();
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
                width() { return this.w; }
                /// Bitmap height in pixels.
                height() { return this.h; }
                // T & operator()(int x, int y);
                // const T & operator()(int x, int y) const;
                getAt(x, y) {
                    return this.content[y * this.w + x];
                }
            };
            exports_1("Bitmap", Bitmap);
            BitmapFloat = class BitmapFloat extends Bitmap {
                constructor(w = 0, h = 0) {
                    super(Float, w, h);
                }
            };
            exports_1("BitmapFloat", BitmapFloat);
            BitmapFloatRGB = class BitmapFloatRGB extends Bitmap {
                constructor(w = 0, h = 0) {
                    super(FloatRGB, w, h);
                }
            };
            exports_1("BitmapFloatRGB", BitmapFloatRGB);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQml0bWFwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQml0bWFwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O1lBRUEsMkJBQTJCO1lBQzNCLFFBQUEsTUFBYSxLQUFLO2dCQUtkLFlBQVksR0FBRyxJQUFXO29CQUoxQixNQUFDLEdBQVcsQ0FBQyxDQUFDO29CQUtWLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7d0JBQ25CLElBQUksT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFFOzRCQUM3QixJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDcEI7NkJBQU07NEJBQ0gsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUN0QjtxQkFDSjtnQkFDTCxDQUFDO2dCQUNNLElBQUksQ0FBQyxLQUFzQjtvQkFDOUIsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNqQixPQUFPLElBQUksQ0FBQztnQkFDaEIsQ0FBQztnQkFDTSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQWtCLEVBQUUsQ0FBa0IsRUFBRSxNQUFjO29CQUNwRSxNQUFNLEdBQUcsR0FBVSxJQUFJLEtBQUssRUFBRSxDQUFDO29CQUMvQixHQUFHLENBQUMsQ0FBQyxHQUFHLGlCQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUM5QixPQUFPLEdBQUcsQ0FBQztnQkFDZixDQUFDO2FBQ0osQ0FBQTs7WUFFRCwrQkFBK0I7WUFDL0IsV0FBQSxNQUFhLFFBQVE7Z0JBT2pCLFlBQVksR0FBRyxJQUFXO29CQU4xQixNQUFDLEdBQVcsQ0FBQyxDQUFDO29CQUNkLE1BQUMsR0FBVyxDQUFDLENBQUM7b0JBQ2QsTUFBQyxHQUFXLENBQUMsQ0FBQztv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