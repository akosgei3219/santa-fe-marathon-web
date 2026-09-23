// Phase 2 "Box and Border Hunt", counted rather than eyeballed.
// Counts elements that read as a CARD: a visible background fill, a visible border, or a
// drop shadow, on a container that holds text. Reports them grouped by section so the debox
// work can be aimed at the worst offenders instead of applied blindly.
// usage: node count_boxes.mjs
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const page = readFileSync(join(HERE, "preview.html"), "utf8");
const srv = createServer((_, r) => { r.writeHead(200, { "Content-Type": "text/html" }); r.end(page); });
await new Promise(r => srv.listen(8153, r));
const profile = mkdtempSync(join(tmpdir(), "v5b-"));
const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe",
  ["--headless=new", "--disable-gpu", "--no-first-run", "--hide-scrollbars",
   "--remote-debugging-port=9417", `--user-data-dir=${profile}`, "--window-size=1440,1000", "about:blank"], { stdio: "ignore" });
let url;
for (let i = 0; i < 80; i++) {
  try { const l = await (await fetch("http://127.0.0.1:9417/json/list")).json();
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
  await send("Page.navigate", { url: "http://127.0.0.1:8153/" });
  await sleep(7000);
  const max = await ev("document.body.scrollHeight");
  for (let y = 0; y <= max; y += 700) { await ev(`window.scrollTo(0,${y});1`); await sleep(100); }
  await ev(`document.querySelectorAll("#root section,#root header,#root aside,#root div").forEach(e=>{e.style.contentVisibility="visible"});1`);
  await sleep(900);

  const out = await ev(`(()=>{
    const solid = c => { const m=(c||"").match(/[0-9.]+/g); if(!m) return false;
      if(m.length>3 && parseFloat(m[3])<0.03) return false; return c!=="transparent"; };
    const rows=[];
    document.querySelectorAll("#root *").forEach(el=>{
      const s=getComputedStyle(el);
      const hasText=(el.textContent||"").trim().length>0;
      if(!hasText) return;
      const r=el.getBoundingClientRect();
      if(r.width<40||r.height<24) return;
      // A CARD is a fill, a full frame, or a shadow -- text trapped in a geometric container.
      // A single border edge is a RULE, which is the deboxed treatment, not the problem.
      // Counting them together inflates the number and makes finished work look unfinished.
      const bg=solid(s.backgroundColor);
      const bw=["Top","Right","Bottom","Left"].map(k=>parseFloat(s["border"+k+"Width"])||0);
      const edges=bw.filter(v=>v>0).length;
      const framed=edges>=3&&solid(s.borderTopColor||s.borderColor);
      const shadow=s.boxShadow&&s.boxShadow!=="none";
      const isCard=bg||framed||shadow;
      if(!isCard){ if(edges>0&&edges<3) window.__rules=(window.__rules||0)+1; return; }
      // only count the OUTERMOST boxed element in a chain, so one card is not counted 4x
      let p=el.parentElement, nested=false;
      while(p&&p.id!=="root"){ const ps=getComputedStyle(p);
        if(solid(ps.backgroundColor)&&ps.backgroundColor===s.backgroundColor){nested=true;break;} p=p.parentElement; }
      if(nested) return;
      let sec=el.closest("section,header,aside");
      rows.push({sec:(sec&&(sec.id||sec.className.split(" ")[0]))||"(page)",
        tag:el.tagName.toLowerCase()+(el.className?"."+String(el.className).split(" ")[0]:""),
        bg:bg?s.backgroundColor:"", border:framed?bw.join("/"):"", shadow:shadow?"yes":"",
        radius:s.borderRadius});
    });
    const bySec={};
    rows.forEach(r=>{bySec[r.sec]=(bySec[r.sec]||0)+1});
    return {total:rows.length, rules:(window.__rules||0), bySec};
  })()`);
  if (!out) { console.log("probe returned nothing -- it threw inside the page"); }
  else {
    console.log(`CARDS  (fill / full frame / shadow, text trapped inside): ${out.total}`);
    console.log(`RULES  (single hairline edge -- this is the deboxed treatment): ${out.rules}`);
    console.log("\ncards by section:");
    Object.entries(out.bySec).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
      console.log(`  ${String(v).padStart(3)}  ${k}`);
    });
  }
} finally {
  ws.close(); chrome.kill(); srv.close(); await sleep(500);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
