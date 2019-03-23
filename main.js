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
                    site: { x: 0, y: 0, w: tw, h: th },
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
                    glyph.json.site.x = rect.x;
                    glyph.json.site.y = rect.y;
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
                font_bitmap.blit(glyph.bitmap, glyph.json.site.x, glyph.json.site.y);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBK0JBLFNBQThCLElBQUksQ0FBQyxPQUFnQjs7WUFDakQsTUFBTSxRQUFRLEdBQWEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsR0FBUyxFQUFFLGdEQUFDLE9BQUEsS0FBSyxDQUFBLEdBQUEsQ0FBQyxDQUFDO1lBQ3ZFLE1BQU0sT0FBTyxHQUFZLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3hELE1BQU0sSUFBSSxHQUFXLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsU0FBUztZQUNsRSxNQUFNLE9BQU8sR0FBYSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDN0UsTUFBTSxJQUFJLEdBQWlCLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkUsTUFBTSxLQUFLLEdBQVcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxTQUFTO1lBQ3JFLE1BQU0sZUFBZSxHQUFXLE1BQU0sQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxVQUFVO1lBQ3BHLE1BQU0sbUJBQW1CLEdBQVcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO1lBRXJHLElBQUksUUFBa0IsQ0FBQztZQUV2QixNQUFNLFVBQVUsR0FBZSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNoRCxRQUFRLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN4QyxJQUFJLFFBQVEsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRTtnQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzthQUFFO1lBRTNFLE1BQU0sT0FBTyxHQUFZLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3ZDLFFBQVEsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN6RSxJQUFJLFFBQVEsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRTtnQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzthQUFFO1lBRTNFLE1BQU0sUUFBUSxHQUFXLElBQUksR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsdUJBQXVCO1lBRTdFLE1BQU0sU0FBUyxHQUFhO2dCQUMxQixJQUFJLEVBQUUsT0FBTyxDQUFDLFdBQVc7Z0JBQ3pCLElBQUksRUFBRSxJQUFJO2dCQUNWLEdBQUcsRUFBRSxLQUFLO2dCQUNWLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUSxHQUFHLFFBQVE7Z0JBQ3JDLFNBQVMsRUFBRSxPQUFPLENBQUMsU0FBUyxHQUFHLFFBQVE7Z0JBQ3ZDLFlBQVksRUFBRSxPQUFPLENBQUMsTUFBTSxHQUFHLFFBQVE7Z0JBQ3ZDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUM5QixNQUFNLEVBQUUsRUFBRTthQUNYLENBQUM7WUFFRixNQUFNLE1BQU0sR0FBWSxFQUFFLENBQUM7WUFFM0IsS0FBSyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDN0MsTUFBTSxJQUFJLEdBQVcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFeEMsUUFBUSxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN6RCxJQUFJLFFBQVEsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRTtvQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztpQkFBRTtnQkFFM0UsTUFBTSxDQUFDLEdBQVcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQztnQkFDekQsTUFBTSxDQUFDLEdBQVcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQztnQkFDMUQsTUFBTSxHQUFHLEdBQVcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQztnQkFDbEUsTUFBTSxHQUFHLEdBQVcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQztnQkFDbEUsTUFBTSxHQUFHLEdBQVcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQztnQkFDbEUsTUFBTSxHQUFHLEdBQVcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQztnQkFDbEUsTUFBTSxFQUFFLEdBQVcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQztnQkFDdEQsTUFBTSxFQUFFLEdBQVcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQztnQkFFdEQsTUFBTSxFQUFFLEdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMs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Q0FBQyxHQUFHLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLE1BQU0sRUFBRTtnQ0FDdEMsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLEVBQUU7b0NBQ3RDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUNBQ25FO2dDQUNELElBQUksTUFBTSxHQUFHLE1BQU0sRUFBRTtvQ0FDbkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQztpQ0FDbkU7NkJBQ0Y7NEJBQ0QsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLE1BQU0sRUFBRTtnQ0FDdEMsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLEVBQUU7b0NBQ3RDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUNBQ25FO2dDQUNELElBQUksTUFBTSxHQUFHLE1BQU0sRUFBRTtvQ0FDbkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FB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