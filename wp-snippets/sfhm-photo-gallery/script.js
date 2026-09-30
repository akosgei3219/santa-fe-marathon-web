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
