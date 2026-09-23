"""v5 DRAFT patch 9 -- debox shuttle and kids-race-info.

Kosgei 9/17: "now debox shuttle and kids-race-info."

SHUTTLE -- the two leg cards are the same pattern already handled in guidelines and races: a
filled, bordered, rounded box carrying a 3px terracotta top edge that is the only part doing
work. Edge stays, box goes.

  KEPT: `.shuttle-fig`, the white panel holding the bus photo and the Santa Fe Trails logo. The
  component's own comment explains it -- "Both images arrive on white, so they share one white
  panel in either colour scheme, with fixed dark text inside it." That is the same category as
  the Lightning Boy plate and the sponsor logo plates: a ground an image needs, not decoration.
  In dark mode removing it would put a white-background photo and a white-background logo
  straight onto a dark ground with no consistent edge.

KIDS-RACE-INFO -- the entire section body sits in one translucent, bordered, rounded panel on the
dark ground, which is exactly the treatment already removed from the river-voice section in
patch 4. Same fix: drop the fill, frame and radius; the section's own terracotta top border and
editorial spacing carry it. Its internal hairline divider above the CTA row stays -- that is a
rule, not a box.

usage: python patch_v5_debox4.py
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


# ---------------------------------------------------------------- shuttle legs
sub("shuttle leg cards",
    '<div key={i} className="card p-5" style={{borderTop:"3px solid var(--terra)"}}>',
    '<div key={i} className="shuttle-leg">')
sub("shuttle legs grid gap",
    '<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mb-5">\n'
    "          {t.shuttleLegs.map(",
    '<div className="grid gap-x-12 gap-y-8 grid-cols-1 sm:grid-cols-2 mb-7">\n'
    "          {t.shuttleLegs.map(")

# ---------------------------------------------------------------- kids panel
sub("kids panel box",
    '<div className="max-w-[750px] mx-auto rounded p-7 sm:p-9" '
    'style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.12)",'
    'color:"var(--panel-fg)"}}>',
    '<div className="kids-panel max-w-[750px] mx-auto" style={{color:"var(--panel-fg)"}}>')

# ---------------------------------------------------------------- css
ANCHOR = "/* v5 Phase 2 (plan): a day divider only needs a rule. */\n"
if s.count(ANCHOR) != 1:
    sys.exit(f"FATAL: css anchor found {s.count(ANCHOR)} times")

CSS = (
  "/* v5 Phase 2 (shuttle legs): same shape as the guidelines rules -- keep the terracotta edge,\n"
  "   drop the box. The white .shuttle-fig panel is NOT touched: both images arrive on white and\n"
  "   need that ground in either colour scheme. */\n"
  ".shuttle-leg{background:none;border:0;border-top:3px solid var(--terra);border-radius:0;"
  "padding:1rem 0 0}\n"
  "html body #root .shuttle-leg strong{display:block;margin-bottom:.4rem;color:var(--terra);"
  "font-family:'Archivo',system-ui,sans-serif;font-weight:800;letter-spacing:.01em}\n"
  "/* v5 Phase 2 (kids): the translucent bordered panel goes, same as the river-voice section.\n"
  "   The section's own terracotta top border and the spacing carry it. */\n"
  ".kids-panel{background:none;border:0;border-radius:0;padding:1.25rem 0 0}\n"
)
s = s.replace(ANCHOR, CSS + ANCHOR)

io.open(SRC, "w", encoding="utf-8", newline="").write(s)
print(f"{SRC}: {orig} -> {len(s)} chars ({len(s)-orig:+d})")
for label, d in edits:
    print(f"  {d:+6d}  {label}")
print("\n.shuttle-fig white photo panel kept on purpose -- a ground the images need")
