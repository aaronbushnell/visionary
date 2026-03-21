/**
 * Renders icon.svg → 1024×1024 PNG, then runs `tauri icon` to produce all sizes.
 * Usage: node scripts/generate-icons.mjs
 */
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = resolve(root, "src-tauri/icons/icon.svg");
const pngPath = resolve(root, "src-tauri/icons/app-icon.png");

const svg = readFileSync(svgPath);
const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1024 } });
const png = resvg.render().asPng();
writeFileSync(pngPath, png);
console.log("✓ Rendered icon.svg → app-icon.png (1024×1024)");

execSync(`node_modules/.bin/tauri icon "${pngPath}"`, {
  stdio: "inherit",
  cwd: root,
});
console.log("✓ All icon sizes generated in src-tauri/icons/");
