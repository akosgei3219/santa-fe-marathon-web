// Minimal "is there a real page here?" probe, for verifying an external link before publishing
// it. curl returning 000 often just means the host refuses that user agent -- a real browser is
// the honest test of what a visitor would get.
(() => ({
  url: location.href,
  title: document.title.slice(0, 120),
  h1: (document.querySelector("h1") || {}).textContent ?
      (document.querySelector("h1").textContent || "").replace(/\s+/g, " ").trim().slice(0, 100) : "(no h1)",
  bodyTextLength: (document.body.textContent || "").trim().length,
  looksLikeParking: /domain (is )?(for sale|parked)|buy this domain|godaddy|sedo/i
                      .test((document.body.textContent || "").slice(0, 4000)),
  firstText: (document.body.innerText || "").replace(/\s+/g, " ").trim().slice(0, 220),
}))()
