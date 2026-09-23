# Deploying the homepage — 2027 edition

The complete procedure for getting `run-santa-fe-2026.src.html` changes onto
the live front page of santafehalfmarathon.com, written down after the
September 2026 → 2027 switchover so next time it's one page instead of an
afternoon of rediscovery.

The page slug stays `run-santa-fe-2026` even though the content is 2027 —
renaming the slug would break the front-page pointer and every cached URL for
no visitor-facing gain.

## The pipeline in one breath

```
edit run-santa-fe-2026.src.html   (repo root AND landing-src/ copy — keep both)
cd landing-src
node build.js                     (JSX → bundle → run-santa-fe-2026.prod.src.html)
node recreate-wp-page.js          (deletes + recreates the live WP page)
purge caches, verify logged out
```

Source of truth is the **src** file; the prod file is a build artifact.
Never hand-edit the prod bundle. Commit both after building — a correct
build reproduces the committed prod file **byte-for-byte**, which is also
your pre-deploy check that nothing drifted.

## Where you can deploy from

- **A machine with the WordPress credentials and open internet** (the
  laptop): everything works.
- **A Claude cloud session**: only if its environment has
  `santafehalfmarathon.com` in the allowed network domains **and**
  `WP_USER` / `WP_APP_PASSWORD` set as environment variables. Two hard-won
  facts: a running container does NOT pick up environment changes — only a
  session started after the change does; and cdnjs.cloudflare.com may be
  blocked, which breaks rendered verification (see below) but not the
  build itself.

The deploy script authenticates with `WP_USER` + `WP_APP_PASSWORD`
(a WordPress Application Password, not the login password) via Basic auth
to the REST API. Never commit or print these.

## Step by step

1. **Sync and check the guard.** `git pull origin main`. The build tooling
   refuses to run if the root and `landing-src/` copies of the src file
   have diverged ("SOURCE DIVERGED"). Diff them, keep the intended content
   in **both**, and remember other sessions merge live diffs into these
   files — reconcile, don't overwrite.
2. **Build.** `cd landing-src && node build.js`. Deps are pinned:
   `react@18.3.1 react-dom@18.3.1 lucide-react@0.454.0 esbuild
   tailwindcss@3.4.14` (`npm install` if node_modules is missing).
   `git status` must come out clean when deploying already-committed
   content — a dirty prod file means the src and bundle disagree; stop and
   find out why before deploying.
3. **Verify rendered behaviour** (skippable for content-only tweaks, not
   for structural ones): `node
   .claude/skills/run-santa-fe-homepage/driver.mjs verify` runs 21 probes
   against the real rendered app. Quirks discovered in sandboxes:
   - The page loads React/ReactDOM as **globals from cdnjs**; if the
     network blocks cdnjs, React never mounts, presence probes all fail
     and absence probes all "pass" (vacuously). Serve the same UMD files
     from `node_modules` locally if you need to verify offline.
   - The driver's `--virtual-time-budget` timing can fire the probe before
     React's scheduler finishes on newer Chromium builds. Real-time waits
     (Playwright with `waitForFunction`) are reliable everywhere.
   - The prod fragment carries its own `<div id="root">`; don't wrap it in
     a second one.
4. **Deploy.** `node recreate-wp-page.js`. What it does, in order: fetches
   the current page by slug, **deletes it**, recreates it with the new
   content, substitutes media-library image URLs, re-applies the AIOSEO
   title/description, and re-points `page_on_front` (deleting the front
   page otherwise silently flips the site to showing posts).
   - **WordPress intermittently strips `<script>` tags on create.** The
     script detects this and warns — when it warns, run it again until
     clean. Always let it verify raw bytes.
   - Take a backup first if the live page has content newer than the repo
     (`backup_homepage.js`, or GET the page JSON via the REST API).
5. **Purge caches and verify logged out.** Fetch `https://santafehalfmarathon.com/`
   with no auth (private browser window) and check:
   - HTTP 200, page renders (React mounted, not a blank hero)
   - "2027 race weekend" and "Fin de semana de carrera 2027" present
   - JSON-LD contains `"startDate":"2027-09-18"`, zero occurrences of `SoldOut`
   - the two cdnjs react script tags survived
   If the HTML is stale, purge the cache layer (Redis/page cache) and
   re-check. A permalink re-save (Settings → Permalinks → Save) fixes
   rewrite-rule 404s after the delete/recreate, but never change the
   structure — that moves every URL on the site.

## The structured data (JSON-LD)

The homepage embeds a `SportsEvent` block near the top of the src file.
As of commit `5774a23` it describes the **2027 weekend**: Sat Sept 18
(5K, 10K, Kids 1K Dash) and Sun Sept 19, 2027 (Half Marathon, 3-Amigos
Relay), date-only `startDate`/`endDate`, `EventScheduled`, and **no offers
array** — registration isn't open and the 2027 RunSignup race doesn't
exist, so an offer would have pointed at the closed 2026 page.

**When 2027 registration opens** (single follow-up commit):
- restore `offers` with the new RunSignup race ID, one Offer per event,
  `availability: https://schema.org/InStock`, real `validThrough`
- swap every registration link in the page body — as of the switchover
  there are 7 (`raceId=83604` ×4 and the 2026 race-page URL ×3)
- confirm exact start times and put them back in `startDate`

Two more copies of the event schema live in **WordPress, not this repo**:
All in One SEO's schema settings, and the Corre Santa Fe page. Both were
brought in line with the 2027 values on 2026-09-23 and verified clean
(no 2026-09-20, no SoldOut). Whenever the page schema changes again -
including the registration-opens update above - change those two in the
same sitting, or Google sees conflicting events.

## 2026 references: all cleared (2026-09-23)

The switchover is complete site-wide. Fixed and verified logged-out, in
order: homepage tiles + embedded JSON-LD (deployed), both AIOSEO schema
copies, the Elementor footer date, and the menu (packet-pickup 2026
venue/hours stripped, cancelled-Expo entry removed). The repo's
footer-block.html was updated to 2027 in the same sitting; mega-menu.html
was already 2027-aware. Intentional 2026 mentions remain only as history:
the menu's sold-out note, its 2026 Archive section, and the results CTA.

## If it goes wrong

- Page 404s after deploy → re-save permalinks (structure unchanged), purge cache.
- Front page shows blog posts → `page_on_front` didn't get re-pointed; the
  deploy script normally handles it, re-run or set Settings → Reading.
- Page renders without interactivity → scripts were stripped; re-run the
  deploy until the script's byte-verify passes.
- Need the old page back → the deploy deletes by slug; restore from the
  backup JSON (step 4) or rebuild from the previous git commit and deploy that.
