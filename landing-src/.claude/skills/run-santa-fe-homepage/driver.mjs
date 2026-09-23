#!/usr/bin/env node
/**
 * run-santa-fe-homepage driver
 *
 * Drives the compiled React homepage LOCALLY. Never touches production.
 * (Deploying is `node recreate-wp-page.js`, which DELETES and recreates the
 * live WordPress front page — deliberately not reachable from this driver.)
 *
 *   node driver.mjs build            build the prod artifact
 *   node driver.mjs serve [port]     wrap + serve it (foreground, Ctrl-C to stop)
 *   node driver.mjs verify           build + serve + headless probes  -> exit 0/1
 *   node driver.mjs shot [out.png]   build + serve + screenshot to disk
 *   node driver.mjs live             read-only assertions against production
 */
import { createServer } from "node:http";
import { spawn, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const UNIT = resolve(HERE, "../../..");          // landing-src/
const REPO = resolve(UNIT, "..");                // SantaFeMarathonWeb/
const PROD = join(UNIT, "run-santa-fe-2026.prod.src.html");
const LIVE = "https://santafehalfmarathon.com/";

// The two-directory split that eats deploys:
//   build.js            READS  ../run-santa-fe-2026.src.html       (repo root)
//                       WRITES ../run-santa-fe-2026.prod.src.html  (repo root)
//   recreate-wp-page.js READS  ./run-santa-fe-2026.prod.src.html   (landing-src)
// So a bare `node build.js` leaves landing-src holding a STALE artifact, and a
// deploy right after it ships the previous build to production. build() below
// owns both copies so the two can never drift apart unnoticed.
const SRC_UNIT = join(UNIT, "run-santa-fe-2026.src.html");
const SRC_REPO = join(REPO, "run-santa-fe-2026.src.html");
const PROD_REPO = join(REPO, "run-santa-fe-2026.prod.src.html");

const CHROMES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome",
];
const chrome = () => {
  const hit = CHROMES.find((p) => existsSync(p));
  if (!hit) throw new Error("No Chrome/Edge found. Checked:\n" + CHROMES.join("\n"));
  return hit;
};

/* ---------------------------------------------------------------- build --- */
function build() {
  // 1. Reconcile the two copies of the SOURCE before building.
  //    landing-src is where you edit; the repo-root copy is only build.js's
  //    input. If they differ, a parallel session may have edited the other one
  //    -- refuse rather than silently clobber somebody's work.
  const a = readFileSync(SRC_UNIT, "utf8");
  const b = existsSync(SRC_REPO) ? readFileSync(SRC_REPO, "utf8") : null;
  if (b === null) {
    writeFileSync(SRC_REPO, a);
    console.log("sync: seeded repo-root source from landing-src");
  } else if (a !== b) {
    const ta = statSync(SRC_UNIT).mtime.toISOString();
    const tb = statSync(SRC_REPO).mtime.toISOString();
    throw new Error(
      "SOURCE DIVERGED -- refusing to build.\n" +
      // chars, NOT bytes: the source carries multi-byte UTF-8 (Spanish accents),
      // so these numbers read ~436 lower than the on-disk file size. Comparing
      // them against `stat` output will look like a phantom third version.
      `  landing-src/run-santa-fe-2026.src.html  ${a.length} chars  ${ta}\n` +
      `  ../run-santa-fe-2026.src.html           ${b.length} chars  ${tb}\n` +
      "Diff them and keep the intended one (landing-src is canonical), then re-run.\n" +
      "A parallel session merges live diffs into these files -- do not just overwrite."
    );
  }

  // 2. build.js reads/writes the REPO ROOT copies.
  const r = spawnSync(process.execPath, ["build.js"], { cwd: UNIT, encoding: "utf8" });
  process.stdout.write(r.stdout || "");
  if (r.status !== 0) { process.stderr.write(r.stderr || ""); throw new Error("build.js failed"); }

  // 3. Pull the fresh artifact down to landing-src, which is where
  //    recreate-wp-page.js (and this driver) read it from.
  if (!existsSync(PROD_REPO)) throw new Error("build.js produced no " + PROD_REPO);
  const fresh = readFileSync(PROD_REPO, "utf8");
  const stale = existsSync(PROD) ? readFileSync(PROD, "utf8") : null;
  writeFileSync(PROD, fresh);
  console.log("sync: prod artifact ->", stale === fresh ? "unchanged" : "UPDATED in landing-src");
  return PROD;
}

