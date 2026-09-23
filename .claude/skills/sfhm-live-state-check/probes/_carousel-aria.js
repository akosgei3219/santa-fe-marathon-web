// Is the carousel correctly exposed to assistive tech? The photo stack is decorative and
// aria-hidden on purpose; the accessible carousel is the slidebar, which holds the caption,
// the dots and the pause control. Adding a role or label to an aria-hidden element is inert,
// so this checks that the meaning lives where a screen reader can actually reach it.
(() => {
  const stack = document.querySelector("#top .hero-slides");
  const bar = document.querySelector("#top .hero-slidebar");
  const cap = document.querySelector("#top .hero-cap");
  const dots = [...document.querySelectorAll("#top .hero-dot")];
  const pause = document.querySelector("#top button.hero-pause");
  const at = (el, a) => (el ? el.getAttribute(a) : "(missing el)");

  // does any slide carry real text a reader would lose by hiding the stack?
  const slideText = [...document.querySelectorAll("#top .hero-slide")]
    .map(s => (s.textContent || "").trim()).filter(Boolean);

  return {
    photoStack: {
      ariaHidden: at(stack, "aria-hidden"),
      role: at(stack, "role"),
      ariaLabel: at(stack, "aria-label"),
      slidesCarryingText: slideText.length,
      note: "aria-hidden is correct IF slidesCarryingText is 0 -- they are background images",
    },
    accessibleCarousel: {
      el: bar ? "." + bar.className : "(missing)",
      role: at(bar, "role"),
      ariaRoledescription: at(bar, "aria-roledescription"),
      ariaLabel: at(bar, "aria-label"),
      captionText: cap ? (cap.textContent || "").trim() : "(none)",
      captionLive: at(cap, "aria-live"),
      dotButtons: dots.length,
      everyDotLabelled: dots.every(d => !!d.getAttribute("aria-label")),
      dotLabelSample: dots[0] ? dots[0].getAttribute("aria-label") : "(none)",
      currentDotMarked: dots.filter(d => d.getAttribute("aria-current") === "true").length,
      pauseIsRealButton: !!pause && pause.tagName === "BUTTON",
      pauseLabel: at(pause, "aria-label"),
    },
    verdict: (at(stack, "aria-hidden") === "true" && slideText.length === 0 &&
              at(bar, "aria-roledescription") && at(bar, "aria-label") &&
              dots.length > 0 && dots.every(d => !!d.getAttribute("aria-label")))
      ? "CORRECT: decoration hidden, carousel named and operable where the content actually is"
      : "inspect",
  };
})()
