import { defineConfig, Options } from "tsup";

const env = process.env?.NODE_ENV || 'development';

export default defineConfig({
  clean: true, // clean up the dist folder
  entry: ["src/app.ts", "src/test.ts"],
  format: ["esm", "cjs"], // Build for commonJS and ESmodules
  dts: true, // Generate declaration file (.d.ts)
  splitting: false,
  sourcemap: env === 'development' ? 'inline' : false,

  watch: env === 'development',
  
  minify: env === 'production',
  treeshake: env === 'production',
  outDir: env === 'production' ? 'dist' : 'dist',
});
