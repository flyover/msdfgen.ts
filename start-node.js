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
            const progress = (completed, total) => __awaiter(this, void 0, void 0, function* () {
                if (verbose) {
                    process.stdout.write(`\r${Math.round(100 * completed / total)}%`);
                }
                return false;
            });
            const verbose = commander_1.default.verbose;
            const ttf_path = commander_1.default.font;
            // const fs = require("fs");
            // const fs = await import("fs");
            const ttf_file = new Uint8Array(fs_1.default.readFileSync(ttf_path));
            const size = commander_1.default.size;
            const charset = commander_1.default.charset;
            const type = commander_1.default.type;
            const range = commander_1.default.range;
            const options = { progress, verbose, ttf_file, size, charset, type, range };
            const results = yield main.default(options);
            if (verbose) {
                process.stdout.write(`\r100%\n`);
            }
            const json_path = ttf_path.replace(/\.(ttf|otf)$/i, ".json");
            const png_path = ttf_path.replace(/\.(ttf|otf)$/i, ".png");
            if (results.json) {
                results.json.page.name = png_path.split("/").pop() || png_path; // relative to json directory
                fs_1.default.writeFileSync(json_path, JSON.stringify(results.json, null, "\t"));
            }
            if (verbose) {
                console.log(json_path, results.json.page.name);
            }
            if (results.bitmap.width > 0 && results.bitmap.height > 0) {
                fs_1.default.writeFileSync(png_path, PNG.encode(results.bitmap));
            }
            if (verbose) {
                console.log(png_path, results.bitmap.width, results.bitmap.height);
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnQtbm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN0YXJ0LW5vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsNkJBQTZCOzs7Ozs7Ozs7Ozs7O0lBZTdCLFNBQWUsS0FBSzs7WUFDbEIsTUFBTSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQywrQkFBK0I7WUFDbkQsTUFBTSxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQywrQkFBK0I7WUFFcEQsTUFBTSxZQUFZLEdBQVcsWUFBRSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sWUFBWSxHQUFnQixJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTNELDBDQUEwQztZQUMxQyw0REFBNEQ7WUFDNUQsbUJBQVM7aUJBQ04sT0FBTyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUM7aUJBQzdCLE1BQU0sQ0FBQyxlQUFlLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQztpQkFDekMsTUFBTSxDQUFDLG1CQUFtQixFQUFFLFVBQVUsRUFBRSxjQUFjLENBQUM7aUJBQ3ZELE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxxQkFBcUIsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQztpQkFDakYsTUFBTSxDQUFDLHlCQUF5QixFQUFFLGVBQWUsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDO2lCQUN4RSxNQUFNLENBQUMsbUJBQW1CLEVBQUUsOEJBQThCLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQztpQkFDbkcsTUFBTSxDQUFDLHFCQUFxQixFQUFFLHFCQUFxQixFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDO2lCQUNwRixNQUFNLENBQUMsMkJBQTJCLEVBQUUsNEJBQTRCLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FB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