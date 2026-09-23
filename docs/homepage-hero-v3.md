# Homepage hero v3 — live since 2026-09-15 (front page 5041 since the v3.8 update)

Built 2026-09-15 from Kosgei's layered-hero brief, and updated the same day with their answers: a 2025 results button,
and the Capitol Ford logo badge kept. Previewed locally with the live site's theme CSS at 1920, 1440, 1280, 1024, 768,
390, 375 and 360 px. The homepage is the compiled React page in `landing-src/run-santa-fe-2026.src.html`, not an
Elementor page, so there are no Elementor container settings: this document is the real code.

`extract_code_doc.py` generated the first draft of this file. The "Checks run", "Applying it" and "Decisions" sections
were written by hand afterwards, so re-running that script would erase them. Edit this file directly instead.

## Layout outline

**1. Top strip** (navy, slim, scrolls away)
- Left: `SUN, SEPT 20, 2026 · SANTA FE, NM · 7,000 FT`
- Middle: live countdown `STARTS IN 04d 20h 43m 52s`; after the 7:30 AM start it becomes a `Results & Photos` link
- Right: `Roads into the start close at 7:00 AM` (opens the road-closure panel further down the page)
- Phones: date and countdown on one line, the road notice on a second line

**2. Navigation** (unchanged, sticky). The three menu triggers lose the theme's red pill styling.

**3. Hero main stage** (full width; 560 to 720 px tall on desktop)
- Background: the runner under the big sky, with a dark gradient heaviest on the left, behind the copy.
  On wide screens the photo is sized by width so the runner sits about two thirds across, clear of the copy.
- Copy, left-aligned:
  - Date line: `SUNDAY, SEPTEMBER 20, 2026`
  - Headline (H1): `SANTA FE INTERNATIONAL HALF MARATHON`, condensed, two lines on desktop
  - Tagline: `THIN AIR. BIG SKY. TRUE GRIT.`
  - Value badges: `100% PAVED` · `7,000 FT ALTITUDE` · `5TH ANNUAL EDITION`
  - Buttons: solid `REGISTER FOR 2026` + outline `2025 RESULTS` (/results-photos/)
- Title sponsor, pinned to the bottom edge of the photo: `PRESENTED BY [Capitol Ford logo] CAPITOL FORD`
- Phones and tablets: the copy stacks, both buttons go full width, and a photo window below the copy
  keeps the runner in view

**4. Quick-access bar** (white card overlapping the bottom of the photo)
1. Start times & locations → /event-schedule/
2. Packet pickup & expo → /packet-pickup/
3. Course profile & maps → /course-map/
4. Kids Dash & charity partners → Kids 1K Dash section, plus a second link to /charity-information/

Four columns on desktop, two on tablets, one per row on phones.

## Behavior that follows the calendar

The page reads the clock on load, the same way the site's existing register buttons do.
- **Saturday Sept 19, 5:00 PM (online registration closes):** the Register button becomes `Race-day schedule`,
  like today's hero.
- **Sunday Sept 20, 7:30 AM (race start):** the countdown and the `2025 results` button both switch to `Results & Photos`,
  which opens the same page.
- **Previewing a moment:** `?regnow=<epoch ms>` on the homepage URL shows that moment's state.
  Saturday 6 PM is `1789862400000` and Sunday 8 AM is `1789912800000`.

## What it replaces

- The navy notice banner. Its date and road notice move into the top strip.
- The 9/13 one-button hero.
- The stats strip. Paved, altitude and edition become badges; the charity count is dropped.
- The countdown band, which moves into the top strip.
- The "Know before you go" tiles. Road closures move to the top-strip notice.

## Checks run on 2026-09-15

- **Build check:** `driver.mjs verify` passed 20 of 20, including the check that the outline button opens
  /results-photos/. The texturize gate passed.
- **Road-closure wording (v3.5):** the build check passed 20 of 20 again, and so did the texturize gate. `check_text_v35.py`
  found the new English and Spanish wording in the build and the lockdown wording gone. It also found the new text
  showing when the closures and driving panels open.
- **Layout:** the first build was measured at 1920, 1440, 1280, 1024, 768, 390, 375 and 360 px, with nothing clipped,
  off-screen or scrolling sideways. After the button change, the screenshots were retaken at 1440, 1280, 1024, 768, 390
  and 375 px.
- **Spanish:** the button reads `Resultados 2025`. At 375 px the Spanish headline runs three lines instead of two, at 27 px,
  with nothing clipped.
- **Charity partners link (tile 4):** hit-tested at 375 and 1280 px. The middle and both ends of the link land on the link
  itself. The rest of the tile still opens the Kids 1K Dash section.
- **Contrast over the photo:** every line of hero text passes WCAG AA. `contrast_check.py` takes the brightest photo pixel
  under each line, after the gradient and any pill or button fill. It ignores the blur behind the pills, which only makes
  these figures stricter.

