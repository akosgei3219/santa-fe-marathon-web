/* SFHM-DESKTOP-DROPDOWNS 2026-09-28 -- see README.md next to this file.
   Adds a Run Sedona-style dropdown bar to the homepage header on wide screens
   and makes the grouped menu panel close with Esc or a click outside it.
   Menu entries mirror the grouped panel in the live homepage bundle (the same
   three groups as the inner-page header), minus "Register Now" while 2027
   registration is not open. No race facts live here, only page links. */
(function () {
  "use strict";

  var GROUPS = [
    { key: "races", en: "Race Info", es: "La carrera", items: [
      ["/course-map/", "Half Marathon", "Medio maratón"],
      ["/relays-exchange-zones/", "3-Amigos Relay", "Relevo 3-Amigos"],
      ["#races", "10K, 5K & Kids Fun Dash", "10K, 5K y Kids Fun Dash"],
      ["/course-map/", "Course Maps & Elevation", "Mapas del recorrido y elevación"],
      ["/start-line-procedures/", "Start Line Procedures", "Línea de salida"],
      ["/safety-support/", "Safety & Support", "Seguridad y apoyo"],
      ["/time-limits/", "Time Limits & Cut-offs", "Límites de tiempo y cortes"],
      ["/aid-stations/", "Aid Stations", "Puestos de hidratación"],
      ["/awards/", "Age-Group Divisions & Medallions", "Divisiones por edad y medallones"]
    ]},
    { key: "guide", en: "Runner Guide", es: "Guía del corredor", items: [
      ["/event-schedule/", "Schedule & Expo", "Horario y expo"],
      ["/packet-pickup/", "Packet Pick-Up", "Recogida de paquetes"],
      ["/transportation-parking/", "Parking & Shuttles", "Estacionamiento y shuttles"],
      ["/gear-bag-drop/", "Gear & Bag Drop", "Guarda equipaje"],
      ["/lodging-travel/", "Lodging & Travel", "Hospedaje y viaje"],
      ["/event-logistics/", "Event Logistics", "Logística del evento"],
      ["/spectator-guide/", "Spectator Guide", "Guía para espectadores"],
      ["/refund-policy/", "Refund & Deferral Policy", "Política de reembolso y aplazamiento"]
    ]},
    { key: "community", en: "Community & Event", es: "Comunidad", items: [
      ["/sponsors/", "Sponsors", "Patrocinadores"],
      ["/volunteer/", "Volunteer", "Voluntariado"],
      ["/contact-us/", "Contact Us", "Contáctanos"],
      ["/host-city-guide/", "Host City Guide", "Guía de la ciudad anfitriona"],
      ["/finish-line-festival/", "Finish Line Festival", "Festival en la meta"],
      ["/charity-information/", "Charity Information", "Información benéfica"],
      ["/news/", "Stories", "Historias"],
      ["/race-history/", "The Run Santa Fe Story", "La historia de Run Santa Fe"]
    ]}
  ];
  /* Spanish top-level labels are the short forms: the full phrases ("Información de la
     carrera", "Comunidad y evento", "Resultados y fotos") push the ES/EN toggle off a
     1200-1440px screen. The full phrases stay in the phone/tablet panel. */
  var RESULTS = ["/race-information/results-photos/", "Results & Photos", "Resultados"];
  var CLOSE_DELAY = 180; // ms the pointer may leave a list before it closes

  var bar = null, lang = null, closeTimer = null;
  var finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function header() { return document.querySelector("#root > div.sticky"); }
  function controls() { return document.querySelector("#root > div.sticky > nav > div:last-child"); }
  /* The bar lives INSIDE the existing link row (nav > div:last-child > div:first-child),
     never as a new sibling: the site's own header CSS addresses that row as
     "div:first-child", and a new first child would steal those rules. */
  function row() { var c = controls(); return c && c.firstElementChild; }

  /* The ES/EN toggle shows the language you would switch TO, so "EN" means Spanish is on. */
  function currentLang() {
    var c = controls(); if (!c) return "en";
    var btns = c.querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) {
      var t = (btns[i].textContent || "").trim();
      if (t === "EN") return "es";
      if (t === "ES") return "en";
    }
    return (document.documentElement.lang || "en").slice(0, 2) === "es" ? "es" : "en";
  }

  function caret() {
    return '<svg class="sfdd-caret" aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  }

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

  function build(l) {
    var el = document.createElement("div");
    el.className = "sfdd-bar";
    el.setAttribute("data-sfdd", "1");
    var html = "";
    GROUPS.forEach(function (g) {
      var id = "sfdd-menu-" + g.key;
      html += '<div class="sfdd-item" data-key="' + g.key + '">' +
        '<button type="button" class="sfdd-trigger display" aria-expanded="false" aria-controls="' + id + '">' +
        esc(l === "es" ? g.es : g.en) + caret() + "</button>" +
        '<ul class="sfdd-menu" id="' + id + '">';
      g.items.forEach(function (it) {
        html += '<li><a href="' + esc(it[0]) + '">' + esc(l === "es" ? it[2] : it[1]) + "</a></li>";
      });
      html += "</ul></div>";
    });
    html += '<a class="sfdd-link display" href="' + RESULTS[0] + '">' + esc(l === "es" ? RESULTS[2] : RESULTS[1]) + "</a>";
    el.innerHTML = html;
    wire(el);
    return el;
  }

  function items(el) { return Array.prototype.slice.call(el.querySelectorAll(".sfdd-item")); }

  function setOpen(item, open) {
    if (!item) return;
    item.classList.toggle("is-open", open);
    var b = item.querySelector(".sfdd-trigger");
    if (b) b.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function closeAll(except) {
    if (!bar) return;
    items(bar).forEach(function (it) { if (it !== except) setOpen(it, false); });
  }

  function links(item) { return Array.prototype.slice.call(item.querySelectorAll(".sfdd-menu a")); }

  function wire(el) {
    items(el).forEach(function (item) {
      var btn = item.querySelector(".sfdd-trigger");

      btn.addEventListener("click", function () {
        var open = !item.classList.contains("is-open");
        closeAll(item);
        setOpen(item, open);
      });

      btn.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown") {
          e.preventDefault(); closeAll(item); setOpen(item, true);
          var first = links(item)[0]; if (first) first.focus();
        }
      });

      item.addEventListener("keydown", function (e) {
        var ls = links(item), i = ls.indexOf(document.activeElement);
        if (e.key === "Escape") {
          e.preventDefault(); setOpen(item, false); btn.focus();
        } else if (i > -1 && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
          e.preventDefault();
          var next = e.key === "ArrowDown" ? Math.min(i + 1, ls.length - 1) : i - 1;
          if (next < 0) btn.focus(); else ls[next].focus();
        } else if (i > -1 && (e.key === "Home" || e.key === "End")) {
          e.preventDefault(); ls[e.key === "Home" ? 0 : ls.length - 1].focus();
        }
      });

      // tabbing out of a list closes it
      item.addEventListener("focusout", function (e) {
        if (!item.contains(e.relatedTarget)) setOpen(item, false);
      });

      if (finePointer) {
        item.addEventListener("mouseenter", function () {
          clearTimeout(closeTimer); closeAll(item); setOpen(item, true);
        });
        item.addEventListener("mouseleave", function () {
          clearTimeout(closeTimer);
          closeTimer = setTimeout(function () {
            if (!item.contains(document.activeElement)) setOpen(item, false);
          }, CLOSE_DELAY);
        });
      }

      links(item).forEach(function (a) {
        a.addEventListener("click", function () { setOpen(item, false); });
      });
    });
  }

  /* Insert (or re-insert, or re-label) the bar. React owns the header, so if a
     re-render drops our node or the language flips, rebuild it. */
  function ensure() {
    var r = row(); if (!r || r.tagName !== "DIV") return;
    var l = currentLang();
    if (bar && bar.parentNode === r && l === lang) return;
    if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
    lang = l;
    bar = build(l);
    r.insertBefore(bar, r.firstChild);
  }

  /* Grouped panel (phones, tablets): close with Esc or a click outside the header. */
  function panelToggle() {
    return document.querySelector('#root > div.sticky button[aria-controls="mobile-menu"][aria-expanded="true"]');
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var t = panelToggle();
    if (t) { t.click(); t.focus(); return; }
    if (bar && bar.querySelector(".is-open")) {
      var open = bar.querySelector(".is-open .sfdd-trigger");
      closeAll(); if (open) open.focus();
    }
  });

  document.addEventListener("click", function (e) {
    var h = header();
    // composedPath() is fixed at dispatch time. e.target alone is not enough: React
    // swaps the menu icon on click, so the clicked <svg> line is already detached
    // by the time this bubbles up and would look like a click outside the header.
    var path = e.composedPath ? e.composedPath() : [e.target];
    if (!h || path.indexOf(h) > -1) return;
    closeAll();
    var t = panelToggle();
    if (t) t.click();
  });

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
