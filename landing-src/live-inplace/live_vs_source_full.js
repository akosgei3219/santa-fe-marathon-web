// Full (uncapped) diff of the LIVE homepage content against what the current source build would
// deploy, plus a snapshot of the live content to disk for grepping. Read-only.
// predeploy_exact.js stops at 12 regions; the parallel session edited the live page directly, so
// every region matters before anything touches the homepage.
const fs = require("fs");
const path = require("path");
const LS = "C:/Users/info/OneDrive/Desktop/SantaFeMarathonWeb/landing-src";
const OUT = __dirname;

const deploySrc = fs.readFileSync(path.join(LS, "recreate-wp-page.js"), "utf8");
const mapBlock = deploySrc.match(/const CDN = "([^"]+)";\s*const urlMap = \{([\s\S]*?)\n\};/);
const CDN = mapBlock[1];
const urlMap = {};
for (const m of mapBlock[2].matchAll(/"(%%IMG_[A-Z]+%%)":\s*(?:CDN \+ "([^"]+)"|"([^"]+)")/g)) {
  urlMap[m[1]] = m[2] ? CDN + m[2] : m[3];
}
let html = fs.readFileSync(path.join(LS, "run-santa-fe-2026.prod.src.html"), "utf8");
for (const [token, url] of Object.entries(urlMap)) html = html.split(token).join(url);
// 2026-09-22: the %%IMG_ADVANCED%% base64 inline that used to sit here is gone. The token
// is now an ordinary urlMap entry resolved in the loop above, so this substitution had
// become a silent no-op -- it produced the right answer for the wrong reason.
html = html.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/g,
  (m, open, body, close) => open + body.split(" & ").join(" \\u0026 ") + close);
const content = "<!-- wp:html -->\n" + html + "\n<!-- /wp:html -->";

const env = {};
for (const line of fs.readFileSync("C:/Users/info/mcp-server/.env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2].trim();
}
const BASE = env.WP_URL.replace(/\/$/, "");
const AUTH = "Basic " + Buffer.from(env.WP_USER + ":" + env.WP_APP_PASSWORD).toString("base64");

(async () => {
  const r = await fetch(`${BASE}/wp-json/wp/v2/pages?slug=run-santa-fe-2026&status=publish&context=edit&_fields=id,modified,modified_gmt,content`,
    { headers: { Authorization: AUTH, "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140.0 SFHM-diff" } });
  const pages = await r.json();
  const live = pages[0].content.raw;
  fs.writeFileSync(path.join(OUT, "live_home_5103.html"), live);
  fs.writeFileSync(path.join(OUT, "source_would_deploy.html"), content);
  console.log(`page ${pages[0].id}  modified ${pages[0].modified} (gmt ${pages[0].modified_gmt})`);
  console.log(`live ${live.length}  would-deploy ${content.length}\n`);

  let i = 0, j = 0, regions = 0;
  while (i < live.length && j < content.length) {
    if (live[i] === content[j]) { i++; j++; continue; }
    let found = false;
    for (let k = i + 1; k < Math.min(live.length, i + 6000) && !found; k++) {
      const win = live.slice(k, k + 40);
      const at = content.indexOf(win, j);
      if (at >= 0 && at - j < 6000) {
        regions++;
        console.log(`--- region ${regions} @live ${i} ---`);
        console.log(`  LIVE     : ${JSON.stringify(live.slice(i, k))}`);
        console.log(`  SOURCE   : ${JSON.stringify(content.slice(j, at))}\n`);
        i = k; j = at; found = true;
      }
    }
    if (!found) { console.log("  (could not resync)"); break; }
  }
  console.log(`${regions} differing region(s)`);
})().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