/* ------------------------------------------------------- serve (wrapped) --- */
// The prod artifact is a FRAGMENT (starts at <title>) because WordPress embeds
// it inside its own page. Standalone it needs a doctype/html/body shell, plus
// a #root — otherwise React has nothing to mount into and you get a blank page.
const PROBE = `
<script>
window.__PROBE__ = { done:false, results:{} };
(async function(){
  const R = window.__PROBE__.results;
  const wait = (ms)=>new Promise(r=>setTimeout(r,ms));
  const q = (sel)=>document.querySelectorAll(sel).length;
  const appTxt = ()=>(document.getElementById("root")||document.body).textContent;
  try {
    await wait(1400);
    const root = document.getElementById("root");
    R.reactMounted = !!(root && root.children.length > 0);
    R.heroHeadline = appTxt().includes("Thin Air.") && appTxt().includes("True Grit.");

    // --- Kosgei's three-element hero: headline, sub-headline, ONE cta. The badge pills
    //     and the old .hero3-sponsor chip were removed and the stats relocated below.
    R.heroOneCta    = q("#top .hero3-ctas a") === 1;
    R.heroNoBadges  = q("#top ul.hero-badges") === 0;
    R.heroNoChip    = q(".hero3-sponsor") === 0;
    R.heroPresented = q(".hero3-presented") === 1;
    R.heroFactsBand = q(".hero-facts") === 1;

    // --- "unboxed": the copy block must have NO background. Kosgei-verified requirement.
    const copy = document.querySelector(".hero3-copy");
    R.copyBg = copy ? getComputedStyle(copy).backgroundColor : "none";
    R.copyUnboxed = R.copyBg === "rgba(0, 0, 0, 0)" || R.copyBg === "transparent";

    // --- the 2026-09-22 contrast fix. A flat 40% overlay failed AA on 3 of 6 slides.
    //     This asserts the fix is still in place; it does NOT re-measure contrast.
    //     Re-measure with pixels if the slide set, copy width or text sizes change.
    const shade = document.querySelector(".hero3-shade");
    const sb = shade ? getComputedStyle(shade) : null;
    R.shadeBase  = sb ? sb.backgroundColor : "none";
    R.shadeGrad  = !!(sb && sb.backgroundImage && sb.backgroundImage.indexOf("linear-gradient") >= 0);
    R.contrastFix = R.shadeGrad && !!(sb && sb.backgroundColor.indexOf("0.4") >= 0);

    // --- slideshow
    R.slides = q("#top .hero-slide");
    R.dots   = q("#top .hero-dots button.hero-dot");
    R.slideshow = R.slides === 6 && R.dots === 6 && q("#top button.hero-pause") === 1
                  && q("#top video") === 0;

    // --- sub-headline carries the next-race date, not the 2026 race day
    const sub = document.querySelector(".hero3-date");
    R.subLine = sub ? sub.textContent.trim() : "";
    R.subIs2027 = R.subLine.indexOf("2027") >= 0 && R.subLine.indexOf("September 20, 2026") < 0;

    // --- facts that must not regress (these are what the back-port fixed)
    const t = appTxt();
    R.noWarehouse21 = t.indexOf("Warehouse 21") < 0 && t.indexOf("Railyard") < 0;
    R.runningHub    = t.indexOf("Running Hub") >= 0;
    R.soldOut       = t.toLowerCase().indexOf("sold out") >= 0;
    R.resultsNested = !!document.querySelector('a[href="/race-information/results-photos/"]');

    // --- shared structure
    R.raceCards  = q("#races article") === 4;
    // 2026-09-23: the IA v4 dropdown groups were replaced by a flat nav -- four explicit
    // links plus one high-contrast anchor button. The old probe asserted the groups.
    R.navGroups  = [...document.querySelectorAll("a.navflat")].map(x=>x.textContent.trim()).join("|");
    R.navRegLabel= (document.querySelector("a.nav-reg")||{}).textContent || "";
    R.navFlat    = document.querySelectorAll("a.navflat").length === 4
                   && document.querySelectorAll("a.nav-reg").length === 1
                   && document.querySelectorAll(".navgrp").length === 0
                   && /Results/i.test(R.navGroups);
    // The race is SOLD OUT. Rule 9: this control must not offer registration when it is
    // closed. Asserted explicitly so a regression to a bare "Register" fails the build.
    R.navRegNotOpen = !/^Register/i.test(R.navRegLabel.trim());
    R.quickBar   = q("nav.quick-bar li.qb-item") === 4;
    R.concierge  = q(".cg-trigger") >= 1;
    R.langToggle = !!document.querySelector('[aria-label*="espa"]');
  } catch (e) { R.error = String(e && e.message || e); }
  window.__PROBE__.done = true;
  const out = document.createElement("div");
  out.id = "__PROBE_OUT__"; out.style.display = "none";
  out.textContent = JSON.stringify(R);
  document.body.appendChild(out);
})();
</script>`;

