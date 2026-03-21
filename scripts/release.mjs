#!/usr/bin/env node
import readline from "readline/promises";
import { execSync, spawnSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const suggestedTag = `v${pkg.version}`;

const APP_PATH = join(root, "src-tauri/target/release/bundle/macos/Visionary.app");
const ZIP_PATH = join(root, "src-tauri/target/release/bundle/macos/Visionary-mac.zip");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const rawTag = await rl.question(`Tag [${suggestedTag}]: `);
const tag = rawTag.trim() || suggestedTag;
const notes = await rl.question("Release notes (optional): ");
rl.close();

console.log(`\nReleasing ${tag}${notes ? ` — "${notes}"` : ""}\n`);

const run = (cmd) => {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: root });
};

// 1. Build
run("npm run build");

// 2. Archive (.app symlinks must be preserved)
if (!existsSync(APP_PATH)) {
  console.error(`\nBuild succeeded but .app not found at:\n  ${APP_PATH}`);
  process.exit(1);
}
execSync(`zip -r --symlinks "${ZIP_PATH}" Visionary.app`, {
  stdio: "inherit",
  cwd: join(root, "src-tauri/target/release/bundle/macos"),
});

// 3. Tag + push
run(`git tag ${tag}`);
run(`git push origin ${tag}`);

// 4. GitHub release (spawnSync avoids shell-quoting issues with notes)
console.log(`> gh release create ${tag} ...`);
const result = spawnSync(
  "gh",
  ["release", "create", tag, ZIP_PATH, "--title", tag, "--notes", notes || ""],
  { stdio: "inherit", cwd: root }
);
if (result.status !== 0) process.exit(result.status ?? 1);

const remote = execSync("git remote get-url origin", { cwd: root }).toString().trim();
const slug = remote.replace(/.*github\.com[:/]/, "").replace(/\.git$/, "");
console.log(`\nDone! https://github.com/${slug}/releases/tag/${tag}`);
