---
name: run-santa-fe-homepage
description: Build, run, screenshot, verify and deploy the Santa Fe International Half Marathon homepage (compiled React page embedded in WordPress). Use when asked to run, start, build, preview, test, screenshot, smoke-test or deploy the homepage / landing page / santafehalfmarathon.com front page.
---

# Run the Santa Fe homepage

The homepage is a **single-file React app** (`run-santa-fe-2026.src.html`) that esbuild
compiles into an HTML **fragment**, which is then pasted into a WordPress page as the site's
front page. There is no dev server and no `npm start`.

Everything below is driven by **`.claude/skills/run-santa-fe-homepage/driver.mjs`** — it
builds, serves, drives headless Chrome, and asserts on real rendered behaviour.

**All paths are relative to `landing-src/`.** `cd` there first.

> **Production warning.** Deploying is `node recreate-wp-page.js`, which **deletes the live
> WordPress front page and recreates it**. The driver deliberately cannot do this. Never run
> it to "test" something.

## Prerequisites

Node and a Chromium-family browser. Both were already present:

```bash
node --version          # v24.18.0
npm --version           # 11.16.0
```

The driver auto-detects the browser; on this machine it found:
`C:\Program Files\Google\Chrome\Application\chrome.exe` (Edge is also probed as a fallback).

Dependencies are already installed in `landing-src/node_modules`. If missing:

```bash
npm install react@18.3.1 react-dom@18.3.1 lucide-react@0.454.0 esbuild tailwindcss@3.4.14
```

## Run (agent path) — the driver

```bash
cd landing-src
node .claude/skills/run-santa-fe-homepage/driver.mjs verify
```

`verify` builds, serves the page locally, drives headless Chrome, and runs twenty probes against
the **rendered** app — it clicks the concierge open, types a query, checks the routed answer,
flips the language toggle and confirms the Spanish copy actually swapped. Exits **0** on
success, **1** on any failure. Verified output:

```
prod src assembled: 154 KB | bundle: 125 KB | tailwind css: 15 KB
PASS  react mounted
PASS  hero headline
PASS  hero CTAs: register + results
PASS  hero value badges
PASS  top strip + countdown
PASS  quick-access bar
PASS  title sponsor badge
PASS  four race cards
PASS  community grid, no MAC
PASS  logistics accordion
PASS  hero big-sky photo
PASS  shuttle bus + logo
PASS  results on /results-photos/
PASS  IA v4 nav groups
PASS  Store is a dead chip
PASS  concierge button
PASS  concierge routes parking
PASS  language toggle present
PASS  spanish copy applies
PASS  Pecos lodging present

nav groups : The Races|Runner Info|Experience Santa Fe
concierge  : /transportation-parking/ | Free Santa Fe Trails shuttles loop the 3 lots about every 15

all checks passed
```

Other commands:

```bash
node .claude/skills/run-santa-fe-homepage/driver.mjs build        # build only
node .claude/skills/run-santa-fe-homepage/driver.mjs serve 8130   # foreground preview, Ctrl-C
node .claude/skills/run-santa-fe-homepage/driver.mjs shot         # PNG -> shots/homepage.png
node .claude/skills/run-santa-fe-homepage/driver.mjs live         # read-only prod assertions
```

`shot` writes `.claude/skills/run-santa-fe-homepage/shots/homepage.png` (1400x1000).
**Open it and look at it** — a blank or indigo-only image means React did not mount.

`live` fetches production and asserts (all PASS as of 2026-09-11):

```
PASS  HTTP 200
PASS  front page is the React build
PASS  hero headline
PASS  concierge shipped
PASS  Pecos lodging
PASS  no retired sand hex
WPO-Cache-Status: not cached
```

## Edit → verify loop

1. Edit `run-santa-fe-2026.src.html` (the single source; components are inline functions).
2. `node .claude/skills/run-santa-fe-homepage/driver.mjs verify`
3. `... driver.mjs shot` and look at the PNG if the change is visual.

## Deploy (destructive — only on explicit instruction)

Always build through the driver, never with a bare `node build.js` — see the two-directory
trap in Gotchas.

```bash
node .claude/skills/run-santa-fe-homepage/driver.mjs verify
```

Then, and only when told to publish:

```
node recreate-wp-page.js
```

`recreate-wp-page.js` resolves the existing page **by slug** (`run-santa-fe-2026`), **deletes
it**, recreates it, reapplies SEO and repoints the front-page setting. **The page ID changes
every deploy** — never hardcode it. It prints `*** STRIPPED ***` if WordPress ate the inline
script; that is intermittent, and the fix is to delete the page and run it again. Afterwards
purge caches (`wp_purge_cache` with `elementor_files` + `wpo_cache`) and re-check logged out,
then `driver.mjs live`.

## Gotchas

