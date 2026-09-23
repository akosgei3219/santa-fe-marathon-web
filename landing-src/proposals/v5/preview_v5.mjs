// Serve the v5 artifact locally and screenshot the hero.
//
// The artifact is a FRAGMENT: it starts at <title> with no doctype, no <html>, no <body> and no
// #root div -- WordPress supplies those. Opening it directly renders nothing, so wrap it first.
// It is served over http rather than file:// because the page pulls React from a CDN and photos
// from santafehalfmarathon.com, and file:// origins make that inconsistent.
//
// usage: node preview_v5.mjs [outPrefix]
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PREFIX = process.argv[2] || "v5-hero";
const PORT = 8147;
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Image tokens are filled the way recreate-wp-page.js does before a deploy.
const U = "https://santafehalfmarathon.com/wp-content/uploads/";
const TOKENS = {
  "%%IMG_HERO%%": U + "2026/09/sfi-2026-hero-big-sky.jpg",
  "%%IMG_ARCH%%": U + "2026/09/sfhm-hero-2025-start-arch.jpg",
  "%%IMG_ROUTE%%": U + "2026/09/sfhm-hero-2025-on-course.jpg",
  "%%IMG_PODIUM%%": U + "2026/09/sfhm-hero-2025-race-morning.jpg",
  "%%IMG_TRICIA%%": U + "2026/09/sfhm-hero-2025-start-tricia.jpg",
  "%%IMG_LOGO%%": U + "2026/09/sfi-2026-landing-logo-300x300.png",
  "%%IMG_CAPITOL%%": U + "2026/02/Capitol-Ford_logo_round_2024-500KB-e1771703812895.webp",
  "%%IMG_ECON%%": U + "2026/02/2023-Economic-Development-Logo-1-e1771704027372.webp",
  "%%IMG_JIRANI%%": U + "2026/02/jirani-logo-e1771703855425.webp",
  "%%IMG_ARTS%%": U + "2026/02/2023-Arts-Culture-logo-no-background-new-300x86.webp",
  "%%IMG_COUNTY%%": U + "2026/02/Santa-Fe-County-logo-e1771703956228.webp",
  "%%IMG_NUCKOLLS%%": U + "2026/08/nuckolls-brewing-logo-300x272.avif",
  "%%IMG_RUNHUB%%": U + "2026/08/running-hub-santa-fe-logo.png",
};
let frag = readFileSync(join(HERE, "run-santa-fe-2026.prod.src.html"), "utf8");
for (const [k, v] of Object.entries(TOKENS)) frag = frag.split(k).join(v);

// %%IMG_ADVANCED%% must be filled exactly as the deploy fills it, or this is not a preview.
// 2026-09-22: the deploy stopped inlining a base64 WEBP and made this an ordinary urlMap
// entry pointing at a right-sized PNG, so the preview follows. Keep it a PNG: an earlier
// attempt to substitute the media-library AVIF left the sixth Community Partners chip
// visibly EMPTY (Chrome rejects that file with an EncodingError), which also broke the
// logo-ground measurement the mixed-ground decision depends on.
frag = frag.split("%%IMG_ADVANCED%%").join(
  U + "2026/09/advanced-po-logo-300x93-1.png");
const missing = frag.match(/%%[A-Z_]+%%/g);
if (missing) console.log("unfilled tokens:", [...new Set(missing)].join(", "));

const page = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${frag.slice(0, frag.indexOf("<div id=\"root\">"))}
</head><body class="home">
${frag.slice(frag.indexOf("<div id=\"root\">"))}
</body></html>`;
writeFileSync(join(HERE, "preview.html"), page);

const server = createServer((_, res) => { res.writeHead(200, { "Content-Type": "text/html" }); res.end(page); });
await new Promise(r => server.listen(PORT, r));

const profile = mkdtempSync(join(tmpdir(), "v5-"));
const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run", "--hide-scrollbars",
  `--remote-debugging-port=9411`, `--user-data-dir=${profile}`, "--window-size=1440,1000", "about:blank"], { stdio: "ignore" });

async function sock() {
  for (let i = 0; i < 80; i++) {
    try {
      const l = await (await fetch("http://127.0.0.1:9411/json/list")).json();
      const p = l.find(t => t.type === "page");
      if (p) return p.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("no chrome target");
}
const ws = new WebSocket(await sock());
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let seq = 0; const pend = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (m, p = {}) => new Promise(r => { const i = ++seq; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
const ev = async x => (await send("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true })).result?.result?.value;

try {
  await send("Page.enable"); await send("Runtime.enable");
  for (const [label, w, h, mobile] of [["desktop", 1440, 1000, false], ["phone", 390, 844, true]]) {
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: mobile ? 2 : 1, mobile });
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/` });
    await sleep(7000);
    if (label === "desktop") {
      const info = await ev(`(()=>{
        const q=s=>document.querySelector(s);
        const box=q(".hero3-copy"), cta=q(".hero3 a.hero-cta");
        return {
          mounted: !!q("#root .hero3"),
          heroChildren: [...(q(".hero3-copy")||{children:[]}).children].map(e=>e.tagName.toLowerCase()+"."+(e.className||"").split(" ")[0]),
          badgesInHero: document.querySelectorAll(".hero3 .hero-badges").length,
          ctasInHero: document.querySelectorAll(".hero3 a.hero-cta").length,
          ctaLabel: cta?cta.textContent.trim():null,
          subLine: (q(".hero3-date")||{}).textContent,
          presented: (q(".hero3-presented")||{}).textContent,
          factsBand: document.querySelectorAll(".hero-facts .hf-item").length,
          grainOn: getComputedStyle(q(".hero3"),"::after").backgroundImage.slice(0,24),
          copyBg: box?getComputedStyle(box).backgroundColor:null,
        };
      })()`);
      console.log(JSON.stringify(info, null, 2));
    }
    const shot = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(join(HERE, `${PREFIX}-${label}.png`), Buffer.from(shot.result.data, "base64"));
    console.log("wrote", `${PREFIX}-${label}.png`);
  }
} finally {
  ws.close(); chrome.kill(); server.close(); await sleep(500);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
