# Landing page source + deploy pipeline (saved 2026-09-05)

The LIVE HOMEPAGE of santafehalfmarathon.com is a compiled React page.
Source of truth: run-santa-fe-2026.src.html (readable JSX + token CSS, EN/ES i18n).
NEVER hand-edit the deployed bundle -- edit the src, rebuild, redeploy.

## Pipeline
1. build.js (needs npm i react@18.3.1 react-dom@18.3.1 lucide-react@0.454.0 esbuild tailwindcss@3.4.14)
   -> extracts JSX from ../run-santa-fe-2026.src.html, bundles + compiles tailwind
   -> writes run-santa-fe-2026.prod.src.html (has %%IMG_*%% tokens)
2. recreate-wp-page.js -> substitutes media-library URLs (Advanced P&O logo is
   embedded as data URI because the host 406s webp uploads), DELETES the current
   page and re-creates at slug run-santa-fe-2026 (update-in-place strips scripts
   INTERMITTENTLY -- always verify raw bytes; script warns on strip, re-run if so).
   It also re-applies AIOSEO title+description and re-points page_on_front
   (deleting the front page silently flips show_on_front to posts otherwise).
   EDIT THE DELETE ID in the script to the current page id before running.
3. Purge caches via the bridge (wp_purge_cache), verify logged-out.
4. Artifact twin: substitute tokens with data URIs from images/web/ instead.

Old homepage (page 3564) is DRAFT; full backups in ../archive/old-homepage/.
Standing rules: NO emojis, NO arrows anywhere; positive start-line phrasing only.
