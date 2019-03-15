import * as msdfgen from "msdfgen-core";
import * as FT from "freetype-js";

export { msdfgen };

export const DEFAULT_SIZE: number = 80; // pixels
export const DEFAULT_CHARSET: string = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
export const DEFAULT_TYPE: msdfgen.Type = msdfgen.Type.MSDF;
export const DEFAULT_RANGE: number = 3; // pixels
export const DEFAULT_ANGLE_THRESHOLD: number = 3; // radians
export const DEFAULT_MSDF_EDGE_THRESHOLD: number = 1.00000001;

export type Progress = (completed: number, total: number) => Promise<boolean>;

export interface Options {
  progress?: Progress;
  verbose?: boolean;
  font_file: Uint8Array;
  size?: number;
  charset?: string;
  type?: msdfgen.Type;
  range?: number;
  angle_threshold?: number;
  msdf_edge_threshold?: number; // only for msdf type
}

export interface Results {
  json: FontJSON;
  bitmap: Bitmap;
}

export default async function main(options: Options): Promise<Results> {
  const progress: Progress = option(options.progress, async () => false);
  const verbose: boolean = option(options.verbose, false);
  const size: number = option(options.size, DEFAULT_SIZE); // pixels
  const charset: string[] = option(options.charset, DEFAULT_CHARSET).split("");
  const type: msdfgen.Type = option(options.type, msdfgen.Type.MSDF);
  const range: number = option(options.range, DEFAULT_RANGE); // pixels
  const angle_threshold: number = option(options.angle_threshold, DEFAULT_ANGLE_THRESHOLD); // radians
  const msdf_edge_threshold: number = option(options.msdf_edge_threshold, DEFAULT_MSDF_EDGE_THRESHOLD);

  let ft_error: FT.Error;

  const ft_library: FT.Library = new FT.Library();
  ft_error = FT.Init_FreeType(ft_library);
  if (ft_error !== FT.Err.Ok) { throw new Error(FT.Error_String(ft_error)); }

  const ft_face: FT.Face = new FT.Face();
  ft_error = FT.New_Memory_Face(ft_library, options.font_file, 0, ft_face);
  if (ft_error !== FT.Err.Ok) { throw new Error(FT.Error_String(ft_error)); }

  const ft_scale: number = size / ft_face.units_per_EM; // font units to pixels

  const font_json: FontJSON = {
    name: ft_face.family_name,
    size, type,
    pad: range,
    ascender: ft_face.ascender * ft_scale,
    descender: ft_face.descender * ft_scale,
    line_advance: ft_face.height * ft_scale,
    page: { name: "", w: 0, h: 0 }, // name set by export, w and h set by pack
    glyphs: []
  };

  const glyphs: Glyph[] = [];

  for (const [index, char] of charset.entries()) {
    const code: number = char.charCodeAt(0);

    ft_error = FT.Load_Char(ft_face, code, FT.LOAD.NO_SCALE);
    if (ft_error !== FT.Err.Ok) { throw new Error(FT.Error_String(ft_error)); }
  
    const w: number = ft_face.glyph.metrics.width * ft_scale;
    const h: number = ft_face.glyph.metrics.height * ft_scale;
    const hbx: number = ft_face.glyph.metrics.horiBearingX * ft_scale;
    const hby: number = ft_face.glyph.metrics.horiBearingY * ft_scale;
    const vbx: number = ft_face.glyph.metrics.vertBearingX * ft_scale;
    const vby: number = ft_face.glyph.metrics.vertBearingY * ft_scale;
    const ax: number = ft_face.glyph.advance.x * ft_scale;
    const ay: number = ft_face.glyph.advance.y * ft_scale;
  
    const tw: number = w === 0 ? 0 : w + 2 * range;
    const th: number = h === 0 ? 0 : h + 2 * range;
  
    const glyph_json: FontGlyphJSON = {
      char, code, w, h,
      hbx, hby, vbx, vby, ax, ay,
      tx: 0, ty: 0, tw, th // tx and ty set by pack
    };
  
    // round texture size up to whole pixels
    const glyph_bitmap: Bitmap = new Bitmap(Math.ceil(tw), Math.ceil(th));
  
    const shape: msdfgen.Shape = new msdfgen.Shape();
    shape.inverseYAxis = true;

    let contour: msdfgen.Contour | null = null;
    let start: msdfgen.Point2 | null = null;
  
    // glyph contour coordinates are in font units
    function import_ft_vector(ft_vector: FT.Vector): msdfgen.Point2 {
      return new msdfgen.Point2(ft_vector.x * ft_scale, ft_vector.y * ft_scale);
    }
  
    // load and parse glyph outline
    ft_error = FT.Outline_Decompose(ft_face.glyph.outline, {
      move_to: (to: Readonly<FT.Vector>): FT.Error => {
        contour = shape.addContour();
        start = import_ft_vector(to);
        return FT.Err.Ok;
      },
      line_to: (to: Readonly<FT.Vector>): FT.Error => {
        if (contour === null || start === null) { return FT.Err.Invalid_Outline; }
        contour.addEdge(new msdfgen.LinearSegment(start, start = import_ft_vector(to)));
        return FT.Err.Ok;
      },
      conic_to: (cp: Readonly<FT.Vector>, to: Readonly<FT.Vector>): FT.Error => {
        if (contour === null || start === null) { return FT.Err.Invalid_Outline; }
        contour.addEdge(new msdfgen.QuadraticSegment(start, import_ft_vector(cp), start = import_ft_vector(to)));
        return FT.Err.Ok;
      },
      cubic_to: (cp1: Readonly<FT.Vector>, cp2: Readonly<FT.Vector>, to: Readonly<FT.Vector>): FT.Error => {
        if (contour === null || start === null) { return FT.Err.Invalid_Outline; }
        contour.addEdge(new msdfgen.CubicSegment(start, import_ft_vector(cp1), import_ft_vector(cp2), start = import_ft_vector(to)));
        return FT.Err.Ok;
      },
    });
    if (ft_error !== FT.Err.Ok) { throw new Error(FT.Error_String(ft_error)); }
  
    if (!shape.validate()) { throw new Error(FT.Error_String(FT.Err.Invalid_Outline)); }
  
    shape.normalize();
  
    msdfgen.edgeColoringSimple(shape, angle_threshold);
  
    const ox: number = hbx - range;
    const oy: number = hby + range - glyph_bitmap.height;
  
    // msdfgen transform
    // x' = (x + .5) / scale.x - translate.x;
    // y' = (y + .5) / scale.y - translate.y;
    const scale: msdfgen.Vector2 = new msdfgen.Vector2(1, 1);
    const translate: msdfgen.Vector2 = new msdfgen.Vector2(-ox, -oy);
  
    switch (type) {
    case msdfgen.Type.SDF:
      const sdf: msdfgen.BitmapFloat = new msdfgen.BitmapFloat(glyph_bitmap.width, glyph_bitmap.height);
      msdfgen.generateSDF(sdf, shape, range, scale, translate);
      for (let y = 0; y < sdf.height(); ++y) {
        for (let x = 0; x < sdf.width(); ++x) {
          glyph_bitmap.pixel(x, y).set([ 255, 255, 255, sdf.getAt(x, y).a * 255 ]);
        }
      }
      break;
    case msdfgen.Type.PSDF:
      const psdf: msdfgen.BitmapFloat = new msdfgen.BitmapFloat(glyph_bitmap.width, glyph_bitmap.height);
      msdfgen.generatePseudoSDF(psdf, shape, range, scale, translate);
      for (let y = 0; y < psdf.height(); ++y) {
        for (let x = 0; x < psdf.width(); ++x) {
          glyph_bitmap.pixel(x, y).set([ 255, 255, 255, psdf.getAt(x, y).a * 255 ]);
        }
      }
      break;
    case msdfgen.Type.MSDF:
      const msdf: msdfgen.BitmapFloatRGB = new msdfgen.BitmapFloatRGB(glyph_bitmap.width, glyph_bitmap.height);
      msdfgen.generateMSDF(msdf, shape, range, scale, translate, msdf_edge_threshold);
      for (let y = 0; y < msdf.height(); ++y) {
        for (let x = 0; x < msdf.width(); ++x) {
          const rgb: msdfgen.FloatRGB = msdf.getAt(x, y);
          glyph_bitmap.pixel(x, y).set([ rgb.r * 255, rgb.g * 255, rgb.b * 255, 255 ]);
        }
      }
      break;
    default: throw new Error();
    }

    font_json.glyphs.push(glyph_json);
    glyphs.push({ json: glyph_json, bitmap: glyph_bitmap });

    const stop: boolean = await progress(index + 1, charset.length);
    if (stop) { break; }
  }

  const kernings: FontKerningJSON[] = [];
  const kerning: FT.Vector = new FT.Vector();
  for (const char_a of charset) {
    const a: number = char_a.charCodeAt(0);
    for (const char_b of charset) {
      const b: number = char_b.charCodeAt(0);
      kerning.x = 0; kerning.y = 0;
      ft_error = FT.Get_Kerning(ft_face, a, b, FT.KERNING.DEFAULT, kerning);
      if (ft_error !== FT.Err.Ok) { throw new Error(FT.Error_String(ft_error)); }
      if (kerning.x !== 0 || kerning.y !== 0) {
        kernings.push({ a, b, x: kerning.x || undefined, y: kerning.y || undefined });
      }
    }
  }
  if (kernings.length > 0) {
    font_json.kernings = kernings;
  }

  ft_error = FT.Done_Face(ft_face);
  if (ft_error !== FT.Err.Ok) { throw new Error(FT.Error_String(ft_error)); }

  ft_error = FT.Done_FreeType(ft_library);
  if (ft_error !== FT.Err.Ok) { throw new Error(FT.Error_String(ft_error)); }

  // find minimum font texture size
  for (const glyph of glyphs) {
    font_json.page.w = Math.max(font_json.page.w, pow2ceil(glyph.bitmap.width));
    font_json.page.h = Math.max(font_json.page.h, pow2ceil(glyph.bitmap.height));
  }

  // sort glyphs descending by the longest texture side
  glyphs.sort((a: Glyph, b: Glyph): number => {
    return Math.max(b.bitmap.width, b.bitmap.height) - Math.max(a.bitmap.width, a.bitmap.height);
  });

  let fit: boolean = false;
  const max: number = 4096;
  const gap: number = 1;
  while (!fit && font_json.page.w <= max && font_json.page.h <= max) {
    const pack: Pack = new Pack(font_json.page.w + gap, font_json.page.h + gap);
    fit = true;
    for (const glyph of glyphs) {
      if (glyph.bitmap.width === 0 && glyph.bitmap.height === 0) { continue; }
      const rect: Rect | null = pack.find(glyph.bitmap.width + gap, glyph.bitmap.height + gap);
      if (rect === null) { fit = false; break; }
      glyph.json.tx = rect.x;
      glyph.json.ty = rect.y;
    }
    if (!fit) {
      font_json.page.w <= font_json.page.h ? font_json.page.w <<= 1 : font_json.page.h <<= 1;
    }
  }
  if (!fit) { throw new Error(); }

  const font_bitmap: Bitmap = new Bitmap(font_json.page.w, font_json.page.h);

  for (const glyph of glyphs) {
    font_bitmap.blit(glyph.bitmap, glyph.json.tx, glyph.json.ty);
  }

  return { json: font_json, bitmap: font_bitmap };
}

