// Build EXACTLY the content recreate-wp-page.js would upload -- same token map, same base64
// logo, same & escape, same wp:html wrapper -- and diff it byte-for-byte against what is live.
//
// predeploy_diff.py compared string literals and found only the Kids copy changed, but it left
// a 17.8 KB size gap unexplained (it compared a raw artifact against substituted live content).
// "Probably the tokens" is not a standard to deploy on, three days before a race, with a parallel
// session known to have edited the source. This removes the guesswork: if the only differing
// regions are the Kids strings, nothing unreviewed ships.
//
// The token map is READ FROM recreate-wp-page.js rather than copied, so the two cannot drift.
// Read-only: never writes to WordPress.
const fs = require("fs");
const path = require("path");

const deploySrc = fs.readFileSync(path.join(__dirname, "recreate-wp-page.js"), "utf8");
const mapBlock = deploySrc.match(/const CDN = "([^"]+)";\s*const urlMap = \{([\s\S]*?)\n\};/);
if (!mapBlock) throw new Error("could not read urlMap from recreate-wp-page.js");
const CDN = mapBlock[1];
const urlMap = {};
for (const m of mapBlock[2].matchAll(/"(%%IMG_[A-Z]+%%)":\s*(?:CDN \+ "([^"]+)"|"([^"]+)")/g)) {
  urlMap[m[1]] = m[2] ? CDN + m[2] : m[3];
}
console.log(`token map read from recreate-wp-page.js: ${Object.keys(urlMap).length} entries`);

let html = fs.readFileSync(path.join(__dirname, "run-santa-fe-2026.prod.src.html"), "utf8");
for (const [token, url] of Object.entries(urlMap)) {
  if (!html.includes(token)) throw new Error("token missing: " + token);
  html = html.split(token).join(url);
}
// 2026-09-22: the %%IMG_ADVANCED%% base64 inline that used to sit here is gone. The token
// is now an ordinary urlMap entry resolved in the loop above, so this substitution had
// become a silent no-op -- it produced the right answer for the wrong reason.
html = html.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/g,
  (m, open, body, close) => open + body.split(" & ").join(" \\u0026 ") + close);
require("./texturize-gate.js").assertSafe(html);
const content = "<!-- wp:html -->\n" + html + "\n<!-- /wp:html -->";

const env = {};
for (const line of fs.readFileSync("C:/Users/info/mcp-server/.env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2].trim();
}
const BASE = env.WP_URL.replace(/\/$/, "");
const AUTH = "Basic " + Buffer.from(env.WP_USER + ":" + env.WP_APP_PASSWORD).toString("base64");

(async () => {
  const r = await fetch(`${BASE}/wp-json/wp/v2/pages?slug=run-santa-fe-2026&status=publish&context=edit&_fields=id,content`,
    { headers: { Authorization: AUTH, "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140.0 SFHM-predeploy" } });
  const pages = await r.json();
  if (!Array.isArray(pages) || pages.length !== 1) throw new Error("expected 1 front page");
  const live = pages[0].content.raw;

  console.log(`\nlive content     ${live.length.toLocaleString()} chars  (page ${pages[0].id})`);
  console.log(`would-deploy     ${content.length.toLocaleString()} chars`);
  console.log(`delta            ${(content.length - live.length).toLocaleString()} chars\n`);

  if (live === content) { console.log("IDENTICAL -- a deploy would change nothing."); return; }

  // Walk both strings and report every region that differs, with context.
  let i = 0, j = 0, regions = 0;
  while (i < live.length && j < content.length && regions < 12) {
    if (live[i] === content[j]) { i++; j++; continue; }
    // find resync: the next 40-char window of `live` that appears in `content` ahead
    let found = false;
    for (let k = i + 1; k < Math.min(live.length, i + 4000) && !found; k++) {
      const win = live.slice(k, k + 40);
      const at = content.indexOf(win, j);
      if (at >= 0 && at - j < 4000) {
        regions++;
        console.log(`--- region ${regions} ---`);
        console.log(`  LIVE     : ${JSON.stringify(live.slice(i, k)).slice(0, 260)}`);
        console.log(`  DEPLOYING: ${JSON.stringify(content.slice(j, at)).slice(0, 260)}\n`);
        i = k; j = at; found = true;
      }
    }
    if (!found) { console.log("  (could not resync -- large structural difference)"); break; }
  }
  console.log(`${regions} differing region(s)`);
})().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
