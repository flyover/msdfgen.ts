/// @ts-check
/// <reference types="node"/>

require("source-map-support").install();

process.chdir(__dirname);

global["SystemJS"] = require("systemjs");

module.require("./system.config");

SystemJS.import("./main")
.then(function (main) {
  main.default()
  .then(function () {
    console.log("done");
  })
  .catch(console.error);
})
.catch(console.error);
