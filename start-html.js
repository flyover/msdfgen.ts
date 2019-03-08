System.register(["freetype-js", "libpng-js", "./main"], function (exports_1, context_1) {
    "use strict";
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var FT, PNG, main;
    var __moduleName = context_1 && context_1.id;
    function start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield FT.default(); // initialize Emscripten module
            yield PNG.default(); // initialize Emscripten module
            const package_response = yield fetch("./package.json");
            const package_json = JSON.parse(yield package_response.text());
            const options_div = document.body.appendChild(document.createElement("div"));
            options_div.id = "options";
            const label_name = options_div.appendChild(document.createElement("span"));
            label_name.innerHTML = package_json.name;
            const label_version = options_div.appendChild(document.createElement("span"));
            label_version.innerHTML = package_json.version;
            const option_verbose = options_div.appendChild(document.createElement("input"));
            option_verbose.type = "checkbox";
            option_verbose.checked = false;
            const option_ttf_path = options_div.appendChild(document.createElement("input"));
            option_ttf_path.type = "url";
            option_ttf_path.value = "Consolas.ttf";
            const option_size = options_div.appendChild(document.createElement("input"));
            option_size.type = "number";
            option_size.valueAsNumber = main.DEFAULT_SIZE;
            const option_charset = options_div.appendChild(document.createElement("input"));
            option_charset.type = "text";
            option_charset.value = main.DEFAULT_CHARSET;
            const option_types = options_div.appendChild(document.createElement("span"));
            for (const type in main.msdfgen.Type) {
                const option_type = option_types.appendChild(document.createElement("input"));
                option_type.type = "radio";
                option_type.name = "type";
                option_type.value = main.msdfgen.Type[type];
                option_type.checked = main.msdfgen.Type[type] === main.DEFAULT_TYPE;
                const label_type = option_types.appendChild(document.createElement("label"));
                label_type.innerHTML = `Type.${type}`;
            }
            const option_range = options_div.appendChild(document.createElement("input"));
            option_range.type = "number";
            option_range.valueAsNumber = main.DEFAULT_RANGE;
            const actions_div = document.body.appendChild(document.createElement("div"));
            actions_div.id = "actions";
            const action_start = actions_div.appendChild(document.createElement("input"));
            action_start.type = "button";
            action_start.value = "start";
            const action_clear = actions_div.appendChild(document.createElement("input"));
            action_clear.type = "button";
            action_clear.value = "clear";
            const action_progress = actions_div.appendChild(document.createElement("progress"));
            action_progress.value = 0;
            const results_div = document.body.appendChild(document.createElement("div"));
            results_div.id = "results";
            const result_json = results_div.appendChild(document.createElement("textarea"));
            result_json.hidden = true;
            const result_bitmap = results_div.appendChild(document.createElement("canvas"));
            result_bitmap.hidden = true;
            action_start.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                action_start.disabled = true;
                action_clear.disabled = true;
                action_progress.value = 0;
                const verbose = option_verbose.checked;
                const progress = (completed, total) => __awaiter(this, void 0, void 0, function* () {
                    action_progress.max = total;
                    action_progress.value = Math.round(action_progress.max * completed / total);
                    yield sleep(); // allow page refresh
                    return false; // return true to stop
                });
                const ttf_path = option_ttf_path.value;
                const response = yield fetch(ttf_path);
                const ttf_file = new Uint8Array(yield response.arrayBuffer());
                const size = option_size.valueAsNumber;
                const charset = option_charset.value;
                const option_type = option_types.querySelector("input[name='type']:checked");
                if (option_type === null) {
                    throw new Error();
                }
                const type = option_type.value;
                const range = option_range.valueAsNumber;
                const options = { progress, verbose, ttf_file, size, charset, type, range };
                const results = yield main.default(options);
                const json_path = ttf_path.replace(/\.(ttf|otf)$/i, ".json");
                const png_path = ttf_path.replace(/\.(ttf|otf)$/i, ".png");
                if (results.json) {
                    results.json.page.name = png_path.split("/").pop() || png_path; // relative to json directory
                    result_json.value = JSON.stringify(results.json, null, "\t");
                    result_json.hidden = false;
                }
                if (verbose) {
                    console.log(json_path, results.json.page.name);
                }
                if (results.bitmap.width > 0 && results.bitmap.height > 0) {
                    result_bitmap.style.width = `${result_bitmap.width = results.bitmap.width}px`;
                    result_bitmap.style.height = `${result_bitmap.height = results.bitmap.height}px`;
                    const ctx = result_bitmap.getContext("2d");
                    if (ctx !== null) {
                        const image_data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
                        image_data.data.set(results.bitmap.data);
                        ctx.putImageData(image_data, 0, 0);
                    }
                    result_bitmap.hidden = false;
                }
                if (verbose) {
                    console.log(png_path, results.bitmap.width, results.bitmap.height);
                }
                action_start.disabled = false;
                action_clear.disabled = false;
                action_progress.value = 0;
            }));
            action_clear.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                result_json.hidden = true;
                result_bitmap.hidden = true;
            }));
        });
    }
    function sleep(time = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            const start = Date.now() / 1000; // seconds
            return new Promise((resolve) => {
                setTimeout(() => {
                    const end = Date.now() / 1000; // seconds
                    resolve(Math.max(0, time - (end - start)));
                }, time * 1000);
            });
        });
    }
    return {
        setters: [
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnQtaHRtbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN0YXJ0LWh0bWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBV0EsU0FBZSxLQUFLOztZQUNsQixNQUFNLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLCtCQUErQjtZQUNuRCxNQUFNLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLCtCQUErQjtZQUVwRCxNQUFNLGdCQUFnQixHQUFhLE1BQU0sS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDakUsTUFBTSxZQUFZLEdBQWdCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBRTVFLE1BQU0sV0FBVyxHQUFtQixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDN0YsV0FBVyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUM7WUFFM0IsTUFBTSxVQUFVLEdBQW9CLFdBQVcsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzVGLFVBQVUsQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQztZQUV6QyxNQUFNLGFBQWEsR0FBb0IsV0FBVyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDL0YsYUFBYSxDQUFDLFNBQVMsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDO1lBRS9DLE1BQU0sY0FBYyxHQUFxQixXQUFXLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNsRyxjQUFjLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQztZQUNqQyxjQUFjLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZ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