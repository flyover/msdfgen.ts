import * as msdfgen from "msdfgen-core";

export default async function main(): Promise<void> {
  console.log("msdfgen version", msdfgen.VERSION);

  const shape: msdfgen.Shape = loadTestShape();

  if (!shape.validate()) {
    throw new Error("The geometry of the loaded shape is invalid.");
  }

  shape.normalize();

  const angle_threshold: number = 3; // radians
  msdfgen.edgeColoringSimple(shape, angle_threshold);

  const bounds: msdfgen.Bounds2 = shape.bounds();

  const range: number = 3;
  const bitmap_x: number = bounds.l - range;
  const bitmap_y: number = bounds.b - range;
  const bitmap_w: number = Math.ceil(bounds.w + 2 * range); // round up to whole pixels
  const bitmap_h: number = Math.ceil(bounds.h + 2 * range); // round up to whole pixels

  // msdfgen transform
  // x' = (x + .5) / scale.x - translate.x;
  // y' = (y + .5) / scale.y - translate.y;
  const scale: msdfgen.Vector2 = new msdfgen.Vector2(1, 1);
  const translate: msdfgen.Vector2 = new msdfgen.Vector2(-bitmap_x, -bitmap_y);
  
  const sdf: msdfgen.BitmapFloat = new msdfgen.BitmapFloat(bitmap_w, bitmap_h);
  msdfgen.generateSDF(sdf, shape, range, scale, translate);
  dumpFloat("sdf", sdf);

  const psdf: msdfgen.BitmapFloat = new msdfgen.BitmapFloat(bitmap_w, bitmap_h);
  msdfgen.generatePseudoSDF(psdf, shape, range, scale, translate);
  dumpFloat("psdf", psdf);

  const edge_threshold: number = 1.00000001;
  const msdf: msdfgen.BitmapFloatRGB = new msdfgen.BitmapFloatRGB(bitmap_w, bitmap_h);
  msdfgen.generateMSDF(msdf, shape, range, scale, translate, edge_threshold);
  dumpFloatRGB("msdf", msdf);
}

function dumpFloat(title: string, bitmap: msdfgen.BitmapFloat): void {
  if (typeof document !== "undefined") {
    const width: number = bitmap.width();
    const height: number = bitmap.height();
    const div: HTMLDivElement = document.body.appendChild(document.createElement("div"));
    const canvas: HTMLCanvasElement = div.appendChild(document.createElement("canvas"));
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;
    const text: HTMLDivElement = div.appendChild(document.createElement("div"));
    text.innerHTML = `${title} ${width}x${height}`;
    const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
    if (ctx === null) { throw new Error(); }
    const image_data: ImageData = ctx.getImageData(0, 0, width, height);
    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        const i: number = 4 * (y * width + x);
        const pixel: msdfgen.Float = bitmap.getAt(x, y);
        const a: number = msdfgen.clamp(Math.floor(256 * pixel.a), 0, 255);
        image_data.data[i + 0] = a;
        image_data.data[i + 1] = a;
        image_data.data[i + 2] = a;
        image_data.data[i + 3] = 255;
      }
    }
    ctx.putImageData(image_data, 0, 0);
  } else {
    const width: number = bitmap.width();
    const height: number = bitmap.height();
    console.log(`${title} ${width}x${height}`);
    let text: string = "";
    text += "╔" + "═".repeat(width) + "╗\n";
    for (let y = 0; y < height; ++y) {
      text += "║";
      for (let x = 0; x < width; ++x) {
        const pixel: msdfgen.Float = bitmap.getAt(x, y);
        const a: number = msdfgen.clamp(Math.floor(256 * pixel.a), 0, 255);
        // const ta: string = a.toString(16).padStart(2, "0").toUpperCase();
        // text += `${ta} `;
        text += " ░▒▓█"[Math.floor(a * 5 / 256)];
      }
      text += "║\n";
    }
    text += "╚" + "═".repeat(width) + "╝\n";
    console.log(text);
  }
}

