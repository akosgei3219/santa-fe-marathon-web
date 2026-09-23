// Render an artifact fragment headlessly and dump the resulting DOM.
// usage: node bp_dom.mjs <artifact.html> <out.dom.html> <port>
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
const [, , FILE, OUT, PORT] = process.argv;
const CHROMES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
];
const CHROME = CHROMES.find((p) => existsSync(p));
if (!CHROME) throw new Error("no chrome");
const CDN = "https://santafehalfmarathon.com/wp-content/uploads/2026/09/";
let frag = readFileSync(FILE, "utf8")
  .split("%%IMG_HERO%%").join(CDN + "sfi-2026-landing-startline.jpg")
  .split("%%IMG_ADVANCED%%").join(CDN + "sfhm-sponsor-advanced-prosthetics-logo.png");
// remaining %%IMG_*%% tokens -> harmless placeholder so they can't change layout
frag = frag.replace(/%%IMG_[A-Z]+%%/g, CDN + "x.png");
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"></head><body>
<div id="root"></div>${frag}</body></html>`;
const srv = createServer((q, r) => { r.writeHead(200, { "content-type": "text/html; charset=utf-8" }); r.end(html); });
await new Promise((ok) => srv.listen(Number(PORT), "127.0.0.1", ok));
const args = ["--headless=new", "--disable-gpu", "--no-sandbox", "--virtual-time-budget=9000",
  "--run-all-compositor-stages-before-draw", "--dump-dom", `http://127.0.0.1:${PORT}/`];
const dom = await new Promise((done) => {
  const p = spawn(CHROME, args, { windowsHide: true });
  let o = ""; p.stdout.on("data", (d) => (o += d)); p.on("close", () => done(o));
});
srv.close();
writeFileSync(OUT, dom);
console.log(`${FILE} -> ${OUT}  ${dom.length} chars`);
