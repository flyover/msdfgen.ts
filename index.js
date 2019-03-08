/// @ts-check
/// <reference types="node"/>

require("source-map-support").install();

process.chdir(__dirname);

global["SystemJS"] = require("systemjs");

SystemJS.config({ map: { "fs": "@node/fs" } });
SystemJS.config({ map: { "path": "@node/path" } });
SystemJS.config({ map: { "util": "@node/util" } });
SystemJS.config({ map: { "events": "@node/events" } });
SystemJS.config({ map: { "child_process": "@node/child_process" } });

SystemJS.config({
  map: { "commander": "node_modules/commander" },
  packages: { "commander": { main: "index.js" } }
});

SystemJS.config({ map: { "freetype-js": "node_modules/freetype-js" } });
SystemJS.config({ map: { "libpng-js": "node_modules/libpng-js" } });

module.require("./system.config");

SystemJS.import("./start-node").catch(console.error);
