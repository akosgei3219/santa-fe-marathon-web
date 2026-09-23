// Did the Kids 1K Dash copy fix actually reach the live page, in the language shown?
// Kosgei 2026-09-17: "NO ORGANIC FINISHER SNACK PACKS. DON'T MAKE UP STUFF." The claim sat live
// in EN and ES; this confirms it is gone from the RENDERED page and that React mounted at all.
// textContent, not innerText: the section is below the fold under content-visibility:auto, and
// innerText silently omits unpainted sections.
(() => {
  const tidy = s => (s || "").replace(/\s+/g, " ").trim();
  const root = document.querySelector("#root");
  const sec = document.querySelector("#kids-race-info");
  const all = root ? root.textContent : "";
  const banned = ["snack pack", "refrigerio", "International Kids Run", "Railyard time slot",
                  "custom-made medal", "traffic-free course loops", "comprehensive schedule overhaul"];
  return {
    reactMounted: !!root && root.children.length > 0,
    rootChildren: root ? root.children.length : 0,
    lang: document.documentElement.lang || "(none)",
    kidsTitle: sec ? tidy((sec.querySelector("h3") || {}).textContent) : "(no #kids-race-info)",
    kidsCopy: sec ? tidy([...sec.querySelectorAll("p")].map(p => p.textContent).join(" | ")).slice(0, 360) : "",
    bannedStillOnPage: banned.filter(b => all.toLowerCase().includes(b.toLowerCase())),
  };
})()
