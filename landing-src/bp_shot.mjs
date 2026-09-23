// Screenshot a forced hero slide at a given viewport.
// usage: node bp_shot.mjs <artifact> <slideN> <w> <h> <out.png> <port>
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
const [, , FILE, N, W, H, OUT, PORT] = process.argv;
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"].find(existsSync);
const CDN = "https://santafehalfmarathon.com/wp-content/uploads/2026/09/";
let frag = readFileSync(FILE, "utf8")
  .split("%%IMG_HERO%%").join(CDN + "sfi-2026-landing-startline.jpg")
  .split("%%IMG_ADVANCED%%").join(CDN + "sfhm-sponsor-advanced-prosthetics-logo.png")
  .replace(/%%IMG_[A-Z]+%%/g, CDN + "x.png");
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"></head><body>
<div id="root"></div>${frag}</body></html>`;
const srv = createServer((q, r) => { r.writeHead(200, { "content-type": "text/html; charset=utf-8" }); r.end(html); });
await new Promise((ok) => srv.listen(Number(PORT), "127.0.0.1", ok));
await new Promise((done) => {
  const p = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
    `--window-size=${W},${H}`, "--virtual-time-budget=12000", "--run-all-compositor-stages-before-draw",
    `--screenshot=${OUT}`, `http://127.0.0.1:${PORT}/?heroslide=${N}`], { windowsHide: true });
  p.on("close", done);
});
srv.close();
console.log(`slide ${N} @ ${W}x${H} -> ${OUT}`);
