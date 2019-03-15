/// <reference types="node"/>
System.register(["fs", "commander", "freetype-js", "libpng-js", "./main"], function (exports_1, context_1) {
    "use strict";
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var fs_1, commander_1, FT, PNG, main;
    var __moduleName = context_1 && context_1.id;
    function start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield FT.default(); // initialize Emscripten module
            yield PNG.default(); // initialize Emscripten module
            const package_text = fs_1.default.readFileSync("./package.json", { encoding: "utf-8" });
            const package_json = JSON.parse(package_text);
            // const commander = require("commander");
            // const { default: commander } = await import("commander");
            commander_1.default
                .version(package_json.version)
                .option("-v, --verbose", "verbose", false)
                .option("-f, --font <font>", "font URL", "Consolas.ttf")
                .option("-s, --size <size>", "font size in pixels", parseFloat, main.DEFAULT_SIZE)
                .option("-c, --charset <charset>", "character set", main.DEFAULT_CHARSET)
                .option("-t, --type <type>", "SDF type (sdf, psdf or msdf)", /^(sdf|psdf|msdf)$/, main.DEFAULT_TYPE)
                .option("-r, --range <range>", "SDF range in pixels", parseFloat, main.DEFAULT_RANGE)
                .option("--angle-threshold <value>", "angle threshold in radians", parseFloat, main.DEFAULT_ANGLE_THRESHOLD)
                .option("--msdf-edge-threshold <value>", "msdf edge threshold", parseFloat, main.DEFAULT_MSDF_EDGE_THRESHOLD)
                .parse(process.argv);
            const verbose = commander_1.default.verbose;
            const font_path = commander_1.default.font;
            // const fs = require("fs");
            // const fs = await import("fs");
            const font_file = new Uint8Array(fs_1.default.readFileSync(font_path));
            const size = commander_1.default.size;
            const charset = commander_1.default.charset;
            const type = commander_1.default.type;
            const range = commander_1.default.range;
            let cancel = false;
            const progress = (completed, total) => __awaiter(this, void 0, void 0, function* () {
                if (verbose) {
                    process.stdout.write(`\r${Math.round(100 * completed / total)}%`);
                }
                yield blink(); // allow refresh
                return cancel; // return true to stop
            });
            const options = { progress, verbose, font_file, size, charset, type, range };
            const listen_cancel = () => { cancel = true; };
            process.on("SIGINT", listen_cancel);
            const results = yield main.default(options);
            process.off("SIGINT", listen_cancel);
            if (verbose) {
                process.stdout.write(`\n`);
            }
            const json_path = font_path.replace(/\.(ttf|otf)$/i, ".json");
            const bitmap_path = font_path.replace(/\.(ttf|otf)$/i, ".png");
            if (results.json) {
                results.json.page.name = bitmap_path.split("/").pop() || bitmap_path; // relative to json directory
                fs_1.default.writeFileSync(json_path, JSON.stringify(results.json, null, "\t"));
            }
            if (verbose) {
                console.log(json_path, results.json.page.name);
            }
            if (results.bitmap.width > 0 && results.bitmap.height > 0) {
                fs_1.default.writeFileSync(bitmap_path, PNG.encode(results.bitmap));
            }
            if (verbose) {
                console.log(bitmap_path, results.bitmap.width, results.bitmap.height);
            }
        });
    }
    function blink() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                if (typeof requestAnimationFrame === "function") {
                    requestAnimationFrame(resolve);
                }
                else if (typeof setImmediate === "function") {
                    setImmediate(resolve);
                }
                else if (typeof setTimeout === "function") {
                    setTimeout(resolve);
                }
                else {
                    resolve();
                }
            });
        });
    }
    return {
        setters: [
            function (fs_1_1) {
                fs_1 = fs_1_1;
            },
            function (commander_1_1) {
                commander_1 = commander_1_1;
            },
            function (FT_1) {
                FT = FT_1;
            },
            function (PNG_1) {
                PNG = PNG_1;
            },
            function (main_1) {
                main = main_1;
            }
        ],
        execute: function () {
            start().catch(console.error);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnQtbm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN0YXJ0LW5vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsNkJBQTZCOzs7Ozs7Ozs7Ozs7O0lBZTdCLFNBQWUsS0FBSzs7WUFDbEIsTUFBTSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQywrQkFBK0I7WUFDbkQsTUFBTSxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQywrQkFBK0I7WUFFcEQsTUFBTSxZQUFZLEdBQVcsWUFBRSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sWUFBWSxHQUFnQixJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTNELDBDQUEwQztZQUMxQyw0REFBNEQ7WUFDNUQsbUJBQVM7aUJBQ04sT0FBTyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUM7aUJBQzdCLE1BQU0sQ0FBQyxlQUFlLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQztpQkFDekMsTUFBTSxDQUFDLG1CQUFtQixFQUFFLFVBQVUsRUFBRSxjQUFjLENBQUM7aUJBQ3ZELE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxxQkFBcUIsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQztpQkFDakYsTUFBTSxDQUFDLHlCQUF5QixFQUFFLGVBQWUsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDO2lCQUN4RSxNQUFNLENBQUMsbUJBQW1CLEVBQUUsOEJBQThCLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQztpQkFDbkcsTUFBTSxDQUFDLHFCQUFxQixFQUFFLHFCQUFxQixFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDO2lCQUNwRixNQUFNLENBQUMsMkJBQTJCLEVBQUUsNEJBQTRCLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQztpQkFDM0csTUFBTSxDQUFDLCtCQUErQixFQUFFLHFCQUFxQixFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsMkJBQTJCLENBQUM7aUJBQzVHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFdkIsTUFBTSxPQUFPLEdBQVksbUJBQVMsQ0FBQyxPQUFPLENBQUM7WUFDM0MsTUFBTSxTQUFTLEdBQVcsbUJBQVMsQ0FBQyxJQUFJLENBQUM7WUFDekMsNEJBQTRCO1lBQzVCLGlDQUFpQztZQUNqQyxNQUFNLFNBQVMsR0FBZSxJQUFJLFVBQVUsQ0FBQyxZQUFFLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDekUsTUFBTSxJQUFJLEdBQVcsbUJBQVMsQ0FBQyxJQUFJLENBQUM7WUFDcEMsTUFBTSxPQUFPLEdBQVcsbUJBQVMsQ0FBQyxPQUFPLENBQUM7WUFDMUMsTUFBTSxJQUFJLEdBQXNCLG1CQUFTLENBQUMsSUFBSSxDQUFDO1lBQy9DLE1BQU0sS0FBSyxHQUFXLG1CQUFTLENBQUMsS0FBSyxDQUFDO1lBRXRDLElBQUksTUFBTSxHQUFZLEtBQUssQ0FBQztZQUU1QixNQUFNLFFBQVEsR0FBa0IsQ0FBTyxTQUFpQixFQUFFLEtBQWEsRUFBb0IsRUFBRTtnQkFDM0YsSUFBSSxPQUFPLEVBQUU7b0JBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxTQUFTLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUFFO2dCQUNuRixNQUFNLEtBQUssRUFBRSxDQUFDLENBQUMsZ0JBQWdCO2dCQUMvQixPQUFPLE1BQU0sQ0FBQyxDQUFDLHNCQUFzQjtZQUN2QyxDQUFDLENBQUEsQ0FBQztZQUVGLE1BQU0sT0FBTyxHQUFpQixFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDO1lBRTNGLE1BQU0sYUFBYSxHQUEyQixHQUFTLEVBQUUsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdFLE9BQU8sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBRXBDLE1BQU0sT0FBTyxHQUFpQixNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFMUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFFckMsSUFBSSxPQUFPLEVBQUU7Z0JBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7YUFBRTtZQUU1QyxNQUFNLFNBQVMsR0FBVyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN0RSxNQUFNLFdBQVcsR0FBVyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUV2RSxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUU7Z0JBQ2hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLFdBQVcsQ0FBQyxDQUFDLDZCQUE2QjtnQkFDbkcsWUFBRSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQ3ZFO1lBQ0QsSUFBSSxPQUFPLEVBQUU7Z0JBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFBRTtZQUVoRSxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3pELFlBQUUsQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7YUFDM0Q7WUFDRCxJQUFJLE9BQU8sRUFBRTtnQkFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQUU7UUFDekYsQ0FBQztLQUFBO0lBRUQsU0FBZSxLQUFLOztZQUNsQixPQUFPLElBQUksT0FBTyxDQUFPLENBQUMsT0FBbUIsRUFBUSxFQUFFO2dCQUNyRCxJQUFJLE9BQU8scUJBQXFCLEtBQUssVUFBVSxFQUFFO29CQUMvQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDaEM7cUJBQU0sSUFBSSxPQUFPLFlBQVksS0FBSyxVQUFVLEVBQUU7b0JBQzdDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDdkI7cUJBQU0sSUFBSSxPQUFPLFVBQVUsS0FBSyxVQUFVLEVBQUU7b0JBQzNDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDckI7cUJBQU07b0JBQ0wsT0FBTyxFQUFFLENBQUM7aUJBQ1g7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7S0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUEvRUQsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyJ9