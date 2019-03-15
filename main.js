System.register(["msdfgen-core", "freetype-js"], function (exports_1, context_1) {
    "use strict";
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var msdfgen, FT, DEFAULT_SIZE, DEFAULT_CHARSET, DEFAULT_TYPE, DEFAULT_RANGE, DEFAULT_ANGLE_THRESHOLD, DEFAULT_MSDF_EDGE_THRESHOLD, Rect, Pack, Bitmap;
    var __moduleName = context_1 && context_1.id;
    function main(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const progress = option(options.progress, () => __awaiter(this, void 0, void 0, function* () { return false; }));
            const verbose = option(options.verbose, false);
            const size = option(options.size, DEFAULT_SIZE); // pixels
            const charset = option(options.charset, DEFAULT_CHARSET).split("");
            const type = option(options.type, msdfgen.Type.MSDF);
            const range = option(options.range, DEFAULT_RANGE); // pixels
            const angle_threshold = option(options.angle_threshold, DEFAULT_ANGLE_THRESHOLD); // radians
            const msdf_edge_threshold = option(options.msdf_edge_threshold, DEFAULT_MSDF_EDGE_THRESHOLD);
            let ft_error;
            const ft_library = new FT.Library();
            ft_error = FT.Init_FreeType(ft_library);
            if (ft_error !== FT.Err.Ok) {
                throw new Error(FT.Error_String(ft_error));
            }
            const ft_face = new FT.Face();
            ft_error = FT.New_Memory_Face(ft_library, options.font_file, 0, ft_face);
            if (ft_error !== FT.Err.Ok) {
                throw new Error(FT.Error_String(ft_error));
            }
            const ft_scale = size / ft_face.units_per_EM; // font units to pixels
            const font_json = {
                name: ft_face.family_name,
                size, type,
                pad: range,
                ascender: ft_face.ascender * ft_scale,
                descender: ft_face.descender * ft_scale,
                line_advance: ft_face.height * ft_scale,
                page: { name: "", w: 0, h: 0 },
                glyphs: []
            };
            const glyphs = [];
            for (const [index, char] of charset.entries()) {
                const code = char.charCodeAt(0);
                ft_error = FT.Load_Char(ft_face, code, FT.LOAD.NO_SCALE);
                if (ft_error !== FT.Err.Ok) {
                    throw new Error(FT.Error_String(ft_error));
                }
                const w = ft_face.glyph.metrics.width * ft_scale;
                const h = ft_face.glyph.metrics.height * ft_scale;
                const hbx = ft_face.glyph.metrics.horiBearingX * ft_scale;
                const hby = ft_face.glyph.metrics.horiBearingY * ft_scale;
                const vbx = ft_face.glyph.metrics.vertBearingX * ft_scale;
                const vby = ft_face.glyph.metrics.vertBearingY * ft_scale;
                const ax = ft_face.glyph.advance.x * ft_scale;
                const ay = ft_face.glyph.advance.y * ft_scale;
                const tw = w === 0 ? 0 : w + 2 * range;
                const th = h === 0 ? 0 : h + 2 * range;
                const glyph_json = {
                    char, code, w, h,
                    hbx, hby, vbx, vby, ax, ay,
                    tx: 0, ty: 0, tw, th // tx and ty set by pack
                };
                // round texture size up to whole pixels
                const glyph_bitmap = new Bitmap(Math.ceil(tw), Math.ceil(th));
                const shape = new msdfgen.Shape();
                shape.inverseYAxis = true;
                let contour = null;
                let start = null;
                // glyph contour coordinates are in font units
                function import_ft_vector(ft_vector) {
                    return new msdfgen.Point2(ft_vector.x * ft_scale, ft_vector.y * ft_scale);
                }
                // load and parse glyph outline
                ft_error = FT.Outline_Decompose(ft_face.glyph.outline, {
                    move_to: (to) => {
                        contour = shape.addContour();
                        start = import_ft_vector(to);
                        return FT.Err.Ok;
                    },
                    line_to: (to) => {
                        if (contour === null || start === null) {
                            return FT.Err.Invalid_Outline;
                        }
                        contour.addEdge(new msdfgen.LinearSegment(start, start = import_ft_vector(to)));
                        return FT.Err.Ok;
                    },
                    conic_to: (cp, to) => {
                        if (contour === null || start === null) {
                            return FT.Err.Invalid_Outline;
                        }
                        contour.addEdge(new msdfgen.QuadraticSegment(start, import_ft_vector(cp), start = import_ft_vector(to)));
                        return FT.Err.Ok;
                    },
                    cubic_to: (cp1, cp2, to) => {
                        if (contour === null || start === null) {
                            return FT.Err.Invalid_Outline;
                        }
                        contour.addEdge(new msdfgen.CubicSegment(start, import_ft_vector(cp1), import_ft_vector(cp2), start = import_ft_vector(to)));
                        return FT.Err.Ok;
                    },
                });
                if (ft_error !== FT.Err.Ok) {
                    throw new Error(FT.Error_String(ft_error));
                }
                if (!shape.validate()) {
                    throw new Error(FT.Error_String(FT.Err.Invalid_Outline));
                }
                shape.normalize();
                msdfgen.edgeColoringSimple(shape, angle_threshold);
                const ox = hbx - range;
                const oy = hby + range - glyph_bitmap.height;
                // msdfgen transform
                // x' = (x + .5) / scale.x - translate.x;
                // y' = (y + .5) / scale.y - translate.y;
                const scale = new msdfgen.Vector2(1, 1);
                const translate = new msdfgen.Vector2(-ox, -oy);
                switch (type) {
                    case msdfgen.Type.SDF:
                        const sdf = new msdfgen.BitmapFloat(glyph_bitmap.width, glyph_bitmap.height);
                        msdfgen.generateSDF(sdf, shape, range, scale, translate);
                        for (let y = 0; y < sdf.height(); ++y) {
                            for (let x = 0; x < sdf.width(); ++x) {
                                glyph_bitmap.pixel(x, y).set([255, 255, 255, sdf.getAt(x, y).a * 255]);
                            }
                        }
                        break;
                    case msdfgen.Type.PSDF:
                        const psdf = new msdfgen.BitmapFloat(glyph_bitmap.width, glyph_bitmap.height);
                        msdfgen.generatePseudoSDF(psdf, shape, range, scale, translate);
                        for (let y = 0; y < psdf.height(); ++y) {
                            for (let x = 0; x < psdf.width(); ++x) {
                                glyph_bitmap.pixel(x, y).set([255, 255, 255, psdf.getAt(x, y).a * 255]);
                            }
                        }
                        break;
                    case msdfgen.Type.MSDF:
                        const msdf = new msdfgen.BitmapFloatRGB(glyph_bitmap.width, glyph_bitmap.height);
                        msdfgen.generateMSDF(msdf, shape, range, scale, translate, msdf_edge_threshold);
                        for (let y = 0; y < msdf.height(); ++y) {
                            for (let x = 0; x < msdf.width(); ++x) {
                                const rgb = msdf.getAt(x, y);
                                glyph_bitmap.pixel(x, y).set([rgb.r * 255, rgb.g * 255, rgb.b * 255, 255]);
                            }
                        }
                        break;
                    default: throw new Error();
                }
                font_json.glyphs.push(glyph_json);
                glyphs.push({ json: glyph_json, bitmap: glyph_bitmap });
                const stop = yield progress(index + 1, charset.length);
                if (stop) {
                    break;
                }
            }
            const kernings = [];
            const kerning = new FT.Vector();
            for (const char_a of charset) {
                const a = char_a.charCodeAt(0);
                for (const char_b of charset) {
                    const b = char_b.charCodeAt(0);
                    kerning.x = 0;
                    kerning.y = 0;
                    ft_error = FT.Get_Kerning(ft_face, a, b, FT.KERNING.DEFAULT, kerning);
                    if (ft_error !== FT.Err.Ok) {
                        throw new Error(FT.Error_String(ft_error));
                    }
                    if (kerning.x !== 0 || kerning.y !== 0) {
                        kernings.push({ a, b, x: kerning.x || undefined, y: kerning.y || undefined });
                    }
                }
            }
            if (kernings.length > 0) {
                font_json.kernings = kernings;
            }
            ft_error = FT.Done_Face(ft_face);
            if (ft_error !== FT.Err.Ok) {
                throw new Error(FT.Error_String(ft_error));
            }
            ft_error = FT.Done_FreeType(ft_library);
            if (ft_error !== FT.Err.Ok) {
                throw new Error(FT.Error_String(ft_error));
            }
            // find minimum font texture size
            for (const glyph of glyphs) {
                font_json.page.w = Math.max(font_json.page.w, pow2ceil(glyph.bitmap.width));
                font_json.page.h = Math.max(font_json.page.h, pow2ceil(glyph.bitmap.height));
            }
            // sort glyphs descending by the longest texture side
            glyphs.sort((a, b) => {
                return Math.max(b.bitmap.width, b.bitmap.height) - Math.max(a.bitmap.width, a.bitmap.height);
            });
            let fit = false;
            const max = 4096;
            const gap = 1;
            while (!fit && font_json.page.w <= max && font_json.page.h <= max) {
                const pack = new Pack(font_json.page.w + gap, font_json.page.h + gap);
                fit = true;
                for (const glyph of glyphs) {
                    if (glyph.bitmap.width === 0 && glyph.bitmap.height === 0) {
                        continue;
                    }
                    const rect = pack.find(glyph.bitmap.width + gap, glyph.bitmap.height + gap);
                    if (rect === null) {
                        fit = false;
                        break;
                    }
                    glyph.json.tx = rect.x;
                    glyph.json.ty = rect.y;
                }
                if (!fit) {
                    font_json.page.w <= font_json.page.h ? font_json.page.w <<= 1 : font_json.page.h <<= 1;
                }
            }
            if (!fit) {
                throw new Error();
            }
            const font_bitmap = new Bitmap(font_json.page.w, font_json.page.h);
            for (const glyph of glyphs) {
                font_bitmap.blit(glyph.bitmap, glyph.json.tx, glyph.json.ty);
            }
            return { json: font_json, bitmap: font_bitmap };
        });
    }
    exports_1("default", main);
    function option(option, _default) {
        return typeof option !== "undefined" ? option : _default;
    }
    function pow2ceil(v) {
        if (v <= 0) {
            return 0;
        }
        v--;
        let p = 2;
        while (v >>= 1) {
            p <<= 1;
        }
        return p;
    }
    return {
        setters: [
            function (msdfgen_1) {
                msdfgen = msdfgen_1;
            },
            function (FT_1) {
                FT = FT_1;
            }
        ],
        execute: function () {
            exports_1("msdfgen", msdfgen);
            exports_1("DEFAULT_SIZE", DEFAULT_SIZE = 80); // pixels
            exports_1("DEFAULT_CHARSET", DEFAULT_CHARSET = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~");
            exports_1("DEFAULT_TYPE", DEFAULT_TYPE = msdfgen.Type.MSDF);
            exports_1("DEFAULT_RANGE", DEFAULT_RANGE = 3); // pixels
            exports_1("DEFAULT_ANGLE_THRESHOLD", DEFAULT_ANGLE_THRESHOLD = 3); // radians
            exports_1("DEFAULT_MSDF_EDGE_THRESHOLD", DEFAULT_MSDF_EDGE_THRESHOLD = 1.00000001);
            Rect = class Rect {
                constructor(x = 0, y = 0, w = 0, h = 0) {
                    this.x = x;
                    this.y = y;
                    this.w = w;
                    this.h = h;
                }
                collides(rect) {
                    return (rect.x < this.x + this.w && this.x < rect.x + rect.w &&
                        rect.y < this.y + this.h && this.y < rect.y + rect.h);
                }
                contains(rect) {
                    return (this.x <= rect.x && rect.x + rect.w <= this.x + this.w &&
                        this.y <= rect.y && rect.y + rect.h <= this.y + this.h);
                }
            };
            exports_1("Rect", Rect);
            Pack = class Pack {
                constructor(w, h) {
                    this.rects = new Set();
                    this.rects.add(new Rect(0, 0, w, h));
                }
                find(w, h) {
                    let best = null;
                    let best_score = Number.MAX_VALUE;
                    for (const rect of this.rects) {
                        if (w <= rect.w && h <= rect.h) {
                            const score = rect.w * rect.h - w * h;
                            if (score < best_score) {
                                best = new Rect(rect.x, rect.y, w, h);
                                best_score = score;
                            }
                        }
                    }
                    if (best !== null) {
                        this.split(best);
                    }
                    return best;
                }
                split(best) {
                    const best_r = best.x + best.w;
                    const best_t = best.y + best.h;
                    for (const rect of this.rects) {
                        if (rect.collides(best)) {
                            const rect_r = rect.x + rect.w;
                            const rect_t = rect.y + rect.h;
                            if (best.x < rect_r && rect.x < best_r) {
                                if (rect.y < best.y && best.y < rect_t) {
                                    this.rects.add(new Rect(rect.x, rect.y, rect.w, best.y - rect.y));
                                }
                                if (best_t < rect_t) {
                                    this.rects.add(new Rect(rect.x, best_t, rect.w, rect_t - best_t));
                                }
                            }
                            if (best.y < rect_t && rect.y < best_t) {
                                if (rect.x < best.x && best.x < rect_r) {
                                    this.rects.add(new Rect(rect.x, rect.y, best.x - rect.x, rect.h));
                                }
                                if (best_r < rect_r) {
                                    this.rects.add(new Rect(best_r, rect.y, rect_r - best_r, rect.h));
                                }
                            }
                            this.rects.delete(rect);
                        }
                    }
                    for (const a of this.rects) {
                        for (const b of this.rects) {
                            if (a !== b && a.contains(b)) {
                                this.rects.delete(b);
                            }
                        }
                    }
                }
            };
            exports_1("Pack", Pack);
            Bitmap = class Bitmap {
                constructor(width, height) {
                    this.width = width;
                    this.height = height;
                    this.data = new Uint8ClampedArray(this.width * this.height * 4);
                }
                index(x, y) {
                    if (0 <= x && x < this.width && 0 <= y && y <= this.height) {
                        return (y * this.width + x) * 4;
                    }
                    return -1;
                }
                pixel(x, y) {
                    const index = this.index(x, y);
                    if (index === -1) {
                        throw new Error();
                    }
                    return this.data.subarray(index, index + 4);
                }
                blit(src, dx = 0, dy = 0, sx = 0, sy = 0, sw = src.width - sx, sh = src.height - sy) {
                    const dst = this;
                    for (let y = 0; y < sh; ++y) {
                        for (let x = 0; x < sw; ++x) {
                            const si = src.index(x + sx, y + sy);
                            if (si === -1) {
                                continue;
                            }
                            const di = dst.index(x + dx, y + dy);
                            if (di === -1) {
                                continue;
                            }
                            dst.data.subarray(di, di + 4).set(src.data.subarray(si, si + 4));
                        }
                    }
                }
            };
            exports_1("Bitmap", Bitmap);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBK0JBLFNBQThCLElBQUksQ0FBQyxPQUFnQjs7WUFDakQsTUFBTSxRQUFRLEdBQWEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsR0FBUyxFQUFFLGdEQUFDLE9BQUEsS0FBSyxDQUFBLEdBQUEsQ0FBQyxDQUFDO1lBQ3ZFLE1BQU0sT0FBTyxHQUFZLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3hELE1BQU0sSUFBSSxHQUFXLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsU0FBUztZQUNsRSxNQUFNLE9BQU8sR0FBYSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDN0UsTUFBTSxJQUFJLEdBQWlCLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkUsTUFBTSxLQUFLLEdBQVcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxTQUFTO1lBQ3JFLE1BQU0sZUFBZSxHQUFXLE1BQU0sQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxVQUFVO1lBQ3BHLE1BQU0sbUJBQW1CLEdBQVcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO1lBRXJHLElBQUksUUFBa0IsQ0FBQztZQUV2QixNQUFNLFVBQVUsR0FBZSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNoRCxRQUFRLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN4QyxJQUFJLFFBQVEsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRTtnQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzthQUFFO1lBRTNFLE1BQU0sT0FBTyxHQUFZLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3ZDLFFBQVEsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN6RSxJQUFJLFFBQVEsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRTtnQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzthQUFFO1lBRTNFLE1BQU0sUUFBUSxHQUFXLElBQUksR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsdUJBQXVCO1lBRTdFLE1BQU0sU0FBUyxHQUFhO2dCQUMxQixJQUFJLEVBQUUsT0FBTyxDQUFDLFdBQVc7Z0JBQ3pCLElBQUksRUFBRSxJQUFJO2dCQUNWLEdBQUcsRUFBRSxLQUFLO2dCQUNWLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUSxHQUFHLFFBQVE7Z0JBQ3JDLFNBQVMsRUFBRSxPQUFPLENBQUMsU0FBUyxHQUFHLFFBQVE7Z0JBQ3ZDLFlBQVksRUFBRSxPQUFPLENBQUMsTUFBTSxHQUFHLFFBQVE7Z0JBQ3ZDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUM5QixNQUFNLEVBQUUsRUFBRTthQUNYLENBQUM7WUFFRixNQUFNLE1BQU0sR0FBWSxFQUFFLENBQUM7WUFFM0IsS0FBSyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDN0MsTUFBTSxJQUFJLEdBQVcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFeEMsUUFBUSxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN6RCxJQUFJLFFBQVEsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRTtvQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztpQkFBRTtnQkFFM0UsTUFBTSxDQUFDLEdBQVcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQztnQkFDekQsTUFBTSxDQUFDLEdBQVcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQztnQkFDMUQsTUFBTSxHQUFHLEdBQVcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQztnQkFDbEUsTUFBTSxHQUFHLEdBQVcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQztnQkFDbEUsTUFBTSxHQUFHLEdBQVcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQztnQkFDbEUsTUFBTSxHQUFHLEdBQVcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQztnQkFDbEUsTUFBTSxFQUFFLEdBQVcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQztnQkFDdEQsTUFBTSxFQUFFLEdBQVcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQztnQkFFdEQsTUFBTSxFQUFFLEdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMs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QUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxFQUFFO29DQUN0QyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lDQUNuRTtnQ0FDRCxJQUFJLE1BQU0sR0FBRyxNQUFNLEVBQUU7b0NBQ25CLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUM7aUNBQ25FOzZCQUNGOzRCQUNELElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLEVBQUU7Z0NBQ3RDLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxFQUFFO29DQUN0QyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lDQUNuRTtnQ0FDRCxJQUFJLE1BQU0sR0FBRyxNQUFNLEVBQUU7b0NBQ25CLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLE1BQU0sR0FBRyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUNBQ25F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