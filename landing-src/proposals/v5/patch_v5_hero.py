"""v5 DRAFT patch 1 -- hero restructure + non-corporate design-system core.

Kosgei's brief, 2026-09-16, plus the follow-up hero spec:
  1. Unbox the hero: no solid container box; title natively over a full-bleed photo with a
     subtle 40% dark overlay.
  2. Three-element top fold: Headline (title + tagline), Sub-headline (date & location only),
     single primary high-contrast CTA.
  3. Relocate secondary details below the fold into clean multi-column grids.
Plus, from the aesthetic brief: high texture instead of smooth vector gradients, editorial
typography, borderless sections with stark dividers.

RULINGS HONOURED
  * Turquoise stays, Anton stays -- no Oswald/Bebas, no palette swap (Kosgei, 9/16).
  * Rule 9 stands: the single CTA still branches across all three registration states. A
    story-first hero and a working Register button are not in conflict; the CTA is one element
    of the three-element fold, which is exactly what the spec asks for.

TWO DELIBERATE SUBSTITUTIONS -- reported, not silent
  * Grain is CSS/SVG (feTurbulence data-URI, ~500 bytes), NOT a raster film-grain overlay.
    A raster overlay re-adds the weight just cut from phone load (~600 KB) on a page that still
    carries 21 oversized images.
  * The editorial serif is a SYSTEM stack, not a webfont. The page already pays for Archivo and
    Martian Mono; a third family is a third network round trip for body copy.

NOT DONE, AND WHY
  * The Capitol Ford "presented by" line stays in the hero, unboxed as plain text. The strict
    three-element reading would remove it, but "presented by Capitol Ford" is part of the
    official event name in CLAUDE.md, and /sponsors/ sells "Logo on race website" in the Title
    package. Demoting the title sponsor is a commercial call, not a design one -- flagged for
    Kosgei rather than decided here.

usage: python patch_v5_hero.py [--check]
"""
import io, re, sys

SRC = "run-santa-fe-2026.src.html"
CHECK = "--check" in sys.argv
s = io.open(SRC, encoding="utf-8").read()
orig = len(s)
edits = []


def sub(label, old, new, count=1):
    """Exact-match replacement with an occurrence guard -- the house rule on this project."""
    global s
    n = s.count(old)
    if n != count:
        sys.exit(f"FATAL [{label}]: expected {count} occurrence(s), found {n}")
    s = s.replace(old, new)
    edits.append((label, len(new) - len(old)))


# ---------------------------------------------------------------- 1. copy strings
# Sub-headline is "date AND location only" -- heroDateLine carries no location today.
sub("EN heroSubLine",
    '  heroDateLine:"Sunday, September 20, 2026",',
    '  heroDateLine:"Sunday, September 20, 2026",\n'
    '  heroSubLine:"Sunday, September 20, 2026 \\u00b7 Santa Fe, New Mexico",')
sub("ES heroSubLine",
    '  heroDateLine:"Domingo 20 de septiembre de 2026",',
    '  heroDateLine:"Domingo 20 de septiembre de 2026",\n'
    '  heroSubLine:"Domingo 20 de septiembre de 2026 \\u00b7 Santa Fe, Nuevo M\\u00e9xico",')

# ---------------------------------------------------------------- 2. hero JSX
OLD_COPY = '''        <div className="hero3-copy">
          <p className="hero3-date">{t.heroDateLine}</p>
          <h1 id="hero-h" className="hero3-title">{t.heroTitle}</h1>
          <p className="hero3-tag">{t.heroTagline.map((ln,i)=>(<span key={i} className={i===t.heroTagline.length-1?"hero-grit":undefined}>{(i?" ":"")+ln}</span>))}</p>
          <ul className="hero-badges" aria-label={t.statsLabel}>
            {t.heroBadges.map(([v,l],i)=>(<li key={i}><Glyph name={badgeIcons[i]} size={14}/><span><b>{v}</b> {l}</span></li>))}
          </ul>
          <div className="hero3-ctas">
            {REG_STATE==="open"
              ? <a className="hero-cta hero-cta-solid" href={REG_URL} target="_blank" rel="noopener"><span>{t.ctaHalf}</span></a>
              : REG_STATE==="walkup"
                ? <a className="hero-cta hero-cta-solid" href="#races"><span>{t.walkupShort}</span></a>
                : <a className="hero-cta hero-cta-solid" href="/event-schedule/"><span>{t.heroClosedCta}</span></a>}
            <a className="hero-cta hero-cta-outline" href="/results-photos/"><span>{started?t.nav.results:t.heroResultsCta}</span></a>
          </div>
        </div>
        <div className="hero3-sponsor">
          <span className="hs-lbl">{t.presentedLbl}</span>
          <img className="hs-logo" src={IMGS.capitol} alt="" width="38" height="38"/>
          <span className="hs-name">Capitol Ford</span>
        </div>'''

