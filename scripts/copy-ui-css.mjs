import { copyFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const components = [
  "button",
  "button-group",
  "checkbox",
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

function copyRootCss(name) {
  const src = join(root, "ui-components", name);
  const dest = join(outDir, name);
  copyFileSync(src, dest);
  console.log(`  ${name} → dist/ui-components/${name}`);
}

copyRootCss("vars.css");
copyRootCss("margin.css");

for (const name of components) {
  const src = join(root, "ui-components", name, `${name}.component.css`);
  const dest = join(outDir, `${name}.css`);
  copyFileSync(src, dest);
  console.log(`  ${name}.component.css → dist/ui-components/${name}.css`);
}