function dumpFloatRGB(title: string, bitmap: msdfgen.BitmapFloatRGB): void {
  if (typeof document !== "undefined") {
    const width: number = bitmap.width();
    const height: number = bitmap.height();
    const div: HTMLDivElement = document.body.appendChild(document.createElement("div"));
    const canvas: HTMLCanvasElement = div.appendChild(document.createElement("canvas"));
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;
    const text: HTMLDivElement = div.appendChild(document.createElement("div"));
    text.innerHTML = `${title} ${width}x${height}`;
    const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
    if (ctx === null) { throw new Error(); }
    const image_data: ImageData = ctx.getImageData(0, 0, width, height);
    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        const i: number = 4 * (y * width + x);
        const pixel: msdfgen.FloatRGB = bitmap.getAt(x, y);
        const r: number = msdfgen.clamp(Math.floor(256 * pixel.r), 0, 255);
        const g: number = msdfgen.clamp(Math.floor(256 * pixel.g), 0, 255);
        const b: number = msdfgen.clamp(Math.floor(256 * pixel.b), 0, 255);
        image_data.data[i + 0] = r;
        image_data.data[i + 1] = g;
        image_data.data[i + 2] = b;
        image_data.data[i + 3] = 255;
      }
    }
    ctx.putImageData(image_data, 0, 0);
  } else {
    const width: number = bitmap.width();
    const height: number = bitmap.height();
    console.log(`${title} ${width}x${height}`);
    let text: string = "";
    text += "╔" + "═".repeat(width) + "╗\n";
    for (let y = 0; y < height; ++y) {
      text += "║";
      for (let x = 0; x < width; ++x) {
        const pixel: msdfgen.FloatRGB = bitmap.getAt(x, y);
        const r: number = msdfgen.clamp(Math.floor(256 * pixel.r), 0, 255);
        const g: number = msdfgen.clamp(Math.floor(256 * pixel.g), 0, 255);
        const b: number = msdfgen.clamp(Math.floor(256 * pixel.b), 0, 255);
        // const tr: string = r.toString(16).padStart(2, "0").toUpperCase();
        // const tg: string = g.toString(16).padStart(2, "0").toUpperCase();
        // const tb: string = b.toString(16).padStart(2, "0").toUpperCase();
        // text += `${tr} ${tg} ${tb} `;
        const a: number = msdfgen.median(r, g, b);
        text += " ░▒▓█"[Math.floor(a * 5 / 256)];
      }
      text += "║\n";
    }
    text += "╚" + "═".repeat(width) + "╝\n";
    console.log(text);
  }
}

function loadTestShape(size: number = 64): msdfgen.Shape {
  const scale: number = size / test.units_per_em;
  const shape: msdfgen.Shape = new msdfgen.Shape();
  let contour: msdfgen.Contour | null = null;
  const start: msdfgen.Point2 = new msdfgen.Point2();
  for (const line of test.commands) {
    const command: string[] = line.split(" ");
    const type: string = command.shift() || "";
    const points: msdfgen.Point2[] = [];
    for (let i = 0; i < command.length; i += 2) {
      const x: number = parseInt(command[i + 0]) * scale;
      const y: number = parseInt(command[i + 1]) * scale;
      points.push(new msdfgen.Point2(x, y * test.winding));
    }
    switch (type) {
      case "M":
        contour = shape.addContour();
        start.copy(points[0]);
        break;
      case "L":
        if (contour === null) { throw new Error(); }
        contour.addEdge(new msdfgen.LinearSegment(start, points[0]));
        start.copy(points[0]);
        break;
      case "Q":
        if (contour === null) { throw new Error(); }
        contour.addEdge(new msdfgen.QuadraticSegment(start, points[0], points[1]));
        start.copy(points[1]);
        break;
      case "C":
        if (contour === null) { throw new Error(); }
        contour.addEdge(new msdfgen.CubicSegment(start, points[0], points[1], points[2]));
        start.copy(points[2]);
        break;
      default:
        throw new Error(command[0]);
    }
  }

  return shape;
}

// 新 https://source.typekit.com/source-han-serif/
const test = {
  units_per_em: 1000,
  winding: -1,
  commands: [
    "M 66 677",
    "L 486 677",
    "C 500 677 509 682 512 693",
    "C 481 722 431 762 431 762",
    "L 388 705",
    "L 308 705",
    "L 308 801",
    "C 332 805 340 814 342 827",
    "L 244 837",
    "L 244 705",
    "L 58 705",
    "L 66 677",
    "M 127 664",
    "C 149 622 174 555 175 504",
    "C 227 451 294 569 139 670",
    "L 127 664",
    "M 512 453",
    "C 526 453 536 458 538 468",
    "C 507 498 456 539 456 539",
    "L 411 481",
    "L 329 481",
    "C 365 526 398 582 420 623",
    "C 441 623 453 630 457 642",
    "L 359 671",
    "C 348 615 327 537 307 481",
    "L 39 481",
    "L 47 453",
    "L 512 453",
    "M 307 251",
    "L 307 297",
    "L 496 297",
    "C 510 297 519 302 522 313",
    "C 493 342 445 381 445 381",
    "L 401 327",
    "L 307 327",
    "L 307 403",
    "C 329 406 338 415 339 428",
    "L 244 439",
    "L 244 327",
    "L 49 327",
    "L 57 297",
    "L 217 297",
    "C 179 192 117 91 38 13",
    "L 49 -2",
    "C 129 54 195 125 244 205",
    "L 244 -78",
    "L 257 -78",
    "C 280 -78 307 -63 307 -55",
    "L 307 237",
    "C 353 202 403 145 417 97",
    "C 484 54 528 196 308 252",
    "L 307 251",
    "M 838 491",
    "L 624 491",
    "L 624 707",
    "C 720 721 828 748 896 772",
    "C 920 764 936 764 945 773",
    "L 866 838",
    "C 815 805 721 762 635 733",
    "L 561 759",
    "L 561 431",
    "C 561 243 536 71 384 -64",
    "L 398 -77",
    "C 601 53 624 251 624 431",
    "L 624 461",
    "L 773 461",
    "L 773 -78",
    "L 784 -78",
    "C 816 -78 838 -61 838 -56",
    "L 838 461",
    "L 947 461",
    "C 960 461 970 466 972 477",
    "C 940 509 886 552 886 552",
    "L 838 491",
  ]
}