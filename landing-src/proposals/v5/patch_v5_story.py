"""v5 DRAFT patch 5 -- asymmetric story section + Phase 2 debox.

Brief: "Move away from perfect geometric card grids. Stagger photos and text blocks unevenly so
the layout feels like a curated local lookbook or field journal rather than a SaaS landing page."
Phase 2: strip background fills off containers that trap text.

The old section was a 50/50 `lg:grid-cols-2` -- a perfectly symmetric grid, with the two charity
names sitting in bordered, filled chips. That is the exact pattern both notes call out.

WHAT CHANGES
  * Uneven columns: 1.55fr / 1fr, not 1fr / 1fr.
  * Vertical stagger: the side column starts ~4.5rem lower, so the two blocks do not align at the
    top. This is what stops it reading as a grid.
  * The photo breaks the right edge with a negative margin, so the block is not a tidy rectangle.
  * Charity chips DEBOXED -- filled, bordered pills become a hairline-ruled list. Phase 2.
  * Impact stats keep hairline rules (already borderless) but move to a semantic <ul>.

PHOTO SIZING -- the dpr-2 rule, not CSS pixels
  The image renders ~34vw (about 490 px at 1440), so dpr 2 wants ~980 px and the 1024 variant is
  the right top end. srcset stops there deliberately: the 1536 and 2048 variants are JPEG, not
  AVIF, and shipping a 2400 px original into a 490 px slot is exactly the oversizing corrected
  on 9/16. The photo is already in HERO_SLIDES, so it is a cache hit for most visitors.

CAPTION is "On course, 2025" -- the same wording as the hero slide caption for this photo, so
the year is stated and no new claim is introduced.

usage: python patch_v5_story.py
"""
import io, sys

SRC = "run-santa-fe-2026.src.html"
s = io.open(SRC, encoding="utf-8").read()
orig = len(s)


def sub(label, old, new, count=1):
    global s
    n = s.count(old)
    if n != count:
        sys.exit(f"FATAL [{label}]: expected {count}, found {n}")
    s = s.replace(old, new)


# ---------------------------------------------------------------- strings
# The charities line is IDENTICAL in the EN and ES blocks, so an exact-match replace cannot tell
# them apart -- the occurrence guard caught this rather than letting it write to the wrong one.
# Insert positionally instead: first hit is EN, second is ES. Work right-to-left so the earlier
# index stays valid after the first insertion.
ANCHOR_LINE = '  charities:["Kitany Water Project","Lightning Boy Foundation"'
hits = []
k = s.find(ANCHOR_LINE)
while k >= 0:
    hits.append(k)
    k = s.find(ANCHOR_LINE, k + 1)
if len(hits) != 2:
    sys.exit(f"FATAL: expected 2 charities lines (EN + ES), found {len(hits)}")

EN_STR = ('  storyPhotoAlt:"Runners on the Santa Fe River Trail corridor during the 2025 race",\n'
          '  storyPhotoCap:"On course, 2025",\n')
ES_STR = ('  storyPhotoAlt:"Corredores en el corredor del Santa Fe River Trail durante la carrera de 2025",\n'
          '  storyPhotoCap:"En el recorrido, 2025",\n')
s = s[:hits[1]] + ES_STR + s[hits[1]:]
s = s[:hits[0]] + EN_STR + s[hits[0]:]
if s.count("storyPhotoCap") != 2:
    sys.exit("FATAL: storyPhotoCap should exist exactly twice")

# ---------------------------------------------------------------- image const
U9 = "https://santafehalfmarathon.com/wp-content/uploads/2026/09/"
STORY_IMG = (
    '/* 2026-09-17 v5: the story photo. Sized for the ~34vw slot at dpr 2 (~980px), so the srcset\n'
    '   tops out at the 1024 AVIF variant -- the 1536/2048 variants are JPEG and the 2400px\n'
    '   original would be the oversizing fixed on 9/16. Already in HERO_SLIDES, so usually cached. */\n'
    'const STORY_IMG = {\n'
    '  src: "' + U9 + 'sfhm-hero-2025-on-course-1024x683.avif",\n'
    '  srcset: "' + U9 + 'sfhm-hero-2025-on-course-768x512.avif 768w, "\n'
    '        + "' + U9 + 'sfhm-hero-2025-on-course-1024x683.avif 1024w"\n'
    '};\n'
)
sub("STORY_IMG const", "/* ================= i18n ================= */",
    STORY_IMG + "\n/* ================= i18n ================= */")

# ---------------------------------------------------------------- component
START = "function Story({t}){"
i = s.find(START)
if i < 0:
    sys.exit("FATAL: Story not found")
j = s.find("\n}\n", i) + len("\n}\n")
old = s[i:j]
for must in ("storyBody1", "charities", "impact"):
    if must not in old:
        sys.exit(f"FATAL: bounded Story block missing {must}")
if old.count("function ") != 1:
    sys.exit("FATAL: slice spans more than one function")

