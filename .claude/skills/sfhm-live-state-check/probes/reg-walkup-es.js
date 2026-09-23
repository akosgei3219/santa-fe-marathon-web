// Spanish side of reg-walkup.js: click the homepage's own EN/ES toggle, wait for React to re-render,
// then read the same things. The toggle is the button whose aria-label is "Cambiar a espanol".
// Returns a Promise; probe.mjs awaits it.
(async () => {
  const tidy = s => (s || "").replace(/\s+/g, " ").trim();
  const btn = [...document.querySelectorAll("button")].find(b => /Cambiar a espa/.test(b.getAttribute("aria-label") || ""));
  if (!btn) return { error: "no EN/ES toggle found" };
  btn.click();
  await new Promise(r => setTimeout(r, 900));
  const hero = document.querySelector("#top .hero-cta-solid");
  const cards = [...document.querySelectorAll("article.race-card")].map(c => {
    const link = c.querySelector("a.btn");
    const last = c.lastElementChild;
    return tidy((c.querySelector("h3") || {}).textContent) + " -> " + (link ? "LINK " + link.getAttribute("href") : tidy(last && last.textContent));
  });
  let faq = "(not found)";
  for (const el of document.querySelectorAll("#faq *")) {
    if (el.children.length === 0 && /Cu.ndo cierra la inscripci/.test(el.textContent)) {
      let box = el.parentElement;
      for (let k = 0; k < 3 && box && tidy(box.textContent).length < 120; k++) box = box.parentElement;
      faq = tidy(box ? box.textContent : el.textContent);
      break;
    }
  }
  return {
    htmlLang: document.documentElement.lang,
    heroLabel: hero ? tidy(hero.textContent) : "(no hero CTA)",
    raceCards: cards,
    faqRegClose: faq.slice(0, 420),
  };
})()
