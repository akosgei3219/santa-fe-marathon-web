// Validate the contrast method before trusting any number it produces. A 1:1 result means the
// foreground and the background resolved to the same colour, which for visible text means the
// background lookup is wrong -- not that the text is invisible.
(() => {
  const tidy = s => (s || "").replace(/\s+/g, " ").trim();
  const wanted = ["The Voice of the River Trail", "Santa Fe International Kids Run", "Empowering Youth"];

  const out = [];
  for (const el of document.querySelectorAll("#root *")) {
    if (el.children.length) continue;
    const t = tidy(el.textContent);
    if (!t || !wanted.some(w => t.startsWith(w.slice(0, 18)))) continue;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();

    // walk the ancestors and record what each one contributes, so the failure is visible
    const chain = [];
    let n = el;
    for (let i = 0; i < 8 && n && n !== document.documentElement; i++) {
      const c = getComputedStyle(n);
      chain.push({
        tag: n.tagName.toLowerCase() + (n.id ? "#" + n.id : ""),
        bgColor: c.backgroundColor,
        bgImage: c.backgroundImage === "none" ? "-" : "IMAGE",
        contentVisibility: c.contentVisibility,
        display: c.display,
        visibility: c.visibility,
      });
      n = n.parentElement;
    }
    out.push({
      text: t.slice(0, 34),
      color: cs.color,
      ownBg: cs.backgroundColor,
      rect: Math.round(r.width) + "x" + Math.round(r.height) + " @" + Math.round(r.top),
      inViewportFlow: r.width > 0 && r.height > 0,
      chain: chain,
    });
    if (out.length >= 3) break;
  }
  return { found: out.length, detail: out };
})()
