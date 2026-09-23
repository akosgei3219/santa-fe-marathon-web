# Homepage v5 — non-corporate draft (NOT DEPLOYED)

Kosgei, 2026-09-16: *"yes, start drafting v5 in source. keep turquoise and Anton."*
Ships **after race day (Sun Sept 20)**, never before — see Timing.

## Isolation

Nothing here touches the live page. The canonical sources stay byte-identical
(`3194e8f1929f8237640eb9d9584c9292` at the time of writing — check it after every run):

```bash
md5sum ../../run-santa-fe-2026.src.html ../../../run-santa-fe-2026.src.html
```

`build_v5.js` mirrors `../../build.js` but confines both the source and the artifact to this
directory. **Do not run `../../build.js` to build v5** — it reads the repo-root source and writes
the repo-root prod artifact, which is the file `recreate-wp-page.js` deploys. That is how an
unapproved redesign would get staged for the next deploy.

The canonical `driver.mjs` also cannot verify v5: its hero probe asserts the six-slide v4
structure. v5 has its own driver now (see below).

```bash
python patch_v5_hero.py && python patch_v5_fixes.py && python patch_v5_phone.py  # already applied
node build_v5.js        # -> run-santa-fe-2026.prod.src.html (this dir)
node preview_v5.mjs     # -> preview.html + v5-hero-desktop.png + v5-hero-phone.png
```

## Done

**Hero, to Kosgei's three-element spec.** Unboxed — the copy block has no background
(`rgba(0,0,0,0)` verified), the badge pills and the sponsor chip are gone. Full-bleed photo under
a flat 40% overlay, replacing the old four-stop 90° gradient, at **both** breakpoints. The fold is
now exactly: headline (title + tagline), sub-headline (date and location only, a new
`heroSubLine` string in EN and ES), single high-contrast CTA.

**Rule 9 preserved.** The single CTA still branches across open / walk-up / closed. A story-first
hero and a working Register button are not in conflict — the CTA *is* one of the three elements.

**Secondary detail relocated.** The three stat badges left the fold and became `HeroFacts`, an
editorial rule-separated band below the quick tiles — no pills, no shadows.

**Texture and type tokens.** Fractal-noise grain and a `--sf-serif` system stack are defined.

**Bilingual river-voice columns** (patch 4). The one idea worth keeping from the AI draft Kosgei
pasted on 9/17 — EN and ES shown together — rebuilt with true copy. `voiceParas` already exists
as four fully parallel paragraphs in both languages (the approved official event narrative, live
today), so **this section introduces zero new factual claims**. The section is unboxed: the old
rounded, bordered, tinted panel is gone, replaced by a stark rule between the columns. The
`--sf-serif` token is finally applied here — the brief asked for "a warm editorial serif for
stories and quotes", and this is the page's story.

`lang="en"` / `lang="es"` are set per column and asserted by `shot_voice.mjs`. Without them a
screen reader voices the Spanish with English phonetics, which is unintelligible — it is the main
accessibility reason to build a bilingual block properly rather than float two divs. Heading and
footer still follow the language toggle so the page's heading structure stays coherent.
Phone stacks to one column with a horizontal rule; verified.

Titles were NOT relabelled — CLAUDE.md records that Kosgei chose to leave the homepage river
titles as they are.

**Asymmetric story section** (patch 5). Was a perfectly symmetric `lg:grid-cols-2`. Now columns
of **1.55fr / 1fr** (measured 637px / 411px) with the side column **staggered 72px lower**, so
the two blocks never align at the top — equal columns starting at the same y read as a grid no
matter how they are styled. The photo breaks the grid's right edge with a negative margin.
Charity chips were filled, bordered pills; they are now a hairline-ruled list. Body copy uses
`--sf-serif`. Section-scoped card count: **0**.

Photo is sized by the dpr-2 rule, not CSS pixels: the slot is ~34vw (≈490px at 1440), so dpr 2
wants ≈980px and the srcset stops at the **1024 AVIF** variant. The 1536/2048 variants are JPEG
and the 2400px original would be exactly the oversizing corrected on 9/16. `check_variants.mjs`
confirmed the named variants really are their named sizes. The photo is already in
`HERO_SLIDES`, so it is usually a cache hit. Caption reuses the hero slide's wording
("On course, 2025"), so no new claim is introduced.

## PREVIEW FIDELITY BUG FOUND 9/17 — one token was not filled the way the deploy fills it

