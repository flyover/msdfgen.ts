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
            ft_error = FT.New_Memory_Face(ft_library, options.ttf_file, 0, ft_face);
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
                glyphs: {}
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
                // round texture size up to whole pixels
                const tw = w === 0 ? 0 : Math.ceil(w + 2 * range);
                const th = h === 0 ? 0 : Math.ceil(h + 2 * range);
                const glyph_json = {
                    char, code, w, h,
                    hbx, hby, vbx, vby, ax, ay,
                    tx: 0, ty: 0, tw, th // tx and ty set by pack
                };
                const glyph_bitmap = new Bitmap(tw, th);
                const shape = new msdfgen.Shape();
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
                const oy = hby - range - h;
                // msdfgen transform
                // x' = (x + .5) / scale.x - translate.x;
                // y' = (y + .5) / scale.y - translate.y;
                const scale = new msdfgen.Vector2(1, 1);
                const translate = new msdfgen.Vector2(-ox, -oy);
                switch (type) {
                    case msdfgen.Type.SDF:
                        const sdf = new msdfgen.BitmapFloat(tw, th);
                        msdfgen.generateSDF(sdf, shape, range, scale, translate);
                        for (let y = 0; y < sdf.height(); ++y) {
                            for (let x = 0; x < sdf.width(); ++x) {
                                glyph_bitmap.pixel(x, y).set([255, 255, 255, sdf.getAt(x, y).a * 255]);
                            }
                        }
                        break;
                    case msdfgen.Type.PSDF:
                        const psdf = new msdfgen.BitmapFloat(tw, th);
                        msdfgen.generatePseudoSDF(psdf, shape, range, scale, translate);
                        for (let y = 0; y < psdf.height(); ++y) {
                            for (let x = 0; x < psdf.width(); ++x) {
                                glyph_bitmap.pixel(x, y).set([255, 255, 255, psdf.getAt(x, y).a * 255]);
                            }
                        }
                        break;
                    case msdfgen.Type.MSDF:
                        const msdf = new msdfgen.BitmapFloatRGB(tw, th);
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
                font_json.glyphs[code] = glyph_json;
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
                        kernings.push({ a, b, x: kerning.x, y: kerning.y });
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
                font_json.page.w = Math.max(font_json.page.w, pow2ceil(glyph.json.tw));
                font_json.page.h = Math.max(font_json.page.h, pow2ceil(glyph.json.th));
            }
            // sort glyphs descending by the longest texture side
            glyphs.sort((a, b) => {
                return Math.max(b.json.tw, b.json.th) - Math.max(a.json.tw, a.json.th);
            });
            let fit = false;
            const max = 4096;
            const gap = 1;
            while (!fit && font_json.page.w <= max && font_json.page.h <= max) {
                const pack = new Pack(font_json.page.w + gap, font_json.page.h + gap);
                fit = true;
                for (const glyph of glyphs) {
                    if (glyph.json.tw === 0 && glyph.json.th === 0) {
                        continue;
                    }
                    const rect = pack.find(glyph.json.tw + gap, glyph.json.th + gap);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBK0JBLFNBQThCLElBQUksQ0FBQyxPQUFnQjs7WUFDakQsTUFBTSxRQUFRLEdBQWEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsR0FBUyxFQUFFLGdEQUFDLE9BQUEsS0FBSyxDQUFBLEdBQUEsQ0FBQyxDQUFDO1lBQ3ZFLE1BQU0sT0FBTyxHQUFZLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3hELE1BQU0sSUFBSSxHQUFXLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsU0FBUztZQUNsRSxNQUFNLE9BQU8sR0FBYSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDN0UsTUFBTSxJQUFJLEdBQWlCLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkUsTUFBTSxLQUFLLEdBQVcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxTQUFTO1lBQ3JFLE1BQU0sZUFBZSxHQUFXLE1BQU0sQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxVQUFVO1lBQ3BHLE1BQU0sbUJBQW1CLEdBQVcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO1lBRXJHLElBQUksUUFBa0IsQ0FBQztZQUV2QixNQUFNLFVBQVUsR0FBZSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNoRCxRQUFRLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN4QyxJQUFJLFFBQVEsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRTtnQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzthQUFFO1lBRTNFLE1BQU0sT0FBTyxHQUFZLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3ZDLFFBQVEsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN4RSxJQUFJLFFBQVEsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRTtnQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzthQUFFO1lBRTNFLE1BQU0sUUFBUSxHQUFXLElBQUksR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsdUJBQXVCO1lBRTdFLE1BQU0sU0FBUyxHQUFhO2dCQUMxQixJQUFJLEVBQUUsT0FBTyxDQUFDLFdBQVc7Z0JBQ3pCLElBQUksRUFBRSxJQUFJO2dCQUNWLEdBQUcsRUFBRSxLQUFLO2dCQUNWLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUSxHQUFHLFFBQVE7Z0JBQ3JDLFNBQVMsRUFBRSxPQUFPLENBQUMsU0FBUyxHQUFHLFFBQVE7Z0JBQ3ZDLFlBQVksRUFBRSxPQUFPLENBQUMsTUFBTSxHQUFHLFFBQVE7Z0JBQ3ZDLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUM5QixNQUFNLEVBQUUsRUFBRTthQUNYLENBQUM7WUFFRixNQUFNLE1BQU0sR0FBWSxFQUFFLENBQUM7WUFFM0IsS0FBSyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDN0MsTUFBTSxJQUFJLEdBQVcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFeEMsUUFBUSxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN6RCxJQUFJLFFBQVEsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRTtvQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztpQkFBRTtnQkFFM0UsTUFBTSxDQUFDLEdBQVcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQztnQkFDekQsTUFBTSxDQUFDLEdBQVcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQztnQkFDMUQsTUFBTSxHQUFHLEdBQVcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQztnQkFDbEUsTUFBTSxHQUFHLEdBQVcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQztnQkFDbEUsTUFBTSxHQUFHLEdBQVcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQztnQkFDbEUsTUFBTSxHQUFHLEdBQVcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQztnQkFDbEUsTUFBTSxFQUFFLEdBQVcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQztnQkFDdEQsTUFBTSxFQUFFLEdBQVcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQztnQkFFdEQsd0NBQXdDO2dCQUN4QyxNQUFNLEVBQUUsR0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxD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