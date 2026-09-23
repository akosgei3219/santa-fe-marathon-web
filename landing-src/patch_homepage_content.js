// One-off: PATCH page 5103 content in place from a local file.
// Deliberately NOT recreate-wp-page.js -- that deploys the stale local source and
// force-deletes the page. Live is ahead of source, so we edit the live bytes.
const fs = require("fs");
const env = {};
for (const line of fs.readFileSync("C:/Users/info/mcp-server/.env","utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/); if (m) env[m[1]] = m[2].trim();
}
const BASE = env.WP_URL.replace(/\/$/,"");
const AUTH = "Basic " + Buffer.from(env.WP_USER+":"+env.WP_APP_PASSWORD).toString("base64");
const H = { Authorization: AUTH, "Content-Type": "application/json",
            "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0 Safari/537.36 SFHM-deploy" };
const FILE = process.argv[2], ID = Number(process.argv[3]);
const content = fs.readFileSync(FILE, "utf8");
require("./texturize-gate.js").assertSafe(content);
(async () => {
  const before = await (await fetch(`${BASE}/wp-json/wp/v2/pages/${ID}?context=edit`,{headers:H})).json();
  console.log("stored before:", before.content.raw.length, "chars");
  const r = await fetch(`${BASE}/wp-json/wp/v2/pages/${ID}`, {
    method:"POST", headers:H, body: JSON.stringify({ content }) });
  const t = await r.text();
  if (!r.ok) throw new Error(r.status + " " + t.slice(0,400));
  const after = JSON.parse(t);
  console.log("stored after :", after.content.raw.length, "chars");
  console.log("round-trip identical:", after.content.raw === content);
})().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
