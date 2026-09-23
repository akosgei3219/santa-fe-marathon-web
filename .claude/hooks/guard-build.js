// PreToolUse/Bash guard: refuse a bare `node build.js` for the homepage.
//
// Why (structural and permanent):
//   build.js            READS  ../run-santa-fe-2026.src.html       (repo root)
//                       WRITES ../run-santa-fe-2026.prod.src.html  (repo root)
//   recreate-wp-page.js READS  ./run-santa-fe-2026.prod.src.html   (landing-src)
// A bare `node build.js` updates the repo-root artifact while landing-src keeps the
// PREVIOUS one, so a deploy straight afterwards publishes yesterday's page to the live
// race site and reports success. driver.mjs runs the same build and then copies the
// result down to landing-src, which is why it is the command to use.
//
// History, so nobody re-widens this without cause:
//   2026-09-22 the matcher was widened to also block driver.mjs build|verify|shot, because
//   the authored JSX was stale and ANY build would have restored the Warehouse 21 address
//   (an emergency shelter). The JSX back-port completed the same day and is verified, so
//   that hazard is gone and the widening was reverted. Only the path split above remains.
//
// Reads the hook payload on stdin; prints a deny decision only when it matches.
// Uses node, not jq -- jq is not installed on this machine.
// Allows: the driver (it reconciles both copies), and anything that is not `node build.js`.

let buf = "";
process.stdin.on("data", (d) => (buf += d));
process.stdin.on("end", () => {
  let cmd = "";
  try {
    cmd = (JSON.parse(buf).tool_input || {}).command || "";
  } catch (e) {
    return; // unparseable payload -> stay out of the way
  }

  // `node build.js` (optionally `./build.js`) at the start or after a ; && || separator,
  // and not the driver, which runs build.js itself and then syncs landing-src.
  const isBareBuild =
    /(^|[;&|]\s*)node\s+(\.[\\/])?build\.js\b/.test(cmd) && !/driver\.mjs/.test(cmd);

  if (!isBareBuild) return;

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason:
          "Blocked: `node build.js` writes the prod artifact to the REPO ROOT, but " +
          "recreate-wp-page.js reads it from landing-src/. Deploying straight after a bare " +
          "build ships the PREVIOUS artifact to the live site with no error.\n" +
          "Use the driver instead -- same build, then it syncs both copies:\n" +
          "  node .claude/skills/run-santa-fe-homepage/driver.mjs build\n" +
          "  node .claude/skills/run-santa-fe-homepage/driver.mjs verify   (build + assert)\n" +
          "Building itself is safe again: the authored JSX was back-ported and verified on " +
          "2026-09-22, so it no longer restores the Warehouse 21 address. See CLAUDE.md.",
      },
    })
  );
});
