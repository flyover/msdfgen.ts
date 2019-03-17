System.register(["msdfgen-core"], function (exports_1, context_1) {
    "use strict";
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var msdfgen, test;
    var __moduleName = context_1 && context_1.id;
    function main() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("msdfgen version", msdfgen.VERSION);
            const shape = loadTestShape();
            if (!shape.validate()) {
                throw new Error("The geometry of the loaded shape is invalid.");
            }
            shape.normalize();
            const angle_threshold = 3; // radians
            msdfgen.edgeColoringSimple(shape, angle_threshold);
            const bounds = shape.bounds();
            const range = 3;
            const bitmap_x = bounds.l - range;
            const bitmap_y = bounds.b - range;
            const bitmap_w = Math.ceil(bounds.w + 2 * range); // round up to whole pixels
            const bitmap_h = Math.ceil(bounds.h + 2 * range); // round up to whole pixels
            // msdfgen transform
            // x' = (x + .5) / scale.x - translate.x;
            // y' = (y + .5) / scale.y - translate.y;
            const scale = new msdfgen.Vector2(1, 1);
            const translate = new msdfgen.Vector2(-bitmap_x, -bitmap_y);
            const sdf = new msdfgen.BitmapFloat(bitmap_w, bitmap_h);
            msdfgen.generateSDF(sdf, shape, range, scale, translate);
            dumpFloat("sdf", sdf);
            const psdf = new msdfgen.BitmapFloat(bitmap_w, bitmap_h);
            msdfgen.generatePseudoSDF(psdf, shape, range, scale, translate);
            dumpFloat("psdf", psdf);
            const edge_threshold = 1.00000001;
            const msdf = new msdfgen.BitmapFloatRGB(bitmap_w, bitmap_h);
            msdfgen.generateMSDF(msdf, shape, range, scale, translate, edge_threshold);
            dumpFloatRGB("msdf", msdf);
        });
    }
    exports_1("default", main);
    function dumpFloat(title, bitmap) {
        if (typeof document !== "undefined") {
            const width = bitmap.width();
            const height = bitmap.height();
            const div = document.body.appendChild(document.createElement("div"));
            const canvas = div.appendChild(document.createElement("canvas"));
            canvas.width = width;
            canvas.height = height;
            canvas.style.width = `${canvas.width}px`;
            canvas.style.height = `${canvas.height}px`;
            const text = div.appendChild(document.createElement("div"));
            text.innerHTML = `${title} ${width}x${height}`;
            const ctx = canvas.getContext("2d");
            if (ctx === null) {
                throw new Error();
            }
            const image_data = ctx.getImageData(0, 0, width, height);
            for (let y = 0; y < height; ++y) {
                for (let x = 0; x < width; ++x) {
                    const i = 4 * (y * width + x);
                    const pixel = bitmap.getAt(x, y);
                    const a = msdfgen.clamp(Math.floor(256 * pixel.a), 0, 255);
                    image_data.data[i + 0] = a;
                    image_data.data[i + 1] = a;
                    image_data.data[i + 2] = a;
                    image_data.data[i + 3] = 255;
                }
            }
            ctx.putImageData(image_data, 0, 0);
        }
        else {
            const width = bitmap.width();
            const height = bitmap.height();
            console.log(`${title} ${width}x${height}`);
            let text = "";
            text += "╔" + "═".repeat(width) + "╗\n";
            for (let y = 0; y < height; ++y) {
                text += "║";
                for (let x = 0; x < width; ++x) {
                    const pixel = bitmap.getAt(x, y);
                    const a = msdfgen.clamp(Math.floor(256 * pixel.a), 0, 255);
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
    function dumpFloatRGB(title, bitmap) {
        if (typeof document !== "undefined") {
            const width = bitmap.width();
            const height = bitmap.height();
            const div = document.body.appendChild(document.createElement("div"));
            const canvas = div.appendChild(document.createElement("canvas"));
            canvas.width = width;
            canvas.height = height;
            canvas.style.width = `${canvas.width}px`;
            canvas.style.height = `${canvas.height}px`;
            const text = div.appendChild(document.createElement("div"));
            text.innerHTML = `${title} ${width}x${height}`;
            const ctx = canvas.getContext("2d");
            if (ctx === null) {
                throw new Error();
            }
            const image_data = ctx.getImageData(0, 0, width, height);
            for (let y = 0; y < height; ++y) {
                for (let x = 0; x < width; ++x) {
                    const i = 4 * (y * width + x);
                    const pixel = bitmap.getAt(x, y);
                    const r = msdfgen.clamp(Math.floor(256 * pixel.r), 0, 255);
                    const g = msdfgen.clamp(Math.floor(256 * pixel.g), 0, 255);
                    const b = msdfgen.clamp(Math.floor(256 * pixel.b), 0, 255);
                    image_data.data[i + 0] = r;
                    image_data.data[i + 1] = g;
                    image_data.data[i + 2] = b;
                    image_data.data[i + 3] = 255;
                }
            }
            ctx.putImageData(image_data, 0, 0);
        }
        else {
            const width = bitmap.width();
            const height = bitmap.height();
            console.log(`${title} ${width}x${height}`);
            let text = "";
            text += "╔" + "═".repeat(width) + "╗\n";
            for (let y = 0; y < height; ++y) {
                text += "║";
                for (let x = 0; x < width; ++x) {
                    const pixel = bitmap.getAt(x, y);
                    const r = msdfgen.clamp(Math.floor(256 * pixel.r), 0, 255);
                    const g = msdfgen.clamp(Math.floor(256 * pixel.g), 0, 255);
                    const b = msdfgen.clamp(Math.floor(256 * pixel.b), 0, 255);
                    // const tr: string = r.toString(16).padStart(2, "0").toUpperCase();
                    // const tg: string = g.toString(16).padStart(2, "0").toUpperCase();
                    // const tb: string = b.toString(16).padStart(2, "0").toUpperCase();
                    // text += `${tr} ${tg} ${tb} `;
                    const a = msdfgen.median(r, g, b);
                    text += " ░▒▓█"[Math.floor(a * 5 / 256)];
                }
                text += "║\n";
            }
            text += "╚" + "═".repeat(width) + "╝\n";
            console.log(text);
        }
    }
    function loadTestShape(size = 64) {
        const scale = size / test.units_per_em;
        const shape = new msdfgen.Shape();
        let contour = null;
        const start = new msdfgen.Point2();
        for (const line of test.commands) {
            const command = line.split(" ");
            const type = command.shift() || "";
            const points = [];
            for (let i = 0; i < command.length; i += 2) {
                const x = parseInt(command[i + 0]) * scale;
                const y = parseInt(command[i + 1]) * scale;
                points.push(new msdfgen.Point2(x, y * test.winding));
            }
            switch (type) {
                case "M":
                    contour = shape.addContour();
                    start.copy(points[0]);
                    break;
                case "L":
                    if (contour === null) {
                        throw new Error();
                    }
                    contour.addEdge(new msdfgen.LinearSegment(start, points[0]));
                    start.copy(points[0]);
                    break;
                case "Q":
                    if (contour === null) {
                        throw new Error();
                    }
                    contour.addEdge(new msdfgen.QuadraticSegment(start, points[0], points[1]));
                    start.copy(points[1]);
                    break;
                case "C":
                    if (contour === null) {
                        throw new Error();
                    }
                    contour.addEdge(new msdfgen.CubicSegment(start, points[0], points[1], points[2]));
                    start.copy(points[2]);
                    break;
                default:
                    throw new Error(command[0]);
            }
        }
        return shape;
    }
    return {
        setters: [
            function (msdfgen_1) {
                msdfgen = msdfgen_1;
            }
        ],
        execute: function () {
            // 新 https://source.typekit.com/source-han-serif/
            test = {
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
            };
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBRUEsU0FBOEIsSUFBSTs7WUFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFaEQsTUFBTSxLQUFLLEdBQWtCLGFBQWEsRUFBRSxDQUFDO1lBRTdDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMsOENBQThDLENBQUMsQ0FBQzthQUNqRTtZQUVELEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUVsQixNQUFNLGVBQWUsR0FBVyxDQUFDLENBQUMsQ0FBQyxVQUFVO1lBQzdDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFFbkQsTUFBTSxNQUFNLEdBQW9CLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUUvQyxNQUFNLEtBQUssR0FBVyxDQUFDLENBQUM7WUFDeEIsTUFBTSxRQUFRLEdBQVcsTUFBTSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7WUFDMUMsTUFBTSxRQUFRLEdBQVcsTUFBTSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7WUFDMUMsTUFBTSxRQUFRLEdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLDJCQUEyQjtZQUNyRixNQUFNLFFBQVEsR0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsMkJBQTJCO1lBRXJGLG9CQUFvQjtZQUNwQix5Q0FBeUM7WUFDekMseUNBQXlDO1lBQ3pDLE1BQU0sS0FBSyxHQUFvQixJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FB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QUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN0QixNQUFNO2dCQUNSO29CQUNFLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDL0I7U0FDRjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQzs7Ozs7Ozs7WUFFRCxpREFBaUQ7WUFDM0MsSUFBSSxHQUFHO2dCQUNYLFlBQVksRUFBRSxJQUFJO2dCQUNsQixPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUNYLFFBQVEsRUFBRTtvQkFDUixVQUFVO29CQUNWLFdBQVc7b0JBQ1gsMkJBQTJCO29CQUMzQiwyQkFBMkI7b0JBQzNCLFdBQVc7b0JBQ1gsV0FBVztvQkFDWCxXQUFXO29CQUNYLDJCQUEyQjtvQkFDM0IsV0FBVztvQkFDWCxXQUFXO29CQUNYLFVBQVU7b0JBQ1YsVUFBVTtvQkFDVixXQUFXO29CQUNYLDJCQUEyQjtvQkFDM0IsMkJBQTJCO29CQUMzQixXQUFXO29CQUNYLFdBQVc7b0JBQ1gsMkJBQTJCO29CQUMzQiwyQkFBMkI7b0JBQzNCLFdBQVc7b0JBQ1gsV0FBVztvQkFDWCwyQkFBMkI7b0JBQzNCLDJCQUEyQjtvQkFDM0IsV0FBVztvQkFDWCwyQkFBMkI7b0JBQzNCLFVBQVU7b0JBQ1YsVUFBVTtvQkFDVixXQUFXO29CQUNYLFdBQVc7b0JBQ1gsV0FBVztvQkFDWCxXQUFXO29CQUNYLDJCQUEyQjtvQkFDM0IsMkJBQTJCO29CQUMzQixXQUFXO29CQUNYLFdBQVc7b0JBQ1gsV0FBVztvQkFDWCwyQkFBMkI7b0JBQzNCLFdBQVc7b0JBQ1gsV0FBVztvQkFDWCxVQUFVO29CQUNWLFVBQVU7b0JBQ1YsV0FBVztvQkFDWCx3QkFBd0I7b0JBQ3hCLFNBQVM7b0JBQ1QsMEJBQTBCO29CQUMxQixXQUFXO29CQUNYLFdBQVc7b0JBQ1gsMkJBQTJCO29CQUMzQixXQUFXO29CQUNYLDBCQUEwQjtvQkFDMUIsMEJBQTBCO29CQUMxQixXQUFXO29CQUNYLFdBQVc7b0JBQ1gsV0FBVztvQkFDWCxXQUFXO29CQUNYLDJCQUEyQjtvQkFDM0IsMkJBQTJCO29CQUMzQixXQUFXO29CQUNYLDJCQUEyQjtvQkFDM0IsV0FBVztvQkFDWCxXQUFXO29CQUNYLDBCQUEwQjtvQkFDMUIsV0FBVztvQkFDWCwwQkFBMEI7b0JBQzFCLFdBQVc7b0JBQ1gsV0FBVztvQkFDWCxXQUFXO29CQUNYLFdBQVc7b0JBQ1gsMkJBQTJCO29CQUMzQixXQUFXO29CQUNYLFdBQVc7b0JBQ1gsMkJBQTJCO29CQUMzQiwyQkFBMkI7b0JBQzNCLFdBQVc7aUJBQ1o7YUFDRixDQUFBIn0=