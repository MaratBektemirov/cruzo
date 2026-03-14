import { writeFileSync, renameSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = join(__dirname, "..", "dist");

const content = `export { InputComponent, InputConfig } from "./input.js";
export { ButtonGroupComponent, ButtonGroupConfig } from "./button-group.js";
export { SelectComponent, SelectConfig } from "./select.js";
export { UploadComponent, UploadConfig } from "./upload.js";
export { RouterLinkComponent, RouterLinkConfig } from "./router-link.js";
`;

writeFileSync(join(dist, "ui-components.js"), content, "utf8");

const cruzoCss = join(dist, "cruzo.css");
if (existsSync(cruzoCss)) {
  renameSync(cruzoCss, join(dist, "select.css"));
}
