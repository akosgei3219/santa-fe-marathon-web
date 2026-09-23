// REFERENCE EXPORT ONLY - NOT BUILT, NOT DEPLOYED.
// The live homepage compiles from landing-src/run-santa-fe-2026.src.html (single file).
// This file mirrors the hero with the sand gradient bleed mask as deployed at front id 4849 on 2026-09-10 for reading/handoff.
// Edit the single-file source, never this copy - see src/README.md.

function Hero({t}){
  /* sized by WIDTH: a sitewide "html body img{height:auto!important}" rescue rule
     defeats any height-based sizing (class or inline) — same reason SponsorTicker
     uses inline widths */
  const ribbon=[[IMGS.capitol,"Capitol Ford","44px"],[IMGS.econ,"City of Santa Fe","100px"],[IMGS.jirani,"Jirani Kenyan Coffee","44px"],[IMGS.county,"Santa Fe County","72px"],[IMGS.runhub,"The Running Hub","80px"]];
  return (
    <header id="top" className="relative overflow-hidden flex items-center justify-center" style={{background:"#26265E",color:"#FFF8EF",minHeight:"100vh"}} aria-label={t.heroTitle}>
      {HERO_VIDEO_URL
        ? <video className="absolute inset-0 w-full h-full object-cover" src={HERO_VIDEO_URL} poster={IMGS.hero} autoPlay muted loop playsInline></video>
        : <img src={IMGS.hero} alt={t.slides[0]} fetchpriority="high" className="absolute inset-0 w-full h-full object-cover"/>}
      {/* top layer bleeds the header's sand-2 (#F1EDE6) into the hero art so the nav edge reads as one surface; dark scrim below it keeps hero text contrast */}
      <div aria-hidden="true" className="absolute inset-0" style={{background:"linear-gradient(180deg,rgba(241,237,230,.92) 0%,rgba(241,237,230,0) 14%),radial-gradient(ellipse at center,rgba(12,12,14,.18) 0%,rgba(12,12,14,.52) 100%),linear-gradient(180deg,rgba(12,12,14,.38) 0%,rgba(12,12,14,.22) 55%,rgba(12,12,14,.62) 100%)"}}></div>
      <div className="relative text-center px-5 max-w-[1080px] mx-auto pt-24 pb-40">
        <h1 className="display m-0 text-[clamp(2.4rem,7vw,5.25rem)] leading-[.96]" style={{textShadow:"0 2px 28px rgba(0,0,0,.5)",letterSpacing:".015em"}}>
          <span className="sr-only">{t.heroTitle}: </span>
          {t.heroTagline.map((ln,i)=>(<span key={i} className={"block"+(i===t.heroTagline.length-1?" hero-grit":"")}>{ln}</span>))}
        </h1>
        <p className="hero-river m-0 mt-5">{t.heroRiver}</p>
        <p className="mono mt-5 mb-0 text-[clamp(.72rem,1.6vw,.95rem)] font-semibold uppercase tracking-[.28em]" style={{color:"#FFF8EF",textShadow:"0 1px 12px rgba(0,0,0,.45)"}}>{t.heroTracker}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a className="hero-cta hero-cta-solid" href={REG_URL} target="_blank" rel="noopener"><span>{t.ctaHalf}</span></a>
          <a className="hero-cta hero-cta-outline" href={REG_URL} target="_blank" rel="noopener"><span>{t.cta5k}</span></a>
        </div>
      </div>
      <div className="absolute left-0 right-0 bottom-0" style={{background:"rgba(12,12,14,.72)",WebkitBackdropFilter:"blur(8px)",backdropFilter:"blur(8px)",borderTop:"1px solid rgba(255,255,255,.12)"}}>
        <div className="max-w-[1080px] mx-auto px-5 py-3">
          <p className="mono m-0 mb-2 text-center text-[.6rem] font-bold uppercase tracking-[.3em]" style={{color:"#BFB4A4"}}>{t.ribbonLabel}</p>
          <div className="flex items-center justify-center flex-wrap gap-x-10 gap-y-2">
            {ribbon.map(([src,name,w])=>(
              <img key={name} src={src} alt={name} loading="lazy" style={{width:w,height:"auto",filter:"grayscale(1) contrast(1.05) brightness(1.2)",opacity:.9}}/>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}