/** Build the app and publish it to the gh-pages branch for GitHub Pages.
 * Project pages are served from /<repo>/, so absolute /assets/ strings in the
 * compiled JavaScript are prefixed with that path. Source files are untouched.
 */
import { execSync } from "node:child_process";
import {
  cpSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const run = (cmd, cwd = root) => execSync(cmd, { cwd, stdio: "inherit" });
const out = (cmd) =>
  execSync(cmd, { cwd: root, encoding: "utf8" }).toString().trim();

const remote = out("git remote get-url origin");
const repo = remote.replace(/\.git$/, "").split("/").pop();
const owner = remote.replace(/\.git$/, "").split("/").slice(-2, -1)[0];
const base = `/${repo}/`;

run("npm run build");
const tmp = mkdtempSync(join(tmpdir(), "starchild-pages-"));
cpSync(join(root, "dist"), tmp, { recursive: true });
const assets = join(tmp, "assets");
for (const name of readdirSync(assets)) {
  if (!name.endsWith(".js")) continue;
  const file = join(assets, name);
  writeFileSync(
    file,
    readFileSync(file, "utf8").replaceAll('"/assets/', `"${base}assets/`),
  );
}
writeFileSync(join(tmp, ".nojekyll"), "");
run("git init -q -b gh-pages", tmp);
run("git add -A", tmp);
run('git commit -q -m "Deploy to GitHub Pages"', tmp);
run(`git push -f ${remote} gh-pages`, tmp);
rmSync(tmp, { recursive: true, force: true });
console.log(`Published. Site: https://${owner}.github.io${base}`);
