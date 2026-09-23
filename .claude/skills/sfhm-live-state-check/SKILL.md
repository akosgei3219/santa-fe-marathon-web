---
name: sfhm-live-state-check
description: Verify what santafehalfmarathon.com ACTUALLY renders, rather than what the source says it should. Drives real headless Chrome and reads the live DOM across registration states (open / walk-up / closed), EN and ES, and desktop vs phone widths. Use this whenever you are about to claim a page "looks right", before and after any homepage deploy, when checking time-switched copy or CTAs, when a colour or layout question comes up (read computed styles, never the stylesheet), when something behaves differently on phone, or when asked to debug a page with no described symptom. Especially important because `driver.mjs verify` only ever exercises the OPEN registration state — a green build says nothing about the other two, and has already passed while a walk-up-state bug was live.
---

# Checking what the live site really renders

The homepage is a compiled React app whose copy changes with the clock. Source and rendered
output diverge for three reasons that bite repeatedly:

1. **Time-switched copy.** `REG_STATE` is `open`, `walkup` or `closed` depending on the moment
   of page load. Reading the source tells you all three strings exist; it does not tell you
   which one a runner sees on Saturday evening.
2. **Sitewide CSS outranks the app.** Elementor kit rules and `html body img{height:auto!important}`
   override what the component asked for. The stylesheet is not the answer; `getComputedStyle`
   on the live page is.
3. **Layout differs by width.** Elements that are `0×0` on desktop can be 340px tall on a
   phone, and sticky bars only mount after scrolling.

A raw `fetch` cannot answer any of these — it returns the bundle, not the render. This skill
drives real Chrome over CDP and reads the DOM.

## The one rule that matters most: probe JS goes in a file

`scripts/probe.mjs` takes `--probe <file.js>` and sends that file to the page **verbatim**.
Use it. Do not rebuild this harness inline.

Every time this harness has been written inline — probe source inside a template literal,
inside a shell heredoc, inside a JSON tool argument — an escaping layer has eaten a backslash
and the probe has returned confident nonsense. Two real failures, same afternoon:

- `/\s+/` arrived as `/s+/` and deleted every lowercase **s** from the page text. The keyword
  filter then matched nothing, and three states were reported as "no copy found" on a page
  that was entirely healthy.
- `"\t\r\n"` inside a template literal expanded to real control characters, putting a literal
  newline inside a regex literal. That is a `SyntaxError`, the evaluate returned no value, and
  every state reported `NO RESULT` — which looks exactly like a page that failed to mount.

Both produced plausible, wrong findings that were nearly reported as fact. A probe file has
one layer — the file — and nothing rewrites it on the way in.

The second rule follows from the first: **never swallow an evaluate exception.** A thrown probe
and a broken page are indistinguishable unless you print the exception. `probe.mjs` prints
`PROBE THREW` and says explicitly that it is not a finding about the page.

## Running it

```bash
node .claude/skills/sfhm-live-state-check/scripts/probe.mjs \
  --probe .claude/skills/sfhm-live-state-check/probes/hero-cta.js \
  --states "open=,walkup=?regnow=1789862400000,closed=?regnow=1789912800000"
```

Options: `--url` (default the live site; point at `http://localhost:8130/` to check a build
before deploying), `--viewport desktop|phone|<W>x<H>`, `--scroll <px>`, `--wait <ms>`, `--json`.

## The registration states

`?regnow=<epoch ms>` forces a moment in time on any page:

| state | when | preview value |
|---|---|---|
| open | before Sat 19 Sept 5:00 PM MDT | *(no parameter)* |
| walkup | Sat 5:00 PM → Sun 7:45 AM | `1789862400000` (Sat 6 PM) |
| closed | after Sun 7:45 AM | `1789912800000` (Sun 8 AM) |

**Always check all three.** `driver.mjs verify` runs twenty probes and every one of them
exercises the open state only. It passed green while the hero collapsed walk-up and closed into
a single branch, so during the fifteen-hour window when the 5K was still taking entries the
hero said "Race-day schedule" and nothing above the fold told a runner they could still enter.
A green build is not evidence about the other two states.

Check **both languages** too. The ES strings are a separate table and can drift independently.

## Checking phone

Pass `--viewport phone`. Two things only appear there:

- **Sticky bars mount on scroll.** At load position a fixed-position scan finds nothing, which
  reads identically to "there is no bar". Pass `--scroll 2600`.
- **Find fixed elements by computed position, not class name.** A guess at `[class*="sticky"]`
  returned nothing and looked like a clean result; `getComputedStyle(el).position === "fixed"`
  found the bar immediately.

## Colours and layout

Read `getComputedStyle`, never the stylesheet — sitewide rules win over component styles, and
the whole point is to find out who won. When reporting a colour, also check whether it is
authored or injected: grep the source for the hex. If it is in the source it is a deliberate
choice, and "fixing" it to match the documented palette would reverse a design decision. The
hero CTA's `#FF5400` is exactly this case, and is documented in CLAUDE.md for that reason.

For structure, probe for: horizontal overflow (`documentElement.scrollWidth` vs
`clientWidth`), elements whose bounding box escapes the viewport, overlapping siblings, and
zero-size nodes. Note that a layered hero *should* report overlaps — photo, shade and content
stacked deliberately — so overlap alone is not a fault.

## Interpreting what comes back

Be careful about the difference between what the page shows and what you infer from it. An
empty 340×340 div reads as dead space until you look at a screenshot and see it is reserving
the photo's subject below the copy. Take a screenshot when a structural finding would otherwise
rest on numbers alone, and look at it before reporting.

Equally, a probe that finds nothing is not evidence of absence until you have confirmed the
probe works. Run it against a state you know renders the thing, or check that the selector
matches at all, before writing "not present" in a report.

## content-visibility makes below-fold measurements lie

Every section below the fold carries `content-visibility:auto`. The DOM exists, but the browser
has not laid it out or painted it, so measurements taken there are not what a reader would see.
This is why `innerText` omits those sections (use `textContent`), and it also poisons anything
computed from painted state — most sharply **contrast**.

A contrast pass over the whole page reported 26 failures including several at exactly 1:1, on
headings that are plainly legible on screen. 1:1 means foreground and background resolved to
the same colour: the instrument was broken, not the page. The colour walk itself is sound — on
rendered content it correctly climbs transparent ancestors to `header#top` and finds the dark
panel — it just cannot be trusted on sections that were never painted.

If you need a real contrast audit, scroll the full height in steps and let each section render
before sampling, and drop any element whose ancestors report an unrendered state. Until then,
do not publish a failure count. Reporting a number from an unvalidated instrument is worse than
reporting nothing, because it gets acted on.

## Known benign signals

The homepage reports `FAILED net::ERR_ABORTED Fetch` on essentially every load, in every
registration state, on a single-state run with a nine-second settle. It is state-independent
and predates the 2026-09-15 hero work, so it is almost certainly a deliberate `AbortController`
(the RunSignup results call, or a fetch cancelled on unmount) rather than a fault. Do not treat
it as a regression. Worth a proper look after race day, not during.

The lesson generalises: before reporting any console or network error as a finding, check
whether it appears in states your change never touched. If it does, it is baseline noise.

## Writing a new probe

Copy `probes/hero-cta.js`. The file must evaluate to a single expression — an IIFE returning a
plain object is the easiest shape — and everything it returns gets printed per state. Write
normal JavaScript; escapes are safe in a probe file.