| Text | 1280 px | 375 px | AA minimum |
|---|---|---|---|
| Date line | 12.18:1 | 8.65:1 | 4.5:1 |
| Headline | 5.10:1 | 7.68:1 | 3:1 (large text) |
| Tagline | 7.40:1 | 5.33:1 | 3:1 at 1280 (large text), 4.5:1 at 375 |
| Badge labels | 16.35:1 | 15.76:1 | 4.5:1 |
| Badge values | 11.63:1 | 11.21:1 | 4.5:1 |
| Outline button label | 15.01:1 | 13.94:1 | 4.5:1 |
| "Presented by" label | 13.90:1 | 10.42:1 | 4.5:1 |

## Mount order (App)

```jsx
      <TopStrip t={t}/>
      <Nav t={t} lang={lang} setLang={setLang}/>
      <Hero t={t}/>
      <QuickBar t={t}/>
```

## JSX

```jsx
/* ================= top strip (2026-09-15 hero v3) =================
   Kosgei's layered-hero brief: one slim bar with the date, place and altitude, a live countdown to the 7:30 AM start,
   and the road-closure notice (it opens the closures panel in the logistics accordion). After the start the countdown
   becomes a results link. ?regnow=<epoch ms> shifts this clock too, so race-morning states can be previewed. */
const NOW_SHIFT = REG_NOW - Date.now();
function useNow(){
  const [now,setNow]=useState(Date.now()+NOW_SHIFT);
  useEffect(()=>{const id=setInterval(()=>setNow(Date.now()+NOW_SHIFT),1000);return ()=>clearInterval(id);},[]);
  return now;
}
/* line icons for the hero badges and quick-access tiles: inline SVG, since the site allows no emoji or arrow characters */
const GLYPHS={
  road:<React.Fragment><path d="M8 3 4 21"/><path d="m16 3 4 18"/><path d="M12 4v3"/><path d="M12 11v2"/><path d="M12 17v3"/></React.Fragment>,
  mountain:<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>,
  award:<React.Fragment><circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/></React.Fragment>,
  clock:<React.Fragment><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></React.Fragment>,
  bag:<React.Fragment><path d="M6 8h12l1 13H5L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></React.Fragment>,
  map:<React.Fragment><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z"/><path d="M9 3v15"/><path d="M15 6v15"/></React.Fragment>,
  heart:<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/>,
  chev:<path d="m9 18 6-6-6-6"/>
};
function Glyph({name,size=16}){
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{GLYPHS[name]}</svg>;
}
function TopStrip({t}){
  const now=useNow();
  const started=now>=RACE_START.getTime();
  let diff=Math.max(0,RACE_START.getTime()-now);
  const d=Math.floor(diff/86400000); diff-=d*86400000;
  const h=Math.floor(diff/3600000); diff-=h*3600000;
  const m=Math.floor(diff/60000); const sec=Math.floor((diff-m*60000)/1000);
  const pad=v=>String(v).padStart(2,"0");
  return (
    <div className="top-strip on-banner">
      <div className="top-strip-in">
        <span className="ts-facts">
          <span>{t.bannerDate}</span>
          <span className="ts-dot ts-place" aria-hidden="true">·</span>
          <span className="ts-place">{t.stripPlace}</span>
          <span className="ts-dot ts-alt" aria-hidden="true">·</span>
          <span className="ts-alt">{t.stripAlt}</span>
        </span>
        {started
          ? <a className="ts-link" href="/results-photos/">{t.nav.results}</a>
          : <span className="ts-count" role="timer" aria-label={t.countdown}>
              <span className="ts-count-lbl" aria-hidden="true">{t.stripStarts}</span>
              <span>{pad(d)+t.unitD+" "+pad(h)+t.unitH+" "+pad(m)+t.unitM+" "+pad(sec)+t.unitS}</span>
            </span>}
        <a className="ts-link ts-notice" href="#closures">{t.stripRoads}</a>
      </div>
    </div>
  );
}

/* ================= hero (2026-09-15 hero v3) =================
   Kosgei's 9/15 brief, which revises the 9/13 one-button hero: full-bleed photo (the runner under the big sky,
   media 4977) under a left-weighted dark gradient, the copy on the left, three value badges, the register button
   plus an outline button to the 2025 results (Results & Photos once the race starts), and the title sponsor pinned to
   the bottom edge.
   The photo stays a background div because the sitewide "html body img{height:auto!important}" rule defeats
   height-based image sizing. On phones and tablets a photo window under the copy keeps the runner in view. */
function Hero({t}){
  const closed=REG_STATE!=="open";
  const started=REG_NOW>=RACE_START.getTime();
  const badgeIcons=["road","mountain","award"];
  return (
    <header id="top" className="hero3" aria-labelledby="hero-h">
      {HERO_VIDEO_URL
        ? <video className="hero-photo" src={HERO_VIDEO_URL} poster={HERO_IMG} autoPlay muted loop playsInline aria-hidden="true"></video>
        : <div aria-hidden="true" className="hero-photo" style={{backgroundImage:"url('"+HERO_IMG+"')"}}></div>}
      <div aria-hidden="true" className="hero3-shade"></div>
      <div className="hero3-in">
        <div className="hero3-copy">
          <p className="hero3-date">{t.heroDateLine}</p>
          <h1 id="hero-h" className="hero3-title">{t.heroTitle}</h1>
          <p className="hero3-tag">{t.heroTagline.map((ln,i)=>(<span key={i} className={i===t.heroTagline.length-1?"hero-grit":undefined}>{(i?" ":"")+ln}</span>))}</p>
          <ul className="hero-badges" aria-label={t.statsLabel}>
            {t.heroBadges.map(([v,l],i)=>(<li key={i}><Glyph name={badgeIcons[i]} size={14}/><span><b>{v}</b> {l}</span></li>))}
          </ul>
          <div className="hero3-ctas">
            {closed
              ? <a className="hero-cta hero-cta-solid" href="/event-schedule/"><span>{t.heroClosedCta}</span></a>
              : <a className="hero-cta hero-cta-solid" href={REG_URL} target="_blank" rel="noopener"><span>{t.ctaHalf}</span></a>}
            <a className="hero-cta hero-cta-outline" href="/results-photos/"><span>{started?t.nav.results:t.heroResultsCta}</span></a>
          </div>
        </div>
        <div className="hero3-sponsor">
          <span className="hs-lbl">{t.presentedLbl}</span>
          <img className="hs-logo" src={IMGS.capitol} alt="" width="38" height="38"/>
          <span className="hs-name">Capitol Ford</span>
        </div>
        <div className="hero3-window" aria-hidden="true"></div>
      </div>
    </header>
  );
}

/* ================= quick-access bar (2026-09-15 hero v3) =================
   Four runner priorities directly under the hero, overlapping its bottom edge. Replaces the 9/13 stats strip (its
   values are the hero badges now), the countdown band (now in the top strip) and the "Know before you go" tiles
   (road closures moved to the top-strip notice). Tile 4 carries a second link. */
function QuickBar({t}){
  const icons=["clock","bag","map","heart"];
  return (
    <nav className="quick-bar" aria-label={t.quickLabel}>
      <ul className="qb-list">
        {t.quickTiles.map(([title,detail,href,subLabel,subHref],i)=>(
          <li key={i} className="qb-item">
            <span className="qb-ico" aria-hidden="true"><Glyph name={icons[i]} size={18}/></span>
            <span className="qb-chev" aria-hidden="true"><Glyph name="chev" size={16}/></span>
            <a className="qb-link" href={href}>{title}</a>
            <span className="qb-detail">{detail}</span>
            {subHref ? <a className="qb-sub" href={subHref}>{subLabel}</a> : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

## CSS

Every rule that sizes text, colors links or sizes images goes through `html body #root`. The site's theme kit
otherwise wins in these ways:
- It forces `p` to 16px and `h1` to 28px on phones.
- It centers `h1` inside a `header`.
- It sets link weight to 400.
- It recolors links inside list items with `!important`.
- It paints every bare `button` crimson.