`%%IMG_ADVANCED%%` is **not a URL**. `recreate-wp-page.js:38` inlines a base64 WEBP read off disk
(`images/web/advanced-po-logo.webp`). `preview_v5.mjs` was substituting the AVIF in the media
library instead, and Chrome refuses that file with an `EncodingError` — so the sixth Community
Partners chip rendered **visibly empty** in every preview screenshot, and
`check_logo_ground.mjs` failed to measure the one logo the mixed-ground decision depends on.

Fixed: the preview now reads the same local file the deploy does. With it filled correctly the
logo renders as a white wordmark straight on the dark panel, which **confirms** the component's
comment — it is light artwork and needs a dark ground.

**A preview that fills a token differently from the deploy is not a preview.** If a token is not
a plain URL in `recreate-wp-page.js`, mirror its real treatment.

## BUILD BUG FOUND 9/17 — Tailwind was scanning the wrong file

`build_v5.js` wrote `content: ['./src/app.jsx']` into the v5 Tailwind config. **Tailwind resolves
a relative content glob against the CWD, not against the config file**, and the build runs with
cwd = `landing-src` — so it was scanning the CANONICAL build's `src/app.jsx`, not v5's. Every
Tailwind class introduced only in v5 was silently dropped from the stylesheet. The symptom: the
widened grid gaps were in the source, the build reported success, and the columns measured ~10px
apart in the browser instead of 44px.

The content glob is now absolute. A build that reads the wrong file and still exits 0 is the same
shape as the two-directory trap this proposal tree exists to avoid — **if a v5-only class does not
appear to apply, suspect the Tailwind scan before the CSS.**

## Phase 2 debox — the measured map

`count_boxes.mjs` separates **cards** (a fill, a full frame, or a shadow — text trapped in a
geometric container) from **rules** (a single hairline edge, which is the deboxed treatment).
Counting them together inflates the number and makes finished work look unfinished.

Progress: **92 → 78 → 65 cards** (rules 27 → 49). Deboxed sections read 1 card each — that one is
the section's own background ground, not a container trapping text.

| Patch | Section | Treatment |
|---|---|---|
| 6 | races, impact | shared `.race-card,.part-card` fill+frame+radius+shadow dropped; terracotta top rule separates; note chip → ruled text; partner fallback block → ghosted display type |
| 7 | guidelines, course | `.card` scoped debox; guidelines keep only the terracotta left edge; waypoint buttons → ruled list with a left-rule selected state; elevation chart unboxed |

Remaining, worst first:

```
 16  py-16      7  (page)     6  impact     6  pb-16
  5  plan       5  sponsors   4  races      4  shuttle
  3  top        3  kids-race-info
```

~~`py-16` / `pb-16` are section wrappers, not text-trapping cards~~ — **WRONG, never checked.**
Those are id-less sections named by their first CSS class; they were Lodging + travel and Race
perks, sixteen real cards. See "Phase 2 COMPLETE" below, and use `inventory_cards.mjs` rather than
this counter to judge what is left. Patch 7 scoped its edits to `#guidelines` and `#course`
because the **global** `.card` rule is shared by eight blocks.

**Screenshot artifact, not a bug:** clipping a tall region below the fold captures the fixed nav
at its viewport position, so it appears mid-section in `v5-guidelines-desktop.png`. The nav is
not overlapping content.

## Two deliberate substitutions — Kosgei should know

1. **Grain is generated, not a raster overlay.** `feTurbulence` as a data-URI, ~0.5 KB, no
   request. A film-grain image would re-add the weight just cut from phone load (~600 KB) on a
   page still carrying 21 oversized images.
2. **The editorial serif is a system stack, not a webfont.** The page already pays for Archivo and
   Martian Mono; a third family is a third round trip for body copy.

## Open decisions for Kosgei

**None — all cleared 2026-09-22.** See Closed decisions below.


## Closed decisions

- **"Keep Anton" — ACKNOWLEDGED 2026-09-22, no change.** Anton is the *inner-page* face
  (template 2365); the homepage's own display face is **Archivo**, loaded in the build.
  Re-verified on the day: the homepage loads only `family=Archivo` and `family=Martian+Mono`,
  and contains no Oswald or Bebas. (A grep for "Anton" returns 4 hits — all of them inside
  "Antonio Lopez", the founder's name, not a font declaration. Do not mistake those for a
  stray font reference.) This was always a clarification rather than a decision.
- **Capitol Ford in the hero — KEPT. Ruled by Kosgei 2026-09-22.** Stays as "presented by"
  plain type, the Title sponsor alone. A strict three-element reading of the hero brief would
  have removed it, but it is part of the official event name and `/sponsors/` sells "Logo on
  race website" in the Title package.
  **Asked at the same time whether the Gold and Silver sponsors should join it in the hero:
  NO.** SFOED (City of Santa Fe Economic Development) and Jirani Kahawa stay in the tiered
  `#sponsors` section. Exclusive hero placement is part of what the Title package sells;
  adding the other tiers would dilute it and re-expand the fold the redesign just cleared.