NEW = '''function Story({t}){
  /* v5: deliberately asymmetric -- uneven columns AND a vertical stagger. Equal columns that
     start at the same y read as a grid no matter how they are styled. */
  return (
    <section id="story" className="story-v5 below-fold" aria-labelledby="story-h">
      <div className="story-in">
        <div className="story-head">
          <span className="story-kicker">{t.storyKicker}</span>
          <h2 id="story-h" className="story-title">{t.storyTitle}</h2>
        </div>
        <div className="story-grid">
          <div className="story-text">
            <p className="story-p">{t.storyBody1}</p>
            <p className="story-p">{t.storyBody2}</p>
            <ul className="story-charities">
              {t.charities.map(c=>(<li key={c}>{c}</li>))}
            </ul>
          </div>
          <div className="story-side">
            <figure className="story-fig">
              <img className="story-img" src={STORY_IMG.src} srcSet={STORY_IMG.srcset}
                   sizes="(max-width:900px) 92vw, 34vw" alt={t.storyPhotoAlt}
                   loading="lazy" decoding="async"/>
              <figcaption className="story-cap">{t.storyPhotoCap}</figcaption>
            </figure>
            <ul className="story-impact">
              {t.impact.map((x,i)=>(
                <li key={i}><span className="si-stat">{x.stat}</span><span className="si-label">{x.label}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
'''
s = s[:i] + NEW + s[j:]

# ---------------------------------------------------------------- css
ANCHOR = "/* v5 bilingual river-voice: unboxed, two languages separated by a stark rule. The old\n"
if s.count(ANCHOR) != 1:
    sys.exit(f"FATAL: css anchor found {s.count(ANCHOR)} times")

CSS = (
  "/* v5 asymmetric story: uneven columns + a vertical stagger, photo breaking the right edge. */\n"
  ".story-v5{background:var(--panel);color:var(--panel-fg);padding:5.5rem clamp(1.25rem,4vw,2.5rem)}\n"
  ".story-in{max-width:1120px;margin:0 auto}\n"
  ".story-head{display:flex;flex-direction:column;gap:.55rem;margin-bottom:3rem;max-width:22ch}\n"
  "html body #root span.story-kicker{font-family:'Martian Mono',monospace;font-size:.62rem;font-weight:800;"
  "letter-spacing:.2em;text-transform:uppercase;color:var(--sunset)}\n"
  "html body #root h2.story-title{margin:0;font-family:'Archivo',system-ui,sans-serif;font-weight:900;"
  "font-stretch:78%;font-size:clamp(1.7rem,4vw,2.6rem)!important;line-height:1!important;letter-spacing:0;"
  "text-transform:uppercase;color:inherit;text-wrap:balance}\n"
  ".story-grid{display:grid;grid-template-columns:1.55fr 1fr;gap:clamp(2rem,5vw,4.5rem);align-items:start}\n"
  ".story-text{max-width:58ch}\n"
  "html body #root p.story-p{margin:0 0 1.2rem;font-family:var(--sf-serif);font-size:1rem!important;"
  "line-height:1.75!important;opacity:.92;text-wrap:pretty}\n"
  "/* the stagger: the side column starts lower, so the two blocks never align at the top */\n"
  ".story-side{margin-top:4.5rem}\n"
  "/* the photo breaks the grid's right edge -- a field-journal crop, not a tidy rectangle */\n"
  ".story-fig{margin:0 calc(-1 * clamp(0px,3.5vw,2.75rem)) 2.5rem 0}\n"
  "html body #root img.story-img{display:block;width:100%;height:auto!important;object-fit:cover;"
  "aspect-ratio:3/2;filter:saturate(.96)}\n"
  "html body #root figcaption.story-cap{margin-top:.6rem;font-family:'Martian Mono',monospace;"
  "font-size:.58rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;opacity:.6}\n"
  "/* Phase 2 debox: filled, bordered chips become a hairline-ruled list */\n"
  "html body #root ul.story-charities{list-style:none;margin:1.9rem 0 0;padding:0;"
  "border-top:1px solid rgba(255,255,255,.22)}\n"
  "html body #root ul.story-charities li{margin:0;padding:.7rem 0;font-family:'Martian Mono',monospace;"
  "font-size:.64rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;opacity:.85;"
  "border-bottom:1px solid rgba(255,255,255,.14)}\n"
  "html body #root ul.story-impact{list-style:none;margin:0;padding:0}\n"
  "html body #root ul.story-impact li{margin:0;display:flex;align-items:baseline;gap:1rem;"
  "padding:0 0 .75rem;margin-bottom:.75rem;border-bottom:1px solid rgba(255,255,255,.22)}\n"
  ".si-stat{font-family:'Martian Mono',monospace;font-size:1.7rem;font-weight:700;min-width:5.5ch;"
  "color:var(--sunset);line-height:1.1}\n"
  ".si-label{font-size:.9rem;opacity:.9}\n"
  "@media (max-width:900px){.story-grid{grid-template-columns:1fr;gap:2.5rem}"
  ".story-side{margin-top:0}.story-fig{margin-right:0}.story-head{max-width:none}}\n"
)
s = s.replace(ANCHOR, CSS + ANCHOR)

io.open(SRC, "w", encoding="utf-8", newline="").write(s)
print(f"{SRC}: {orig} -> {len(s)} chars ({len(s)-orig:+d})")
print(f"  Story rebuilt ({len(old)} -> {len(NEW)} chars)")
print("  columns 1.55fr/1fr, side column staggered 4.5rem, charity chips deboxed")
print("  photo srcset tops out at the 1024 AVIF variant (dpr-2 sized for a ~34vw slot)")
