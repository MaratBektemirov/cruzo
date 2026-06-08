import { build } from "vite";
import { gzipSync } from "node:zlib";
import { readFileSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, ".tree-shake-out");

const scenarios = [
  {
    name: "template-only",
    code: `import { Template } from "cruzo";\nconsole.log(Template);\n`,
  },
  {
    name: "template+component",
    code: `import { Template, AbstractComponent } from "cruzo";\nconsole.log(Template, AbstractComponent);\n`,
  },
  {
    name: "full-core",
    code: `import {
  Template,
  AbstractComponent,
  AbstractService,
  HttpClient,
  routerService,
  RxBucket,
  Rx,
  componentsRegistryService,
} from "cruzo";\nconsole.log(Template, routerService, HttpClient);\n`,
  },
];

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const scenario of scenarios) {
  const entry = resolve(outDir, `${scenario.name}.mjs`);
  const scenarioOut = resolve(outDir, scenario.name);
  mkdirSync(scenarioOut, { recursive: true });
  writeFileSync(entry, scenario.code);

  await build({
    configFile: false,
    logLevel: "error",
    build: {
      outDir: scenarioOut,
      emptyOutDir: true,
      minify: "esbuild",
      rollupOptions: {
        input: entry,
        output: { format: "es", entryFileNames: "bundle.js" },
      },
    },
    resolve: {
      alias: { cruzo: resolve(root, "dist/index.js") },
    },
  });

  const bundlePath = resolve(scenarioOut, "bundle.js");
  const raw = readFileSync(bundlePath);
  const gzip = gzipSync(raw);
  console.log(
    `${scenario.name}: ${(raw.length / 1024).toFixed(1)} KB min / ${(gzip.length / 1024).toFixed(1)} KB gzip`,
  );
}