- **The build spans two directories, and that silently ships stale code.** `build.js` *reads*
  `../run-santa-fe-2026.src.html` and *writes* `../run-santa-fe-2026.prod.src.html` — both at
  the **repo root** — while `recreate-wp-page.js` reads the artifact from **`landing-src/`**.
  So a bare `node build.js` leaves `landing-src` holding the previous build, and a deploy
  right after it publishes yesterday's page while reporting success. `driver.mjs build` owns
  both copies: it reconciles the sources first, then copies the fresh artifact down. It prints
  `sync: prod artifact -> UPDATED in landing-src` when the copies had drifted.
- **A parallel session edits these files while you work.** The source grew by 207 bytes
  mid-session during this very write-up. That is why `build` *refuses* to run when the two
  source copies differ rather than overwriting one — `landing-src` is canonical, but diff
  before you reconcile, because the other copy may hold merged live diffs you want.
- **The built artifact is a fragment, not a page.** It starts at `<title>` — no doctype, no
  `<html>`, no `<body>`, and **no `#root` div**; WordPress supplies those. Opening it
  directly in a browser renders nothing. The driver wraps it in a shell with `<div id="root">`
  before serving. This is why "just open the file" fails.
- **`--virtual-time-budget` hangs forever** on this page. It runs two `setInterval` timers
  (race countdown, sponsor ticker); under virtual time they fire endlessly, the budget never
  drains, and `--dump-dom` never returns. The driver injects a shim that stubs `setInterval`
  to a far-future delay so virtual time can reach the end. `setTimeout` is left alone, so
  React and the probes still work.
- **Chrome's `--timeout=N` is not a substitute** — it aborts navigation and dumps an empty
  `<html><head></head><body></body></html>` (41 chars).
- **`spawnSync` deadlocks the driver.** The static server runs *in the driver's own process*,
  so a blocking spawn freezes the event loop, the server never answers Chrome, and you get
  that same empty DOM. Chrome must be spawned **async**.
- **`innerText` lies.** Below-fold sections use `content-visibility:auto`; their DOM exists
  but is not rendered, so `innerText` omits them and content assertions silently fail. Use
  `textContent`.
- **The hero is `min-height:100vh`**, so the `--window-size` height you pass *is* the hero
  height. A 2600px-tall window stretches the hero and produces a strange capture. 1400x1000
  is a realistic viewport.
- **The hero photo is a remote asset** on santafehalfmarathon.com. In local preview it often
  does not load and you see the indigo `#26265E` fallback. That is expected locally and is
  not a regression.
- **Sitewide CSS outranks page CSS.** `body:not(.home) h1,h2,h3{font-family:Anton}` is
  specificity (0,1,2) and beats a single-class descendant selector, and the Elementor kit
  styles bare `a` and `button`. Verify styling with `getComputedStyle` on the **live** page,
  never by reading the stylesheet.
- **Discount codes must never appear here.** They are email-only. Hotel codes SHM and
  RUNSANTAFE26 are the only on-site exceptions.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `verify` hangs past ~60s | A `--virtual-time-budget` call reached a page with live `setInterval`s. Ensure the timer shim is injected (it is, in `wrap()`), or switch that call to a wall-clock kill. |
| `FAIL: probe never ran`, DOM length 0 | Chrome produced nothing — the driver prints `chrome stderr`. Usually the browser path is wrong; check the `CHROMES` list in `driver.mjs`. |
| `FAIL: probe never ran`, DOM length 41 | Empty document: either `--timeout` aborted navigation, or the server was blocked by a sync spawn. |
| Screenshot is blank / indigo only | React did not mount. Confirm the wrapper supplied `<div id="root">` and re-run `verify` for the specific failing probe. |
| `verify` passes but the LIVE homepage is blank, console "Invalid or unexpected token" | WordPress wptexturize rewrote an `&` inside a script at output: any `&` between a `<` and the next `>` becomes `&#038;`, even in code. Deploy 5023 went blank this way on 2026-09-15. `recreate-wp-page.js` now runs `texturize-gate.js` and refuses such a build before deleting the old page. To diagnose a live page, run `node --check` on each served inline script. |
| `build.js failed` | Run `node build.js` directly in `landing-src` for the real esbuild error. Missing deps → the `npm install` line above. |
| `ERROR: SOURCE DIVERGED -- refusing to build` | The two source copies differ (usually a parallel session). Diff `landing-src/run-santa-fe-2026.src.html` against `../run-santa-fe-2026.src.html`, keep the intended content in both, re-run. Do not blindly overwrite. |
| Deployed, but the page shows older content | You built with a bare `node build.js`. Re-run `driver.mjs build` (it syncs `landing-src`) and deploy again. |
| Deploy "succeeded" but the site looks unchanged | Cache. Purge `elementor_files` + `wpo_cache`, then re-fetch logged out and check the `WPO-Cache-Status` header. |
