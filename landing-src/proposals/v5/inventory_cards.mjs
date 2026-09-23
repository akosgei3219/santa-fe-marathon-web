// Inventory EVERY remaining card in the v5 preview -- what it is, which section it sits in (named
// by its HEADING, not its first CSS class), what makes it a card, and whether it is interactive.
//
// Written because count_boxes.mjs names sections by `id || className.split(" ")[0]`, so a section
// without an id shows up as "py-16" or "pb-16". Those 22 cards were described to Kosgei as
// "section wrappers, not cards" without ever being looked at. That was a guess reported as fact.
// This replaces the guess with a list.
//
// usage: node inventory_cards.mjs
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
await new Promise(r => srv.listen(8161, r));
const profile = mkdtempSync(join(tmpdir(), "v5i-"));
const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe",
  ["--headless=new", "--disable-gpu", "--no-first-run", "--hide-scrollbars",
   "--remote-debugging-port=9431", `--user-data-dir=${profile}`, "--window-size=1440,1000", "about:blank"],
  { stdio: "ignore" });
let url;
for (let i = 0; i < 80; i++) {
  try { const l = await (await fetch("http://127.0.0.1:9431/json/list")).json();
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
  await send("Page.navigate", { url: "http://127.0.0.1:8161/" });
  await sleep(7000);
  const max = await ev("document.body.scrollHeight");
  for (let y = 0; y <= max; y += 700) { await ev(`window.scrollTo(0,${y});1`); await sleep(100); }
  await ev(`document.querySelectorAll("#root section,#root header,#root aside,#root div,#root nav,#root footer").forEach(e=>{e.style.contentVisibility="visible"});1`);
  await sleep(900);

  const rows = await ev(`(()=>{
    const solid=c=>{const m=(c||"").match(/[0-9.]+/g);if(!m)return false;
      if(m.length>3&&parseFloat(m[3])<0.03)return false;return c!=="transparent"};
    const out=[];
    document.querySelectorAll("#root *").forEach(el=>{
      if(!(el.textContent||"").trim())return;
      const s=getComputedStyle(el),r=el.getBoundingClientRect();
      if(r.width<40||r.height<24)return;
      const bg=solid(s.backgroundColor);
      const bw=["Top","Right","Bottom","Left"].map(k=>parseFloat(s["border"+k+"Width"])||0);
      const framed=bw.filter(v=>v>0).length>=3&&solid(s.borderTopColor);
      const shadow=s.boxShadow&&s.boxShadow!=="none";
      if(!(bg||framed||shadow))return;
      let p=el.parentElement,nested=false;
      while(p&&p.id!=="root"){const ps=getComputedStyle(p);
        if(solid(ps.backgroundColor)&&ps.backgroundColor===s.backgroundColor){nested=true;break}p=p.parentElement}
      if(nested)return;
      // name the section by its heading, falling back to id, then to the first class
      const sec=el.closest("section,header,aside,nav,footer");
      let secName="(no section)";
      if(sec){const h=sec.querySelector("h1,h2,h3");
        secName=(h?h.textContent.trim().slice(0,34):"")||sec.id||String(sec.className).split(" ")[0]||sec.tagName.toLowerCase();}
      const isSectionItself = el===sec;
      const interactive = el.matches("a,button,[role=button],summary,input,select,label") ||
                          !!el.closest("a,button,summary");
      const kind = isSectionItself ? "SECTION GROUND"
                 : interactive ? "BUTTON/LINK"
                 : el.querySelector("img")&&!(el.textContent||"").replace(/\\s/g,"").length ? "LOGO PLATE"
                 : el.querySelector("img")&&el.children.length<=2 ? "LOGO PLATE"
                 : "TEXT CARD";
      out.push({sec:secName, kind, tag:el.tagName.toLowerCase(),
        cls:String(el.className||"").split(" ").slice(0,3).join(" "),
        why:[bg?"fill":"",framed?"frame":"",shadow?"shadow":""].filter(Boolean).join("+"),
        text:(el.textContent||"").replace(/\\s+/g," ").trim().slice(0,46)});
    });
    return out;
  })()`);

  const bySec = {};
  for (const r of rows) (bySec[r.sec] ||= []).push(r);
  const tally = {};
  for (const r of rows) tally[r.kind] = (tally[r.kind] || 0) + 1;
  console.log(`TOTAL ${rows.length}   ` + Object.entries(tally).map(([k, v]) => `${k}: ${v}`).join("   ") + "\n");
  for (const [sec, list] of Object.entries(bySec).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`== ${sec}  (${list.length})`);
    for (const r of list) {
      console.log(`   ${r.kind.padEnd(15)} ${r.why.padEnd(18)} <${r.tag}.${r.cls.slice(0, 34)}>  "${r.text}"`);
    }
  }
} finally {
  ws.close(); chrome.kill(); srv.close(); await sleep(500);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