NEW_COPY = '''        <div className="hero3-copy">
          <h1 id="hero-h" className="hero3-title">{t.heroTitle}</h1>
          <p className="hero3-tag">{t.heroTagline.map((ln,i)=>(<span key={i} className={i===t.heroTagline.length-1?"hero-grit":undefined}>{(i?" ":"")+ln}</span>))}</p>
          <p className="hero3-date">{t.heroSubLine}</p>
          <div className="hero3-ctas">
            {REG_STATE==="open"
              ? <a className="hero-cta hero-cta-solid" href={REG_URL} target="_blank" rel="noopener"><span>{t.ctaHalf}</span></a>
              : REG_STATE==="walkup"
                ? <a className="hero-cta hero-cta-solid" href="#races"><span>{t.walkupShort}</span></a>
                : <a className="hero-cta hero-cta-solid" href="/event-schedule/"><span>{t.heroClosedCta}</span></a>}
          </div>
        </div>
        <p className="hero3-presented">{t.presentedLbl} <b>Capitol Ford</b></p>'''
sub("hero three-element fold", OLD_COPY, NEW_COPY)

# ---------------------------------------------------------------- 3. relocated facts band
# The three badges leave the fold and become an editorial band under the hero: a stark
# rule-separated row, not pills. This is Kosgei's item 3 ("clean multi-column grids").
FACTS = '''
/* 2026-09-16 v5: the hero badges, relocated out of the top fold per Kosgei's three-element
   rule. Rendered as an editorial measure-band -- rules and spacing, no pills, no shadows. */
function HeroFacts({t}){
  return (
    <aside className="hero-facts" aria-label={t.statsLabel}>
      <ul className="hf-list">
        {t.heroBadges.map(([v,l],i)=>(
          <li key={i} className="hf-item"><b className="hf-v">{v}</b><span className="hf-l">{l}</span></li>
        ))}
      </ul>
    </aside>
  );
}

'''
sub("HeroFacts component", "/* ================= quick-access bar", FACTS.lstrip("\n") + "/* ================= quick-access bar")
sub("HeroFacts mount", "      <Hero t={t}/>\n", "      <Hero t={t}/>\n      <HeroFacts t={t}/>\n")

# ---------------------------------------------------------------- 4. CSS
# 4a. Unbox: flat 40% overlay as specified, plus a short bottom scrim. The bottom scrim is not
# decoration -- the slide caption and dots sit there over open sky, and a flat 40% alone leaves
# them under 4.5:1. Contrast is measured after this build, not assumed.
sub("flat 40% hero overlay (desktop)",
    ".hero3-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(12,12,14,.84) 0%,rgba(12,12,14,.74) 34%,rgba(12,12,14,.56) 62%,rgba(12,12,14,.16) 100%),linear-gradient(180deg,rgba(12,12,14,.22) 0%,rgba(12,12,14,0) 26%,rgba(12,12,14,0) 58%,rgba(12,12,14,.6) 100%)}",
    ".hero3-shade{position:absolute;inset:0;background:rgba(12,12,14,.40)}"
    ".hero3-shade::after{content:'';position:absolute;inset:0;"
    "background:linear-gradient(180deg,rgba(12,12,14,0) 58%,rgba(12,12,14,.58) 100%)}")