```css
/* 2026-09-15 hero v3 (Kosgei's layered-hero brief): slim top strip with a live countdown, full-bleed photo with the copy on
   the left, value badges, two buttons, the title sponsor pinned to the bottom edge, and a quick-access bar overlapping the
   photo. Kit traps: every p is forced to 16px at 540px and below, bare links and buttons get kit colors, and img height is
   forced to auto, so rules that size text, links or images go through html body #root. */
.top-strip{background:var(--banner-bg);color:var(--banner-fg);border-bottom:2px solid var(--terra)}
.top-strip-in{max-width:1200px;margin:0 auto;padding:.45rem clamp(1rem,4vw,2.5rem);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;column-gap:1.75rem;row-gap:.1rem;font-family:'Martian Mono',monospace;font-size:.66rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;line-height:1.7}
.ts-facts{display:inline-flex;flex-wrap:wrap;align-items:center;column-gap:.75em}
.ts-dot{opacity:.6}
.ts-count{display:inline-flex;align-items:baseline;gap:.75em;white-space:nowrap;font-variant-numeric:tabular-nums}
.ts-count-lbl{opacity:.8}
html body #root a.ts-link{color:var(--banner-fg)!important;text-decoration:underline;text-underline-offset:3px}
@media (max-width:1023px){.top-strip-in{justify-content:center;column-gap:1.25rem}.ts-notice{flex-basis:100%;text-align:center}}
@media (max-width:639px){.ts-alt,.ts-place,.ts-count-lbl{display:none}.top-strip-in{column-gap:1rem;padding-top:.4rem;padding-bottom:.4rem}}
/* the inner box fills the hero so the sponsor pill anchors to the hero bottom edge; the theme kit centers h1, sets link weight 400
   and recolors links inside list items, so those properties are pinned through #root below */
.hero3{position:relative;overflow:hidden;display:flex;align-items:stretch;min-height:clamp(560px,78vh,720px);background:#0C0C0E;color:#FFF8EF}
/* sized by width on wide screens so the runner (45% across the photo) always lands about 68% across the hero, right of the copy */
.hero3 .hero-photo{position:absolute;inset:0;background-repeat:no-repeat;background-size:max(150%,1559px) auto;background-position:0% 60%}
.hero3 video.hero-photo{width:100%;height:100%;object-fit:cover}
@media (min-width:1600px){.hero3 .hero-photo{background-position:0% 68%}}
.hero3-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(12,12,14,.84) 0%,rgba(12,12,14,.74) 34%,rgba(12,12,14,.56) 62%,rgba(12,12,14,.16) 100%),linear-gradient(180deg,rgba(12,12,14,.22) 0%,rgba(12,12,14,0) 26%,rgba(12,12,14,0) 58%,rgba(12,12,14,.6) 100%)}
.hero3-in{position:relative;width:100%;max-width:1200px;margin:0 auto;padding:3rem clamp(1.25rem,4vw,2.5rem) 9rem;display:flex;flex-direction:column;justify-content:center}
.hero3-copy{max-width:48rem}
html body #root .hero3-copy{text-align:left}
html body #root p.hero3-date{margin:0 0 1.1rem;font-family:'Martian Mono',monospace;font-size:.72rem!important;line-height:1.5!important;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#FFF8EF;text-shadow:0 1px 10px rgba(0,0,0,.5)}
html body #root h1.hero3-title{margin:0;font-family:'Archivo',system-ui,sans-serif;font-size:clamp(2.25rem,4.4vw,4rem)!important;line-height:.92!important;text-align:left!important;font-weight:900;font-stretch:78%;letter-spacing:0;text-transform:uppercase;color:#FFF8EF;text-shadow:0 2px 26px rgba(0,0,0,.45);text-wrap:balance}
html body #root p.hero3-tag{margin:1rem 0 0;font-size:clamp(1.05rem,2.2vw,1.55rem)!important;line-height:1.2!important;font-weight:700;font-stretch:115%;letter-spacing:.05em;text-transform:uppercase;color:#FFF8EF;text-shadow:0 2px 18px rgba(0,0,0,.55)}
.hero3-tag .hero-grit{color:#FFC9A8}
html body #root ul.hero-badges{list-style:none;margin:1.6rem 0 0;padding:0;display:flex;flex-wrap:wrap;gap:.5rem}
html body #root ul.hero-badges li{margin:0;display:inline-flex;align-items:center;gap:.5rem;padding:.42rem .85rem .42rem .65rem;border-radius:999px;background:rgba(12,12,14,.74);border:1px solid rgba(255,248,239,.3);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);font-family:'Martian Mono',monospace;font-size:.64rem;font-weight:700;letter-spacing:.12em;line-height:1.2;text-transform:uppercase;color:#FFF8EF}
.hero-badges b{font-weight:700;color:#FFC9A8}
.hero-badges svg{flex-shrink:0;color:#FFC9A8}
.hero3-ctas{display:flex;flex-wrap:wrap;align-items:center;gap:1rem 1.25rem;margin-top:2rem}
html body #root .hero3 a.hero-cta{padding:1rem 2.1rem;font-size:clamp(.9rem,1.4vw,1.05rem);font-family:'Archivo',system-ui,sans-serif;font-weight:800;letter-spacing:.08em}
html body #root a.hero-cta-outline{color:#FFF8EF!important;background:rgba(12,12,14,.62);box-shadow:inset 0 0 0 3px #FFF8EF}
html body #root a.hero-cta-outline:hover,html body #root a.hero-cta-outline:focus-visible{color:#0C0C0E!important;background:#FFF8EF}
.hero3-sponsor{position:absolute;left:clamp(1.25rem,4vw,2.5rem);bottom:5.5rem;display:inline-flex;align-items:center;gap:.7rem;padding:.35rem 1rem .35rem .9rem;border-radius:999px;background:rgba(12,12,14,.72);border:1px solid rgba(255,248,239,.26);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
.hs-lbl{font-family:'Martian Mono',monospace;font-size:.58rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#E9DED0}
html body #root img.hs-logo{display:block;width:38px;height:38px!important;border-radius:50%;background:#FFFFFF;object-fit:contain}
.hs-name{font-weight:800;font-size:.9rem;letter-spacing:.04em;text-transform:uppercase;color:#FFF8EF;white-space:nowrap}
.hero3-window{display:none}
.quick-bar{position:relative;z-index:3;max-width:1200px;margin:-3.75rem auto 0;padding:0 clamp(1.25rem,4vw,2.5rem)}
html body #root ul.qb-list{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));background:var(--card);border:1px solid var(--line);border-radius:10px;overflow:hidden;box-shadow:0 26px 50px -30px rgba(12,12,14,.6),0 2px 6px rgba(12,12,14,.08)}
html body #root ul.qb-list li.qb-item{position:relative;margin:0;display:grid;grid-template-columns:auto 1fr auto;column-gap:.75rem;row-gap:.35rem;align-content:start;padding:1.1rem 1.25rem 1.25rem;border-left:1px solid var(--line);transition:background-color .15s ease}
html body #root ul.qb-list li.qb-item:first-child{border-left:0}
.qb-ico{grid-column:1;grid-row:1;width:36px;height:36px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:var(--chip);color:var(--terra)}
.qb-chev{grid-column:3;grid-row:1;align-self:center;display:inline-flex;color:var(--ink-soft);transition:transform .15s ease,color .15s ease}
html body #root a.qb-link{grid-column:1/-1;grid-row:2;margin-top:.35rem;color:var(--ink)!important;font-weight:800;font-size:.86rem;line-height:1.25;letter-spacing:.03em;text-transform:uppercase;text-decoration:none}
html body #root a.qb-link::after{content:"";position:absolute;inset:0}
.qb-detail{grid-column:1/-1;font-size:.8rem;line-height:1.45;color:var(--ink-soft)}
html body #root a.qb-sub{grid-column:1/-1;justify-self:start;position:relative;z-index:1;padding:.15rem 0;font-family:'Martian Mono',monospace;font-size:.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--terra)!important;text-decoration:underline;text-underline-offset:3px}
html body #root ul.qb-list li.qb-item:hover{background:var(--sand-2)}
html body #root ul.qb-list li.qb-item:hover a.qb-link{color:var(--terra)!important}
html body #root ul.qb-list li.qb-item:hover .qb-chev{color:var(--terra);transform:translateX(3px)}
/* the stretched tile link shows its focus as a ring around the whole tile */
html body #root a.qb-link:focus-visible{outline:none!important}
html body #root ul.qb-list li.qb-item:has(a.qb-link:focus-visible){box-shadow:inset 0 0 0 3px var(--terra)}
@media (prefers-reduced-motion:reduce){html body #root ul.qb-list li.qb-item,.qb-chev{transition:none}html body #root ul.qb-list li.qb-item:hover .qb-chev{transform:none}}
@media (max-width:1023px){
  .hero3{display:block;min-height:0}
  .hero3-in{display:flex;flex-direction:column;align-items:flex-start;padding:2.25rem clamp(1.25rem,5vw,2.5rem) 0}
  .hero3-copy{align-self:stretch;max-width:36rem}
  .hero3-sponsor{position:static;margin-top:1.75rem}
  /* a photo window under the copy keeps the runner in view on phones and tablets */
  .hero3-window{display:block;align-self:stretch;height:380px}
  .hero3-shade{background:linear-gradient(180deg,rgba(12,12,14,.74) 0%,rgba(12,12,14,.68) 50%,rgba(12,12,14,.3) 66%,rgba(12,12,14,.12) 84%,rgba(12,12,14,.42) 100%)}
  .hero3 .hero-photo{background-size:auto 100%;background-position:40% 100%}
  html body #root ul.qb-list{grid-template-columns:repeat(2,minmax(0,1fr))}
  html body #root ul.qb-list li.qb-item:nth-child(odd){border-left:0}
  html body #root ul.qb-list li.qb-item:nth-child(n+3){border-top:1px solid var(--line)}
  .quick-bar{margin-top:-2rem}
}
@media (max-width:639px){
  .hero3-ctas{flex-direction:column;align-items:stretch;gap:.85rem}
  /* the kit forces h1 to 28px !important at 767px and below; this keeps the phone size ours */
  html body #root h1.hero3-title{font-size:clamp(1.6rem,7.2vw,2.25rem)!important}
  html body #root .hero3 a.hero-cta{display:block;text-align:center;padding:.95rem 1.5rem}
  .hero3-window{height:340px}
  html body #root ul.qb-list{grid-template-columns:1fr}
  html body #root ul.qb-list li.qb-item{border-left:0;padding:.95rem 1rem;row-gap:.2rem}
  html body #root ul.qb-list li.qb-item+li.qb-item{border-top:1px solid var(--line)}
  .qb-ico{grid-row:1/span 3}
  html body #root a.qb-link{grid-column:2;grid-row:1;margin-top:.45rem}
  .qb-detail,html body #root a.qb-sub{grid-column:2}
  .quick-bar{margin-top:-1.5rem}
}
/* 2026-09-15: the theme kit paints every bare button crimson (#CC0033, 999px radius, 12px 18px padding), so the three desktop
   nav group triggers showed as red pills with #222 text at 2.74:1 (9/13 a11y audit, still live 9/15). Plain text triggers again. */
html body #root .navgrp>button{background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;padding:.5rem 0!important;color:var(--ink)!important}
html body #root .navgrp>button:hover,html body #root .navgrp:focus-within>button{background:transparent!important;color:var(--terra)!important}
```

