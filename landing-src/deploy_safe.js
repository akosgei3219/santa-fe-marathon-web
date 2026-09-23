// Deploy the homepage, then prove it actually RENDERS, and roll back automatically if it does not.
//
// Why this exists: on 2026-09-16 a deploy reported complete success -- 189,827 bytes sent and
// read back, "script: true style: true" -- and shipped a blank homepage. WordPress had stripped
// the artifact's <script type="application/ld+json"> tag on OUTPUT, not in storage, so every
// stored-content check passed. Losing that tag also broke wptexturize's element tracking, which
// then converted 409 "--" sequences into &ndash; and 4,685 quotes into smart quotes, destroying
// the CSS custom properties and the bundle. React never mounted.
//
// The strip is intermittent (see the deploy notes), so the fix is usually just to re-run. What
// was missing was a check that fails when the page does not render, instead of one that passes
// because the bytes round-tripped.
//
// usage: node deploy_safe.js <backup-label>
//   e.g. node deploy_safe.js pre-hero-v4
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const label = process.argv[2] || "pre-deploy";
const run = (cmd, args) => execFileSync(cmd, args, { cwd: __dirname, encoding: "utf8", stdio: "pipe" });

// resolve the current front page by slug -- the id churns with every deploy
const env = {};
for (const line of fs.readFileSync("C:/Users/info/mcp-server/.env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const BASE = env.WP_URL.replace(/\/$/, "");
const AUTH = "Basic " + Buffer.from(env.WP_USER + ":" + env.WP_APP_PASSWORD).toString("base64");
const H = { Authorization: AUTH, "Content-Type": "application/json" };

(async () => {
  const cur = await (await fetch(BASE + "/wp-json/wp/v2/pages?slug=run-santa-fe-2026&status=publish&context=edit", { headers: H })).json();
  const oldId = cur[0].id;
  console.log("current front page:", oldId);

  console.log("\n--- backup ---");
  console.log(run("node", ["backup_homepage.js", String(oldId), label]).trim());
  const backup = path.join(__dirname, "..", "backups",
    `homepage-${oldId}-${label}-${new Date().toISOString().slice(0, 10)}.json`);
  if (!fs.existsSync(backup)) throw new Error("backup not written, refusing to deploy: " + backup);

  console.log("\n--- deploy ---");
  console.log(run("node", ["recreate-wp-page.js"]).trim());

  console.log("\n--- render check (the part that was missing) ---");
  await new Promise(r => setTimeout(r, 4000));
  const html = await (await fetch(BASE + "/?cachebust=" + Date.now(), {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0 Safari/537.36" },
  })).text();

  // Each of these was violated by the blank deploy, and each is cheap to check.
  const checks = {
    "artifact json-ld script tag survived": html.includes('<script type="application/ld+json">{"@context"'),
    "no smart-quote texturize damage":      html.split("&rdquo;").length - 1 < 5,
    "custom properties intact (no &ndash;)": !html.includes("&ndash;tw-") && !html.includes("var(&ndash;"),
    "var(--) still present":                (html.split("var(--").length - 1) > 50,
    "hero markup present":                  html.includes("hero3"),
  };
  let ok = true;
  for (const [name, pass] of Object.entries(checks)) {
    console.log(`  ${pass ? "PASS" : "FAIL"}  ${name}`);
    if (!pass) ok = false;
  }

  if (ok) {
    console.log("\nDEPLOY OK. Still confirm React mounts (#root children > 0) with the live-state-check skill.");
    return;
  }

  console.log("\n*** RENDER CHECK FAILED -- rolling back automatically ***");
  console.log(run("node", ["restore_homepage.js", backup]).trim());
  console.log("\nRolled back. The strip is intermittent: re-running often succeeds.");
  process.exit(2);
})().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
