# src/ - REFERENCE EXPORT, NOT THE BUILD

These files mirror the live homepage code for reading and handoff. **The site does NOT build from them.**

- Real source: `landing-src/run-santa-fe-2026.src.html` (single file; Nav, Hero, and all sections are inline functions)
- Build & deploy: `landing-src/build.js` then `landing-src/recreate-wp-page.js`
- Sitewide mega menu + mobile drawer: NOT React - WordPress Elementor footer template 2365 (edit via the santafe/v1/elementor bridge)
- Exported 2026-09-10 at front id 4849. These copies go stale the moment the single file changes - regenerate rather than trust.