## Copy — English

```js
  heroDateLine:"Sunday, September 20, 2026",
  heroBadges:[["100%","Paved"],["7,000 ft","Altitude"],["5th","Annual edition"]],
  heroResultsCta:"2025 results",presentedLbl:"Presented by",
  stripPlace:"Santa Fe, NM",stripAlt:"7,000 ft",stripStarts:"Starts in",stripRoads:"Roads into the start close at 7:00 AM",
  quickLabel:"Runner essentials",
  quickTiles:[
    ["Start times & locations","Half & Relay 7:30 AM at Romero's Park · 5K 8:00 AM at Reunity","/event-schedule/"],
    ["Packet pickup & expo","Fri 12–6 PM · Sat 10 AM–5 PM · Warehouse 21, Railyard","/packet-pickup/"],
    ["Course profile & maps","13.1 mi · +651 ft of climb · turnaround at mile 9","/course-map/"],
    ["Kids Dash & charity partners","Free Kids 1K Dash, ages 3–12 · Sun 9:00 AM at Reunity","#kids-race-info","Charity partners","/charity-information/"]],
```

## Copy — Spanish

```js
  heroDateLine:"Domingo 20 de septiembre de 2026",
  heroBadges:[["100%","Pavimentada"],["7,000 pies","de altitud"],["5ª","edición anual"]],
  heroResultsCta:"Resultados 2025",presentedLbl:"Presentado por",
  stripPlace:"Santa Fe, NM",stripAlt:"7,000 pies",stripStarts:"Salida en",stripRoads:"Cierre de calles a la salida: 7:00 AM",
  quickLabel:"Lo esencial para correr",
  quickTiles:[
    ["Horarios y lugares de salida","Medio y Relevo 7:30 AM en Romero's Park · 5K 8:00 AM en Reunity","/event-schedule/"],
    ["Entrega de dorsales y expo","Vie 12–6 PM · Sáb 10 AM–5 PM · Warehouse 21, Railyard","/packet-pickup/"],
    ["Perfil y mapas del recorrido","13.1 mi · +651 pies de ascenso · retorno en la milla 9","/course-map/"],
    ["Kids Dash y beneficencia","Kids 1K Dash gratis, de 3 a 12 años · dom 9:00 AM en Reunity","#kids-race-info","Organizaciones benéficas","/charity-information/"]],
```

