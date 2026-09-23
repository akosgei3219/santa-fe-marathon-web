// Phone menu (template 2365, nav#sitenavMobile): open it with the hamburger, then read the expo link
// in English, flip the site language to Spanish with the nav's own toggle, and read it again.
// Also reports whether the label fits: link box inside the drawer, no horizontal overflow.
// Run with --viewport phone. Returns a Promise; probe.mjs awaits it.
(async () => {
  const tidy = s => (s || "").replace(/\s+/g, " ").trim();
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const burger = document.querySelector(".hamburger");
  if (!burger) return { error: "no .hamburger on this page" };
  burger.click();
  await sleep(700);
  const drawer = document.querySelector("#sitenavMobile");
  const link = drawer && drawer.querySelector('a[href="/health-and-wellness-expo/"]');
  if (!link) return { error: "no expo link inside #sitenavMobile" };
  const box = link.getBoundingClientRect();
  const dbox = drawer.getBoundingClientRect();
  const en = tidy(link.textContent);

  let es = "(no ES toggle found)";
  const toggle = [...document.querySelectorAll("#sitenav-wrap .lang-toggle button, #sitenavMobile .lang-toggle button, .lang-toggle button")]
    .find(b => /^ES$/i.test(tidy(b.textContent)) || /espa/i.test(b.getAttribute("aria-label") || ""));
  if (toggle) { toggle.click(); await sleep(500); es = tidy(link.textContent); }

  return {
    burgerExpanded: burger.getAttribute("aria-expanded"),
    drawerVisible: getComputedStyle(drawer).visibility !== "hidden" && getComputedStyle(drawer).display !== "none" && dbox.width > 0,
    linkTextEN: en,
    linkTextES: es,
    dataEs: link.getAttribute("data-es"),
    linkBox: `${Math.round(box.left)}..${Math.round(box.right)} x ${Math.round(box.height)}px tall`,
    drawerBox: `${Math.round(dbox.left)}..${Math.round(dbox.right)}`,
    fitsInDrawer: box.left >= dbox.left - 1 && box.right <= dbox.right + 1,
    linkOverflows: link.scrollWidth > link.clientWidth + 1,
    pageScrollsSideways: document.documentElement.scrollWidth > window.innerWidth + 1,
    otherExpoLabels: [...document.querySelectorAll('a[href="/health-and-wellness-expo/"]')].map(a => tidy(a.textContent)),
  };
})()
