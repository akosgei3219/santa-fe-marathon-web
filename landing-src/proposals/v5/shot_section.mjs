// Screenshot one v5 section at desktop and phone, and report what it actually rendered.
// Replaces the earlier shot_voice.mjs / shot_story.mjs pair -- deriving one from the other with
// sed left a script that selected one section and measured another.
//
// usage: node shot_section.mjs <css-selector> <out-prefix>
//   node shot_section.mjs .voice-v5 v5-voice
//   node shot_section.mjs .story-v5 v5-story
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SEL = process.argv[2];
const PREFIX = process.argv[3];
if (!SEL || !PREFIX) { console.error("usage: node shot_section.mjs <selector> <prefix>"); process.exit(1); }

const HERE = dirname(fileURLToPath(import.meta.url));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const page = readFileSync(join(HERE, "preview.html"), "utf8");
const srv = createServer((_, r) => { r.writeHead(200, { "Content-Type": "text/html" }); r.end(page); });
await new Promise(r => srv.listen(8157, r));
const profile = mkdtempSync(join(tmpdir(), "v5s-"));
const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe",
  ["--headless=new", "--disable-gpu", "--no-first-run", "--hide-scrollbars",
   "--remote-debugging-port=9421", `--user-data-dir=${profile}`, "--window-size=1440,1000", "about:blank"],
  { stdio: "ignore" });
let url;
for (let i = 0; i < 80; i++) {
  try { const l = await (await fetch("http://127.0.0.1:9421/json/list")).json();
    const p = l.find(t => t.type === "page"); if (p) { url = p.webSocketDebuggerUrl; break; } } catch {}
  await sleep(250);
}
const ws = new WebSocket(url);
await new Promise((a, b) => { ws.onopen = a; ws.onerror = b; });
let seq = 0; const pend = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (m, p = {}) => new Promise(r => { const i = ++seq; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
const ev = async x => (await send("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true })).result?.result?.value;

try {
  await send("Page.enable"); await send("Runtime.enable");
  for (const [label, w, h, mobile] of [["desktop", 1440, 1000, false], ["phone", 390, 844, true]]) {
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: mobile ? 2 : 1, mobile });
    await send("Page.navigate", { url: "http://127.0.0.1:8157/" });
    await sleep(6500);
    const max = await ev("document.body.scrollHeight");
    for (let y = 0; y <= max; y += Math.round(h * 0.7)) { await ev(`window.scrollTo(0,${y});1`); await sleep(110); }
    await sleep(900);

    const box = await ev(`(()=>{
      const s=document.querySelector(${JSON.stringify(SEL)}); if(!s) return null;
      s.style.contentVisibility="visible";
      const imgs=[...s.querySelectorAll("img")];
      const grid=s.querySelector(".story-grid,.voice-cols");
      const r=s.getBoundingClientRect();
      const cs=el=>el?getComputedStyle(el):null;
      // Count boxed text containers inside THIS section (Phase 2 metric, section-scoped).
      const solid=c=>{const m=(c||"").match(/[0-9.]+/g);if(!m)return false;
        if(m.length>3&&parseFloat(m[3])<0.03)return false;return c!=="transparent"};
      let boxes=0;
      s.querySelectorAll("*").forEach(el=>{
        if(!(el.textContent||"").trim())return;
        const st=getComputedStyle(el),b=el.getBoundingClientRect();
        if(b.width<40||b.height<24)return;
        const bw=["Top","Right","Bottom","Left"].map(k=>parseFloat(st["border"+k+"Width"])||0);
        const framed=bw.filter(v=>v>0).length>=3&&solid(st.borderTopColor);
        if(solid(st.backgroundColor)||framed||(st.boxShadow&&st.boxShadow!=="none"))boxes++;
      });
      return {
        cols: grid?cs(grid).gridTemplateColumns:null,
        stagger: cs(s.querySelector(".story-side"))?.marginTop||null,
        langs: [...s.querySelectorAll("[lang]")].map(e=>e.getAttribute("lang")),
        imgs: imgs.map(i=>({shown:Math.round(i.getBoundingClientRect().width)+"x"+Math.round(i.getBoundingClientRect().height),
                            file:(i.currentSrc||i.src||"").split("/").pop(),
                            loaded:i.complete&&i.naturalWidth>0, natural:i.naturalWidth+"x"+i.naturalHeight})),
        boxedTextContainers: boxes,
        y: Math.round(r.top+scrollY), h: Math.round(r.height), w: Math.round(r.width),
      };
    })()`);
    if (!box) throw new Error("selector not found: " + SEL);
    if (label === "desktop") console.log(JSON.stringify(box, null, 2));
    const shot = await send("Page.captureScreenshot", {
      format: "png", captureBeyondViewport: true,
      clip: { x: 0, y: box.y, width: box.w, height: Math.min(box.h, 2600), scale: 1 },
    });
    writeFileSync(join(HERE, `${PREFIX}-${label}.png`), Buffer.from(shot.result.data, "base64"));
    console.log(`wrote ${PREFIX}-${label}.png  (${box.w}x${box.h})`);
  }
} finally {
  ws.close(); chrome.kill(); srv.close(); await sleep(500);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
