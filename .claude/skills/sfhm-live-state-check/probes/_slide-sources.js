// Are all seven slides pointed at real media, and does the caption announce changes?
// The slideshow lazy-loads: background-image is only set on slides near the active one, so an
// empty computed background is expected and is NOT a broken asset. data-src is the truth.
(() => {
  const tidy = s => (s || "").replace(/\s+/g, " ").trim();
  const slides = [...document.querySelectorAll("#top .hero-slide")];
  const cap = document.querySelector("#top .hero-cap");
  const capParent = cap && cap.parentElement;
  return {
    slides: slides.map((s, i) => {
      const ds = s.getAttribute("data-src") || "";
      const bg = getComputedStyle(s).backgroundImage;
      return `${i}  ${s.classList.contains("is-on") ? "ON " : "   "} data-src=${ds ? ds.split("/").pop() : "(none)"}  painted=${bg !== "none"}`;
    }),
    allHaveDataSrc: slides.every(s => (s.getAttribute("data-src") || "").length > 10),
    // aria-live may sit on the caption or on a wrapper; check both before calling it missing
    capLive: cap ? cap.getAttribute("aria-live") : "(no cap)",
    capParentLive: capParent ? capParent.getAttribute("aria-live") : "(none)",
    capRole: cap ? cap.getAttribute("role") : null,
    capText: tidy(cap && cap.textContent),
    slidesRegion: (() => {
      const r = document.querySelector("#top .hero-slides");
      return r ? { role: r.getAttribute("role"), label: r.getAttribute("aria-label"), cls: r.className } : "(none)";
    })(),
  };
})()
