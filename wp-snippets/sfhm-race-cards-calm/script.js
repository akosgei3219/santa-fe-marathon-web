/* SFHM-RACE-CARDS-CALM 2026-09-28 -- see README.md next to this file.
   Makes the homepage race cards (#races) quieter:
   - one line under "Event Info" says registration isn't open and gives the
     early-bird starting price, instead of a price line and a "not open yet"
     line repeated on every card;
   - shorter card blurbs that don't repeat the date/time already on the card;
   - the Kids card's date line matches the other cards.
   Originals stay in the page (hidden) so the site can keep updating them;
   switch the snippet off and the cards are exactly as before.
   Prices: 2027 early-bird per race director (Half $75, Relay $195/team,
   10K $50, 5K $30, Kids free). Re-check before editing any figure here. */
(function () {
  "use strict";

  var T = {
    en: {
      note: "2027 registration isn’t open yet. Early-bird entry starts at $30, and the Kids Fun Dash is free.",
      half: "The main event: a 100% paved course through Agua Fría Village, then out and back along the Santa Fe River.",
      relay: "Split the half with two friends: three legs, and a ceremonial sash passed hand to hand instead of a baton.",
      tenk: "New for 2027: more than a 5K, less than the half. Course and start details to be announced.",
      fivek: "A welcoming loop through Agua Fría Village. Great for first-timers, or as a shakeout the day before the half.",
      kids: "Free for kids ages 3 to 12. Every kid gets a bib and every finisher gets a medal. Not chip-timed.",
      kidsNote: "Sat, Sept 18, 2027 · time TBA · Reunity Resources Farm"
    },
    es: {
      note: "La inscripción 2027 aún no está abierta. El precio anticipado empieza en $30 y el Kids Fun Dash es gratis.",
      half: "El evento principal: un recorrido 100% pavimentado por Agua Fría Village y luego ida y vuelta junto al río Santa Fe.",
      relay: "Divide el medio maratón entre tres: tres tramos y una banda ceremonial que pasa de mano en mano en lugar de un testigo.",
      tenk: "Nuevo en 2027: más que un 5K, menos que el medio maratón. Ruta y salida por anunciar.",
      fivek: "Un circuito acogedor por Agua Fría Village. Ideal para debutantes o para soltar piernas el día antes del medio maratón.",
      kids: "Gratis para niños de 3 a 12 años. Cada niño recibe un dorsal y cada finalista una medalla. Sin cronometraje con chip.",
      kidsNote: "Sáb 18 sept 2027 · hora por anunciar · Reunity Resources Farm"
    }
  };

  var PRICE = /early-bird|anticipado/i;
  var STATUS = /registration not open|inscripción 2027 aún no abierta/i;

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

  function kindOf(title) {
    var t = (title || "").toLowerCase();
    if (/relay|relevo/.test(t)) return "relay";
    if (/half|medio/.test(t)) return "half";
    if (/10k/.test(t)) return "tenk";
    if (/5k/.test(t)) return "fivek";
    if (/kids|niños/.test(t)) return "kids";
    return null;
  }

  function hide(el) { if (!el.classList.contains("sfhm-cc-hide")) el.classList.add("sfhm-cc-hide"); }

  /* Hide el and show our own copy of it (same tag and classes) with new text. */
  function swap(el, text) {
    hide(el);
    var ours = el.nextElementSibling;
    if (!ours || !ours.classList.contains("sfhm-cc")) {
      ours = el.cloneNode(false);
      ours.classList.remove("sfhm-cc-hide");
      ours.classList.add("sfhm-cc");
      el.parentNode.insertBefore(ours, el.nextSibling);
    }
    if (ours.textContent !== text) ours.textContent = text;
  }

  function ensure() {
    var races = document.getElementById("races");
    if (!races) return;
    var c = T[currentLang()];

    var h2 = document.getElementById("races-h");
    var head = h2 && h2.parentNode;
    if (head && head.parentNode) {
      var line = head.nextElementSibling;
      if (!line || !line.classList.contains("sfhm-cc-note")) {
        line = document.createElement("p");
        line.className = "sfhm-cc-note";
        head.parentNode.insertBefore(line, head.nextSibling);
      }
      if (line.textContent !== c.note) line.textContent = c.note;
    }

    var cards = races.querySelectorAll("article");
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var h3 = card.querySelector("h3");
      var kind = kindOf(h3 && h3.textContent);
      var leaves = card.querySelectorAll("span, p");
      for (var j = 0; j < leaves.length; j++) {
        var el = leaves[j];
        if (el.classList.contains("sfhm-cc") || el.children.length) continue;
        var txt = el.textContent || "";
        if (el.tagName === "SPAN" && (PRICE.test(txt) || STATUS.test(txt))) { hide(el); continue; }
        if (el.tagName === "P" && kind && c[kind]) { swap(el, c[kind]); continue; }
        if (kind === "kids" && el.classList.contains("race-note")) swap(el, c.kidsNote);
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