interface Glyph {
  json: FontGlyphJSON;
  bitmap: Bitmap;
}

function option<T>(option: T | undefined, _default: T): T {
  return typeof option !== "undefined" ? option : _default;
}

function pow2ceil(v: number): number {
  if (v <= 0) { return 0; }
  v--;
  let p: number = 2;
  while (v >>= 1) { p <<= 1; }
  return p;
}

export interface FontJSON {
  name: string;
  size: number;
  type: msdfgen.Type;
  pad?: number | [number,number] | [number,number,number,number];
  ascender: number;
  descender: number;
  line_advance: number;
  page: FontPageJSON;
  glyphs: FontGlyphJSON[];
  kernings?: FontKerningJSON[];
}

export interface FontPageJSON {
  name: string;
  w: number;
  h: number;
}

export interface FontGlyphJSON {
  char: string;
  code: number;
  w: number; // width
  h: number; // height
  hbx: number; // hori bearing x
  hby: number; // hori bearing y
  vbx: number; // vert bearing x
  vby: number; // vert bearing y
  ax: number; // advance x
  ay: number; // advance y
  tx: number; // texture x
  ty: number; // texture y
  tw: number; // texture width
  th: number; // texture height
}

export interface FontKerningJSON {
  a: number; // character code
  b: number; // character code
  x?: number; // kerning x
  y?: number; // kerning y
}

