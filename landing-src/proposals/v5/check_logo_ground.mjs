// Which ground does each homepage sponsor logo actually need?
//
// The Sponsors component carries a comment saying Advanced Prosthetics is LIGHT artwork that
// would vanish on the white chips the others use, which is why it rides straight on the dark
// panel. That mixed-ground row is the reason the outer chips exist at all -- they are what makes
// five white plates and one bare logo read as one object. So before deboxing that row I need to
// know if the comment is still true of the file that is actually served.
//
// Measures mean brightness of the INK only (alpha > 128), the same test used for the /sponsors/
// chips. > 140 means it needs a dark ground; < 140 means it is safe on white.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const U = "https://santafehalfmarathon.com/wp-content/uploads/";
const LOGOS = {
  "Advanced Prosthetics": U + "2026/08/advanced-prosthetics-orthotics-logo.avif",
  "Arts & Culture":       U + "2026/02/2023-Arts-Culture-logo-no-background-new-300x86.webp",
  "Santa Fe County":      U + "2026/02/Santa-Fe-County-logo-e1771703956228.webp",
  "Nuckolls":             U + "2026/08/nuckolls-brewing-logo-300x272.avif",
  "The Running Hub":      U + "2026/08/running-hub-santa-fe-logo.png",
  "NAHN":                 U + "2026/09/nahn-enchantment-chapter-nm-logo.jpg",
};

const sleep = ms => new Promise(r => setTimeout(r, ms));
const profile = mkdtempSync(join(tmpdir(), "ground-"));
const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe",
  ["--headless=new", "--disable-gpu", "--no-first-run",
   "--remote-debugging-port=9427", `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
let url;
for (let i = 0; i < 80; i++) {
  try { const l = await (await fetch("http://127.0.0.1:9427/json/list")).json();
    const p = l.find(t => t.type === "page"); if (p) { url = p.webSocketDebuggerUrl; break; } } catch {}
  await sleep(250);
}
const ws = new WebSocket(url);
await new Promise((a, b) => { ws.onopen = a; ws.onerror = b; });
let seq = 0; const pend = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (m, p = {}) => new Promise(r => { const i = ++seq; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })); });

try {
  await send("Runtime.enable");
  await send("Page.navigate", { url: "https://santafehalfmarathon.com/" });
  await sleep(4000);
  const expr = `
    (async () => {
      const logos = ${JSON.stringify(LOGOS)};
      const out = [];
      for (const [name, src] of Object.entries(logos)) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = src;
          await img.decode();
          const c = document.createElement("canvas");
          c.width = img.naturalWidth; c.height = img.naturalHeight;
          const g = c.getContext("2d");
          g.drawImage(img, 0, 0);
          const d = g.getImageData(0, 0, c.width, c.height).data;
          let sum = 0, n = 0, opaque = 0;
          for (let i = 0; i < d.length; i += 4) {
            if (d[i+3] > 128) { sum += 0.2126*d[i] + 0.7152*d[i+1] + 0.0722*d[i+2]; n++; }
            if (d[i+3] > 250) opaque++;
          }
          out.push({ name, size: c.width + "x" + c.height,
                     mean: n ? Math.round(sum/n) : null,
                     transparency: Math.round(100 - (opaque / (d.length/4)) * 100) + "%" });
        } catch (e) { out.push({ name, error: String(e).slice(0, 60) }); }
      }
      return out;
    })()
  `;
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  const rows = r.result?.result?.value;
  if (!rows) { console.log("PROBE THREW:", JSON.stringify(r.result?.exceptionDetails || r).slice(0, 400)); }
  else {
    console.log("logo".padEnd(24) + "size".padEnd(12) + "transp".padEnd(9) + "ink mean   needs");
    console.log("-".repeat(72));
    for (const x of rows) {
      if (x.error) { console.log(`${x.name.padEnd(24)}ERROR: ${x.error}`); continue; }
      const needs = x.mean === null ? "?" : (x.mean > 140 ? "DARK ground" : "safe on white");
      console.log(`${x.name.padEnd(24)}${x.size.padEnd(12)}${x.transparency.padEnd(9)}${String(x.mean).padEnd(11)}${needs}`);
    }
  }
} finally {
  ws.close(); chrome.kill(); await sleep(400);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
