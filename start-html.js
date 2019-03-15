System.register(["vue", "freetype-js", "libpng-js", "./main"], function (exports_1, context_1) {
    "use strict";
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var vue_1, FT, PNG, main;
    var __moduleName = context_1 && context_1.id;
    function start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield FT.default(); // initialize Emscripten module
            yield PNG.default(); // initialize Emscripten module
            const package_response = yield fetch("./package.json");
            const package_json = JSON.parse(yield package_response.text());
            const data = {
                // message: "Hello Vue!",
                package: package_json,
                options: {
                    verbose: false,
                    font: "Consolas.ttf",
                    size: main.DEFAULT_SIZE,
                    charset: main.DEFAULT_CHARSET,
                    types: enum_options(main.msdfgen.Type), type: main.DEFAULT_TYPE,
                    range: main.DEFAULT_RANGE,
                    angle_threshold: main.DEFAULT_ANGLE_THRESHOLD,
                    msdf_edge_threshold: main.DEFAULT_MSDF_EDGE_THRESHOLD,
                }
            };
            const methods = {
                start: (e) => { console.log("start", e); },
                cancel: (e) => { console.log("cancel", e); },
                clear: (e) => { console.log("clear", e); },
            };
            const html = String.raw;
            const template = html `
    <div id="app">
      <!-- {{ message }} -->
      <div id="package">
        {{ package.name }} version {{ package.version }}
      </div>
      <!-- <form> -->
      <div id="options">
        <div>Options</div>
        <label for="verbose">
          <input type="checkbox" id="verbose" v-model="options.verbose" />
          <span class="label-body">Verbose</span>
        </label>
        <label for="font">Font</label>
        <input type="text" class="u-full-width" id="font" v-model="options.font" />
        <label for="size">Size</label>
        <input type="number" id="size" v-model="options.size" />
        <label for="charset">Character Set</label>
        <input type="text" class="u-full-width" id="charset" v-model="options.charset" />
        <label for="type">Type</label>
        <select id="type" v-model="options.type">
          <option v-for="type in options.types" v-bind:value="type.value">Type.{{ type.text }}</option>
        </select>
        <label for="range">Range</label>
        <input type="number" id="range" v-model="options.range" />
        <label for="angle_threshold">Angle Threshold</label>
        <input type="number" id="angle_threshold" v-model="options.angle_threshold" />
        <label for="msdf_edge_threshold">MSDF Edge Threshold</label>
        <input type="number" id="msdf_edge_threshold" v-model="options.msdf_edge_threshold" />
        <!-- <input class="button-primary" type="submit" value="Submit"> -->
      </div>
      <!-- </form> -->
      <div id="actions">
        <button id="start" v-on:click="start">Start</button>
        <button id="cancel" v-on:click="cancel">Cancel</button>
        <button id="clear" v-on:click="clear">Clear</button>
        <progress id="progress" value="0"></progress>
      </div>
      <div id="results">
        <div>Results</div>
        <textarea id="json"></textarea>
        <canvas id="bitmap"></canvas>
      </div>
    </div>
  `;
            const app = new vue_1.default({ el: "#app", data, methods, template });
            // const app_div: HTMLDivElement = document.querySelector("div#app") as HTMLDivElement;
            // app_div.hidden = false;
            const actions_div = app.$el.querySelector("div#actions");
            const action_start = actions_div.querySelector("button#start");
            const action_cancel = actions_div.querySelector("button#cancel");
            const action_clear = actions_div.querySelector("button#clear");
            const action_progress = actions_div.querySelector("progress#progress");
            const results_div = app.$el.querySelector("div#results");
            const result_json = results_div.querySelector("textarea#json");
            const result_bitmap = results_div.querySelector("canvas#bitmap");
            action_start.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                action_start.disabled = true;
                action_clear.disabled = true;
                action_progress.value = 0;
                const verbose = app.options.verbose;
                const font_path = app.options.font;
                const font_resp = yield fetch(font_path);
                const font_file = new Uint8Array(yield font_resp.arrayBuffer());
                const size = app.options.size;
                const charset = app.options.charset;
                const type = app.options.type;
                const range = app.options.range;
                let cancel = false;
                const progress = (completed, total) => __awaiter(this, void 0, void 0, function* () {
                    action_progress.max = total;
                    action_progress.value = Math.round(action_progress.max * completed / total);
                    yield blink(); // allow refresh
                    return cancel; // return true to stop
                });
                const options = { progress, verbose, font_file, size, charset, type, range };
                const listen_cancel = () => { cancel = true; };
                action_cancel.addEventListener("click", listen_cancel);
                const results = yield main.default(options);
                action_cancel.removeEventListener("click", listen_cancel);
                const json_path = font_path.replace(/\.(ttf|otf)$/i, ".json");
                const bitmap_path = font_path.replace(/\.(ttf|otf)$/i, ".png");
                if (results.json) {
                    results.json.page.name = bitmap_path.split("/").pop() || bitmap_path; // relative to json directory
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
                    console.log(bitmap_path, results.bitmap.width, results.bitmap.height);
                }
                action_start.disabled = false;
                action_clear.disabled = false;
                action_progress.value = 0;
            }));
            action_clear.addEventListener("click", () => {
                result_json.hidden = true;
                result_bitmap.hidden = true;
            });
        });
    }
    function enum_options(_enum) {
        const options = [];
        for (const key in _enum) {
            const text = key;
            const value = _enum[key];
            options.push({ text, value });
        }
        return options;
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
            function (vue_1_1) {
                vue_1 = vue_1_1;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnQtaHRtbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN0YXJ0LWh0bWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBT0EsU0FBZSxLQUFLOztZQUNsQixNQUFNLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLCtCQUErQjtZQUNuRCxNQUFNLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLCtCQUErQjtZQUVwRCxNQUFNLGdCQUFnQixHQUFhLE1BQU0sS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDakUsTUFBTSxZQUFZLEdBQWdCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBRTVFLE1BQU0sSUFBSSxHQUFZO2dCQUNwQix5QkFBeUI7Z0JBQ3pCLE9BQU8sRUFBRSxZQUFZO2dCQUNyQixPQUFPLEVBQUU7b0JBQ1AsT0FBTyxFQUFFLEtBQUs7b0JBQ2QsSUFBSSxFQUFFLGNBQWM7b0JBQ3BCLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWTtvQkFDdkIsT0FBTyxFQUFFLElBQUksQ0FBQyxlQUFlO29CQUM3QixLQUFLLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZO29CQUMvRCxLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWE7b0JBQ3pCLGVBQWUsRUFBRSxJQUFJLENBQUMsdUJBQXVCO29CQUM3QyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsMkJBQTJCO2lCQUN0RDthQUNGLENBQUE7WUFFRCxNQUFNLE9BQU8sR0FBZTtnQkFDMUIsS0FBSyxFQUFFLENBQUMsQ0FBYSxFQUFRLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVELE1BQU0sRUFBRSxDQUFDLENBQWEsRUFBUSxFQUFF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