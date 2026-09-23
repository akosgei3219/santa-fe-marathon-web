// Minimal mount diagnostic: did React render anything into #root, and what is the page's
// actual top-level structure right now?
(() => {
  const root = document.querySelector("#root");
  const kids = root ? [...root.children].map(e =>
    e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") +
    (typeof e.className === "string" && e.className.trim() ? "." + e.className.trim().split(/\s+/)[0] : "")
  ) : [];
  return {
    readyState: document.readyState,
    hasRoot: !!root,
    rootChildCount: root ? root.childElementCount : -1,
    rootFirstChildren: kids.slice(0, 8),
    rootTextLength: root ? (root.textContent || "").trim().length : -1,
    bodyTextLength: (document.body.textContent || "").trim().length,
    headerCount: document.querySelectorAll("header").length,
    topExists: !!document.querySelector("#top"),
    anyHeroClass: document.querySelectorAll("[class*='hero']").length,
    reactPresent: typeof window.React !== "undefined",
    title: document.title.slice(0, 60),
  };
})()
