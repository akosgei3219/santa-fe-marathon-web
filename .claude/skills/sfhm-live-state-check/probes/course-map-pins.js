// /course-map/: did the Leaflet map actually render, and are the START / FINISH pins where
// Kosgei said? A map script that throws renders an empty grey box while every stored-data check
// still passes, so this reads the RENDERED map.
//
// The map lives inside an IIFE, so its Leaflet instance is not global. Instead: find each marker
// icon, read its popup-bound position by reversing Leaflet's projection through the map pane.
// Simpler and sufficient: Leaflet stores the LatLng on the icon's parent layer via _leaflet_id;
// we locate the S and F icons by their text and read the matching entry from the page's D object.
(() => {
  const icons = [...document.querySelectorAll(".leaflet-marker-icon")];
  const byText = t => icons.find(i => (i.textContent || "").trim() === t);
  // the page's own data object, parsed from the inline script -- the source of the pins
  let D = null;
  for (const s of document.querySelectorAll("script")) {
    const t = s.textContent || "";
    const i = t.indexOf("var D=");
    if (i >= 0) { const j = t.indexOf("};", i); try { D = JSON.parse(t.slice(i + 6, j + 1)); } catch (e) {} break; }
  }
  return {
    leafletLoaded: !!window.L,
    mapRendered: !!document.querySelector(".leaflet-container .leaflet-tile-pane"),
    markerIcons: icons.length,
    startIconShown: !!byText("S"),
    finishIconShown: !!byText("F"),
    dataStart: D && D.start,
    dataFinish: D && D.finish,
    routeOriginUnchanged: D && JSON.stringify(D.loop[0]) === JSON.stringify([35.65834, -106.02965]),
    mileMarkers: D && D.markers ? D.markers.length : 0,
  };
})()