## Applying it

**Published 2026-09-15 as front page 5029** on Kosgei's "Proceed now". It replaced 5026, which is backed up in
`backups/homepage-5026-pre-hero-v3-2026-09-15.json`. Later that day:
- v3.6 corrected the Caja del Oro row and redeployed as front page 5032.
- v3.7 aligned that row to 07:00 AM and, after a failed first attempt was restored, went live as front page 5038.
- v3.8 removed every registration fee from the homepage and went live as **front page 5041**.

All three are covered under Decisions. `landing-src` now holds the v3.8 source (md5 `ab157e4de317da941ae01133df3612cb`;
v3.7 was `5af9e242a6b181f618bf4862fa232009`, v3.6 was `206f761b8940c436129625b75a75463d`, v3.5 was
`38133e3fc208f1c67a2730d8b10f7a8c`). The steps below record how the first release shipped.

Everything needed is in `backups/retired/hero-v3-2026-09-22/`
(RETIRED 2026-09-22; was `landing-src/proposals/hero-v3/`):
- the patched `run-santa-fe-2026.src.html` (v3.6 to v3.8 were patched straight into landing-src, not into this copy)
- `driver.mjs` and `SKILL.md` with the five new checks (the hero check also requires the button to /results-photos/)
- the patch scripts, in order: `patch_hero_v3.py`, `patch_driver_hero_v3.py`, `patch_hero_v3_1.py`, `patch_hero_v3_2_nav.py`,
  `patch_hero_v3_3.py`, `patch_hero_v3_4_results_cta.py`, `patch_driver_hero_v3_4.py`, `patch_hero_v3_5_rolling_closure.py`,
  `patch_hero_v3_6_caja_del_oro.py`, `patch_hero_v3_7_caja_7am.py`, `patch_hero_v3_8_no_fees.py`