- **Sponsor naming.** The Silver logo's alt text said only "Jirani"; corrected to
  **"Jirani Kahawa"** (CLAUDE.md: "Jirani (Jirani Kahawa / Jirani Kenyan Coffee)", and the
  river narrative already used the full name). Deployed 2026-09-22.
  **"SFOED" was NOT adopted as public wording** — the published name stays "City of Santa Fe
  Economic Development". The abbreviation is not in canon and a civic sponsor's name is not
  something to shorten unilaterally. Say so if you want it changed.
- **Sponsor placement — brief item 2 DECLINED by Kosgei 2026-09-22.** The brief asked for
  “a subtle footer titled Local Partners”. The tiered `#sponsors` section stays exactly as
  it is: **Title** (Capitol Ford) → **Gold** (City of Santa Fe Economic Development) →
  **Silver** (Jirani) → **Community Partners** (six logos). Reasons, so this does not get
  reopened as an oversight:
  1. `/sponsors/` sells “Logo on race website” in the Title package, and tier
     differentiation is substantially what Gold and Silver buyers are paying for. A
     subtle footer flattens the thing that was sold.
  2. “Local Partners” would silently reverse Kosgei's own 2026-09-16 ruling naming that
     tier **“Community Partners”**. See [[sfhm-sponsor-tiers]].
  3. Several entries are not “local partners” in that sense — City of Santa Fe Economic
     Development and Santa Fe County are civic bodies.

  **No code change: declining means the current structure is already correct.**

## Still to do

**Nothing.** All five items from the original list are closed — see below.

### Simplified nav — DONE, shipped 2026-09-23

Flat IA, no dropdowns: **Race Info** (`#races`) · **Event & Courses** (`#course`) ·
**Travel & Lodging** (`/lodging-travel/`) · **Results & Photos**
(`/race-information/results-photos/`), plus a high-contrast anchor button.

Two deviations from the brief, both deliberate:

1. **The anchor button has FOUR states, not a bare “Register”.** Rule 9 requires it to branch
   on the three registration states; a fourth was added 2026-09-23 for race day.

   | state | label | href |
   |---|---|---|
   | open | Register | RunSignup |
   | walkup | 5K walk-ups until 7:45 AM | `#races` |
   | **race day** | **Live results** | `/race-information/results-photos/` |
   | closed (now) | Get race updates | `/news/newsletter/` |

   Race day is its own module-level window (`RACE_DAY_OPEN` 05:00 → `RACE_DAY_SHUT`
   midnight, local) sharing `REG_NOW`, so **`?regnow=<epoch ms>` previews every state**.
   All four were verified that way, on the live page, because rule 9 warns that a green
   `driver.mjs verify` only exercises one of them.

   “Live updates” was rejected as a permanent label: the button points at a **monthly
   email** (`footerNewsSub` says so) and there is no live event until Sept 2027, so it
   would promise coverage that does not exist — the same error shape as Register on a
   sold-out race. It now says Live results only while runners are actually on course.
   The driver asserts `reg control respects sold-out` so a regression fails the build.
2. **Results & Photos is a fifth link.** The brief said four. The first flat build shipped
   nothing to results: collapsing 21 dropdown links to four left **zero** routes to that
   page anywhere on the homepage, and the footer carries only mailto and tel. Four days
   after the race that is the page people arrive for. Kosgei added it as the fifth.

**17 links that were in the dropdowns are no longer in the homepage nav** — among them
course map, course highlights, relays/exchange zones, time limits, event schedule, packet
pickup, transportation & parking, host city guide, spectator guide, finish-line festival,
volunteer, and the in-page anchors for plan/guidelines/faq/story/sponsors. That is the
intended trade of a flat IA; if any of them need to stay reachable, add them here or to
the footer rather than reinstating the dropdowns.

### Distance badges — DONE, shipped 2026-09-23

Kosgei's spec: modern geometric shapes, inline with the heading on desktop, stacked above
the registration control on phones. **Circle** = Half Marathon, **hexagon** = 3-Amigos
Relay, **triangle** = Santa Fe 5K. Kids Dash is unbadged (only three were specified).
Stroke-only SVG, `aria-hidden` (the distance is already in text beside them), terracotta.

**The brief said “4K” for the triangle. That is the RETIRED name** — it became the Santa Fe
5K, and CLAUDE.md lists “4K” among strings that must never appear. Built as 5K; the served
page contains zero occurrences of “4K”.

