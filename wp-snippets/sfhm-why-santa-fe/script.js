/* SFHM-WHY-SANTA-FE 2026-09-28 -- see README.md next to this file.
   Inserts the "Why run Santa Fe?" section just above the race cards (#races)
   and keeps it there, in the language the ES/EN toggle is set to.
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

  function ensure() {
    var races = document.getElementById("races");
    if (!races || !races.parentNode) return;
    var l = currentLang();
    if (node && node.nextElementSibling === races && l === lang) return;
    if (node && node.parentNode) node.parentNode.removeChild(node);
    lang = l;
    node = build(l);
    races.parentNode.insertBefore(node, races);
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
