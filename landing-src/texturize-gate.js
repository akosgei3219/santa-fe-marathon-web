// 2026-09-15: pre-deploy gate against WordPress wptexturize.
// On output, wptexturize splits page content on "<...>" spans (a "<" up to the next ">") and rewrites every lone
// "&" inside each span to "&#038;" -- even inside <script>. In the minified homepage bundle a span runs from any
// "<" comparison to the next ">", so an && operator that lands there becomes "&#038;&#038;": a syntax error, and
// the live homepage renders blank (front id 5023, 2026-09-15). recreate-wp-page.js already writes " & " inside
// strings as a unicode escape; operators cannot be escaped, so this gate refuses the deploy instead.
// Standalone: node texturize-gate.js <artifact.html>   (applies the same " & " escape first; exits 1 on any hit)
const SPAN = /<(?:!--[\s\S]*?-->|[^>]*>?)/g;
const AMP = /&(?!#(?:\d+|x[a-f0-9]+);|[a-z1-4]{1,8};)/gi;
const SCRIPT = /(<script\b[^>]*>)([\s\S]*?)(<\/script>)/g;

function findHits(html) {
  const bodies = [];
  for (const m of html.matchAll(SCRIPT)) {
    const start = m.index + m[1].length;
    bodies.push([start, start + m[2].length]);
  }
  const hits = [];
  for (const sm of html.matchAll(SPAN)) {
    const a = sm.index, z = sm.index + sm[0].length;
    for (const [b0, b1] of bodies) {
      if (a < b1 && z > b0) {
        const lo = Math.max(a, b0);
        for (const am of html.slice(lo, Math.min(z, b1)).matchAll(AMP)) hits.push(lo + am.index);
      }
    }
  }
  return { scripts: bodies.length, hits };
}

function assertSafe(html) {
  const { scripts, hits } = findHits(html);
  console.log("texturize gate: " + scripts + " script blocks, " + hits.length + " ampersands WordPress would rewrite");
  if (!hits.length) return;
  for (const i of hits.slice(0, 5)) console.log("   ..." + html.slice(Math.max(0, i - 100), i + 30).replace(/\n/g, " ") + "...");
  throw new Error("texturize gate: an & sits between a < and the next > inside a script, and WordPress would break it. Rewrite that code before deploying.");
}

module.exports = { findHits, assertSafe };

if (require.main === module) {
  const fs = require("fs");
  const file = process.argv[2];
  if (!file) { console.error("usage: node texturize-gate.js <artifact.html>"); process.exit(2); }
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(SCRIPT, (m, open, body, close) => open + body.split(" & ").join(" \\u0026 ") + close);
  try { assertSafe(html); console.log("GATE PASS"); } catch (e) { console.error(e.message); process.exit(1); }
}
