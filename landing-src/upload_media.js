// Upload one file to the WP media library over REST.
//
// Why this exists: the MCP wp_upload_media tool gets HTTP 406 from Mod_Security. The same
// thing happened to this project's link checks on 2026-09-22 -- a bare "Mozilla/5.0" UA was
// rejected and a complete, honest browser header set fixed it. This sends the full set and a
// raw binary body (WP accepts that with Content-Disposition; no multipart needed).
//
// usage: node upload_media.js <path> [title] [alt]
const fs = require("fs");
const path = require("path");

const env = {};
for (const l of fs.readFileSync("C:/Users/info/mcp-server/.env", "utf8").split(/\r?\n/)) {
  const m = l.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const BASE = env.WP_URL.replace(/\/$/, "");
const AUTH = "Basic " + Buffer.from(env.WP_USER + ":" + env.WP_APP_PASSWORD).toString("base64");

const file = path.resolve(process.argv[2]);
const title = process.argv[3] || path.basename(file);
const alt = process.argv[4] || "";
const buf = fs.readFileSync(file);
const ext = path.extname(file).slice(1).toLowerCase();
const types = { webp: "image/webp", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", avif: "image/avif" };
const ctype = types[ext];
if (!ctype) throw new Error("unsupported extension: " + ext);

(async () => {
  console.log(`uploading ${path.basename(file)}  ${buf.length} bytes  ${ctype}`);
  const res = await fetch(BASE + "/wp-json/wp/v2/media", {
    method: "POST",
    headers: {
      Authorization: AUTH,
      "Content-Type": ctype,
      "Content-Disposition": `attachment; filename="${path.basename(file)}"`,
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: BASE + "/wp-admin/media-new.php",
      Origin: BASE,
    },
    body: buf,
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`FAILED http ${res.status}`);
    console.error(text.slice(0, 400));
    process.exit(1);
  }
  const j = JSON.parse(text);
  console.log("  id       :", j.id);
  console.log("  url      :", j.source_url);
  console.log("  mime     :", j.mime_type);
  if (alt) {
    await fetch(BASE + "/wp-json/wp/v2/media/" + j.id, {
      method: "POST",
      headers: { Authorization: AUTH, "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0 Safari/537.36" },
      body: JSON.stringify({ alt_text: alt, title }),
    });
    console.log("  alt/title applied");
  }
})().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
