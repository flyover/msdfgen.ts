import Vue from "vue";
import * as FT from "freetype-js";
import * as PNG from "libpng-js";
import * as main from "./main";

start().catch(console.error);

async function start(): Promise<void> {
  await FT.default(); // initialize Emscripten module
  await PNG.default(); // initialize Emscripten module

  const package_response: Response = await fetch("./package.json");
  const package_json: PackageJSON = JSON.parse(await package_response.text());

  const data: AppData = {
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
  }

  const methods: AppMethods = {
    start: (e: MouseEvent): void => { console.log("start", e); },
    cancel: (e: MouseEvent): void => { console.log("cancel", e); },
    clear: (e: MouseEvent): void => { console.log("clear", e); },
  }

  const html = String.raw;

  const template: string = html`
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

  const app = new Vue({ el: "#app", data, methods, template });

  // const app_div: HTMLDivElement = document.querySelector("div#app") as HTMLDivElement;
  // app_div.hidden = false;

  const actions_div: HTMLDivElement = app.$el.querySelector("div#actions") as HTMLDivElement;
  const action_start: HTMLButtonElement = actions_div.querySelector("button#start") as HTMLButtonElement;
  const action_cancel: HTMLButtonElement = actions_div.querySelector("button#cancel") as HTMLButtonElement;
  const action_clear: HTMLButtonElement = actions_div.querySelector("button#clear") as HTMLButtonElement;
  const action_progress: HTMLProgressElement = actions_div.querySelector("progress#progress") as HTMLProgressElement;

  const results_div: HTMLDivElement = app.$el.querySelector("div#results") as HTMLDivElement;
  const result_json: HTMLTextAreaElement = results_div.querySelector("textarea#json") as HTMLTextAreaElement;
  const result_bitmap: HTMLCanvasElement = results_div.querySelector("canvas#bitmap") as HTMLCanvasElement;

  action_start.addEventListener("click", async (): Promise<void> => {
    action_start.disabled = true;
    action_clear.disabled = true;
    action_progress.value = 0;

    const verbose: boolean = app.options.verbose;
    const font_path: string = app.options.font;
    const font_resp: Response = await fetch(font_path);
    const font_file: Uint8Array = new Uint8Array(await font_resp.arrayBuffer());
    const size: number = app.options.size;
    const charset: string = app.options.charset;
    const type: main.msdfgen.Type = app.options.type;
    const range: number = app.options.range;

    let cancel: boolean = false;

    const progress: main.Progress = async (completed: number, total: number): Promise<boolean> => {
      action_progress.max = total;
      action_progress.value = Math.round(action_progress.max * completed / total);
      await blink(); // allow refresh
      return cancel; // return true to stop
    };

    const options: main.Options = { progress, verbose, font_file, size, charset, type, range };

    const listen_cancel: EventListener = (): void => { cancel = true; };
    action_cancel.addEventListener("click", listen_cancel);

    const results: main.Results = await main.default(options);

    action_cancel.removeEventListener("click", listen_cancel);

    const json_path: string = font_path.replace(/\.(ttf|otf)$/i, ".json");
    const bitmap_path: string = font_path.replace(/\.(ttf|otf)$/i, ".png");

    if (results.json) {
      results.json.page.name = bitmap_path.split("/").pop() || bitmap_path; // relative to json directory
      result_json.value = JSON.stringify(results.json, null, "\t");
      result_json.hidden = false;
    }
    if (verbose) { console.log(json_path, results.json.page.name); }

    if (results.bitmap.width > 0 && results.bitmap.height > 0) {
      result_bitmap.style.width = `${result_bitmap.width = results.bitmap.width}px`;
      result_bitmap.style.height = `${result_bitmap.height = results.bitmap.height}px`;
      const ctx: CanvasRenderingContext2D | null = result_bitmap.getContext("2d");
      if (ctx !== null) {
        const image_data: ImageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        image_data.data.set(results.bitmap.data);
        ctx.putImageData(image_data, 0, 0);
      }
      result_bitmap.hidden = false;
    }
    if (verbose) { console.log(bitmap_path, results.bitmap.width, results.bitmap.height); }

    action_start.disabled = false;
    action_clear.disabled = false;
    action_progress.value = 0;
  });

  action_clear.addEventListener("click", (): void => {
    result_json.hidden = true;
    result_bitmap.hidden = true;
  });
}

export type Enum<E> = Record<keyof E, number | string> & { [k: number]: string };

interface OptionData {
  text: string;
  value: string;
}

function enum_options<T>(_enum: Enum<T>): OptionData[] {
  const options: OptionData[] = [];
  for (const key in _enum) {
    const text: string = key;
    const value: string = _enum[key];
    options.push({ text, value });
  }
  return options;
}

interface PackageJSON {
  name: string;
  version: string;
}

interface AppData {
  // message: string;
  package: PackageJSON;
  options: AppDataOptions;
}

interface AppDataOptions {
  verbose: boolean;
  font: string;
  size: number;
  charset: string;
  types: OptionData[];
  type: main.msdfgen.Type;
  range: number;
  angle_threshold: number;
  msdf_edge_threshold: number; // only for msdf type
}

interface AppMethods {
  start: (e: MouseEvent) => void;
  cancel: (e: MouseEvent) => void;
  clear: (e: MouseEvent) => void;
}

async function blink(): Promise<void> {
  return new Promise<void>((resolve: () => void): void => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(resolve);
    } else if (typeof setImmediate === "function") {
      setImmediate(resolve);
    } else if (typeof setTimeout === "function") {
      setTimeout(resolve);
    } else {
      resolve();
    }
  });
}
