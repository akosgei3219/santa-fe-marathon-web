"""v5 DRAFT patch 4 -- bilingual side-by-side river-voice columns.

Kosgei 9/17: keep the one good idea from the rejected AI draft (EN and ES shown together) and
build it with true copy. The draft's own story columns invented a "Together Team", a coffee lab
and a neighbour-with-coffee origin story; none of that is here.

CONTENT IS UNCHANGED, ONLY ITS PRESENTATION. `voiceParas` already exists as four fully parallel
paragraphs in EN and ES -- the approved official event narrative, live today. So this section
introduces ZERO new factual claims. It also does not relabel the section: CLAUDE.md records that
Kosgei chose to LEAVE the homepage river titles as they are, and both titles are untouched.

Three things this does beyond re-laying-out:
  * `lang="en"` / `lang="es"` on the columns. Without them a screen reader reads Spanish with
    English pronunciation rules -- unintelligible. This is the main accessibility win and the
    reason a bilingual block is worth doing properly rather than just floating two divs.
  * Applies `--sf-serif`, the editorial serif token defined in patch 1 but not yet used
    anywhere. The brief asked for "a warm, editorial secondary serif for stories and quotes";
    this is the page's story.
  * Unboxes the section -- the old treatment was a rounded panel with a border and a tinted
    background, i.e. exactly the card look the brief wants gone. Replaced with a stark rule
    between the columns and editorial spacing.

The heading and footer still follow the language toggle, so the page's heading structure stays
coherent in whichever language the visitor chose; only the narrative is presented in both.

usage: python patch_v5_bilingual.py
"""
import io, sys

SRC = "run-santa-fe-2026.src.html"
s = io.open(SRC, encoding="utf-8").read()
orig = len(s)

# ---- replace the whole VoiceOfRiver component, located by bounds rather than by matching a
# long literal block (whitespace in a 12-line JSX body is too easy to get subtly wrong).
START = "function VoiceOfRiver({t}){"
i = s.find(START)
if i < 0:
    sys.exit("FATAL: VoiceOfRiver not found")
j = s.find("\n}\n", i)
if j < 0:
    sys.exit("FATAL: could not bound VoiceOfRiver")
j += len("\n}\n")
old = s[i:j]
for must in ("voiceParas", "voiceEyebrow", "voiceFooter"):
    if must not in old:
        sys.exit(f"FATAL: bounded block missing {must} -- wrong slice")
if old.count("function ") != 1:
    sys.exit("FATAL: slice spans more than one function")

NEW = '''function VoiceOfRiver({t}){
  /* 2026-09-17 v5: the narrative runs in BOTH languages side by side rather than following the
     toggle. New Mexico is genuinely bilingual and showing that is the point -- but it only works
     if each column carries its own lang attribute, or a screen reader voices the Spanish with
     English phonetics. The heading and footer still follow the toggle so the page's heading
     structure stays coherent in the visitor's chosen language. */
  const cols=[["en","English",T.en],["es","Espa\\u00f1ol",T.es]];
  return (
    <section className="voice-v5 below-fold" aria-label={t.voiceTitle}>
      <div className="voice-in">
        <div className="voice-head">
          <span className="voice-eyebrow">{t.voiceEyebrow}</span>
          <h2 className="voice-title">{t.voiceTitle}</h2>
        </div>
        <div className="voice-cols">
          {cols.map(([code,label,tt])=>(
            <div key={code} className="voice-col" lang={code}>
              <span className="voice-lang" aria-hidden="true">{label}</span>
              {tt.voiceParas.map((p,i)=>(<p key={i} className="voice-p">{p}</p>))}
            </div>
          ))}
        </div>
        <p className="voice-foot">{t.voiceFooter}</p>
      </div>
    </section>
  );
}
'''
s = s[:i] + NEW + s[j:]

# ---- CSS. Anchored on the v5 block added in patch 1 so it lands with the other v5 rules.
ANCHOR = "/* v5 relocated hero facts: stark rules, editorial spacing, no pills or shadows. */\\n"
ANCHOR = "/* v5 relocated hero facts: stark rules, editorial spacing, no pills or shadows. */\n"
if s.count(ANCHOR) != 1:
    sys.exit(f"FATAL: css anchor found {s.count(ANCHOR)} times")

CSS = (
  "/* v5 bilingual river-voice: unboxed, two languages separated by a stark rule. The old\n"
  "   treatment was a rounded tinted panel with a border -- the card look the brief drops. */\n"
  ".voice-v5{background:var(--panel);color:var(--panel-fg);border-top:2px solid var(--terra);"
  "padding:5rem clamp(1.25rem,4vw,2.5rem)}\n"
  ".voice-in{max-width:1100px;margin:0 auto}\n"
  ".voice-head{display:flex;flex-direction:column;gap:.55rem;margin-bottom:2.6rem}\n"
  "html body #root span.voice-eyebrow{font-family:'Martian Mono',monospace;font-size:.62rem;font-weight:800;"
  "letter-spacing:.2em;text-transform:uppercase;color:var(--sunset)}\n"
  "html body #root h2.voice-title{margin:0;font-family:'Archivo',system-ui,sans-serif;font-weight:900;"
  "font-stretch:78%;font-size:clamp(1.5rem,3.4vw,2.3rem)!important;line-height:1.02!important;"
  "letter-spacing:0;text-transform:uppercase;color:inherit;text-wrap:balance}\n"
  ".voice-cols{display:grid;grid-template-columns:1fr 1fr;gap:0}\n"
  ".voice-col{padding:0 2.4rem;min-width:0}\n"
  ".voice-col:first-child{padding-left:0}\n"
  ".voice-col:last-child{padding-right:0;border-left:1px solid rgba(255,255,255,.22)}\n"
  "html body #root span.voice-lang{display:block;margin-bottom:1.1rem;font-family:'Martian Mono',monospace;"
  "font-size:.58rem;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--sunset);opacity:.9}\n"
  "html body #root p.voice-p{margin:0 0 1.15rem;font-family:var(--sf-serif);font-size:.95rem!important;"
  "line-height:1.75!important;opacity:.9;text-wrap:pretty}\n"
  "html body #root p.voice-p:last-child{margin-bottom:0}\n"
  "html body #root p.voice-foot{margin:2.6rem 0 0;padding-top:1.4rem;border-top:1px solid rgba(255,255,255,.14);"
  "font-family:'Martian Mono',monospace;font-size:.6rem!important;font-weight:700;letter-spacing:.14em;"
  "text-transform:uppercase;opacity:.6}\n"
  "@media (max-width:820px){.voice-cols{grid-template-columns:1fr}.voice-col{padding:0}"
  ".voice-col:last-child{border-left:0;border-top:1px solid rgba(255,255,255,.22);margin-top:2rem;padding-top:2rem}}\n"
)
s = s.replace(ANCHOR, CSS + ANCHOR)

io.open(SRC, "w", encoding="utf-8", newline="").write(s)
print(f"{SRC}: {orig} -> {len(s)} chars ({len(s)-orig:+d})")
print(f"  VoiceOfRiver rebuilt ({len(old)} -> {len(NEW)} chars)")
print(f"  +{len(CSS)} chars of v5 bilingual CSS")
print("  content unchanged: voiceParas reused verbatim in both languages")
