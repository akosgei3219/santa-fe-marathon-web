/* SFHM-KIDS-FUN-RUN 2026-09-28 -- see README.md next to this file.
   On the homepage race cards, the Kids Fun Dash card shows "FUN RUN"
   (Spanish: "CARRERA DIVERTIDA") in the small tag under the title, in place
   of "1 KM". The original tag stays in the page, hidden, so the site can keep
   updating it; switch the snippet off and "1 KM" comes back. */
(function () {
  "use strict";

  var LABEL = { en: "FUN RUN", es: "CARRERA DIVERTIDA" };
  var KIDS = /kids|niños|carrerita/i;

  /* The ES/EN toggle shows the language you would switch TO, so "EN" means Spanish is on. */
  function currentLang() {
    var btns = document.querySelectorAll("#root > div.sticky button");
    for (var i = 0; i < btns.length; i++) {
      var t = (btns[i].textContent || "").trim();
      if (t === "EN") return "es";
      if (t === "ES") return "en";
    }
    return "en";
  }

  function ensure() {
    var l = currentLang();
    var cards = document.querySelectorAll("#races article");
    for (var i = 0; i < cards.length; i++) {
      var h = cards[i].querySelector("h3");
      if (!h || !KIDS.test(h.textContent || "")) continue;
      var spans = cards[i].querySelectorAll("span");
      for (var j = 0; j < spans.length; j++) {
        var s = spans[j];
        if (s.classList.contains("sfhm-kids-tag") || s.children.length) continue;
        if ((s.textContent || "").trim().toUpperCase() !== "1 KM") continue;
        s.style.display = "none";
        var ours = s.nextElementSibling;
        if (!ours || !ours.classList.contains("sfhm-kids-tag")) {
          ours = s.cloneNode(false);
          ours.removeAttribute("style");
          ours.classList.add("sfhm-kids-tag");
          s.parentNode.insertBefore(ours, s.nextSibling);
        }
        if (ours.textContent !== LABEL[l]) ours.textContent = LABEL[l];
      }
    }
  }

  function start() {
    ensure();
    var root = document.getElementById("root");
    if (!root || !window.MutationObserver) return;
    var queued = false;
    new MutationObserver(function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; ensure(); });
    }).observe(root, { childList: true, subtree: true, characterData: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
