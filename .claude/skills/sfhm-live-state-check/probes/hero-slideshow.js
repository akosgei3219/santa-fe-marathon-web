// Does the hero slideshow actually work on the live page? Checks structure, the captions
// Kosgei ruled on, the accessibility controls, and whether the video element is real and
// loadable (readyState/networkState tell you if the file resolved, before it plays).
(() => {
  const tidy = s => (s || "").replace(/\s+/g, " ").trim();
  const slides = [...document.querySelectorAll("#top .hero-slide")];
  if (!slides.length) return { error: "no .hero-slide found" };

  const v = document.querySelector("#top .hero-slide video");
  const dots = [...document.querySelectorAll("#top .hero-dot")];
  const pause = document.querySelector("#top button.hero-pause");
  const cap = document.querySelector("#top .hero-cap");

  const broken = slides.map(s => {
    const img = s.querySelector("img");
    const bg = getComputedStyle(s).backgroundImage;
    const url = img ? (img.currentSrc || img.src) : (bg.match(/url\(["']?([^"')]+)/) || [])[1];
    return { url: url ? url.split("/").pop() : "(none)",
             loaded: img ? (img.complete && img.naturalWidth > 0) : !!url };
  });

  return {
    slideCount: slides.length,
    onNow: slides.findIndex(s => s.classList.contains("is-on")),
    exactlyOneOn: slides.filter(s => s.classList.contains("is-on")).length === 1,
    caption: tidy(cap && cap.textContent),
    captionLive: cap ? cap.getAttribute("aria-live") : "(no .hero-cap)",
    dotCount: dots.length,
    dotsLabelled: dots.every(d => d.getAttribute("aria-label")),
    dotHasCurrent: dots.some(d => d.getAttribute("aria-current") === "true"),
    pauseLabel: pause ? pause.getAttribute("aria-label") : "(no pause button)",
    pauseIsButton: !!pause && pause.tagName === "BUTTON",
    video: v ? {
      src: (v.currentSrc || v.src || "").split("/").pop(),
      // 0 none, 1 metadata, 2 current, 3 future, 4 enough. >=1 means the file resolved.
      readyState: v.readyState,
      // 1 idle, 2 loading, 3 NO_SOURCE -- 3 means the URL is wrong
      networkState: v.networkState,
      duration: isFinite(v.duration) ? Math.round(v.duration * 10) / 10 : "(unknown)",
      muted: v.muted, autoplay: v.autoplay, playsInline: v.playsInline,
      poster: (v.getAttribute("poster") || "").split("/").pop(),
    } : "(no video element)",
    slideAssets: broken.map(b => (b.loaded ? "ok   " : "FAIL ") + b.url),
    anyAssetBroken: broken.some(b => !b.loaded),
  };
})()
