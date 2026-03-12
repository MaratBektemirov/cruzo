import { copyFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const components = [
  "button-group",
  "input",
  "modal",
  "select",
  "spinner",
  "upload",
];

const outDir = join(root, "dist", "ui-components");
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

for (const name of components) {
  const src = join(root, "ui-components", name, `${name}.component.css`);
  const dest = join(outDir, `${name}.css`);
  copyFileSync(src, dest);
  console.log(`  ${name}.component.css → dist/ui-components/${name}.css`);
}
