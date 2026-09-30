# Homepage bundle: one snippet instead of five

`homepage.css` + `homepage.js` combine every front-page snippet in this folder:

1. `sfhm-desktop-dropdowns`: Race Info / Runner Guide / Community & Event dropdowns (1200px+), Lodging Partners in the menu
2. `sfhm-why-santa-fe`: "Why run Santa Fe?" in the old story section's place; guards against the three-friends story
3. `sfhm-race-cards-calm`: one fee/status line, shorter race-card blurbs, no stray phone icons
4. `sfhm-kids-fun-run`: Kids Fun Dash tag reads FUN RUN / CARRERA DIVERTIDA
5. `sfhm-photo-gallery`: "2026 in pictures" carousel above the sponsors (shows only once the
   12 photos are uploaded to the media library; see its README)

Tested together on the live homepage 2026-09-28: desktop 1366px and phone 390px, EN, ES
and back; no page errors, no sideways scroll.

## Install: easiest (Elementor > Custom Code, one paste)

The site already runs its add-ons from Elementor > Custom Code, so use that:

1. WordPress admin > Elementor > Custom Code > Add New. Title: `SFHM Homepage Bundle`.
2. Location: `</body> - End`. Priority: 1.
3. Paste all of `homepage-elementor.html` into the code box.
4. Publish. When asked for conditions: Include > Front Page. Save & Close.
5. Purge the cache (HostGator and any caching plugin), open the homepage in a private window and check.

To undo: Elementor > Custom Code, switch the entry to Draft.

## Install: alternative (a code snippets plugin, two files)

1. Code snippets plugin: add a new snippet, type CSS, paste `homepage.css`, front page only.
2. Add a second snippet, type JavaScript (footer), paste `homepage.js`, front page only.
3. Save both as active, purge the site cache, open the homepage logged out and check:
   dropdowns in the header, "Why run Santa Fe?" above "Two charities", one line under
   "Event Info", FUN RUN on the kids card.

To undo: switch the two snippets off. Nothing in the page itself is changed.

## Editing later

Edit the snippet's own folder, then run `python3 wp-snippets/_bundle/build.py` and paste
the rebuilt files. Do not edit the bundle files directly.
