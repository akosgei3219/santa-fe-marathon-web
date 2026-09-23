# Homepage proposals

| directory | status |
|---|---|
| `v5/` | **SHIPPED 2026-09-22.** Promoted to the canonical source and deployed; the live homepage now runs v5. This directory is the draft it came from — the living copy is `run-santa-fe-2026.src.html` at the repo root and in `landing-src/`. Edit there, not here. |
| `hero-v3/` | **RETIRED 2026-09-22** → `backups/retired/hero-v3-2026-09-22/` (23 files). |
| `hero-v4/` | **RETIRED 2026-09-22** → `backups/retired/hero-v4-2026-09-22/` (5 files). |

Pre-v5 production is archived at `backups/pre-v5-ship-2026-09-22/` (source, artifact and
the old driver) if the redesign ever needs backing out.

Both archives were verified byte-identical with `diff -rq` before removal.

## Why they were retired

Both were superseded and both carried the same hazards for no benefit: **12 "Warehouse 21"
and 10 "Railyard"** references each (Warehouse 21 is an emergency shelter — the address the
production back-port existed to remove), 4 stale `InStock` offers, the un-nested
`/results-photos/` URL, and a full duplicate of the canonical driver carrying the path bug
below. hero-v3 also had a `SKILL.md` duplicating the active skill's own
`name: run-santa-fe-homepage`.

Historical record is kept: `docs/homepage-hero-v3.md` and `docs/homepage-hero-v3-preview/`
stay where they are, and the directory itself is in `backups/retired/`.

## The copied-driver path bug (now archived with them)

Both proposal drivers were copies of the canonical one and kept its path arithmetic. That is
wrong at this depth: from `landing-src/proposals/<name>`, `../../..` resolves to the **repo
root**, not `landing-src`. The consequences were that `PROD` pointed at the canonical
repo-root artifact, and `SRC_REPO` at `C:/Users/info/OneDrive/Desktop/run-santa-fe-2026.src.html`
— outside the project, which `build()` creates on first run. Neither had ever been run from
its own directory, which is the only reason nothing was damaged.

hero-v3's copy was fixed before retirement; hero-v4's never was. Both are archived, so the
bug is out of the active tree — **but do not run either archived driver, and do not copy
one as a starting point.**

**A copied driver inherits path arithmetic relative to the original's depth. Re-derive the
paths; never trust an inherited `../../..`.** `v5/driver.mjs` is the correct template: it
builds only within its own directory and re-hashes all four canonical files after every build,
throwing `ISOLATION BROKEN` if any changed.
