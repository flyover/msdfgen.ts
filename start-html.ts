import * as FT from "freetype-js";
import * as PNG from "libpng-js";
import * as main from "./main";

interface PackageJSON {
  name: string;
  version: string;
}

start().catch(console.error);

async function start(): Promise<void> {
  await FT.default(); // initialize Emscripten module
  await PNG.default(); // initialize Emscripten module

  const package_response: Response = await fetch("./package.json");
  const package_json: PackageJSON = JSON.parse(await package_response.text());

  const options_div: HTMLDivElement = document.body.appendChild(document.createElement("div"));
  options_div.id = "options";

  const label_name: HTMLSpanElement = options_div.appendChild(document.createElement("span"));
  label_name.innerHTML = package_json.name;

  const label_version: HTMLSpanElement = options_div.appendChild(document.createElement("span"));
  label_version.innerHTML = package_json.version;

  const option_verbose: HTMLInputElement = options_div.appendChild(document.createElement("input"));
  option_verbose.type = "checkbox";
  option_verbose.checked = false;

  const option_ttf_path: HTMLInputElement = options_div.appendChild(document.createElement("input"));
  option_ttf_path.type = "url";
  option_ttf_path.value = "Consolas.ttf";

  const option_size: HTMLInputElement = options_div.appendChild(document.createElement("input"));
  option_size.type = "number";
  option_size.valueAsNumber = main.DEFAULT_SIZE;

  const option_charset: HTMLInputElement = options_div.appendChild(document.createElement("input"));
  option_charset.type = "text";
  option_charset.value = main.DEFAULT_CHARSET;

  const option_types: HTMLSpanElement = options_div.appendChild(document.createElement("span"));
  for (const type in main.msdfgen.Type) {
    const option_type: HTMLInputElement = option_types.appendChild(document.createElement("input"));
    option_type.type = "radio";
    option_type.name = "type";
    option_type.value = main.msdfgen.Type[type];
    option_type.checked = main.msdfgen.Type[type] === main.DEFAULT_TYPE;
    const label_type: HTMLLabelElement = option_types.appendChild(document.createElement("label"));
    label_type.innerHTML = `Type.${type}`;
  }

  const option_range: HTMLInputElement = options_div.appendChild(document.createElement("input"));
  option_range.type = "number";
  option_range.valueAsNumber = main.DEFAULT_RANGE;

  const actions_div: HTMLDivElement = document.body.appendChild(document.createElement("div"));
  actions_div.id = "actions";

  const action_start: HTMLInputElement = actions_div.appendChild(document.createElement("input"));
  action_start.type = "button";
  action_start.value = "start";

  const action_clear: HTMLInputElement = actions_div.appendChild(document.createElement("input"));
  action_clear.type = "button";
  action_clear.value = "clear";

  const action_progress: HTMLProgressElement = actions_div.appendChild(document.createElement("progress"));
  action_progress.value = 0;

  const results_div: HTMLDivElement = document.body.appendChild(document.createElement("div"));
  results_div.id = "results";

  const result_json: HTMLTextAreaElement = results_div.appendChild(document.createElement("textarea"));
  result_json.hidden = true;

  const result_bitmap: HTMLCanvasElement = results_div.appendChild(document.createElement("canvas"));
  result_bitmap.hidden = true;

  action_start.addEventListener("click", async (): Promise<void> => {
    action_start.disabled = true;
    action_clear.disabled = true;
    action_progress.value = 0;

    const verbose: boolean = option_verbose.checked;

    const progress: main.Progress = async (completed: number, total: number): Promise<boolean> => {
      action_progress.max = total;
      action_progress.value = Math.round(action_progress.max * completed / total);
      await sleep(); // allow page refresh
      return false; // return true to stop
    };

    const ttf_path: string = option_ttf_path.value;
    const response: Response = await fetch(ttf_path);
    const ttf_file: Uint8Array = new Uint8Array(await response.arrayBuffer());

    const size: number = option_size.valueAsNumber;

    const charset: string = option_charset.value;

    const option_type: HTMLInputElement | null = option_types.querySelector("input[name='type']:checked");
    if (option_type === null) { throw new Error(); }
    const type: main.msdfgen.Type = option_type.value as main.msdfgen.Type;

    const range: number = option_range.valueAsNumber;

    const options: main.Options = { progress, verbose, ttf_file, size, charset, type, range };
  
    const results: main.Results = await main.default(options);

    const json_path: string = ttf_path.replace(/\.(ttf|otf)$/i, ".json");
    const png_path: string = ttf_path.replace(/\.(ttf|otf)$/i, ".png");
    
    if (results.json) {
      results.json.page.name = png_path.split("/").pop() || png_path; // relative to json directory
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
    if (verbose) { console.log(png_path, results.bitmap.width, results.bitmap.height); }

    action_start.disabled = false;
    action_clear.disabled = false;
    action_progress.value = 0;
  });

  action_clear.addEventListener("click", async () => {
    result_json.hidden = true;
    result_bitmap.hidden = true;
  });
}

async function sleep(time: number = 0): Promise<number> {
  const start: number = Date.now() / 1000; // seconds
  return new Promise<number>((resolve: (remain: number) => void): void => {
    setTimeout((): void => {
      const end: number = Date.now() / 1000; // seconds
      resolve(Math.max(0, time - (end - start)));
    }, time * 1000);
  });
}
