import { defineConfig } from "vite";

export default defineConfig({
  css: {
    modules: {
      localsConvention: "camelCase",
      generateScopedName: "[name]__[local]___[hash:base64:5]",
    },
  },
  build: {
    lib: {
      entry: {
        index: "./index.ts",
        utils: "./utils.ts",
        input: "./ui-components/input/input.component.ts",
        "button-group": "./ui-components/button-group/button-group.component.ts",
        select: "./ui-components/select/select.component.ts",
        upload: "./ui-components/upload/upload.component.ts",
        "router-link": "./ui-components/router-link/router-link.ts",
      },
      name: "Cruzo",
      formats: ["es"],
    },
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: ["cruzo", "cruzo/utils"],
      output: {
        entryFileNames: "[name].js",
        assetFileNames: "[name][extname]",
      },
    },
  },
});