# The phone breakpoint carries its own shade rule; flatten it the same way or the two
# breakpoints disagree about what "40% overlay" means.
sub("flat 40% hero overlay (phone)",
    "  .hero3-shade{inset:0 0 auto 0;height:var(--hero-band);background:linear-gradient(180deg,rgba(12,12,14,.1) 0%,rgba(12,12,14,0) 45%,rgba(12,12,14,.45) 100%)}",
    "  .hero3-shade{inset:0 0 auto 0;height:var(--hero-band);background:rgba(12,12,14,.40)}")

# 4b. Unbox the sponsor chip: plain type, no pill, no border, no blur.
sub("unbox sponsor chip",
    ".hero3-sponsor{position:absolute;left:clamp(1.25rem,4vw,2.5rem);bottom:5.5rem;display:inline-flex;align-items:center;gap:.7rem;padding:.35rem 1rem .35rem .9rem;border-radius:999px;background:rgba(12,12,14,.72);border:1px solid rgba(255,248,239,.26);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}",
    "html body #root p.hero3-presented{position:absolute;left:clamp(1.25rem,4vw,2.5rem);bottom:5.5rem;margin:0;"
    "font-family:'Martian Mono',monospace;font-size:.62rem!important;line-height:1.4!important;letter-spacing:.18em;"
    "text-transform:uppercase;color:rgba(255,248,239,.82);text-shadow:0 1px 10px rgba(0,0,0,.6)}"
    ".hero3-presented b{font-weight:700;color:#FFF8EF}")

# 4c. Texture instead of smooth gradients. feTurbulence as a data-URI: ~0.5 KB, no request.
GRAIN = ("/* v5 texture: fractal noise as a data-URI. The brief asked for film grain; a raster "
         "overlay would re-add the weight just cut from phone load, so it is generated. */\n"
         ".hero3::after{content:'';position:absolute;inset:0;pointer-events:none;opacity:.14;mix-blend-mode:overlay;"
         "background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E"
         "%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E"
         "%3Crect width='160' height='160' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E\")}\n"
         "@media (prefers-reduced-motion:reduce){.hero3::after{opacity:.1}}\n"
         "/* v5 editorial serif for narrative copy -- system stack, no extra webfont request. */\n"
         ":root{--sf-serif:'Iowan Old Style','Palatino Linotype',Palatino,'Book Antiqua',Georgia,serif}\n"
         "/* v5 relocated hero facts: stark rules, editorial spacing, no pills or shadows. */\n"
         ".hero-facts{background:#FBF9F6;border-bottom:1px solid rgba(34,34,34,.14)}\n"
         "html body #root ul.hf-list{list-style:none;margin:0 auto;padding:1.15rem clamp(1.25rem,4vw,2.5rem);max-width:1200px;"
         "display:grid;grid-template-columns:repeat(3,1fr);gap:0}\n"
         "html body #root ul.hf-list li.hf-item{margin:0;display:flex;flex-direction:column;gap:.15rem;padding:0 1.25rem;"
         "border-left:1px solid rgba(34,34,34,.16)}\n"
         "html body #root ul.hf-list li.hf-item:first-child{border-left:0;padding-left:0}\n"
         ".hf-v{font-family:'Archivo',system-ui,sans-serif;font-weight:900;font-stretch:78%;font-size:1.5rem;"
         "line-height:1;letter-spacing:0;color:#222}\n"
         ".hf-l{font-family:'Martian Mono',monospace;font-size:.6rem;letter-spacing:.16em;text-transform:uppercase;color:#6B6257}\n"
         "@media (max-width:640px){html body #root ul.hf-list li.hf-item{padding:0 .7rem}.hf-v{font-size:1.15rem}"
         ".hf-l{font-size:.52rem;letter-spacing:.1em}}\n")
# Anchor on the base .hero3 rule: ".hero3-shade{" is NOT unique (a phone breakpoint redefines
# it), which the occurrence guard caught on the first run.
ANCHOR = ".hero3{position:relative;overflow:hidden;"
sub("v5 texture + serif + facts css", ANCHOR, GRAIN + ANCHOR)

if CHECK:
    print("dry run only")
    sys.exit(0)

io.open(SRC, "w", encoding="utf-8", newline="").write(s)
print(f"{SRC}: {orig} -> {len(s)} chars")
for label, d in edits:
    print(f"  {d:+6d}  {label}")
