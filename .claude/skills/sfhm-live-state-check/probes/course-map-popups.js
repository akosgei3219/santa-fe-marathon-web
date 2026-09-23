// /course-map/: open the START and FINISH popups and read what they ACTUALLY say.
// WordPress texturizes Elementor HTML-widget output, so text stored cleanly can still reach the
// visitor rewritten -- the only honest check is to click the marker and read the rendered popup.
// Async: the harness passes awaitPromise:true.
(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const icon = t => [...document.querySelectorAll(".leaflet-marker-icon")]
    .find(i => (i.textContent || "").trim() === t);
  const open = async t => {
    const el = icon(t);
    if (!el) return `(no ${t} marker)`;
    el.scrollIntoView({ block: "center" });
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await sleep(700);
    const p = document.querySelector(".leaflet-popup-content");
    const txt = p ? p.textContent.replace(/\s+/g, " ").trim() : "(no popup opened)";
    const close = document.querySelector(".leaflet-popup-close-button");
    if (close) close.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await sleep(300);
    return txt;
  };
  const start = await open("S");
  const finish = await open("F");
  return {
    startPopup: start,
    finishPopup: finish,
    // An EXACT match on the rendered text is the texturize check: if WordPress had rewritten a
    // single character of the new sentence on output, this comes back false.
    finishHas5KLine: finish.includes("The 5K starts here at 8:00 AM. The Half, the 3-Amigos Relay and the 5K all finish here."),
  };
})()
