"""v5 DRAFT patch 11 -- debox the last genuine text cards.

Kosgei 9/17: "now debox the remaining cards in v5."

CORRECTION THAT PROMPTED THIS: count_boxes.mjs names a section `id || className.split(" ")[0]`,
so sections without an id surfaced as "py-16" and "pb-16". Those 22 cards were described to
Kosgei as "section wrappers, not cards" without being inspected. inventory_cards.mjs showed they
were Lodging + travel (ten real text cards) and Race perks (six). A guess had been reported as a
fact.

DEBOXED HERE
  * Race perks -- six `.card` boxes; the 4px terracotta top edge stays, as in races.
  * Tricia Downing ambassador -- one `.card` holding photo + text.
  * Travel tips -- two `.card` boxes.
  * Pecos Trail Inn -- one `.card`; its booking-code chip loses its fill.
  * Concept Hotel Group panel -- see below; this one is not a one-line change.
  * Quick-access bar -- see below.

CONCEPT HOTEL GROUP: its text is all LIGHT (`var(--panel-fg)`, sunset headings, a white-ish code
chip) because it was built for a dark `var(--panel)` ground. Removing only the fill would leave
light text on the sand section -- unreadable. So the text is recoloured to the ink tokens at the
same time. It also carries `.on-panel`, which sets keyboard focus outlines to the LIGHT panel
colour; left in place on a light ground, the focus ring disappears and keyboard users lose their
place. `.on-panel` comes off with the fill.
  Concept is the OFFICIAL Lodging Partner and Pecos is "also offering race rates". The dark panel
  was what ranked them. That ranking is a commercial distinction, so it is preserved without the
  box: Concept keeps a 3px terracotta rule and a terracotta heading; Pecos gets a hairline.

QUICK-ACCESS BAR: a filled, framed, shadowed bar with `margin-top:-60px` so it overlaps the hero
photo. Its fill is what keeps the tiles legible where they sit ON the photo. So the overlap goes
with the fill -- it sits on the page ground, tiles separated by vertical rules. The facts band
(patch 2) is ordered after it and follows naturally.

KEPT, DELIBERATELY -- not cards in the Phase 2 sense
  * Buttons and links (~20). What is interactive should look interactive.
  * Section grounds (~13). A section's own background, not text trapped in a container.
  * `.shuttle-fig` -- bus photo and logo both arrive on white and need that ground.
  * The community sponsor chips -- a mixed-ground row (patch 8).
  * The hero slide bar -- caption, dots and pause sit ON the photo; the ground is legibility,
    and it is an interactive control group.
  * The top strip -- the full-width banner carrying the countdown and "roads into the start
    close at 7:00 AM", the most time-critical line on the page.
  * The sticky nav and the skip link.

usage: python patch_v5_debox5.py
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


# ---------------------------------------------------------------- perks
sub("perk cards",
    '<div key={i} className="card p-5" style={{borderTop:"4px solid var(--terra)"}}>\n'
    '              <div className="mb-2.5" style={{color:"var(--terra)"}}><Ic name={p.ic} size={26}/></div>',
    '<div key={i} className="perk">\n'
    '              <div className="mb-2.5" style={{color:"var(--terra)"}}><Ic name={p.ic} size={26}/></div>')
sub("perks grid gap",
    '<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">\n'
    "          {t.perks.map(",
    '<div className="grid gap-x-12 gap-y-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">\n'
    "          {t.perks.map(")

# ---------------------------------------------------------------- ambassador
sub("ambassador card",
    '<div className="card p-6 grid gap-6 grid-cols-1 md:grid-cols-[260px_1fr] items-start">',
    '<div className="amb-block grid gap-8 grid-cols-1 md:grid-cols-[260px_1fr] items-start">')

# ---------------------------------------------------------------- travel: concept panel
sub("concept panel box",
    '<div className="rounded p-7 sm:p-9 mb-6 on-panel" '
    'style={{background:"var(--panel)",color:"var(--panel-fg)",border:"2px solid var(--terra)"}}>',
    '<div className="lodge-official mb-10">')
sub("concept eyebrow colour",
    '<span className="mono text-[11px] font-extrabold tracking-[.18em] uppercase" '
    'style={{color:"var(--sunset)"}}>{t.lodgeEyebrow}</span>',
    '<span className="mono text-[11px] font-extrabold tracking-[.18em] uppercase" '
    'style={{color:"var(--terra)"}}>{t.lodgeEyebrow}</span>')
sub("concept heading colour",
    '<h3 className="text-[1.3rem] font-black uppercase tracking-[.03em] mt-2 mb-3" '
    'style={{color:"var(--sunset)"}}>{t.lodgeName}</h3>',
    '<h3 className="text-[1.5rem] font-black uppercase tracking-[.03em] mt-2 mb-3" '
    'style={{color:"var(--terra)"}}>{t.lodgeName}</h3>')
sub("concept statement text",
    '<p className="m-0 mb-5 text-[.9rem] opacity-90 max-w-[62ch]">{t.lodgeStatement}</p>',
    '<p className="m-0 mb-5 text-[.9rem] max-w-[62ch]" style={{color:"var(--ink-soft)"}}>{t.lodgeStatement}</p>')
sub("concept property chips",
    '<span key={p} className="text-[.85rem] font-bold px-4 py-2.5 rounded-sm" '
    'style={{background:"rgba(255,255,255,.05)",borderLeft:"3px solid var(--terra)"}}>{p}</span>',
    '<span key={p} className="lodge-prop">{p}</span>')
sub("concept how text",
    '<p className="m-0 mb-4 text-[.85rem] opacity-85 max-w-[62ch]">{t.lodgeHow}</p>',
    '<p className="m-0 mb-4 text-[.85rem] max-w-[62ch]" style={{color:"var(--ink-soft)"}}>{t.lodgeHow}</p>')
sub("concept phone colour",
    'style={{color:"var(--panel-fg)",textDecoration:"none"}} href="tel:+15057720476">',
    'style={{color:"var(--ink)",textDecoration:"none"}} href="tel:+15057720476">')
sub("concept code chip",
    '<span className="mono text-[.7rem] rounded-[3px] px-2.5 py-1.5" '
    'style={{background:"rgba(255,255,255,.1)"}}>{t.code}: <strong>SHM</strong></span>',
    '<span className="lodge-code">{t.code}: <strong>SHM</strong></span>')
sub("concept copy button colour",
    'style={{background:"transparent",color:"var(--sunset)",border:"1.5px solid var(--terra)"}} onClick={()=>copy(0,"SHM")}>',
    'style={{background:"transparent",color:"var(--terra)",border:"1.5px solid var(--terra)"}} onClick={()=>copy(0,"SHM")}>')

# ---------------------------------------------------------------- travel: pecos
sub("pecos card",
    '<div className="card p-6 sm:p-7 mb-6">\n'
    '          <span className="mono text-[11px] font-extrabold tracking-[.18em] uppercase" '
    'style={{color:"var(--terra)"}}>{t.pecosEyebrow}</span>',
    '<div className="lodge-also mb-10">\n'
    '          <span className="mono text-[11px] font-extrabold tracking-[.18em] uppercase" '
    'style={{color:"var(--terra)"}}>{t.pecosEyebrow}</span>')
sub("pecos code chip",
    '<span className="mono text-[.7rem] rounded-[3px] px-2.5 py-1.5" '
    'style={{background:"var(--chip)"}}>{t.code}: <strong>RUNSANTAFE26</strong></span>',
    '<span className="lodge-code">{t.code}: <strong>RUNSANTAFE26</strong></span>')

# ---------------------------------------------------------------- travel: tips
sub("travel tip cards",
    '<div key={i} className="card p-5">\n'
    '              <strong className="block mb-1.5" style={{color:"var(--terra)"}}>{p.name}</strong>',
    '<div key={i} className="travel-tip">\n'
    '              <strong className="block mb-1.5" style={{color:"var(--terra)"}}>{p.name}</strong>')
sub("travel tips grid gap",
    '<div className="grid gap-4 grid-cols-1 sm:grid-cols-2">\n'
    "          {t.travelTips.map(",
    '<div className="grid gap-x-12 gap-y-8 grid-cols-1 sm:grid-cols-2">\n'
    "          {t.travelTips.map(")

# ---------------------------------------------------------------- css
ANCHOR = "/* v5 Phase 2 (shuttle legs): same shape as the guidelines rules -- keep the terracotta edge,\n"
if s.count(ANCHOR) != 1:
    sys.exit(f"FATAL: css anchor found {s.count(ANCHOR)} times")

CSS = (
  "/* v5 Phase 2 (perks): terracotta top edge kept, box dropped -- same as races. */\n"
  ".perk{background:none;border:0;border-top:3px solid var(--terra);border-radius:0;padding:1.1rem 0 0}\n"
  "/* v5 Phase 2 (ambassador): photo + text on the ground, separated by a rule. */\n"
  ".amb-block{background:none;border:0;border-top:1px solid var(--line);border-radius:0;padding:2rem 0 0}\n"
  "/* v5 Phase 2 (lodging): the dark panel ranked Concept above Pecos. The box goes; the ranking\n"
  "   stays, carried by rule weight and heading colour. Text recoloured to ink -- it was all light,\n"
  "   built for the dark ground. .on-panel removed so focus rings are not light-on-light. */\n"
  ".lodge-official{background:none;border:0;border-top:3px solid var(--terra);border-radius:0;"
  "padding:1.6rem 0 0}\n"
  ".lodge-also{background:none;border:0;border-top:1px solid var(--line);border-radius:0;padding:1.4rem 0 0}\n"
  "html body #root span.lodge-prop{display:inline-block;padding:.15rem 0 .15rem .75rem;"
  "border-left:3px solid var(--terra);font-size:.88rem;font-weight:700;color:var(--ink)}\n"
  "html body #root span.lodge-code{font-family:'Martian Mono',monospace;font-size:.72rem;"
  "padding:.2rem 0;border-bottom:1px dashed var(--terra);color:var(--ink)}\n"
  ".travel-tip{background:none;border:0;border-top:1px solid var(--line);border-radius:0;padding:1rem 0 0}\n"
  "/* v5 Phase 2 (quick bar): the fill existed to keep the tiles legible where they overlapped the\n"
  "   hero photo. The overlap goes with the fill; tiles sit on the ground, split by vertical rules. */\n"
  "html body #root .quick-bar{margin-top:0!important;padding-top:2.25rem!important}\n"
  "html body #root ul.qb-list{background:none!important;border:0!important;border-radius:0!important;"
  "box-shadow:none!important}\n"
  "html body #root ul.qb-list>li+li{border-left:1px solid var(--line)}\n"
  "@media (max-width:900px){html body #root ul.qb-list>li+li{border-left:0;border-top:1px solid var(--line)}}\n"
)
s = s.replace(ANCHOR, CSS + ANCHOR)

# nothing light-on-light may survive in the lodging block
blk_start = s.find('className="lodge-official')
blk_end = s.find('className="lodge-also', blk_start)
block = s[blk_start:blk_end]
for bad in ("var(--panel-fg)", "on-panel", "var(--sunset)"):
    if bad in block:
        sys.exit(f"FATAL: '{bad}' still inside the Concept block -- light-on-light risk")

io.open(SRC, "w", encoding="utf-8", newline="").write(s)
print(f"{SRC}: {orig} -> {len(s)} chars ({len(s)-orig:+d})")
for label, d in edits:
    print(f"  {d:+6d}  {label}")
print("\nguard passed: no panel-fg / sunset / on-panel left inside the Concept block")
