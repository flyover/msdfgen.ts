SystemJS.config({
    // map: { "freetype-js": "node_modules/freetype-js" },
    // map: { "freetype-js": "https://raw.githubusercontent.com/flyover/freetype-js/master" },
    packages: { "freetype-js": { main: "freetype.js" } }
});
SystemJS.config({
    // map: { "libpng-js": "node_modules/libpng-js" },
    // map: { "libpng-js": "https://raw.githubusercontent.com/flyover/libpng-js/master" },
    packages: { "libpng-js": { main: "libpng.js" } }
});
SystemJS.config({
    map: { "msdfgen-core": "core" },
    packages: { "msdfgen-core": { main: "index.js" } }
});
SystemJS.config({
    packages: { ".": { defaultExtension: "js" } }
});