export class Rect {
  constructor(public x: number = 0, public y: number = 0, public w: number = 0, public h: number = 0) {}

  public collides(rect: Rect): boolean {
    return (
      rect.x < this.x + this.w && this.x < rect.x + rect.w &&
      rect.y < this.y + this.h && this.y < rect.y + rect.h
    );
  }

  public contains(rect: Rect): boolean {
    return (
      this.x <= rect.x && rect.x + rect.w <= this.x + this.w &&
      this.y <= rect.y && rect.y + rect.h <= this.y + this.h
    );
  }
}

export class Pack {
  private readonly rects: Set<Rect> = new Set<Rect>();

  constructor(w: number, h: number) {
    this.rects.add(new Rect(0, 0, w, h));
  }

  public find(w: number, h: number): Rect | null {
    let best: Rect | null = null;
    let best_score: number = Number.MAX_VALUE;
    for (const rect of this.rects) {
      if (w <= rect.w && h <= rect.h) {
        const score: number = rect.w * rect.h - w * h;
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

  private split(best: Rect): void {
    const best_r: number = best.x + best.w;
    const best_t: number = best.y + best.h;
    for (const rect of this.rects) {
      if (rect.collides(best)) {
        const rect_r: number = rect.x + rect.w;
        const rect_t: number = rect.y + rect.h;
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
}

export class Bitmap implements ImageData {
  public data: Uint8ClampedArray;

  constructor(public readonly width: number, public readonly height: number) {
    this.data = new Uint8ClampedArray(this.width * this.height * 4);
  }

  public index(x: number, y: number): number {
    if (0 <= x && x < this.width && 0 <= y && y <= this.height) {
      return (y * this.width + x) * 4;
    }
    return -1;
  }

  public pixel(x: number, y: number): Uint8ClampedArray {
    const index: number = this.index(x, y);
    if (index === -1) { throw new Error(); }
    return this.data.subarray(index, index + 4);
  }

  public blit(src: Bitmap, dx: number = 0, dy: number = 0, sx: number = 0, sy: number = 0, sw: number = src.width - sx, sh: number = src.height - sy): void {
    const dst: Bitmap = this;
    for (let y = 0; y < sh; ++y) {
      for (let x = 0; x < sw; ++x) {
        const si: number = src.index(x + sx, y + sy);
        if (si === -1) { continue; }
        const di: number = dst.index(x + dx, y + dy);
        if (di === -1) { continue; }
        dst.data.subarray(di, di + 4).set(src.data.subarray(si, si + 4));
      }
    }
  }
}
