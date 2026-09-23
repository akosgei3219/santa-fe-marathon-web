// Verify the REAL pixel dimensions of the story photo's AVIF variants.
// WordPress names a variant by the size it was ASKED for, not necessarily what the optimizer
// produced -- the story probe reported a file called "768x512" decoding at 489px wide. If the
// variants are smaller than their names claim, the srcset width descriptors are lies and the
// browser will pick a file too small for the slot, which is the oversizing bug in reverse.
//
// Written to a file on purpose: the same check inline through the shell died on quote escaping.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const U = "https://santafehalfmarathon.com/wp-content/uploads/2026/09/";
const FILES = [
  "sfhm-hero-2025-on-course-300x200.avif",
  "sfhm-hero-2025-on-course-768x512.avif",
  "sfhm-hero-2025-on-course-1024x683.avif",
  "sfhm-hero-2025-on-course.avif",
];

const sleep = ms => new Promise(r => setTimeout(r, ms));
const profile = mkdtempSync(join(tmpdir(), "avif-"));
const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe",
  ["--headless=new", "--disable-gpu", "--no-first-run",
   "--remote-debugging-port=9425", `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
let url;
for (let i = 0; i < 80; i++) {
  try { const l = await (await fetch("http://127.0.0.1:9425/json/list")).json();
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
      const base = ${JSON.stringify(U)};
      const files = ${JSON.stringify(FILES)};
      const out = [];
      for (const f of files) {
        const img = new Image();
        img.src = base + f;
        try {
          await img.decode();
          out.push({ file: f, real: img.naturalWidth + "x" + img.naturalHeight });
        } catch (e) {
          out.push({ file: f, real: "DECODE FAILED" });
        }
      }
      return out;
    })()
  `;
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  const rows = r.result?.result?.value;
  if (!rows) { console.log("PROBE THREW:", JSON.stringify(r.result?.exceptionDetails || r, null, 2)); }
  else {
    console.log("file".padEnd(46) + "claimed      real");
    console.log("-".repeat(74));
    for (const row of rows) {
      const claim = (row.file.match(/-(\d+x\d+)\.avif$/) || [, "full"])[1];
      const bad = claim !== "full" && claim !== row.real;
      console.log(`${row.file.padEnd(46)}${claim.padEnd(13)}${row.real}${bad ? "   <-- MISMATCH" : ""}`);
    }
  }
} finally {
  ws.close(); chrome.kill(); await sleep(400);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
