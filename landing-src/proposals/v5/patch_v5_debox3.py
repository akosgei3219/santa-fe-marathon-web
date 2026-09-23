"""v5 DRAFT patch 8 -- debox plan (schedule) and the sponsors tier boxes.

Kosgei 9/17: "now debox plan and sponsors."

PLAN -- each schedule day is a `.card p-5` (fill + frame + radius). Deboxed to a hairline top
rule per day, which is all a day divider needs, with the gap widened so white space separates
the days.

SPONSORS -- the Title / Gold / Silver tiers are translucent filled, bordered, rounded boxes on
the dark panel. Their logos already sit on their OWN white plates inside, so the outer boxes are
pure decoration and come off. Tier identity moves to the label plus a rule.

THE COMMUNITY ROW IS DELIBERATELY LEFT ALONE, and this is a judgement call, not an oversight.
That row is mixed-ground: five logos sit on white plates, Advanced Prosthetics rides straight on
the dark panel because its artwork is light. The outer chips are what make those two treatments
read as one object -- remove them and the row becomes five white plates and one floating logo.
I tried to verify the current state with `check_logo_ground.mjs` and the measurement did not
support a change:
  * Advanced Prosthetics -- the file the page serves would not decode into canvas, so the one
    logo the decision hinges on could not be measured at all.
  * Santa Fe County (210) and NAHN (194) came back "needs dark ground", which is WRONG: both
    report 0% transparency, so the mean is measuring their own baked-in white background rather
    than their marks. A brightness test only means what it appears to mean for artwork with real
    transparency.
Changing a load-bearing mixed-ground row on measurements that unreliable is how a logo silently
disappears. Flagged for Kosgei instead.

usage: python patch_v5_debox3.py
"""
import io, sys

SRC = "run-santa-fe-2026.src.html"
s = io.open(SRC, encoding="utf-8").read()
orig = len(s)
edits = []


def sub(label, old, new, count=1):
    global s
    n = s.count(old)
    if n != count:
        sys.exit(f"FATAL [{label}]: expected {count}, found {n}")
    s = s.replace(old, new)
    edits.append((label, len(new) - len(old)))


# ---------------------------------------------------------------- plan
sub("schedule day cards",
    '<li key={i} className="card p-5 grid gap-4 grid-cols-1 sm:grid-cols-[150px_1fr]">',
    '<li key={i} className="sched-day grid gap-4 grid-cols-1 sm:grid-cols-[150px_1fr]">')
sub("schedule list gap",
    '<ol className="list-none m-0 p-0 flex flex-col gap-4">',
    '<ol className="list-none m-0 p-0 flex flex-col gap-9">')

# ---------------------------------------------------------------- sponsors: title tier
sub("sponsors title tier box",
    '<div className="mx-auto max-w-[560px] rounded-md px-8 py-8 mb-5" '
    'style={{border:"2px solid var(--sunset)",background:"rgba(255,255,255,.05)"}}>',
    '<div className="sp-tier sp-tier-title mx-auto max-w-[560px] mb-8">')

# ---------------------------------------------------------------- sponsors: gold + silver
sub("sponsors gold/silver boxes",
    '<div className="rounded-md px-6 py-6 flex flex-col items-center justify-center gap-3" '
    'style={{border:"1px solid rgba(255,255,255,.35)",background:"rgba(255,255,255,.04)"}}>',
    '<div className="sp-tier flex flex-col items-center justify-center gap-3">', 2)
sub("sponsors tier grid gap",
    '<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 max-w-[760px] mx-auto mb-9">',
    '<div className="grid gap-x-12 gap-y-9 grid-cols-1 sm:grid-cols-2 max-w-[760px] mx-auto mb-10">')

# ---------------------------------------------------------------- css
ANCHOR = "/* v5 Phase 2 (guidelines): the 4px terracotta edge was the only part doing work. Keep it,\n"
if s.count(ANCHOR) != 1:
    sys.exit(f"FATAL: css anchor found {s.count(ANCHOR)} times")

CSS = (
  "/* v5 Phase 2 (plan): a day divider only needs a rule. */\n"
  ".sched-day{background:none;border:0;border-top:1px solid var(--line);border-radius:0;"
  "padding:1.35rem 0 0}\n"
  "/* v5 Phase 2 (sponsors): the tier logos already sit on their own white plates, so the outer\n"
  "   translucent boxes were pure decoration. Tier identity = the label plus a rule.\n"
  "   The COMMUNITY row keeps its chips on purpose -- it is mixed-ground (five white plates plus\n"
  "   one light logo straight on the panel) and the chips are what make it read as one object. */\n"
  ".sp-tier{background:none;border:0;border-radius:0;padding:1.4rem 0 0;"
  "border-top:1px solid rgba(255,255,255,.3)}\n"
  ".sp-tier-title{padding-top:1.8rem;border-top:2px solid var(--sunset)}\n"
)
s = s.replace(ANCHOR, CSS + ANCHOR)

io.open(SRC, "w", encoding="utf-8", newline="").write(s)
print(f"{SRC}: {orig} -> {len(s)} chars ({len(s)-orig:+d})")
for label, d in edits:
    print(f"  {d:+6d}  {label}")
print("\ncommunity sponsor row NOT touched -- mixed-ground, and the measurement was unreliable")
