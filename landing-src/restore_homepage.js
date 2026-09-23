// Restore the front page from a backup written by backup_homepage.js.
//
// Deploying is delete-then-create with no rollback in between, so when a deploy ships something
// broken the only way back is the snapshot taken beforehand. This is the counterpart to
// backup_homepage.js and the reason that script exists.
//
// It deliberately mirrors recreate-wp-page.js: resolve by slug (the id churns), delete, create
// with the backup's stored content, verify the write round-tripped, re-apply SEO (AIOSEO meta
// dies with every delete) and repoint the front-page setting.
//
// Credentials come from mcp-server/.env and are never printed.
//
// usage: node restore_homepage.js <backup.json>
const fs = require("fs");

const env = {};
for (const line of fs.readFileSync("C:/Users/info/mcp-server/.env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const BASE = env.WP_URL.replace(/\/$/, "");
const AUTH = "Basic " + Buffer.from(env.WP_USER + ":" + env.WP_APP_PASSWORD).toString("base64");
const H = { Authorization: AUTH, "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36 SFHM-restore" };

const file = process.argv[2];
if (!file) { console.error("usage: node restore_homepage.js <backup.json>"); process.exit(1); }
const snap = JSON.parse(fs.readFileSync(file, "utf8"));
const content = snap.content_raw;
if (!content || content.length < 1000) throw new Error("backup content_raw looks empty: " + (content || "").length);
if (!content.includes("<script")) throw new Error("backup has no <script> -- refusing to restore a blank page");

async function req(url, opts) {
  const r = await fetch(url, opts);
  const t = await r.text();
  if (!r.ok) throw new Error(url + " -> " + r.status + " " + t.slice(0, 300));
  return JSON.parse(t);
}

(async () => {
  console.log("restoring from:", file);
  console.log("  snapshot of id", snap.id, "taken", snap.saved_at, "|", content.length, "chars");

  const cur = await req(BASE + "/wp-json/wp/v2/pages?slug=run-santa-fe-2026&status=publish,draft&context=edit", { headers: H });
  if (cur.length !== 1) throw new Error("expected exactly 1 page at slug run-santa-fe-2026, got " + cur.length);
  const oldId = cur[0].id;
  const del = await req(BASE + "/wp-json/wp/v2/pages/" + oldId + "?force=true", { method: "DELETE", headers: H });
  console.log("deleted page " + oldId + ":", del.deleted === true);

  const page = await req(BASE + "/wp-json/wp/v2/pages", {
    method: "POST", headers: H,
    body: JSON.stringify({ title: snap.title_raw || "Run Santa Fe 2026", slug: snap.slug || "run-santa-fe-2026",
                           status: "publish", template: snap.template || "elementor_canvas", content }),
  });
  console.log("created id=" + page.id, page.link);

  const chk = await req(BASE + "/wp-json/wp/v2/pages/" + page.id + "?context=edit", { headers: H });
  const raw = chk.content.raw;
  console.log("raw bytes=" + raw.length, "sent=" + content.length,
              "script:", raw.includes("<script"), "style:", raw.includes("<style"));
  if (raw.length !== content.length) console.log("*** LENGTH MISMATCH -- content was altered on write ***");

  const seo = await fetch(BASE + "/wp-json/santafe/v1/seo/" + page.id, {
    method: "POST", headers: H,
    body: JSON.stringify({ description: "Health & Wellness Expo Sept 18-19 and race day Sunday, Sept 20, 2026 in Santa Fe: Half Marathon, 3-Amigos Relay, 5K and free Kids 1K Dash at 7,000 ft." }),
  });
  console.log("seo re-applied:", seo.ok);

  const st = await req(BASE + "/wp-json/wp/v2/settings", { method: "POST", headers: H,
    body: JSON.stringify({ show_on_front: "page", page_on_front: page.id }) });
  console.log("front page setting:", st.page_on_front === page.id ? "repointed to " + page.id : "UNEXPECTED " + st.page_on_front);

  await req(BASE + "/wp-json/santafe/v1/seo/" + page.id, { method: "POST", headers: H,
    body: JSON.stringify({ title: "Santa Fe International Half Marathon | Sept 20, 2026 Race" }) });
  console.log("homepage title re-applied");
})().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
