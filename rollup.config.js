export default [
  {
    input: "core/index.js",
    output: {
      file: "dist/msdfgen-core.umd.js",
      name: "msdfgen",
      format: "umd",
      exports: "named"
    }
  },
  {
    input: "index.js",
    output: {
      file: "dist/msdfgen.umd.js",
      name: "msdfgen",
      format: "umd",
      exports: "named"
    }
  }
];
