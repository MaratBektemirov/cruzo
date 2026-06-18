import { readdirSync, rmSync, statSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const sourceRoots = ["lib", "ui-components"];

function cleanDir(dir) {
  let removed = 0;

  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      removed += cleanDir(path);
      continue;
    }

    if (entry.endsWith(".d.ts") || entry.endsWith(".d.ts.map")) {
      rmSync(path);
      removed += 1;
    }
  }

  return removed;
}

let total = 0;

for (const sourceRoot of sourceRoots) {
  const dir = join(root, sourceRoot);
  total += cleanDir(dir);
}

if (total > 0) {
  console.log(`Removed ${total} stray declaration file(s) from lib/ and ui-components/`);
}