- the preview and screenshot tools

Screenshots are in `docs/homepage-hero-v3-preview/`.

To ship it once Kosgei approves:
1. Check that `landing-src/run-santa-fe-2026.src.html` still has md5 `ca5b82d0d6b0859eb314570872ef2699`, the source of
   the live 5026 page.
   - **If it does:** copy the proposal's source over both source copies (landing-src and the repo root). Copy its
     `driver.mjs` and `SKILL.md` into `landing-src/.claude/skills/run-santa-fe-homepage/`.
   - **If it does not:** the homepage changed since. Run the patch scripts in order against the new source instead.
     Each is md5-guarded and stops on a mismatch, so diff and adjust rather than copying files over.
2. From `landing-src`, run `node .claude/skills/run-santa-fe-homepage/driver.mjs verify`. Expect 20 PASS.
3. Run `node texturize-gate.js run-santa-fe-2026.prod.src.html`. Expect GATE PASS. `recreate-wp-page.js` also runs
   the gate before it deletes anything.
3b. Before deploying, click both of these in the local preview. Both passed on 9/15 as real clicks in the Browser pane
   at its 279 px width, and the charity link was also hit-tested at 375 and 1280 px:
   - **Charity partners sub-link (tile 4).** It must open /charity-information/. The tile's stretched link covers the
     whole tile, and only `a.qb-sub{position:relative;z-index:1}` keeps the second link clickable.
   - **Top-strip road notice.** It must open the Road closures panel. It is now the only homepage entry to `#closures`,
     since the "Know before you go" tile that used to link there is gone. On 9/15 the click set `#closures`, expanded
     the first logistics panel and scrolled it to just below the sticky menu.
