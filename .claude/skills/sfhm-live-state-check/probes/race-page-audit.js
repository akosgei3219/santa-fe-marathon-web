// Audit the homepage against the endurance/race landing-page blueprint and its guardrails:
// mobile-first, WCAG 2.1 contrast (4.5:1 body, 3:1 large), semantic structure, sticky CTA,
// and the four expected modules (hero, logistics ribbon, course/elevation, tiered sponsors).
//
// Measures rather than asserts. Contrast is computed from rendered colours, because sitewide
// CSS routinely overrides what a component asked for.
(() => {
  const tidy = s => (s || "").replace(/\s+/g, " ").trim();

  const lum = c => {
    const m = (c.match(/[0-9.]+/g) || []).slice(0, 3).map(Number);
    if (m.length < 3) return null;
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]);
  };
  // walk up the tree for the first non-transparent background, since most text sits on a
  // transparent element over a coloured ancestor
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
  const ratio = (fg, bg) => {
    const a = lum(fg), b = lum(bg);
    if (a === null || b === null) return null;
    return Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100;
  };

  // sample real text nodes rather than a hand-picked list
  const samples = [];
  const seen = new Set();
  for (const el of document.querySelectorAll("#root p, #root h1, #root h2, #root h3, #root li, #root a, #root button, #root span")) {
    const t = tidy(el.textContent);
    if (!t || t.length < 8 || el.children.length > 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    const cs = getComputedStyle(el);
    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const key = t.slice(0, 24) + size;
    if (seen.has(key)) continue;
    seen.add(key);
    const cr = ratio(cs.color, bgOf(el));
    if (cr === null) continue;
    samples.push({ text: t.slice(0, 40), size: Math.round(size * 10) / 10, large, ratio: cr,
                   need: large ? 3 : 4.5, pass: cr >= (large ? 3 : 4.5) });
  }
  const fails = samples.filter(s => !s.pass).sort((a, b) => a.ratio - b.ratio);

  // blueprint modules
  const has = sel => !!document.querySelector(sel);
  const sticky = [...document.querySelectorAll("#root *")]
    .filter(e => { const p = getComputedStyle(e).position; return p === "fixed" || p === "sticky"; })
    .map(e => tidy(e.textContent).slice(0, 60)).filter(Boolean);

  const imgs = [...document.querySelectorAll("#root img")];
  const oversized = imgs.filter(i => i.naturalWidth && i.getBoundingClientRect().width &&
    i.naturalWidth > i.getBoundingClientRect().width * 2.5)
    .map(i => (i.currentSrc || i.src).split("/").pop() + "  natural " + i.naturalWidth +
              "px shown " + Math.round(i.getBoundingClientRect().width) + "px");

  return {
    viewportWidth: document.documentElement.clientWidth,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,

    semantic_main: document.querySelectorAll("main").length,
    semantic_section: document.querySelectorAll("section").length,
    semantic_article: document.querySelectorAll("article").length,
    semantic_nav: document.querySelectorAll("nav").length,
    semantic_header: document.querySelectorAll("header").length,
    h1Count: document.querySelectorAll("h1").length,

    module_hero: has("#top"),
    module_countdown: /\d+\s*D\s*\d+\s*H|\d+d\s*\d+h/i.test(document.body.textContent),
    module_logisticsRibbon: has("#top ~ * a[href*='packet'], a[href*='event-schedule'], a[href*='transportation']"),
    module_courseOrElevation: has("#course") ||
      /elevation|profile|\+651|climb/i.test(tidy((document.querySelector("#course") || {}).textContent || "")),
    module_elevationGraphic: !!document.querySelector("#course svg, #course canvas, #course img[alt*='elevation' i]"),
    module_sponsorGrid: has("#sponsors"),
    sponsorTierLabels: [...document.querySelectorAll("#sponsors *")]
      .map(e => tidy(e.textContent)).filter(t => /^(title|gold|silver|bronze|partner)/i.test(t) && t.length < 30)
      .filter((v, i, a) => a.indexOf(v) === i).slice(0, 8),
    sponsorTickerStillPresent: has(".ticker"),

    stickyElements: sticky.slice(0, 4),
    imageCount: imgs.length,
    oversizedImages: oversized.slice(0, 5),

    contrastSamplesChecked: samples.length,
    contrastFailures: fails.length,
    worstContrast: fails.slice(0, 6).map(f => f.ratio + ":1 (needs " + f.need + ") " + f.size + "px  \"" + f.text + "\""),
  };
})()
