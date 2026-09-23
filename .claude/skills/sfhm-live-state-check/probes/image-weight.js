// Every rendered image: what it actually is vs how big it is drawn. Used to find assets served
// far larger than they display, which is wasted bytes on a weak trailhead signal.
//
// Report the LARGEST displayed size you see across breakpoints before resizing anything -- a
// logo drawn at 38px on a phone may be drawn at 110px on desktop, and sizing for the phone
// alone would leave desktop blurry. Target roughly displayed x 2 for crispness on 2x screens.
(() => {
  const rows = [];
  for (const img of document.querySelectorAll("#root img")) {
    const r = img.getBoundingClientRect();
    const shownW = Math.round(r.width);
    const shownH = Math.round(r.height);
    if (!img.naturalWidth) continue;            // not loaded / decorative
    const src = img.currentSrc || img.src || "";
    rows.push({
      file: src.split("/").pop().split("?")[0],
      natural: img.naturalWidth + "x" + img.naturalHeight,
      shown: shownW + "x" + shownH,
      ratio: shownW ? Math.round((img.naturalWidth / shownW) * 10) / 10 : null,
      hasSrcset: !!img.getAttribute("srcset"),
      attrW: img.getAttribute("width") || "-",
      attrH: img.getAttribute("height") || "-",
      loading: img.getAttribute("loading") || "eager",
      cls: (img.className || "").split(/\s+/).slice(0, 2).join(" "),
      alt: (img.getAttribute("alt") || "").slice(0, 28),
    });
  }
  rows.sort((a, b) => (b.ratio || 0) - (a.ratio || 0));
  return {
    viewport: document.documentElement.clientWidth,
    dpr: window.devicePixelRatio,
    totalImages: rows.length,
    withSrcset: rows.filter(r => r.hasSrcset).length,
    oversized2x: rows.filter(r => r.ratio && r.ratio >= 2).length,
    all: rows.map(r => `${String(r.ratio).padStart(5)}x  ${r.natural.padEnd(11)} -> ${r.shown.padEnd(9)} ${r.hasSrcset ? "srcset" : "      "} w=${r.attrW} ${r.loading.padEnd(5)} ${r.file}`),
  };
})()
