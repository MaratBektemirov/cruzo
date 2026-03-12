import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: "./lib/index.ts",
        utils: "./lib/utils.ts",
        "ui-components/input": "./ui-components/input/input.component.ts",
        "ui-components/button-group": "./ui-components/button-group/button-group.component.ts",
        "ui-components/router-link": "./ui-components/router-link/router-link.ts",
        "ui-components/select": "./ui-components/select/select.component.ts",
        "ui-components/spinner": "./ui-components/spinner/spinner.component.ts",
        "ui-components/upload": "./ui-components/upload/upload.component.ts",
        "ui-components/modal": "./ui-components/modal/modal.component.ts",
      },
      formats: ["es"],
    },
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: ["cruzo"],
      output: {
        entryFileNames: "[name].js",
        assetFileNames: "[name][extname]",
      },
    },
  },
});
