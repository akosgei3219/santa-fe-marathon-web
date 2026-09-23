const fs = require("fs");
const path = require("path");
const env = {};
for (const line of fs.readFileSync("C:/Users/info/mcp-server/.env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const BASE = env.WP_URL.replace(/\/$/, "");
const AUTH = "Basic " + Buffer.from(env.WP_USER + ":" + env.WP_APP_PASSWORD).toString("base64");
const H = { Authorization: AUTH, "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36 SFHM-deploy", "Content-Type": "application/json" };
const CDN = "https://santafehalfmarathon.com/wp-content/uploads/2026/09/";
const urlMap = {
  "%%IMG_HERO%%": CDN + "sfi-2026-landing-startline.jpg",
  "%%IMG_ARCH%%": CDN + "sfi-2026-landing-startarch.jpg",
  "%%IMG_ROUTE%%": CDN + "sfi-2026-landing-oncourse.jpg",
  "%%IMG_PODIUM%%": CDN + "sfi-2026-landing-podium.jpg",
  "%%IMG_TRICIA%%": CDN + "sfi-2026-landing-wheelchair.jpg",
  // 2026-09-16: the 500x500 original (41.8 KB) was served for a 44px nav mark and a 96px footer
  // mark. At dpr 2 the largest use needs ~192px, so the 300x300 variant (20.4 KB) is still
  // oversampled and saves 21.4 KB. Do not drop to 150x150 -- that is below the retina target
  // and the footer mark would go soft.
  "%%IMG_LOGO%%": CDN + "sfi-2026-landing-logo-300x300.png",
  // 2026-09-22: this logo has been through three forms. It was inlined as a 15,880-char
  // base64 data URI, which bloated the HTML on every load AND silently defeated the img's
  // loading="lazy" (a data URI can never be lazy). Then the full-size PNG (583x180,
  // 16,497 b) for a logo that renders at 130x40. Now a right-sized 300x93 128-colour
  // palette PNG, 4,966 b, visually identical at render size.
  // NOTE: Mod_Security 406s image/webp uploads to wp/v2/media -- image/png and image/gif
  // pass fine, so convert to PNG before uploading. Use upload_media.js. (A 300x93 webp was
  // tried first at 7,280 b; the palette PNG beat it, so the webp was deleted.)
  "%%IMG_ADVANCED%%": "https://santafehalfmarathon.com/wp-content/uploads/2026/09/advanced-po-logo-300x93-1.png",
  "%%IMG_CAPITOL%%": "https://santafehalfmarathon.com/wp-content/uploads/2026/02/Capitol-Ford_logo_round_2024-500KB-e1771703812895.webp",
  "%%IMG_ECON%%": "https://santafehalfmarathon.com/wp-content/uploads/2026/02/2023-Economic-Development-Logo-1-e1771704027372.webp",
  "%%IMG_JIRANI%%": "https://santafehalfmarathon.com/wp-content/uploads/2026/02/jirani-logo-e1771703855425.webp",
  // 2026-09-16: 1050px wide original (14.2 KB) drawn at 110x34. The 300x86 variant is 2.4 KB
  // and still clears the ~220px dpr-2 target, saving 11.8 KB.
  "%%IMG_ARTS%%": "https://santafehalfmarathon.com/wp-content/uploads/2026/02/2023-Arts-Culture-logo-no-background-new-300x86.webp",
  "%%IMG_COUNTY%%": "https://santafehalfmarathon.com/wp-content/uploads/2026/02/Santa-Fe-County-logo-e1771703956228.webp",
  "%%IMG_NUCKOLLS%%": "https://santafehalfmarathon.com/wp-content/uploads/2026/08/nuckolls-brewing-logo-300x272.avif",
  "%%IMG_RUNHUB%%": "https://santafehalfmarathon.com/wp-content/uploads/2026/08/running-hub-santa-fe-logo.png"
};
let html = fs.readFileSync(path.join(__dirname, "run-santa-fe-2026.prod.src.html"), "utf8");
for (const [token, url] of Object.entries(urlMap)) {
  if (!html.includes(token)) throw new Error("token missing: " + token);
  html = html.split(token).join(url);
}
// 2026-09-13: when WordPress serves the page, wptexturize rewrites some "&" inside the inline bundle to "&#038;"
// (five homepage nav labels read "Races &#038; Distances" although the stored content was clean). Write " & "
// inside <script> blocks as the JS escape & so nothing is left for it to rewrite; JavaScript still reads "&".
html = html.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/g, (m, open, body, close) => open + body.split(" & ").join(" \\u0026 ") + close);
// 2026-09-15: refuse to deploy anything wptexturize would corrupt (see texturize-gate.js). This runs before the old page is deleted.
require("./texturize-gate.js").assertSafe(html);
const content = "<!-- wp:html -->\n" + html + "\n<!-- /wp:html -->";

async function req(url, opts) {
  const r = await fetch(url, opts);
  const t = await r.text();
  if (!r.ok) throw new Error(url + " -> " + r.status + " " + t.slice(0, 300));
  return JSON.parse(t);
}
(async () => {
  // NEVER hardcode the delete id -- it churns with every recreate. Resolve by slug.
  const cur = await req(BASE + "/wp-json/wp/v2/pages?slug=run-santa-fe-2026&status=publish,draft&context=edit", { headers: H });
  if (cur.length !== 1) throw new Error("expected exactly 1 page at slug run-santa-fe-2026, got " + cur.length);
  const oldId = cur[0].id;
  const del = await req(BASE + "/wp-json/wp/v2/pages/" + oldId + "?force=true", { method: "DELETE", headers: H });
  console.log("deleted page " + oldId + ":", del.deleted === true);
  const page = await req(BASE + "/wp-json/wp/v2/pages", {
    method: "POST", headers: H,
    body: JSON.stringify({ title: "Run Santa Fe 2026", slug: "run-santa-fe-2026", status: "publish", template: "elementor_canvas", content })
  });
  console.log("created id=" + page.id, page.link, "template=" + page.template);
  const chk = await req(BASE + "/wp-json/wp/v2/pages/" + page.id + "?context=edit", { headers: H });
  const raw = chk.content.raw;
  const intact = raw.includes("<script") && raw.includes("<style") && raw.length === content.length;
  console.log("raw bytes=" + raw.length, "sent=" + content.length, "script:", raw.includes("<script"), "style:", raw.includes("<style"));
  if (!intact) console.log("*** STRIPPED -- delete page " + page.id + " and re-run (the strip is intermittent) ***");
  // AIOSEO meta lives per-post-id and dies with every delete+recreate: re-apply it.
  const seo = await fetch(BASE + "/wp-json/santafe/v1/seo/" + page.id, {
    method: "POST", headers: H,
    body: JSON.stringify({ description: "Health & Wellness Expo Sept 18-19 and race day Sunday, Sept 20, 2026 in Santa Fe: Half Marathon, 3-Amigos Relay, 5K and free Kids 1K Dash at 7,000 ft." })
  });
  console.log("seo re-applied:", seo.ok);
  // this page IS the site front page: repoint the setting at the fresh id and keep the homepage title
  const st = await req(BASE + "/wp-json/wp/v2/settings", { method: "POST", headers: H, body: JSON.stringify({ show_on_front: "page", page_on_front: page.id }) });
  console.log("front page setting:", st.page_on_front === page.id ? "repointed to " + page.id : "UNEXPECTED " + st.page_on_front);
  await req(BASE + "/wp-json/santafe/v1/seo/" + page.id, { method: "POST", headers: H, body: JSON.stringify({ title: "Santa Fe International Half Marathon | Sept 20, 2026 Race" }) });
  console.log("homepage title re-applied");
})().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
