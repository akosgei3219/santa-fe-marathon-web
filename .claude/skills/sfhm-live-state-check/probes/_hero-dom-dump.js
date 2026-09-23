// What is actually rendered inside the hero right now, regardless of what the bundle contains.
// Markup present in the served HTML only proves the code shipped, not that React rendered it.
(() => {
  const top = document.querySelector("#top");
  if (!top) return { error: "no #top" };
  const sig = e => e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") +
    (typeof e.className === "string" && e.className.trim() ? "." + e.className.trim().split(/\s+/).join(".") : "");
  const tree = [];
  const walk = (el, d) => {
    if (d > 2) return;
    for (const c of el.children) {
      const r = c.getBoundingClientRect();
      tree.push("  ".repeat(d) + sig(c) + "  " + Math.round(r.width) + "x" + Math.round(r.height));
      walk(c, d + 1);
    }
  };
  walk(top, 0);
  return {
    heroChildren: top.children.length,
    anySlideAnywhere: document.querySelectorAll(".hero-slide").length,
    anyDotAnywhere: document.querySelectorAll(".hero-dot").length,
    anyVideoAnywhere: document.querySelectorAll("video").length,
    heroPhotoStill: document.querySelectorAll("#top .hero-photo").length,
    rootChildren: (document.querySelector("#root") || {}).childElementCount,
    tree: tree.slice(0, 22),
  };
})()