Mobile reflow without duplicating DOM: `.race-head` becomes `display:contents` under 640px
so the badge and the h3 join the card's own flex column, then the badge is `order:1` and
`.race-card>*:last-child` is `order:2` — the last child is the registration control in every
REG_STATE branch, so it works without touching the conditional JSX.

### Topographic overlay — DONE, shipped 2026-09-23

`.hero3-contour`: generated SVG contour lines at **opacity .05** exactly as specified,
between `.hero3-shade` and `.hero3-copy`, `pointer-events:none`, `aria-hidden`, generated
rather than rastered (same reasoning as the `.hero3::after` grain).

**Contrast RE-MEASURED after adding it, on all six slides** — the spec's own justification
for .05 was that it preserves AA, so it was checked rather than assumed:

| | before overlay | with overlay | needs |
|---|---|---|---|
| headline (worst) | 3.51 | **3.38** | 3.0 |
| sub-line (worst) | 5.84 | **5.96** | 4.5 |

AA still passes everywhere. **Do not raise the opacity without re-measuring** — the headline
has only 0.38 of margin.

### Asymmetric/staggered story — DONE (finished 2026-09-22)

Mostly already built and the item was stale: measured on the live page, the grid is
asymmetric (**637px / 411px**) and `.story-side{margin-top:4.5rem}` puts the side column
**72px lower** than the text, so the two blocks never align at the top.

One of the three devices was NOT working: the photo was supposed to break the grid's right
edge, and measured `figWidth == column width`. The negative margin was applied (-44px) but
computed `max-width` was **100%**, clamping it — a theme rule with higher specificity than
`html body #root figure.story-fig`. **It only reproduces with the served theme CSS**; in the
bare artifact the same rule worked, which is why it had never been caught. Fixed with an
explicit width plus `!important` on both width and max-width, and a matching reset on the
stacked mobile layout.

Verified on the deployed page: desktop figure **455px** vs column **411px** — breaks the
edge by **44px**, computed max-width `none`; mobile resets to the column width; no
horizontal overflow at either. **Test layout fixes against a fetched copy of the live page,
not the bare artifact — the theme CSS changes the answer.**

### Borderless cards — DONE (verified 2026-09-22, the item was stale)

`node inventory_cards.mjs` against the shipped build: **31 boxes total — 13 BUTTON/LINK,
14 SECTION GROUND, 2 TEXT CARD, 2 LOGO PLATE.** Exactly **one** still carries a drop
shadow, and it is a deliberate exception already documented in the source: `.shuttle-fig`,
“NOT touched: both images arrive on white and need that ground in either colour scheme” —
the same mixed-ground reasoning that spared the community sponsor row. Deboxing it would
make those logos unreadable.

The rest are not debox targets: buttons are meant to be framed, SECTION GROUND entries are
section backgrounds rather than cards (the old `count_boxes.mjs` mislabelled those), and the
remaining three are intentional chrome — `.top-strip` banner, the sticky header, and the
`.hero-slidebar` caption bar that is part of the v5 hero. **Nothing left to debox.**

## Contrast: measured, FAILED, FIXED, re-measured — 2026-09-22

The worry in the old to-do list was right. Measured by rendering each slide with the copy
hidden (so sampled pixels are pure background) and computing WCAG ratios against
`rgb(255,248,239)` over the **true text ink rects** (via Range client rects — the element
box is 768px but the sub-line's ink is only 518px, and using the box samples bright photo
where there are no glyphs, which makes the result falsely pessimistic).

**Before** (flat 40%): headline **2.44:1** (needs 3.0, it is 62.6px/900 = large text),
sub-line **2.52:1** (needs 4.5 — at 11.5px it is *normal* text, which is the binding
constraint). Failed on slides 1, 2 and 6, and at the 95th percentile too, so not a
single-bright-pixel artefact.

**Fix.** Raising the flat overlay to .60 also passed, but it darkens the whole photo and
contradicts Kosgei's “subtle 40%”. Instead the 40% base is kept and a 90deg gradient
darkens only the copy column, so the subject on the right stays bright:

```css
.hero3-shade{background-color:rgba(12,12,14,.40);
  background-image:linear-gradient(90deg,rgba(12,12,14,.60) 0%,rgba(12,12,14,.42) 45%,rgba(12,12,14,0) 75%)}
```

**After**, measured on the rebuilt artifact across all six slides: headline **>= 3.51**,
sub-line **>= 5.84**. AA passes everywhere. The copy block keeps `rgba(0,0,0,0)` — no scrim
was added, so the “unboxed” requirement is intact.

