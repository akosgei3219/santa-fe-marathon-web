// Inner pages (template 2365): what the SFHM-REG-STATES script actually did to the nav CTAs, the
// "Secure Your Spot" mega card, the footer link, and the concierge's registration answer.
// Reads data-en / data-es as well as textContent, so both languages are checked from one load.
(() => {
  const tidy = s => (s || "").replace(/\s+/g, " ").trim();
  const one = sel => {
    const el = document.querySelector(sel);
    return el ? { text: tidy(el.textContent), href: el.getAttribute("href"), es: el.getAttribute("data-es") } : "(missing)";
  };
  const rows = [...document.querySelectorAll("#sfcgData .cg-r")]
    .filter(r => (r.getAttribute("data-k") || "").indexOf("register") === 0)
    .map(r => ({ keys: r.getAttribute("data-k"), link: r.getAttribute("data-p"),
                 en: r.getAttribute("data-en"), es: r.getAttribute("data-es") }));
  return {
    navCta: one(".nav-cta"),
    mobileCta: one(".m-cta"),
    megaHead: one(".mcc-head"),
    megaDate: one(".mcc-date"),
    megaBtn: one(".mcc-btn"),
    footerReg: one(".sfhm-ft__reg"),
    conciergeRegisterRows: rows,
  };
})()
