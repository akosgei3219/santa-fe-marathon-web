// Snapshot the live front page to backups/ BEFORE recreate-wp-page.js deletes it.
//
// Why this exists: deploying the homepage is delete-then-create with no rollback in between.
// On 2026-09-15 a WordPress maintenance 503 landed between the two halves and the site was
// down for about ten minutes. A snapshot taken first is the only way back.
//
// Credentials are read from mcp-server/.env exactly as recreate-wp-page.js does, and are
// never printed.
//
// usage: node backup_homepage.js <pageId> <label>
//   e.g. node backup_homepage.js 5041 pre-hero-walkup
const fs = require("fs");
const path = require("path");

const env = {};
for (const line of fs.readFileSync("C:/Users/info/mcp-server/.env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const BASE = env.WP_URL.replace(/\/$/, "");
const AUTH = "Basic " + Buffer.from(env.WP_USER + ":" + env.WP_APP_PASSWORD).toString("base64");
const H = {
  Authorization: AUTH,
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36 SFHM-backup",
};

const id = process.argv[2];
const label = process.argv[3] || "manual";
if (!id) { console.error("usage: node backup_homepage.js <pageId> <label>"); process.exit(1); }

(async () => {
  const url = `${BASE}/wp-json/wp/v2/pages/${id}?context=edit`;
  const r = await fetch(url, { headers: H });
  const text = await r.text();
  if (!r.ok) throw new Error("GET page " + id + " -> " + r.status + " " + text.slice(0, 200));
  const page = JSON.parse(text);

  const raw = (page.content && page.content.raw) || "";
  if (raw.length < 1000) throw new Error("refusing to save: content.raw is only " + raw.length + " chars");

  const day = new Date().toISOString().slice(0, 10);
  const dir = path.join(__dirname, "..", "backups");
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `homepage-${id}-${label}-${day}.json`);
  fs.writeFileSync(out, JSON.stringify({
    saved_at: new Date().toISOString(),
    id: page.id,
    slug: page.slug,
    status: page.status,
    template: page.template,
    title_raw: (page.title && page.title.raw) || "",
    content_raw: raw,
    excerpt_raw: (page.excerpt && page.excerpt.raw) || "",
    meta: page.meta || {},
  }, null, 2), "utf8");

  // proof it is the right page, without dumping 160KB into the console
  console.log("saved   :", out);
  console.log("bytes   :", fs.statSync(out).size);
  console.log("id/slug :", page.id, "/", page.slug, "| status", page.status, "| template", page.template || "(default)");
  console.log("content :", raw.length, "chars");
  for (const marker of ["Santa Fe International Half Marathon", "hero-cta-solid", "REG_STATE", "walkupShort"]) {
    console.log("  marker :", marker.padEnd(36), raw.includes(marker) ? "present" : "MISSING");
  }
})().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