Mobile was left at flat .40 on purpose: there the copy sits *below* the photo band, not
over it. **Re-measure if the slide set, the copy width or the text sizes change.**

## v5 driver — written 2026-09-22

`proposals/v5/driver.mjs` — `build | serve [port] | verify | shot [out.png]`. No `live`
command on purpose: v5 is not deployed. **20/20 checks pass.**

It builds with `build_v5.js` and, after every build, re-hashes all four canonical files and
throws `ISOLATION BROKEN` if any changed. Note the two archived proposal drivers do NOT do
this — it points `UNIT`/`PROD` at the canonical paths, which is precisely the hazard
`build_v5.js` exists to avoid. hero-v3 and hero-v4 were both retired 2026-09-22 into
`backups/retired/`, so **this is now the only proposal driver.** Do not resurrect either
archived copy as a starting point.

Probes assert what makes v5 *v5*, which is why the canonical driver could not: exactly one
hero CTA, badge pills gone, `.hero3-sponsor` chip gone, presented-by as plain type, stats
relocated to `.hero-facts`, and the copy block computing to `rgba(0, 0, 0, 0)` — Kosgei's
“unboxed” requirement, now machine-checked. It also guards the facts the back-port fixed
(no Warehouse 21, Running Hub, sold-out, nested results URL) and that the contrast gradient
is still on `.hero3-shade`.

**It sets `--window-size=1440,900`, and that is load-bearing.** Chrome defaults to 800x600,
which is inside `@media (max-width:1023px)`, where the mobile rule re-declares
`.hero3-shade` with the `background:` SHORTHAND — resetting `background-image` and wiping
the desktop contrast gradient. At the default size the probe reports the fix missing when it
is present. The canonical driver sets a size in `shot()` but NOT in `verify()`, so its own
hero probes describe the mobile layout. Worth fixing there too.

The shade check asserts the CSS is present; it does not re-measure pixels. Re-measure if the
slide set, copy width or text sizes change.

## Timing

Every homepage deploy is `recreate-wp-page.js` = delete + recreate, with no rollback between.
It blanked the site twice in the week of 9/15. A 10-minute outage on Saturday costs registrations
(online close is Sat 5 PM); on Sunday morning it costs runners their race-day information.
Ship Monday.

## Phase 2 COMPLETE (patch 11, 9/17)

**Correction first:** earlier status reports called the `py-16` / `pb-16` entries "section
wrappers, not cards". That was never checked. `count_boxes.mjs` names a section by
`id || className.split(" ")[0]`, so id-less sections surfaced under a CSS class name.
`inventory_cards.mjs` names sections by their HEADING and classifies every boxed element — it
showed those were Lodging + travel (ten real text cards) and Race perks (six). Use the inventory,
not the counter, to decide what is left.

Patch 11 deboxed: race perks (6), Tricia's ambassador card, both travel tips, Pecos, the Concept
Hotel Group panel, and the quick-access bar. **92 -> 37 boxed elements; 2 are text cards**, and
both are kept deliberately:

| Kept | Why |
|---|---|
| top strip | full-width banner with the countdown and "roads into the start close at 7:00 AM" |
| hero slide bar | caption + dots + pause sit ON the photo; the ground is legibility, and it is a control group |
| 19 buttons / links | interactive things should look interactive |
| 14 section grounds | a section's own background, not text trapped in a container |
| nav bar, `.shuttle-fig` | the nav; the bus photo + logo arrive on white |
| community sponsor chips | mixed-ground row (patch 8) |

**Concept Hotel Group needed recolouring, not just unboxing.** Its text was all light, built for a
dark ground. It also carried `.on-panel`, which sets keyboard FOCUS rings to the light panel
colour — left on a light ground the focus ring vanishes. Both removed. The official-vs-also
ranking over Pecos is kept with rule weight (3px terracotta vs hairline) and heading colour.

**BUG CAUGHT BY THE SCREENSHOT, NOT THE GUARD:** the patch guarded against light colour tokens in
the Concept JSX and passed — while the phone number rendered near-invisible.
`a.lodge-phone{color:var(--panel-fg)!important}` (an old fix to beat sitewide link colours on the
dark panel) overrode the inline colour; **inline styles lose to `!important`.** Fixed to ink.
`contrast_sweep.mjs` now MEASURES rendered contrast with getComputedStyle: 58 text elements across
the four deboxed sections, **0 failures, lowest 4.74:1**. Guards read source; only the rendered
page tells you what paints.

**Quick bar:** its fill existed to keep tiles legible where `margin-top:-60px` overlapped the hero
photo. The overlap went with the fill; tiles now sit on the ground split by vertical rules.
