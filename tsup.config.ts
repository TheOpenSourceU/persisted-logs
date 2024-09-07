import { defineConfig, Options } from "tsup";

const env = process.env?.NODE_ENV || 'development';

const tsup: Options = {

  // clean: true, // clean up the dist folder
  // dts: true, // generate dts files
  // format: ['cjs', 'esm'], // generate cjs and esm files
  // entryPoints: ['src/index.ts'],
  //entry: ['src/**/*.ts'], //include all files under src
  minify: env === 'production',
  bundle: env === 'production',
  //skipNodeModulesBundle: true,
  watch: env === 'development',
  //target: 'es2020',
  outDir: env === 'production' ? 'dist' : 'dist',
  treeshake: env === 'production',
  clean: true,
};

export default defineConfig({
  ...tsup,
  entry: ["src/app.ts"],
  format: ["esm", "cjs", "iife"], // Build for commonJS and ESmodules
  dts: true, // Generate declaration file (.d.ts)
  splitting: false,
  sourcemap: true,
  metafile: true,
});