// The page runs two setInterval timers (race countdown + sponsor ticker). Under
// Chrome's --virtual-time-budget those fire forever, the budget never drains and
// --dump-dom hangs. Stubbing setInterval to a far-future delay lets virtual time
// reach the end while leaving setTimeout (and therefore React + our probe) intact.
const TIMER_SHIM = `<script>
(function(){ var si = window.setInterval;
  window.setInterval = function(fn, ms){ return si(fn, 1000000000); }; })();
</script>`;

function wrap(withProbe) {
  const frag = readFileSync(PROD, "utf8");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${withProbe ? TIMER_SHIM : ""}
</head><body>
<div id="root"></div>
${frag}
${withProbe ? PROBE : ""}
</body></html>`;
}

function serve(port, withProbe) {
  const html = wrap(withProbe);
  const srv = createServer((req, res) => {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(html);
  });
  return new Promise((ok) => srv.listen(port, "127.0.0.1", () => ok(srv)));
}

/* ------------------------------------------------------------- headless --- */
// MUST be async. The static server above runs IN THIS PROCESS, so a blocking
// spawnSync would freeze the event loop, the server would never answer Chrome,
// and --dump-dom would return an empty <html><head></head><body></body></html>.
function runChrome(args, ms = 40000) {
  return new Promise((done) => {
    const p = spawn(chrome(), args, { windowsHide: true });
    let out = "", err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    const kill = setTimeout(() => p.kill("SIGKILL"), ms);
    p.on("close", () => { clearTimeout(kill); done({ out, err }); });
  });
}
// NOTE: --virtual-time-budget HANGS FOREVER on this page. The homepage runs two
// setInterval timers (race countdown + sponsor ticker); under virtual time they
// keep firing, the budget never drains, and --dump-dom never returns. Use a wall
// -clock --timeout instead, which dumps whatever is rendered when it expires.
const BASE = ["--headless=new", "--disable-gpu", "--no-sandbox",
              "--no-first-run", "--disable-extensions", "--hide-scrollbars"];
const SETTLE = "--virtual-time-budget=20000";   // safe ONLY with TIMER_SHIM
const SHOT_SETTLE = "--virtual-time-budget=6000";
const VERIFY_VIEWPORT = "--window-size=1440,900";

/* ---------------------------------------------------------------- verify --- */
async function verify() {
  build();
  const port = 8130 + (process.pid % 300);
  const srv = await serve(port, true);
  // 2026-09-22: verify() used to omit --window-size, so Chrome defaulted to 800x600 and
  // every probe below described the MOBILE layout -- inside @media (max-width:1023px),
  // where the hero stacks and several desktop-only rules do not apply. shot() always set
  // a size, so screenshots and checks were reading different layouts. Verify the desktop
  // layout, which is the one the probes are written about.
  const { out: dom, err } = await runChrome([...BASE, VERIFY_VIEWPORT, SETTLE, "--dump-dom", `http://127.0.0.1:${port}/`]);
  srv.close();

  const m = dom.match(/id="__PROBE_OUT__"[^>]*>([^<]*)</);
  if (!m) {
    console.error("FAIL: probe never ran (React likely did not mount).");
    console.error("DOM length:", dom.length, "- first 300 chars:\n" + dom.slice(0, 300));
    process.exit(1);
  }
  const R = JSON.parse(m[1]);
  const checks = [
    ["react mounted",                    R.reactMounted === true],
    ["hero headline",                    R.heroHeadline === true],
    ["hero: exactly one CTA",            R.heroOneCta === true],
    ["hero: badge pills removed",        R.heroNoBadges === true],
    ["hero: sponsor chip removed",       R.heroNoChip === true],
    ["hero: presented-by as plain type", R.heroPresented === true],
    ["stats relocated to facts band",    R.heroFactsBand === true],
    ["copy block unboxed (no bg)",       R.copyUnboxed === true],
    ["contrast fix present on shade",    R.contrastFix === true],
    ["slideshow: 6 slides + dots, no video", R.slideshow === true],
    ["sub-headline is the 2027 date",    R.subIs2027 === true],
    ["no Warehouse 21 / Railyard",       R.noWarehouse21 === true],
    ["Running Hub packet pickup",        R.runningHub === true],
    ["sold-out state",                   R.soldOut === true],
    ["results nested under race-information", R.resultsNested === true],
    ["four race cards",                  R.raceCards === true],
    ["flat nav: 4 links + reg button",   R.navFlat === true],
    ["reg control respects sold-out",    R.navRegNotOpen === true],
    ["quick-access bar",                 R.quickBar === true],
    ["concierge button",                 R.concierge === true],
    ["language toggle present",          R.langToggle === true],
  ];
  let bad = 0;
  for (const [name, ok] of checks) { console.log(`${ok ? "PASS" : "FAIL"}  ${name}`); if (!ok) bad++; }
  console.log("\nnav links  :", R.navGroups);
  console.log("reg control:", (R.navRegLabel||"").trim());
  if (R.error) console.log("probe error:", R.error);
  console.log(bad ? `\n${bad} check(s) FAILED` : "\nall checks passed");
  process.exit(bad ? 1 : 0);
}

