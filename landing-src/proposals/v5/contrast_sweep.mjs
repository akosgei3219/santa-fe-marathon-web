// Measure the rendered contrast of every text element in the given v5 sections.
//
// Why a measurement and not a guard: patch 11 checked the Concept block's JSX for light colour
// tokens and PASSED, while the phone number rendered near-invisible -- a stylesheet rule
// `a.lodge-phone{color:var(--panel-fg)!important}` overrode the inline colour. Guards read the
// source; only getComputedStyle reads what the browser actually paints.
//
// Forces content-visibility:visible and scrolls first: unpainted below-fold sections under
// content-visibility:auto report garbage (the 26 bogus contrast failures earlier this week).
//
// usage: node contrast_sweep.mjs <selector> [<selector> ...]
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SELS = process.argv.slice(2);
if (!SELS.length) { console.error("usage: node contrast_sweep.mjs <selector>..."); process.exit(1); }
const HERE = dirname(fileURLToPath(import.meta.url));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const page = readFileSync(join(HERE, "preview.html"), "utf8");
const srv = createServer((_, r) => { r.writeHead(200, { "Content-Type": "text/html" }); r.end(page); });
await new Promise(r => srv.listen(8163, r));
const profile = mkdtempSync(join(tmpdir(), "v5c-"));
const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe",
  ["--headless=new", "--disable-gpu", "--no-first-run", "--hide-scrollbars",
   "--remote-debugging-port=9433", `--user-data-dir=${profile}`, "--window-size=1440,1000", "about:blank"],
  { stdio: "ignore" });
let url;
for (let i = 0; i < 80; i++) {
  try { const l = await (await fetch("http://127.0.0.1:9433/json/list")).json();
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
  await send("Page.navigate", { url: "http://127.0.0.1:8163/" });
  await sleep(7000);
  const max = await ev("document.body.scrollHeight");
  for (let y = 0; y <= max; y += 700) { await ev(`window.scrollTo(0,${y});1`); await sleep(100); }
  await ev(`document.querySelectorAll("#root section,#root header,#root aside,#root div").forEach(e=>{e.style.contentVisibility="visible"});1`);
  await sleep(800);

  const out = await ev(`(()=>{
    const rgb=c=>{const m=(c||"").match(/[0-9.]+/g);return m?m.slice(0,4).map(Number):null};
    const L=([r,g,b])=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};
      return .2126*f(r)+.7152*f(g)+.0722*f(b)};
    const ratio=(a,b)=>{const x=L(a),y=L(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
    const bgOf=el=>{let n=el;while(n&&n!==document.documentElement){const c=rgb(getComputedStyle(n).backgroundColor);
      if(c&&(c.length<4||c[3]>.5))return c;n=n.parentElement}return [255,255,255]};
    const res=[];
    for(const sel of ${JSON.stringify(SELS)}){
      const sec=document.querySelector(sel); if(!sec){res.push({sel,missing:true});continue}
      const seen=new Set();
      sec.querySelectorAll("*").forEach(el=>{
        const own=[...el.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim()).map(n=>n.textContent.trim()).join(" ");
        if(!own||seen.has(el))return; seen.add(el);
        const s=getComputedStyle(el); if(s.visibility==="hidden"||s.display==="none")return;
        const fg=rgb(s.color), bg=bgOf(el); if(!fg)return;
        const px=parseFloat(s.fontSize), bold=parseInt(s.fontWeight)>=700;
        const large=px>=24||(px>=18.66&&bold);
        const r=ratio(fg,bg), need=large?3:4.5;
        res.push({sel,text:own.slice(0,40),ratio:+r.toFixed(2),need,fail:r<need});
      });
    }
    return res;
  })()`);

  for (const sel of SELS) {
    const rows = out.filter(r => r.sel === sel);
    if (rows[0]?.missing) { console.log(`== ${sel}: NOT FOUND`); continue; }
    const fails = rows.filter(r => r.fail);
    const min = rows.reduce((m, r) => Math.min(m, r.ratio), 99);
    console.log(`== ${sel}   ${rows.length} text elements   lowest ${min}:1   failures: ${fails.length}`);
    for (const f of fails) console.log(`   FAIL ${String(f.ratio).padStart(5)}:1 (needs ${f.need})  "${f.text}"`);
  }
} finally {
  ws.close(); chrome.kill(); srv.close(); await sleep(500);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
