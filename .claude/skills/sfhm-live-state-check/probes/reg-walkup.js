// Registration state as a visitor sees it: hero CTA, each race card's action line, the Kids Dash
// action, the phone bar, and the FAQ answer to "When does registration close?".
// Written 2026-09-19 when online registration closed early (Thu 9/17 11:59 PM MDT) and the
// homepage was switched to walk-up state in place. Uses textContent, not innerText: below-fold
// sections are content-visibility:auto, so innerText silently omits them.
(() => {
  const tidy = s => (s || "").replace(/\s+/g, " ").trim();
  const hero = document.querySelector("#top .hero-cta-solid");
  const heroHref = hero ? hero.getAttribute("href") : null;

  const cards = [...document.querySelectorAll("article.race-card")].map(c => {
    const name = tidy((c.querySelector("h3") || {}).textContent);
    const link = c.querySelector("a.btn");
    const last = c.lastElementChild;
    return name + " -> " + (link ? "LINK " + tidy(link.textContent) + " " + link.getAttribute("href") : tidy(last && last.textContent));
  });

  const kids = document.querySelector("#kids-race-info");
  const kidsAction = kids ? [...kids.querySelectorAll("a.btn, span.mono")].map(e => tidy(e.textContent)).pop() : "(no kids section)";

  let faq = "(FAQ entry not found)";
  for (const el of document.querySelectorAll("#faq *")) {
    if (el.children.length === 0 && /When does registration close\?|Cu.ndo cierra la inscripci/.test(el.textContent)) {
      let box = el.parentElement;
      for (let k = 0; k < 4 && box && tidy(box.textContent).length < 120; k++) box = box.parentElement;
      faq = tidy(box ? box.textContent : el.textContent);
      break;
    }
  }

  const runsignupLinks = [...document.querySelectorAll('a[href*="runsignup.com"]')].map(a => tidy(a.textContent) || a.getAttribute("aria-label"));

  return {
    heroLabel: hero ? tidy(hero.textContent) : "(no hero CTA)",
    heroHref: heroHref,
    heroAnchorTargetExists: heroHref && heroHref.startsWith("#") ? !!document.querySelector(heroHref) : "n/a",
    raceCards: cards,
    kidsAction: kidsAction,
    faqRegClose: faq.slice(0, 420),
    runsignupLinksStillOnPage: runsignupLinks,
  };
})()
