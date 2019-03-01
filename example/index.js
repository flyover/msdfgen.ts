/// @ts-check
/// <reference types="node"/>

require("source-map-support").install();

global["fetch"] = (url) => {
  return new Promise((resolve, reject) => {
    const fs = require('fs');
    if (!fs.existsSync(url)) {
      reject(`File not found: ${url}`);
    }
    const readStream = fs.createReadStream(url);
    readStream.on('open', function () {
      const Response = require('node-fetch').Response;
      resolve(new Response(readStream, {
        status: 200,
        statusText: 'OK'
      }));
    });
  });
};

process.chdir(__dirname);

global["SystemJS"] = require("systemjs");

// SystemJS.config({ map: { "fs": "@node/fs" } });

module.require("./system.config");

SystemJS.import("./main.js")
.then(function (main) {
  main.default()
  .then(function () {
    console.log("done");
  })
  .catch(console.error);
})
.catch(console.error);
