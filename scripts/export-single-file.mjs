/** Build the exact product components into a no-install HTML preview.
 * Only resource paths change in the compiled preview: images become data URLs.
 * Product source files are not modified. Typography loads from Google Fonts
 * when online and falls back to local sans-serif when offline.
 */
import { build } from "esbuild";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { resolve, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const assets = resolve(root, "public/assets");
const mime = {
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};
const replacements = [];
for (const name of (await readdir(assets, { recursive: true })).map((n) =>
  n.split("\\").join("/"),
)) {
  const contentType = mime[extname(name)];
  if (!contentType) continue;
  const bytes = await readFile(resolve(assets, name));
  replacements.push([
    `/assets/${name}`,
    `data:${contentType};base64,${bytes.toString("base64")}`,
  ]);
}
const result = await build({
  absWorkingDir: root,
  entryPoints: ["src/standalone.tsx"],
  bundle: true,
  write: false,
  format: "iife",
  platform: "browser",
  target: ["es2022"],
  jsx: "automatic",
  minify: true,
  legalComments: "inline",
  define: { "process.env.NODE_ENV": '"production"' },
  plugins: [
    {
      name: "embed-product-assets",
      setup(b) {
        b.onLoad({ filter: /\.(?:tsx|ts)$/ }, async (args) => {
          if (args.path.includes("node_modules")) return;
          let contents = await readFile(args.path, "utf8");
          for (const [from, to] of replacements)
            contents = contents.split(from).join(to);
          return {
            contents,
            loader: args.path.endsWith(".tsx") ? "tsx" : "ts",
          };
        });
      },
    },
  ],
});
const cssNames = [
  "base.css",
  "landing.css",
  "mascot.css",
  "workspace.css",
  "extras.css",
  "companion.css",
  "responsive.css",
];
let css = await readFile(
  resolve(root, "node_modules/tailwindcss/preflight.css"),
  "utf8",
);
for (const name of cssNames)
  css +=
    "\n" +
    (await readFile(resolve(root, "src/starchild", name), "utf8")).replace(
      /^@import url\([^\n]+\);\s*/gm,
      "",
    );
const fontUrl =
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap";
const icon =
  replacements.find(([from]) => from === "/assets/favicon.svg")?.[1] || "";
const js = result.outputFiles[0].text.replaceAll("</script", "<\\/script");
const html = `<!doctype html>\n<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><meta name="robots" content="noindex,nofollow"/><title>Starchild</title><link rel="icon" href="${icon}"/><link rel="stylesheet" href="${fontUrl}"/><style>${css}</style></head><body><div id="root"></div><noscript>This interactive prototype needs JavaScript enabled. No account or installation is required.</noscript><script>${js}</script></body></html>`;
const output = process.env.OUT || resolve(root, "../OPEN_IN_BROWSER.html");
await writeFile(output, html);
console.log(
  `Wrote ${output} (${Math.round(Buffer.byteLength(html) / 1024)} KB). All product images and app scripts are embedded.`,
);
