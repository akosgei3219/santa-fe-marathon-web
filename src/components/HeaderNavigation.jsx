// REFERENCE EXPORT ONLY - NOT BUILT, NOT DEPLOYED.
// The live homepage compiles from landing-src/run-santa-fe-2026.src.html (single file).
// This file mirrors the homepage React navbar (the sitewide 3-column mega menu + mobile drawer is NOT React - it lives in WordPress Elementor template 2365) as deployed at front id 4849 on 2026-09-10 for reading/handoff.
// Edit the single-file source, never this copy - see src/README.md.

function Nav({t,lang,setLang}){
  const [open,setOpen]=useState(false);
  const links=[["#races",t.nav.races],["#results",t.nav.results],["#story",t.nav.story],["#plan",t.nav.plan],["#guidelines",t.nav.guide],["#faq",t.nav.faq],["#sponsors",t.nav.sponsors]];
  return (
    <div className="sticky top-0 z-50 border-b" style={{background:"var(--sand-2)",borderColor:"var(--line)"}}>
      <nav aria-label="Main" className="max-w-[1080px] mx-auto px-5 py-3 flex items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2.5 no-underline" style={{color:"var(--ink)"}}>
          <img src={IMGS.logo} alt="Santa Fe International Half Marathon" className="h-11 w-11 shrink-0 object-contain rounded-full" style={{background:"#FFFFFF",border:"1px solid var(--line)"}}/>
          <span className="display text-[.95rem] tracking-[.02em] whitespace-nowrap hidden min-[430px]:inline">Santa Fe Intl Half</span>
        </a>
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex gap-3.5">
            {links.map(([h,l])=>(<a key={h} href={h} className="display no-underline text-[.8rem] py-2 whitespace-nowrap" style={{color:"var(--ink)"}}>{l}</a>))}
          </div>
          <button onClick={()=>setLang(lang==="en"?"es":"en")} className="mono rounded-[3px] px-2.5 py-1.5 text-[.68rem] font-bold cursor-pointer border"
            style={{background:"var(--chip)",color:"var(--ink)",borderColor:"var(--line)"}}
            aria-label={lang==="en"?"Cambiar a español":"Switch to English"}>
            {lang==="en"?"ES":"EN"}
          </button>
          <a className="btn btn-primary !px-3.5 !py-2 !text-[.75rem]" href={REG_URL} target="_blank" rel="noopener">{t.nav.register}</a>
          <button className="md:hidden rounded-[3px] px-2.5 py-2 cursor-pointer border inline-flex" aria-label="Menu" aria-expanded={open} aria-controls="mobile-menu"
            onClick={()=>setOpen(!open)} style={{background:"var(--card)",color:"var(--ink)",borderColor:"var(--line)"}}>
            <Ic name={open?"X":"Menu"} size={18}/>
          </button>
        </div>
      </nav>
      {open && (
        <div id="mobile-menu" className="border-t md:hidden" style={{borderColor:"var(--line)",background:"var(--sand-2)"}}>
          <div className="max-w-[1080px] mx-auto px-5 py-2 flex flex-col">
            {links.map(([h,l])=>(<a key={h} href={h} onClick={()=>setOpen(false)} className="display no-underline py-2.5 border-b" style={{color:"var(--ink)",borderColor:"var(--line)"}}>{l}</a>))}
          </div>
        </div>
      )}
    </div>
  );
}