/* SFHM HOMEPAGE BUNDLE 2026-09-30 -- built from each snippet folder script.js. Do not edit here; edit the source folder and rebuild (wp-snippets/_bundle/build.py). Each part below is self-contained. */

/* ===== sfhm-desktop-dropdowns ===== */
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
      ["/lodging-travel/", "Lodging Partners", "Hoteles aliados"],
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

  /* The grouped panel (phones, tablets) comes from the page bundle and has no
     Lodging Partners entry. Add one under Community & Event, right after Sponsors,
     by copying the Sponsors row so it picks up the panel's own styling. */
  var LODGING = { en: "Lodging Partners", es: "Hoteles aliados" };
  function addPanelLodging() {
    var sp = document.querySelector('#mobile-menu a[href="/sponsors/"]');
    if (!sp) return;
    var want = LODGING[currentLang()];
    var mine = sp.parentNode.querySelector('a[data-sfdd-lodging]');
    if (!mine) {
      mine = sp.cloneNode(false);
      mine.setAttribute("href", "/lodging-travel/");
      mine.setAttribute("data-sfdd-lodging", "1");
      sp.parentNode.insertBefore(mine, sp.nextSibling);
    }
    if (mine.textContent !== want) mine.textContent = want;
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
      requestAnimationFrame(function () { queued = false; ensure(); addPanelLodging(); });
    }).observe(root, { childList: true, subtree: true, characterData: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();

/* ===== sfhm-why-santa-fe ===== */
/* SFHM-WHY-SANTA-FE 2026-09-28 -- see README.md next to this file.
   Puts the "Why run Santa Fe?" section where the homepage story section
   ("Why we run this one") was: in place of #story, or just above #impact now
   that the live page no longer shows the story, and keeps it there in the language the ES/EN
   toggle is set to. Also swaps the three-friends paragraph in "The Voice of the
   River Trail" for the community paragraph, and points the "Our Story" menu
   link at the new section. Switch the snippet off and the page is as before.
   Every claim below was fact-checked on 2026-09-28 (see README). Do not add
   numbers, times or partner names here without the same check. */
(function () {
  "use strict";

  var COPY = {
    en: {
      kicker: "Race weekend, Sept 18\u201319, 2027",
      title: "Why run Santa Fe?",
      items: [
        ["Cool September mornings",
         "Race weekend falls in one of the best months to run in northern New Mexico: cool, dry mornings and big blue skies. Dress for the start, not the finish."],
        ["High-desert running",
         "Santa Fe sits at 7,000 feet at the foot of the Sangre de Cristo Mountains, and the half runs between 6,567 and 6,883 feet. The air is thin and the views go on forever. <a href=\"/training-for-7000-feet/\">Train for the altitude</a>."],
        ["A course with roots",
         "The half starts at Romero's Park, loops through historic Agua Fría Village, then heads out and back along the car-free Santa Fe River Trail."],
        ["A send-off like no other",
         "Coach Kosgei starts the race on a kudu horn that has been in his family for more than 100 years."],
        ["A weekend worth staying for",
         "Come early or stay late. Walk the historic Plaza, wander the galleries, soak in a high-desert hot spring and eat your fill of New Mexican food. Start with our <a href=\"/lodging-travel/\">lodging partners</a> and the <a href=\"/host-city-guide/\">host city guide</a>."],
        ["Finish at a working farm",
         "Every race finishes at Reunity Resources Farm. In 2026, Santa Fe YouthWorks cooked the green chile brunch at the finish. Details for 2027 are coming."],
        ["Every entry gives back",
         "Registration supports clean, sustainable water for the community of Kitany, Kenya, through the Kitany Water Project, and Pueblo youth dance through the Lightning Boy Foundation."]
      ]
    },
    es: {
      kicker: "Fin de semana de carrera, 18\u201319 de septiembre de 2027",
      title: "\u00bfPor qu\u00e9 correr en Santa Fe?",
      items: [
        ["Mañanas frescas de septiembre",
         "El fin de semana de la carrera cae en uno de los mejores meses para correr en el norte de Nuevo México: mañanas frescas y secas bajo un cielo azul enorme. Vístete para la salida, no para la meta."],
        ["Correr en el desierto alto",
         "Santa Fe está a 7,000 pies, al pie de las montañas Sangre de Cristo, y el medio maratón corre entre 6,567 y 6,883 pies. El aire es delgado y las vistas no terminan. <a href=\"/training-for-7000-feet/\">Prepárate para la altura</a>."],
        ["Un recorrido con raíces",
         "El medio maratón sale de Romero's Park, da una vuelta por el histórico pueblo de Agua Fría y luego va y regresa por el sendero del río Santa Fe, libre de autos."],
        ["Una salida única",
         "Coach Kosgei da la salida con un cuerno de kudú que lleva más de 100 años en su familia."],
        ["Un fin de semana para quedarse",
         "Llega antes o quédate después. Recorre la histórica Plaza, visita las galerías, relájate en unas aguas termales del desierto alto y disfruta la comida nuevomexicana. Empieza con nuestros <a href=\"/lodging-travel/\">hoteles aliados</a> y la <a href=\"/host-city-guide/\">guía de la ciudad</a>."],
        ["Meta en una granja",
         "Todas las carreras terminan en Reunity Resources Farm. En 2026, Santa Fe YouthWorks cocinó el brunch de chile verde en la meta. Pronto compartiremos los detalles de 2027."],
        ["Cada inscripción ayuda",
         "Tu inscripción apoya el agua limpia y sostenible para la comunidad de Kitany, Kenia, a través del Kitany Water Project, y la danza juvenil de los Pueblos a través de la Lightning Boy Foundation."]
      ]
    }
  };

  /* Replacement for the second "Voice of the River Trail" paragraph (the
     three-friends founding story). Same wording as the homepage source. */
  var VOICE = {
    en: "My modern chapter is written by this community. Each September the runners come, from down the road and from far away, and the people of Santa Fe come with them: volunteers at every aid station and exchange zone, neighbors along the route, and a farm that opens its gates for the finish. The 3-Amigos Relay carries that spirit in miniature: three runners, one sash, one finish.",
    es: "Mi cap\u00edtulo moderno lo escribe esta comunidad. Cada septiembre llegan los corredores, de aqu\u00ed al lado y de muy lejos, y la gente de Santa Fe llega con ellos: voluntarios en cada puesto de hidrataci\u00f3n y cada zona de relevo, vecinos a lo largo del recorrido y una granja que abre sus puertas para la meta. El Relevo 3-Amigos lleva ese esp\u00edritu en peque\u00f1o: tres corredores, una faja, una meta."
  };
  var MENU = { en: "Why run Santa Fe?", es: "\u00bfPor qu\u00e9 Santa Fe?" };
  var FOUNDERS = /Joseph Karnes|Antonio Lopez/;

  var node = null, lang = null;

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

  function build(l) {
    var c = COPY[l];
    var s = document.createElement("section");
    s.id = "sfhm-why";
    s.setAttribute("aria-labelledby", "sfhm-why-h");
    var html = '<div class="why-wrap"><div class="why-head"><span class="eyebrow">' + c.kicker +
      '</span><h2 id="sfhm-why-h" class="display">' + c.title + '</h2></div><ul class="why-grid">';
    c.items.forEach(function (it) {
      html += '<li class="why-item"><h3 class="display">' + it[0] + "</h3><p>" + it[1] + "</p></li>";
    });
    s.innerHTML = html + "</ul></div>";
    return s;
  }

  function placeSection(l) {
    /* Where the story section was: in place of #story if the page still has
       it, otherwise between the course section and "Two charities" (#impact).
       #races is a last resort so the section never disappears. */
    var story = document.getElementById("story");
    var anchor = story || document.getElementById("impact") || document.getElementById("races");
    if (!anchor || !anchor.parentNode) return;
    document.documentElement.classList.toggle("sfhm-why-on", !!story);
    if (node && node.nextElementSibling === anchor && l === lang) return;
    if (node && node.parentNode) node.parentNode.removeChild(node);
    lang = l;
    node = build(l);
    anchor.parentNode.insertBefore(node, anchor);
  }

  /* Hide any paragraph that tells the three-friends story and show the
     community paragraph right after it. The original stays in the DOM (hidden)
     so React can keep updating it when the language changes. */
  function fixVoice(l) {
    var ps = document.querySelectorAll("#main p");
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
      if (p.classList.contains("sfhm-voice")) continue;
      var next = p.nextElementSibling;
      var ours = next && next.classList.contains("sfhm-voice") ? next : null;
      if (!FOUNDERS.test(p.textContent || "")) {
        if (ours) ours.parentNode.removeChild(ours);
        p.classList.remove("sfhm-hide");
        continue;
      }
      p.classList.add("sfhm-hide");
      if (!ours) {
        ours = p.cloneNode(false);
        ours.classList.remove("sfhm-hide");
        ours.classList.add("sfhm-voice");
        p.parentNode.insertBefore(ours, p.nextSibling);
      }
      if (ours.textContent !== VOICE[l]) ours.textContent = VOICE[l];
    }
  }

  /* The phone menu's "Our Story" link pointed at #story, which is now hidden. */
  function fixMenu(l) {
    if (!document.getElementById("story")) return;
    var links = document.querySelectorAll('a[href="#story"], a[href="#sfhm-why"][data-sfhm-why]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (a.getAttribute("href") !== "#sfhm-why") a.setAttribute("href", "#sfhm-why");
      a.setAttribute("data-sfhm-why", "1");
      var leaf = a;
      while (leaf.children.length === 1) leaf = leaf.children[0];
      if (!leaf.children.length && leaf.textContent !== MENU[l]) leaf.textContent = MENU[l];
    }
  }

  function ensure() {
    var l = currentLang();
    placeSection(l);
    fixVoice(l);
    fixMenu(l);
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

/* ===== sfhm-race-cards-calm ===== */
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

/* ===== sfhm-kids-fun-run ===== */
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
          ours.style.removeProperty("display");
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

/* ===== sfhm-photo-gallery ===== */
/* SFHM-PHOTO-GALLERY 2026-09-30 -- see README.md next to this file.
   "2026 in pictures": an autoplaying photo carousel (4 seconds a photo) placed
   just above the sponsors (#sponsors), in the language the ES/EN toggle is set to.
   Photos: Sam Wasson, race day 2026-09-20 (images/web/2026-race/ in the repo).
   The photos must be uploaded to the WordPress media library first. The script
   looks for them in the upload folders listed in FOLDERS and only adds the
   section once the first photo actually loads, so nothing broken ever shows. */
(function () {
  "use strict";

  var FOLDERS = [
    "/wp-content/uploads/2026/09/",
    "/wp-content/uploads/2026/10/",
    "/wp-content/uploads/2026/11/"
  ];
  var INTERVAL = 4000;

  var PHOTOS = [
    ["sfhm-2026-02-start.jpg", "The start, 2026", "La salida, 2026"],
    ["sfhm-2026-25-smile-mountains.jpg", "Smiles under the clouds", "Sonrisas bajo las nubes"],
    ["sfhm-2026-26-mountains-ahead.jpg", "Mountains ahead", "Montañas al frente"],
    ["sfhm-2026-04-mountain-trail.jpg", "Mountain views from the trail", "Vistas de montaña desde el sendero"],
    ["sfhm-2026-12-drummers-2.jpg", "Drummers cheer runners on the course", "Tamborileros animan a los corredores en el recorrido"],
    ["sfhm-2026-22-mountain-view.jpg", "Mountains on the horizon", "Montañas en el horizonte"],
    ["sfhm-2026-29-mountain-path.jpg", "Mountains over the trail", "Montañas sobre el sendero"],
    ["sfhm-2026-06-water-stop.jpg", "Water stop near mile 12", "Puesto de agua cerca de la milla 12"],
    ["sfhm-2026-10-smiles.jpg", "Smiles on the trail", "Sonrisas en el sendero"],
    ["sfhm-2026-20-chamisa-bridge.jpg", "Chamisa in bloom along the trail", "Chamisa en flor junto al sendero"],
    ["sfhm-2026-31-capitol-ford-tent.jpg", "Capitol Ford tent at the Reunity Resources farm stand", "La carpa de Capitol Ford en el puesto de Reunity Resources"],
    ["sfhm-2026-33-celebration.jpg", "Celebrating at the finish", "Celebrando en la meta"]
  ];

  var UI = {
    en: { kicker: "Race day, Sept 20, 2026", title: "2026 in pictures", prev: "Back", next: "Next",
          pause: "Pause", play: "Play", label: "Race photos", of: "of" },
    es: { kicker: "Día de carrera, 20 de septiembre de 2026", title: "2026 en fotos", prev: "Anterior",
          next: "Siguiente", pause: "Pausa", play: "Reproducir", label: "Fotos de la carrera", of: "de" }
  };

  var base = null, node = null, lang = null, idx = 0, timer = null, playing = true, hovering = false;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) playing = false;

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

  function findBase(i, done) {
    if (i >= FOLDERS.length) return done(null);
    var img = new Image();
    img.onload = function () { done(FOLDERS[i]); };
    img.onerror = function () { findBase(i + 1, done); };
    img.src = FOLDERS[i] + PHOTOS[0][0];
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function build(l) {
    var u = UI[l];
    var s = el("section");
    s.id = "sfhm-gallery";
    s.setAttribute("aria-roledescription", "carousel");
    s.setAttribute("aria-label", u.label);
    var wrap = el("div", "gal-wrap");
    var head = el("div", "gal-head");
    head.appendChild(el("span", "eyebrow", u.kicker));
    var h = el("h2", "display", u.title);
    head.appendChild(h);
    wrap.appendChild(head);

    var fig = el("figure", "gal-fig");
    var img = el("img");
    img.decoding = "async";
    img.width = 2000; img.height = 1333;
    fig.appendChild(img);
    var cap = el("figcaption", "gal-cap");
    fig.appendChild(cap);
    wrap.appendChild(fig);

    var bar = el("div", "gal-bar");
    var prev = el("button", "gal-btn", u.prev); prev.type = "button";
    var play = el("button", "gal-btn gal-play", playing ? u.pause : u.play); play.type = "button";
    play.setAttribute("aria-pressed", playing ? "false" : "true");
    var next = el("button", "gal-btn", u.next); next.type = "button";
    var count = el("span", "gal-count");
    bar.appendChild(prev); bar.appendChild(play); bar.appendChild(next); bar.appendChild(count);
    wrap.appendChild(bar);
    s.appendChild(wrap);

    prev.addEventListener("click", function () { go(idx - 1, true); });
    next.addEventListener("click", function () { go(idx + 1, true); });
    play.addEventListener("click", function () { playing = !playing; sync(); schedule(); });
    s.addEventListener("mouseenter", function () { hovering = true; schedule(); });
    s.addEventListener("mouseleave", function () { hovering = false; schedule(); });
    s.addEventListener("focusin", function () { hovering = true; schedule(); });
    s.addEventListener("focusout", function () { hovering = false; schedule(); });
    return s;
  }

  function sync() {
    if (!node) return;
    var u = UI[lang], p = PHOTOS[idx];
    var img = node.querySelector(".gal-fig img");
    var src = base + p[0];
    if (img.getAttribute("src") !== src) img.setAttribute("src", src);
    img.alt = lang === "es" ? p[2] : p[1];
    node.querySelector(".gal-cap").textContent = lang === "es" ? p[2] : p[1];
    node.querySelector(".gal-count").textContent = (idx + 1) + " " + u.of + " " + PHOTOS.length;
    var pb = node.querySelector(".gal-play");
    pb.textContent = playing ? u.pause : u.play;
    pb.setAttribute("aria-pressed", playing ? "false" : "true");
    /* Announce changes only when the visitor is driving it, not on every autoplay tick. */
    node.querySelector(".gal-cap").setAttribute("aria-live", playing ? "off" : "polite");
    var pre = new Image(); pre.src = base + PHOTOS[(idx + 1) % PHOTOS.length][0];
  }

  function go(i, user) {
    idx = (i + PHOTOS.length) % PHOTOS.length;
    if (user) playing = false;
    sync(); schedule();
  }

  function schedule() {
    clearTimeout(timer);
    if (playing && !hovering && !document.hidden) timer = setTimeout(function () { go(idx + 1, false); }, INTERVAL);
  }

  function ensure() {
    if (!base) return;
    var anchor = document.getElementById("sponsors");
    if (!anchor || !anchor.parentNode) return;
    var l = currentLang();
    if (node && node.nextElementSibling === anchor && l === lang) return;
    if (node && node.parentNode) node.parentNode.removeChild(node);
    lang = l;
    node = build(l);
    anchor.parentNode.insertBefore(node, anchor);
    sync(); schedule();
  }

  function start() {
    findBase(0, function (b) {
      if (!b) return; /* photos not uploaded yet: add nothing */
      base = b;
      ensure();
      document.addEventListener("visibilitychange", schedule);
      var root = document.getElementById("root");
      if (!root || !window.MutationObserver) return;
      var queued = false;
      new MutationObserver(function () {
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () { queued = false; ensure(); });
      }).observe(root, { childList: true, subtree: true, characterData: true });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
