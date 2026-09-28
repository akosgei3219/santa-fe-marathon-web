# Homepage: calmer race cards (#races)

## Audit (2026-09-28)

Early-bird fees on the cards (Half $75, Relay $195 per team of 3, 10K $50, 5K $30,
Kids free) match the race director's 2027 ruling. RunSignup race 89412 does not show
2027 pricing yet, so the site is currently the only place these figures appear; set
them the same in RunSignup when registration opens.

Other race homepages checked 2026-09-28: Run Sedona, Missoula Marathon, Duke City
Marathon, Grandma's Marathon, Big Sur. None shows fees on the homepage; all link to
registration, where fees live.

What made the cards busy: a price line and a "2027 registration not open yet" line on
all five cards; the date/time repeated in the blurb and again in the date line (Half,
Relay, 5K); the Half blurb repeating elevation figures the course section already
shows; a phone-only stray shape icon below each card. The 5K line "fast if you want
it" also broke the site rule against fast-course framing.

## What the snippet does

- One line under "Event Info": registration isn't open yet, early-bird entry starts
  at $30, the Kids Fun Dash is free (EN/ES). Per-card price and status lines hidden.
- Shorter blurbs that don't repeat the date line; 5K drops "fast if you want it".
- Kids card date line matches the other cards.
- Phones: the decorative shape icon is hidden.

Section height: desktop 1157 to 948 px, phone 2374 to 1746 px.

Originals stay in the page, hidden; switch the snippet off to undo.
When registration opens, update or remove the one-line note (it says "isn't open yet").

## Install (WordPress)

New code snippet, front page only: `style.css` as CSS, `script.js` as JavaScript
(footer). Works alongside `sfhm-kids-fun-run`. Purge cache and check logged out.
