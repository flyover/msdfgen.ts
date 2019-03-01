import typescript from "rollup-plugin-typescript2";

const plugins = [
  typescript({
    clean: true,
    tsconfigOverride: {
      compilerOptions: {
        target: "ES2015",
        module: "ES2015"
      }
    }
  })
];

export default [
  {
    input: "core/index.ts",
    output: {
      file: "dist/msdfgen.umd.js",
      name: "msdfgen",
      format: "umd",
      exports: "named"
    },
    plugins: plugins
  }
];
