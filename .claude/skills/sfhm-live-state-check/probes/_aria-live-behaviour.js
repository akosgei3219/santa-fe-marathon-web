// Does the caption's live region behave correctly? It must stay silent while the slideshow
// auto-advances (a screen reader announcing every 6.5s would be unusable) and become polite as
// soon as the visitor takes control by pressing a dot, swiping, or pausing.
//
// This returns a Promise and waits after each click: React batches state updates, so reading
// the DOM synchronously after .click() measures the state BEFORE the re-render and makes a
// working control look dead.
(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const cap = () => document.querySelector("#top .hero-cap");
  const live = () => { const c = cap(); return c ? c.getAttribute("aria-live") : "(none)"; };
  const text = () => { const c = cap(); return (c.textContent || "").trim(); };
  const dots = () => [...document.querySelectorAll("#top .hero-dot")];
  const pause = () => document.querySelector("#top button.hero-pause");

  const out = { atRest: { live: live(), caption: text() } };

  const d = dots();
  if (d.length > 3) {
    d[3].click();
    await wait(900);
    out.afterDotClick = {
      live: live(), caption: text(),
      dotAriaCurrent: dots()[3].getAttribute("aria-current"),
    };
  }

  const p = pause();
  if (p) {
    p.click();
    await wait(900);
    out.afterPause = { live: live(), label: pause().getAttribute("aria-label") };
    pause().click();
    await wait(600);
    out.afterResume = { live: live(), label: pause().getAttribute("aria-label") };
  }

  const ok = out.atRest.live === "off" &&
             out.afterDotClick && out.afterDotClick.live === "polite" &&
             out.afterDotClick.dotAriaCurrent === "true";
  out.verdict = ok ? "CORRECT: silent while auto-rotating, polite once the user takes control"
                   : "UNEXPECTED -- inspect";
  return out;
})()
