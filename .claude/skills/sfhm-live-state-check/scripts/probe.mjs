#!/usr/bin/env node
// Read what a page ACTUALLY renders, across states, languages and viewport widths.
//
// The probe JavaScript lives in its own file and is sent to the page verbatim. That is the
// whole point of this script: every time this harness has been rewritten inline -- inside a
// template literal, inside a shell heredoc, inside a JSON tool argument -- an escaping layer
// has silently eaten a backslash and the probe returned confident nonsense. Two real examples
// from 2026-09-15:
//   * /\s+/ became /s+/ and deleted every lowercase "s" from the page text. The filter then
//     matched nothing, and three states reported "no copy found" on a page that was fine.
//   * "\t\r\n" inside a template literal expanded to real control characters, putting a raw
//     newline inside a regex literal. That is a SyntaxError, the evaluate returned no value,
//     and all three states reported "NO RESULT" -- indistinguishable from a page that failed
//     to mount.
// A probe file has exactly one layer: the file. Nothing rewrites it on the way in.
//
// usage:
//   node probe.mjs --probe <file.js> [options]
//
// options:
//   --url <base>        default https://santafehalfmarathon.com/
//   --states <list>     comma list of name=querystring, e.g. "open=,walkup=?regnow=1789862400000"
//                       default: just one unnamed state with no query string
//   --viewport <v>      desktop (1440x1000, default) | phone (390x844) | <W>x<H>
//   --scroll <px>       scroll down this far before probing (sticky bars mount on scroll)
//   --wait <ms>         settle time after navigation, default 5200
//   --json              emit raw JSON instead of the formatted report
//
// The probe file must evaluate to a single expression -- an IIFE returning a plain object is
// the easiest shape. Whatever it returns is printed per state.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf("--" + name);
  return i === -1 ? fallback : argv[i + 1];
};
const flag = name => argv.includes("--" + name);

const PROBE_FILE = arg("probe");
if (!PROBE_FILE) {
  console.error("need --probe <file.js>   (see probes/ for examples)");
  process.exit(1);
}
const PROBE = readFileSync(PROBE_FILE, "utf8");
const BASE = arg("url", "https://santafehalfmarathon.com/");
const WAIT = Number(arg("wait", 5200));
const SCROLL = Number(arg("scroll", 0));
const AS_JSON = flag("json");

const vp = arg("viewport", "desktop");
const VIEWPORT = vp === "phone" ? { width: 390, height: 844, mobile: true }
  : vp === "desktop" ? null
  : (() => { const m = vp.match(/^(\d+)x(\d+)$/); if (!m) { console.error("bad --viewport"); process.exit(1); }
             return { width: +m[1], height: +m[2], mobile: +m[1] < 768 }; })();

const STATES = (arg("states", "=") || "=").split(",").map(s => {
  const i = s.indexOf("=");
  return i === -1 ? [s || "(default)", ""] : [s.slice(0, i) || "(default)", s.slice(i + 1)];
});

const CHROME_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];
const { existsSync } = await import("node:fs");
const CHROME = CHROME_CANDIDATES.find(p => existsSync(p));
if (!CHROME) { console.error("no Chrome/Edge found; add its path to CHROME_CANDIDATES"); process.exit(1); }