4. Back up the live page's `content.raw`, run `node recreate-wp-page.js`, then purge every cache.
5. Check the live page logged out:
   - every inline script parses
   - the served page contains `hero3`, `top-strip` and `quick-bar`
   - `&#038;` appears only in the Ally widget URL
   - the layout matches the saved screenshots in `docs/homepage-hero-v3-preview/` (1440, 1024, 768 and 390 px)

## Decisions

Both design choices below undo part of the 9/13 restructure, so they went to Kosgei. Answered 2026-09-15:
- **Second hero button: 2025 results.** The 9/13 hero had one register button. The outline button opens /results-photos/
  and reads "Results & Photos" once the race starts. The first build used "View race guide", and
  `patch_hero_v3_4_results_cta.py` switched it.
- **Capitol Ford logo badge in the hero: kept.** The 9/13 restructure had taken sponsor logos out of the hero and kept only
  the "Presented by Capitol Ford" text.

Also in this release, though not design questions:
- **Menu fix.** The red pill menu buttons are a live defect today. This proposal fixes them. If the hero waits, the same
  two CSS rules can ship on their own.
- **Removed content.** The "2 Charity partners" stat is gone, and the "Road closures" tile becomes the top-strip notice.
- **Road-closure wording (Kosgei, 9/15).** These follow their 9/13 ruling that the race uses a rolling closure, in English
  and Spanish:
  - The Romero's Park Start Area row changes from "Strict Vehicle Lockdown, 07:00 AM - 09:00 AM" to "Rolling Closure,
    From 07:00 AM". Kosgei dropped the 09:00 AM end from their 9/5 timetable. The note replaces the "field assembly
    commences" sentence and now reads "Roads into the start close at 07:00 AM and reopen once the field has left the
    start. The Half Marathon and 3-Amigos Relay start at 07:30 AM."
  - The driving card's "strictly locked down or limited to one-way rolling closures" now says roads along the corridor
    close and reopen in stages under a rolling closure.
  - The Caja del Oro Grant Road and Alameda Frontage Road row shipped unchanged in 5029. It tied those roads to the mile 9
    turnaround, but both run past Romero's Park at the start. v3.6 fixed it (below).

**Published 2026-09-15** as front page 5029, on Kosgei's "Proceed now". Logged-out checks after the cache purge:
- all 23 inline scripts parse, and `&#038;` appears only in the Ally widget URL
- the browser console shows no errors
- everything below is served: the new hero, both buttons, the quick-access bar, the menu fix and the rolling-closure wording

### v3.6: the Caja del Oro row (front page 5032)

Kosgei said "fix it now" and chose "Start area, reopens with field" from three offered wordings.
`patch_hero_v3_6_caja_del_oro.py` changed the row in English and Spanish:

