/// <reference types="node"/>

import fs from "fs";
import commander from "commander";
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

  const package_text: string = fs.readFileSync("./package.json", { encoding: "utf-8" });
  const package_json: PackageJSON = JSON.parse(package_text);

  // const commander = require("commander");
  // const { default: commander } = await import("commander");
  commander
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

  const verbose: boolean = commander.verbose;
  const font_path: string = commander.font;
  // const fs = require("fs");
  // const fs = await import("fs");
  const font_file: Uint8Array = new Uint8Array(fs.readFileSync(font_path));
  const size: number = commander.size;
  const charset: string = commander.charset;
  const type: main.msdfgen.Type = commander.type;
  const range: number = commander.range;

  let cancel: boolean = false;

  const progress: main.Progress = async (completed: number, total: number): Promise<boolean> => {
    if (verbose) { process.stdout.write(`\r${Math.round(100 * completed / total)}%`); }
    await blink(); // allow refresh
    return cancel; // return true to stop
  };

  const options: main.Options = { progress, verbose, font_file, size, charset, type, range };

  const listen_cancel: NodeJS.SignalsListener = (): void => { cancel = true; };
  process.on("SIGINT", listen_cancel);

  const results: main.Results = await main.default(options);

  process.off("SIGINT", listen_cancel);

  if (verbose) { process.stdout.write(`\n`); }

  const json_path: string = font_path.replace(/\.(ttf|otf)$/i, ".json");
  const bitmap_path: string = font_path.replace(/\.(ttf|otf)$/i, ".png");

  if (results.json) {
    results.json.page.name = bitmap_path.split("/").pop() || bitmap_path; // relative to json directory
    fs.writeFileSync(json_path, JSON.stringify(results.json, null, "\t"));
  }
  if (verbose) { console.log(json_path, results.json.page.name); }

  if (results.bitmap.width > 0 && results.bitmap.height > 0) {
    fs.writeFileSync(bitmap_path, PNG.encode(results.bitmap));
  }
  if (verbose) { console.log(bitmap_path, results.bitmap.width, results.bitmap.height); }
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
