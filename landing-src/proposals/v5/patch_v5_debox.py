"""v5 DRAFT patch 6 -- debox the races and impact grids (Phase 2, 24 of the 92 cards).

Kosgei 9/17: "keep Archivo, don't mute the spanish. now debox races and impact."

Both grids share one rule:
    .race-card,.part-card{background:var(--card);border:1px solid var(--line);
                          border-radius:8px;box-shadow:...}
Fill + full frame + radius + shadow -- every signal that says "separate object" spent at once,
on eight tiles, which is what flattens the hierarchy and reads as a SaaS card wall.

WHAT REPLACES THEM
  * No fill, no frame, no radius, no shadow. The cards sit on the section ground.
  * The terracotta top rule on each race card STAYS and does the separating -- the brief asks
    for "solid stark dividers", and a rule is the deboxed way to say "new object".
  * Column gap widens (1.25rem -> ~2.75rem) because without borders the tiles need real space
    to separate. This is the brief's "empty white space instead of lines", scaled to a 4-up grid
    rather than the literal 100-120px, which would collapse the columns at this width.
  * The race note chip (filled `var(--chip)` pill) becomes hairline-ruled text.
  * The partner fallback tile (a solid `var(--panel)` block behind the partner name) loses its
    fill and becomes large display type over a hairline rule.

DELIBERATELY KEPT: the white plate behind the Lightning Boy logo. That is not decoration --
a logo needs the ground it was drawn for, and the light-logo trap on this project
([[sfhm-partner-logos]], Pecos) is that a mark can vanish on the wrong ground. Function, not a box.

Buttons keep their fills. What is interactive should look interactive; Phase 2 is about text
trapped in containers, not about making CTAs invisible three days before a race.

usage: python patch_v5_debox.py
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


# ---------------------------------------------------------------- 1. the shared card rule
sub("debox .race-card/.part-card",
    ".race-card,.part-card{background:var(--card);border:1px solid var(--line);border-radius:8px;"
    "box-shadow:0 1px 2px rgba(34,34,34,.06),0 10px 28px -16px rgba(34,34,34,.28)}",
    "/* v5 Phase 2: deboxed. No fill, frame, radius or shadow -- a rule does the separating. */\n"
    ".race-card,.part-card{background:none;border:0;border-radius:0;box-shadow:none}\n"
    ".race-card{padding-top:1.15rem!important}\n"
    "html body #root span.race-note{display:block;margin-top:.2rem;padding-top:.75rem;"
    "border-top:1px solid var(--line);font-family:'Martian Mono',monospace;font-size:.62rem;"
    "letter-spacing:.1em;text-transform:uppercase;color:var(--ink-soft)}\n"
    "/* partner fallback: display type over a rule, not a filled block */\n"
    ".part-fallback{display:flex;align-items:flex-end;aspect-ratio:4 / 3;padding:0 0 .9rem;"
    "border-bottom:1px solid var(--line)}\n"
    "html body #root .part-fallback span{font-family:'Archivo',system-ui,sans-serif;font-weight:900;"
    "font-stretch:78%;font-size:clamp(1.4rem,2.6vw,2rem);line-height:.95;text-transform:uppercase;"
    "color:var(--ink);opacity:.22}\n"
    ".part-card>div:last-child{padding-left:0!important;padding-right:0!important}")

# ---------------------------------------------------------------- 2. wider gaps
sub("races grid gap",
    '<div role="list" className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">\n'
    "          {keys.map(k=>{",
    '<div role="list" className="grid gap-x-11 gap-y-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">\n'
    "          {keys.map(k=>{")
sub("impact grid gap",
    '<div role="list" className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">\n'
    "          {t.partners.map(p=>(",
    '<div role="list" className="grid gap-x-11 gap-y-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">\n'
    "          {t.partners.map(p=>(")

# ---------------------------------------------------------------- 3. race card internals
sub("race card padding",
    'className="race-card p-5 flex flex-col gap-3"',
    'className="race-card flex flex-col gap-3"')
sub("race note chip -> ruled text",
    '<span className="mono text-[.64rem] tracking-[.04em] rounded-[3px] px-2.5 py-1.5 self-start" '
    'style={{background:"var(--chip)",color:"var(--ink)"}}>{r.note}</span>',
    '<span className="race-note">{r.note}</span>')

# ---------------------------------------------------------------- 4. partner fallback tile
sub("partner fallback tile",
    '{!p.img && <div aria-hidden="true" className="flex items-end p-4" '
    'style={{aspectRatio:"4 / 3",background:"var(--panel)",color:"var(--panel-fg)"}}>'
    '<span className="display text-[1.5rem] leading-none">{p.name}</span></div>}',
    '{!p.img && <div aria-hidden="true" className="part-fallback"><span>{p.name}</span></div>}')
sub("partner body padding",
    '<div className="p-5 flex flex-col gap-2 flex-1">',
    '<div className="pt-4 flex flex-col gap-2 flex-1">')

io.open(SRC, "w", encoding="utf-8", newline="").write(s)
print(f"{SRC}: {orig} -> {len(s)} chars ({len(s)-orig:+d})")
for label, d in edits:
    print(f"  {d:+6d}  {label}")
print("\nkept on purpose: the white plate behind the Lightning Boy logo, and button fills")
