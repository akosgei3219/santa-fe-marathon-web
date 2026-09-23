// Hero primary CTA: what it says, where it goes, and whether an in-page target actually exists.
// Written as one expression so probe.mjs can evaluate it directly.
//
// Escapes are safe here because this file is sent to the page verbatim -- no template literal,
// no heredoc, no JSON string in between. Write normal JavaScript.
(() => {
  const tidy = s => (s || "").replace(/\s+/g, " ").trim();
  const solid = document.querySelector("#top .hero-cta-solid");
  const outline = document.querySelector("#top .hero-cta-outline");
  if (!solid) return { error: "no #top .hero-cta-solid on this page" };

  const href = solid.getAttribute("href");
  const cs = getComputedStyle(solid);
  return {
    label: tidy(solid.textContent),
    href: href,
    target: solid.getAttribute("target") || "(same tab)",
    // an in-page link to a section that does not exist is a dead button that still looks fine
    anchorTargetExists: href && href.startsWith("#") ? !!document.querySelector(href) : "n/a",
    background: cs.backgroundColor,
    color: cs.color,
    secondary: outline ? tidy(outline.textContent) + " -> " + outline.getAttribute("href") : "(none)",
  };
})()
