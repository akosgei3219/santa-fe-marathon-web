// The sponsor section: are the tiers static (no marquee), are all logos visible, and is every
// logo actually readable against the surface behind it? A light logo on a white chip is
// invisible even though every automated structural check passes.
//
// ASYNC ON PURPOSE. This section lives below the fold under `content-visibility:auto` with
// lazy-loaded logos, so a straight synchronous read measures a section the browser has not
// painted yet: every image comes back 0x0 with complete=false and the probe reports a wall of
// FAILs for a section that is perfectly healthy. That false alarm is worse than no probe --
// it invites a "fix" to a live page that is not broken. So scroll the section into view,
// force-load the images, await decode(), and only then measure. The harness passes
// awaitPromise:true, so returning a Promise here works.
(async () => {
  const tidy = s => (s || "").replace(/\s+/g, " ").trim();
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const sec = document.querySelector("#sponsors");
  if (!sec) return { error: "no #sponsors section" };

  sec.scrollIntoView({ block: "center" });
  sec.style.contentVisibility = "visible";   // defeat the paint-skipping for the measurement
  await sleep(400);
  const all = [...sec.querySelectorAll("img")];
  all.forEach(i => { i.loading = "eager"; });
  await Promise.all(all.map(i =>
    (i.decode ? i.decode() : Promise.resolve()).catch(() => {})       // decode rejects on a genuinely broken src
  ));
  await sleep(300);

  const lum = c => {
    const m = (c.match(/[0-9.]+/g) || []).slice(0, 3).map(Number);
    if (m.length < 3) return null;
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]);
  };
  const bgOf = el => {
    let n = el;
    while (n && n !== document.documentElement) {
      const c = getComputedStyle(n).backgroundColor;
      const a = (c.match(/[0-9.]+/g) || [])[3];
      if (c && c !== "transparent" && a !== "0") return c;
      n = n.parentElement;
    }
    return "rgb(255,255,255)";
  };

  const imgs = [...sec.querySelectorAll("img")].map(i => {
    const r = i.getBoundingClientRect();
    const bg = bgOf(i);
    const l = lum(bg);
    // A 0x0 box does NOT mean the logo is broken. The homepage sponsor section sits below the
    // fold under `content-visibility:auto`, so until it has actually been painted every image
    // measures 0x0 and reports complete=false -- the same artifact that once produced 26 bogus
    // contrast failures. Distinguish "not painted yet" from "genuinely failed to load", and
    // when in doubt confirm with a screenshot rather than trusting these numbers.
    const painted = r.width > 0 && r.height > 0;
    return {
      alt: i.getAttribute("alt") || "(no alt)",
      file: (i.currentSrc || i.src || "").split("/").pop().slice(0, 46),
      shown: Math.round(r.width) + "x" + Math.round(r.height),
      painted,
      loaded: i.complete && i.naturalWidth > 0,
      surface: l === null ? "?" : (l > 0.5 ? "light" : "dark"),
    };
  });

  return {
    tierLabels: [...sec.querySelectorAll("div,span")].map(e => tidy(e.textContent))
      .filter(t => /^(title sponsor|gold sponsor|silver sponsor|community partners|patrocinador|aliados)/i.test(t) && t.length < 40)
      .filter((v, i, a) => a.indexOf(v) === i),
    logoCount: imgs.length,
    // Only count a logo as failed if it was actually painted and STILL did not load. Anything
    // unpainted is inconclusive, not a failure -- scroll further or take a screenshot.
    trulyBroken: imgs.filter(i => i.painted && !i.loaded).map(i => i.file),
    notPaintedYet: imgs.filter(i => !i.painted).length,
    logos: imgs.map(i => `${i.surface.padEnd(5)} surface  ${i.shown.padEnd(9)} ` +
      `${!i.painted ? "not-painted (inconclusive)" : i.loaded ? "ok  " : "FAIL"} ${i.alt}`),
    tickerGone: document.querySelectorAll(".ticker, .ticker-track").length === 0,
    marqueeAnimations: [...document.querySelectorAll("#sponsors *")]
      .filter(e => { const a = getComputedStyle(e).animationName; return a && a !== "none"; }).length,
  };
})()