const PORT = 9300 + Math.floor(Math.random() * 600);
const profile = mkdtempSync(join(tmpdir(), "probe-"));
const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
  "--hide-scrollbars", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  "--window-size=1440,1000", "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function socket() {
  for (let i = 0; i < 80; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find(t => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("Chrome never exposed a page target");
}

const ws = new WebSocket(await socket());
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let seq = 0;
const pending = new Map();
const consoleErrors = [];
// Track which resource failed, not just that one did. "Failed to load resource: 404" with no
// URL is unactionable -- it could be a missing hero image or a favicon, and you cannot tell
// whether it matters. Network.responseReceived carries the URL and the status.
const netFailures = [];
ws.onmessage = ev => {
  const m = JSON.parse(ev.data);
  if (m.method === "Log.entryAdded" && m.params.entry.level === "error") consoleErrors.push(m.params.entry.text);
  if (m.method === "Runtime.exceptionThrown") {
    const d = m.params.exceptionDetails;
    consoleErrors.push("page exception: " + ((d.exception && d.exception.description) || d.text));
  }
  if (m.method === "Network.responseReceived" && m.params.response && m.params.response.status >= 400) {
    netFailures.push(m.params.response.status + "  " + m.params.response.url);
  }
  if (m.method === "Network.loadingFailed") {
    netFailures.push("FAILED  " + (m.params.errorText || "") + "  " + (m.params.type || ""));
  }
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
const send = (method, params = {}) =>
  new Promise(res => { const i = ++seq; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

// Never swallow an evaluate failure. A thrown probe and a broken page look identical from the
// outside, and reporting "no result" for every state is exactly how a bad probe passes for a
// finding. Surface the exception text so the probe gets fixed instead of believed.
async function evaluate(expression) {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.result && r.result.exceptionDetails) {
    const e = r.result.exceptionDetails;
    return { __threw: (e.exception && e.exception.description) || e.text };
  }
  return r.result && r.result.result ? r.result.result.value : null;
}

const report = {};
try {
  await send("Log.enable");
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Network.enable");
  if (VIEWPORT) {
    await send("Emulation.setDeviceMetricsOverride",
      { width: VIEWPORT.width, height: VIEWPORT.height, deviceScaleFactor: 2, mobile: VIEWPORT.mobile });
  }

  for (const [name, qs] of STATES) {
    consoleErrors.length = 0;
    netFailures.length = 0;
    await send("Page.navigate", { url: BASE.replace(/\/$/, "/") + qs });
    await sleep(WAIT);
    // Step-scroll rather than jumping. A single scrollTo past a lazy-loaded image never brings
    // it into the viewport, so it never loads and the probe reports it as absent -- which reads
    // exactly like "this image is not on the page". Pass --scroll 0 to stay at the top.
    if (SCROLL) {
      const step = 700;
      for (let y = step; y <= SCROLL; y += step) {
        await evaluate(`window.scrollTo(0, ${y}); 1`);
        await sleep(160);
      }
      await sleep(1400);
    }
    const value = await evaluate(PROBE);
    report[name] = { value, consoleErrors: [...consoleErrors], netFailures: [...new Set(netFailures)] };
  }
} finally {
  ws.close();
  chrome.kill();
  await sleep(600);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}

if (AS_JSON) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const label = vp === "desktop" ? "1440 desktop" : vp === "phone" ? "390 phone" : vp;
  console.log(`probe: ${PROBE_FILE}   url: ${BASE}   viewport: ${label}`);
  for (const [name, { value, consoleErrors: errs, netFailures: net }] of Object.entries(report)) {
    console.log(`\n=== ${name}`);
    if (value && value.__threw) {
      console.log("  PROBE THREW:", String(value.__threw).slice(0, 300));
      console.log("  (fix the probe -- this is not a finding about the page)");
    } else if (value === null || value === undefined) {
      console.log("  probe returned nothing -- make sure the file ends in an expression, not a statement");
    } else {
      for (const [k, v] of Object.entries(value)) {
        if (Array.isArray(v)) { console.log(`  ${k}:`); v.forEach(x => console.log("    - " + (typeof x === "object" ? JSON.stringify(x) : x))); }
        else if (v && typeof v === "object") console.log(`  ${k}: ${JSON.stringify(v)}`);
        else console.log(`  ${k}: ${v}`);
      }
    }
    if (net && net.length) { console.log("  failed requests:"); net.slice(0, 8).forEach(u => console.log("    ! " + u.slice(0, 220))); }
    if (errs.length) { console.log("  console errors:"); errs.slice(0, 5).forEach(e => console.log("    ! " + e.slice(0, 200))); }
  }
}
