---
name: sfhm-fact-preflight
description: >
  Fact-check any Santa Fe International Half Marathon copy BEFORE it is published or
  sent — website edits, nav labels and hint text, emails to runners or vendors, social
  captions, press materials, RunSignup content, concierge answers. Use this skill
  whenever copy is about to ship to any surface, whenever the user pastes draft copy
  (their own or from another AI tool) and asks to apply, inject, deploy, send, or
  post it, and whenever generated code contains user-facing race facts (times,
  dates, venues, prices, distances, names). Supplied copy on this project has
  repeatedly contained invented facts stated confidently — run the preflight even
  when the copy looks authoritative, ESPECIALLY when it looks authoritative.
---

# SFHM fact pre-flight

Every piece of race copy is a promise to a runner. A wrong shuttle time strands
someone at a parking lot on race morning; a wrong start time means a missed race.
This project's history proves the danger is real: drafts from the race director,
from parallel AI sessions, and from external tools have all arrived carrying
confident, specific, wrong numbers. The pre-flight exists because **plausible and
verified are different things**, and only verified ships.

## The verdict standard

Every checkable claim in the copy gets exactly one verdict:

- **VERIFIED** — matches a settled source (see hierarchy below). Ships as-is.
- **CONTRADICTS** — conflicts with a settled source. Correct it to the settled
  fact and say what you changed. Never ship the supplied version, even if the
  user wrote it — surface the correction so they can overrule with a ruling.
- **UNVERIFIABLE** — appears in no settled source. Do not ship it. Either remove
  it, replace it with a link to the page that owns that topic, or hold the whole
  piece and ask. An invented fact published once becomes a "source" that future
  checks accidentally verify against — this is how errors fossilize.

A piece of copy passes pre-flight only when every claim is VERIFIED and the
rule gates below are clean.

## Source hierarchy (order matters)

1. **The user's explicit rulings** — newest wins. Check the top of the memory
   ledger (`MEMORY.md` in the project memory directory) for dated rulings; they
   supersede everything, including the live site.
2. **Project `CLAUDE.md`** — the sections "The event", "Race-week logistics",
   "Hard content rules", and critically **"Open conflicts"**: a claim touching an
   open conflict must not ship a number at all until the conflict is ruled.
3. **The live site** — fetch the page that owns the topic (gear facts live on
   /gear-bag-drop/, shuttle facts on /transportation-parking/, etc.) and read
   what it actually says. One fetch per page, reuse the snapshot — the host
   firewalls heavy sweeps. For Elementor pages, rendered HTML is fine for
   reading; never trust `post_content` for them.
4. **RunSignup race 83604** — a second content surface that drifts; when the
   claim is about registration mechanics (close times, event config), RunSignup's
   actual configuration is the truth, and mismatches with intent get flagged, not
   papered over.

When sources disagree with each other, that is a finding in itself — report the
disagreement instead of picking one silently.

## What counts as a checkable claim

Times and dates (starts, closures, windows, deadlines — including implicit ones
like "one week early"), venues and addresses, distances and elevations, prices,
age ranges, counts (aid stations, divisions, lots), proper names (people,
sponsors, artists, operators), URLs and slugs, attributions (who made what, who
provides what), and **tense**: a present/future-tense claim about a date that has
passed is wrong even if the fact was once true. Compare every date against today.

## Rule gates (hard, user-set — check even when no "fact" is wrong)

- **Discount codes and percentages are email-only.** Never on the website, never
  in social posts, never in press. Hotel codes SHM and RUNSANTAFE26 are the only
  on-site exceptions.
- **No emoji and no arrow characters on the website** (including entities like
  `&#9203;` and unicode escapes hiding in JSON). Social captions may use emoji.
- **Attribution by name, exactly as ruled**: Maasai artisans make BOTH the
  finisher medal and age-group medallions; Gasali Adeyemo (2026 shirt); Santa Fe
  YouthWorks (post-race food). Never invent partner programs.
- **Never write "no longer starts downtown"-style history** — the old start was
  La Tienda Plaza in Eldorado.
- **Never sell on PBs, elite times, or "fast course" claims** — the brand sells
  altitude and heritage.
- **Names are load-bearing**: the event is the Santa Fe International Half
  Marathon; Santa Fe Trails is the shuttle *operator*, not a partner or a photo
  source; check any org name against its real role before it ships.

## Procedure

1. **Extract** every checkable claim from the copy into a list. Include the
   quiet ones (a photo caption's "8-foot-wide trail" is a claim; "the race
   doesn't touch downtown" is a claim).
2. **Check each claim** down the source hierarchy. Stop at the first source that
   settles it. Note which source settled it — the report should let the user
   audit your audit.
3. **Run the rule gates** over the whole piece.
4. **Report** in this shape, then apply corrections only if asked to ship:

```
## Pre-flight: <what the copy is / where it's going>
Verdict: PASS | FAIL (N corrections, M unverifiable)

| Claim | Verdict | Settled by | Correction |
|---|---|---|---|

Rule gates: <clean, or violations>
Unverifiable claims held: <list, with what you did instead>
```

5. If the copy came from the user and contains inventions, say so plainly —
   name the invented figure and where you looked for it. They may hold a fact
   you don't (a new operational decision); the report gives them the chance to
   ruled it in. Until they do, it stays out.

## Known error patterns

Read `references/error-catalog.md` before your first pre-flight in a session —
it is the project's actual caught-error history (wrong start times, invented
shuttle waves, phantom cutoffs, retired attributions, name drift). Errors on
this project rhyme; the catalog is what they rhyme with.
