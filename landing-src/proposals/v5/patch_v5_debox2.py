"""v5 DRAFT patch 7 -- debox guidelines and course (Phase 2, next 15 cards).

Kosgei 9/17: "now debox guidelines and course."

SCOPED ON PURPOSE. The global rule is `.card{background+border+radius}` and it is shared by
EIGHT blocks across guidelines, course, plan, faq, sponsors, shuttle and kids-race-info.
Rewriting it would debox five sections nobody asked about, in one unverified sweep. These edits
are scoped to `#guidelines` and `#course`; when the rest are wanted, the same treatment can be
lifted to the global rule in one line.

GUIDELINES -- eight rule cards, each a filled, bordered, rounded box with a 4px terracotta left
edge. The left edge is the only part doing real work, so it stays and everything else goes. A
rule reads as "new object" without trapping the text.

COURSE -- two different problems:
  * The waypoint list is four <button aria-pressed> toggles styled as bordered boxes that gain a
    fill when selected. They are genuinely interactive, so they keep an affordance -- but it
    becomes a terracotta LEFT RULE on the selected item plus hairline separators, instead of four
    competing rectangles. Selection is still conveyed three ways: the rule, the mile colour, and
    the detail paragraph that appears. `aria-pressed` already carries it for assistive tech, so
    the visual change removes no information.
  * The elevation chart sits in a filled card. The chart's own gridlines and labels already give
    it structure; the box around it is redundant.

usage: python patch_v5_debox2.py
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


# ---------------------------------------------------------------- guidelines
sub("guidelines rule cards",
    '<div key={i} className="card p-5" style={{borderLeft:"4px solid var(--terra)"}}>',
    '<div key={i} className="guide-rule">')
sub("guidelines grid gap",
    '<div className="grid gap-4 grid-cols-1 sm:grid-cols-2">\n'
    "          {t.guideRules.map(",
    '<div className="grid gap-x-12 gap-y-8 grid-cols-1 sm:grid-cols-2">\n'
    "          {t.guideRules.map(")

# ---------------------------------------------------------------- course waypoints
sub("course waypoint buttons",
    'className="text-left rounded p-3.5 cursor-pointer"\n'
    '                style={{border:"1px solid "+(wp===i?"var(--terra)":"var(--line)"),'
    'background:wp===i?"var(--card)":"transparent",color:"var(--ink)",font:"inherit"}}>',
    'className={"wp-item cursor-pointer"+(wp===i?" is-on":"")}\n'
    '                style={{font:"inherit",color:"var(--ink)"}}>')
sub("course waypoint list gap",
    '<div className="flex flex-col gap-2">\n'
    "            {t.waypoints.map(",
    '<div className="flex flex-col">\n'
    "            {t.waypoints.map(")

# ---------------------------------------------------------------- course chart
sub("course chart card",
    '<div className="card p-4 overflow-x-auto">',
    '<div className="course-chart overflow-x-auto">')

# ---------------------------------------------------------------- css
ANCHOR = "/* v5 Phase 2: deboxed. No fill, frame, radius or shadow -- a rule does the separating. */\n"
if s.count(ANCHOR) != 1:
    sys.exit(f"FATAL: css anchor found {s.count(ANCHOR)} times")

CSS = (
  "/* v5 Phase 2 (guidelines): the 4px terracotta edge was the only part doing work. Keep it,\n"
  "   drop the fill, frame and radius. */\n"
  ".guide-rule{background:none;border:0;border-left:3px solid var(--terra);border-radius:0;"
  "padding:.1rem 0 .1rem 1.15rem}\n"
  "html body #root .guide-rule strong{display:block;margin-bottom:.4rem;color:var(--terra);"
  "font-family:'Archivo',system-ui,sans-serif;font-weight:800;letter-spacing:.01em}\n"
  "/* v5 Phase 2 (course waypoints): still buttons, so they keep an affordance -- but it is a\n"
  "   left rule plus hairline separators, not four competing rectangles. Selection is carried by\n"
  "   the rule, the mile colour, the detail paragraph, and aria-pressed. */\n"
  "html body #root button.wp-item{display:block;width:100%;text-align:left;background:none;"
  "border:0;border-bottom:1px solid var(--line);border-left:3px solid transparent;border-radius:0;"
  "padding:.9rem 0 .9rem 1rem}\n"
  "html body #root button.wp-item.is-on{border-left-color:var(--terra)}\n"
  "html body #root button.wp-item:hover{border-left-color:var(--ink-soft)}\n"
  "html body #root button.wp-item:focus-visible{outline:2px solid var(--terra);outline-offset:2px}\n"
  "/* v5 Phase 2 (course chart): the chart's own gridlines give it structure; the box is redundant. */\n"
  ".course-chart{background:none;border:0;border-radius:0;padding:.25rem 0 0}\n"
)
s = s.replace(ANCHOR, CSS + ANCHOR)

io.open(SRC, "w", encoding="utf-8", newline="").write(s)
print(f"{SRC}: {orig} -> {len(s)} chars ({len(s)-orig:+d})")
for label, d in edits:
    print(f"  {d:+6d}  {label}")
print("\nglobal .card left alone -- plan / faq / sponsors / shuttle / kids untouched")