| | Before (Kosgei's 9/5 timetable) | After |
|---|---|---|
| Time | 07:15 AM - 12:00 PM | From 07:15 AM / Desde las 07:15 AM |
| Label | Total Sector Diversion | unchanged (not part of the choice) |
| Note, EN | Manages the Mile 9 turnaround loop infrastructure. High-altitude traffic reopens at noon sharp. | Both roads run past Romero's Park at the start. Traffic is diverted from 07:15 AM, and both roads reopen once the field has left the start. |
| Note, ES | Gestiona la infraestructura del retorno de la milla 9. El tráfico reabre al mediodía en punto. | Ambas vías pasan junto a la salida en Romero's Park. El tráfico se desvía desde las 07:15 AM y ambas reabren cuando todos los corredores han dejado la zona de salida. |

Where the roads are: OpenStreetMap places both roads at the Romero's Park start, and an earlier reverse geocode of the
park's pin returned Caja del Oro Grant Rd. The mile 9 turnaround is about 7 km east-northeast of the start pin.

**Published 2026-09-15 as front page 5032**, replacing 5029 (backup `backups/homepage-5029-pre-caja-del-oro-2026-09-15.json`):
- source md5 `206f761b8940c436129625b75a75463d`, prod artifact `5c5f33bc2466c55146eacf5db4689da8`, driver verify 20/20
- texturize gate clean; 180848 raw bytes stored = sent; script and style intact; no STRIPPED line
- after the cache purge, logged out:
  - all 23 inline scripts parse, and `&#038;` appears only in the Ally widget URL
  - the new note is served in both languages, and the old wording is gone
  - driver live 6/6
  - a browser load of `/#closures` shows the new row, with no console errors
  - at 375 px the English note renders in full on 3 lines and, after the language toggle, the Spanish note on 4 lines
    (scrollHeight equals clientHeight, and no ancestor clips either)

Same request, not a homepage change: the /results-photos/ intro (page 1601, widget 6e442dc) no longer says "Relive the
excitement of Race Day — September 21, 2025". It now reads "Relive the excitement of Race Day. Find your official
finishing time below and browse photos from the course. Results from Sunday, September 20, 2026 appear here as soon as
they post."

### v3.7: the Caja del Oro row starts at 07:00 AM (front page 5038)

v3.6 kept the 07:15 AM start from Kosgei's 9/5 timetable, but the start-area row says roads into the start close at
07:00 AM. Asked whether to align them, Kosgei said "make them match, 7:00 AM".

`patch_hero_v3_7_caja_7am.py` changed the row's time and note in English and Spanish:
- time: "From 07:00 AM" / "Desde las 07:00 AM"
- note: "Traffic is diverted from 07:00 AM" / "El tráfico se desvía desde las 07:00 AM"

Unchanged: the label, the Agua Fria River Corridor row (07:15 AM - 12:00 PM) and the driving card's corridor timing.
Source md5 `5af9e242a6b181f618bf4862fa232009`, prod artifact `40cf61dca0443092ce94af1114f7d73d`, driver verify 20/20.

**The first deploy attempt failed and took the homepage down for about 10 minutes.**
- At about 13:30 MDT, `recreate-wp-page.js` deleted 5032.
- Its create call then got HTTP 503 "Briefly unavailable for scheduled maintenance" from a WordPress maintenance window.
- With no page at the slug, `/` served a 499 KB fallback page instead of the homepage.
- Once maintenance cleared, `restore_homepage_from_backup.py` recreated the backup taken seconds before the delete
  (`backups/homepage-5032-pre-caja-7am-2026-09-15.json`) as 5035. The stored copy was byte-identical, and caches were
  purged.
- A logged-out check of 5035 passed before anything else ran.

**The retry at 13:45 published 5038.** It backed up 5035 first (`backups/homepage-5035-pre-caja-7am-retry-2026-09-15.json`),
and the restore script was wired to run automatically if the create failed again:
- texturize gate clean; 180848 raw bytes stored = sent; script and style intact; no STRIPPED line
- after the cache purge, logged out:
  - all 23 inline scripts parse, and `&#038;` appears only in the Ally widget URL
  - the 07:00 note is served in both languages, and the 07:15 wording is gone
  - driver live 6/6
- desktop, Android and iPhone user agents all get the new page (WP-Optimize keeps a separate mobile cache file)
- at 375 px on a fresh load, the row reads "From 07:00 AM" in English and "Desde las 07:00 AM" in Spanish, and neither
  note is clipped

Two things seen while checking:
- A plain reload in the Browser pane kept showing the old 07:15 page, although the server was already sending 07:00 to
  every user agent. Check a deploy with curl or a query-string URL, not a reload.
- After switching to Spanish, the console shows "Cannot find cached translations for locale es".
  - It is not in the page's own code. The page's `lang` flips to `es`, and the likely source is the Elementor Ally
    widget script.
  - It did not show in the 5032 check, and visitors do not see it.

### v3.8: registration fees removed (front page 5041)

Kosgei: "remove the registration fees from homepage". `patch_hero_v3_8_no_fees.py` removed the following, in English
and Spanish:
- **Race cards.** The price line is gone from all four cards (Half $95, Relay $255 / team, 5K $45, Kids Dash Free).
  That includes the 5K's "$50 walk-up" line during the walk-up window. The `price` and `walkupPrice` fields are gone
  from the data too.
- **Walk-up answers.** The $50 is out of the walk-up FAQ answer and the concierge's walk-up registration answer. Both
  keep the walk-up facts: 5K only, race morning, at the 5K start line at Reunity Resources Farm, until 7:45 AM.
- **Phone sticky bar.** "from $45" / "desde $45" is gone. The bar now shows the race date while registration is open.
- **JSON-LD Event offers.** `price` and `priceCurrency` are removed. Name, availability, dates and the RunSignup URL
  stay.

Kept: the word "free" for the Kids 1K Dash elsewhere (quick tile, SEO description), since it gives no amount.

Build checks:
- Source md5 `ab157e4de317da941ae01133df3612cb`, prod artifact `67ca565ff29ba175a09e4b5a7860ac9f`.
- Driver verify 20/20, texturize gate clean.
- The only `$<digit>` left in the build is `"$1-$2"`, a regex backreference in the lucide icon code.

Deployed the same way as the 5038 retry:
- Guard on 5038, backup `backups/homepage-5038-pre-no-fees-2026-09-15.json`, restore wired to run automatically.
- 180,298 bytes stored = sent, no STRIPPED line.
- After the purge, desktop and phone user agents both got the fee-free page logged out, and all 23 inline scripts
  parse.
