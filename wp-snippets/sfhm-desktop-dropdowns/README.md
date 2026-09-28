# Homepage header: desktop dropdowns (Run Sedona style)

Adds three dropdown menus to the homepage header on screens 1200px and wider,
the way RunSedona.com's header works: **Race Info**, **Runner Guide** and
**Community & Event**, each opening its own short list, plus a plain
**Results & Photos** link and the existing registration button.

Below 1200px nothing changes: the menu button opens the same grouped panel as
before. On every width, that panel and the dropdowns now also close with the
**Esc** key or a click outside the header.

## What it changes

| Width | Before | After |
|---|---|---|
| 1200px and up | Four plain links (no dropdowns) **and** a menu button that opens a 27-link, 3-column panel | Three dropdowns + Results & Photos + registration button. Menu button hidden. |
| Under 1200px | Menu button opens the grouped panel | Same, plus Esc / outside click closes it |
| All widths | "Register Now" in the panel points at the 2026 RunSignup page | Hidden until 2027 registration opens (delete the marked CSS rule that day) |

The dropdown entries are the same links, in the same order, as the grouped panel in
the live homepage bundle (checked 2026-09-28), so the homepage, the panel and the
inner-page header all offer the same pages. Spanish uses shorter top-level labels
(La carrera, Guía del corredor, Comunidad, Resultados) because the full phrases push
the ES/EN toggle off a 1200-1440px screen.

Keyboard: Enter/Space opens a menu, Down arrow moves into it, Up/Down/Home/End move
between links, Esc closes and returns focus, Tab out closes it.

## Why a snippet and not a rebuild

The live homepage has been edited in place many times since the last source build.
A comparison on 2026-09-28 found about 150 differences between the live compiled page
and what `run-santa-fe-2026.src.html` would build (early-bird prices and the 10K card
exist only on the live page; the 2027 registration dates exist only in the source).
Rebuilding and redeploying from the source today would undo those live edits, so this
change is layered on top of the live page instead. It only touches the header, and
switching the snippet off restores the previous header exactly.

Worth fixing separately: the live page still has the **2026** registration constants
(race date, close date and the old RunSignup URL), so the header will not switch to
"Register" on its own when 2027 entries open. The source already has the 2027 values.

## Install (WordPress)

1. In WordPress, add a new code snippet (the site uses Angie snippets; WPCode works too).
2. Paste `style.css` as its CSS and `script.js` as its JavaScript (load in the footer).
3. Limit it to the **front page only**.
4. Purge the cache, then check logged out at a wide window and on a phone:
   - wide: the three dropdowns open on hover and on click; the menu button is gone
   - phone: the menu button still opens the full panel; Esc closes it
5. To roll back, switch the snippet off.

## Tested

Headless Chromium against the live page on 2026-09-28, snippet injected:
1366px, 1440px, 1280px and 1200px (English and Spanish, no horizontal overflow),
1199px and 1024px (panel unchanged; Esc and outside click close it), 390px phone.
Hover, click, keyboard, Esc, outside click and the language switch all pass,
with no page errors.
