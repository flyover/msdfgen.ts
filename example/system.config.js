SystemJS.config({
    map: { "msdfgen-core": "../core" },
    packages: { "msdfgen-core": { main: "index.js", } }
});
SystemJS.config({
    packages: { ".": { defaultExtension: "js" } }
});