/* ------------------------------------------------------------------ shot --- */
async function shot(out) {
  build();
  const dest = resolve(out || join(HERE, "shots", "homepage.png"));
  mkdirSync(dirname(dest), { recursive: true });
  const port = 8130 + (process.pid % 300);
  const srv = await serve(port, false);
  await runChrome([...BASE, SHOT_SETTLE, "--window-size=1400,1000",
             `--screenshot=${dest}`, `http://127.0.0.1:${port}/`]);
  srv.close();
  if (!existsSync(dest)) { console.error("FAIL: no screenshot written"); process.exit(1); }
  console.log("screenshot:", dest);
}

/* ------------------------------------------------------------------ live --- */
async function live() {
  const res = await fetch(LIVE + "?driver=1", {
    headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128" },
  });
  const html = await res.text();
  const checks = [
    ["HTTP 200",                res.status === 200],
    ["front page is the React build", /id="root"/.test(html)],
    ["hero headline",           /Thin Air\./.test(html)],
    ["concierge shipped",       /cg-trigger|CONCIERGE_ROUTES/.test(html)],
    ["Pecos lodging",           /Pecos Trail Inn/.test(html)],
    ["no retired sand hex",     !/#F5EDE0/i.test(html)],
  ];
  let bad = 0;
  for (const [n, ok] of checks) { console.log(`${ok ? "PASS" : "FAIL"}  ${n}`); if (!ok) bad++; }
  console.log("WPO-Cache-Status:", res.headers.get("wpo-cache-status") || "(none)");
  process.exit(bad ? 1 : 0);
}

/* ------------------------------------------------------------------ main --- */
const [cmd, arg] = process.argv.slice(2);
try {
  if (cmd === "build") { build(); console.log("built:", PROD); }
  else if (cmd === "serve") {
    const port = Number(arg) || 8130;
    await serve(port, false);
    console.log(`serving http://127.0.0.1:${port}/  (Ctrl-C to stop)`);
  }
  else if (cmd === "verify") await verify();
  else if (cmd === "shot") await shot(arg);
  else if (cmd === "live") await live();
  else {
    console.log("usage: node driver.mjs build|serve [port]|verify|shot [out.png]|live");
    process.exit(2);
  }
} catch (e) { console.error("ERROR:", e.message); process.exit(1); }
