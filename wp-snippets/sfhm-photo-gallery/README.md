# Homepage: "2026 in pictures" photo carousel

A photo carousel just above the sponsors: 12 race-day photos by Sam Wasson (2026-09-20),
4 seconds each, looping, with an English/Spanish caption under each photo and Back,
Pause/Play and Next buttons (words, no arrow characters). It pauses on hover or keyboard
focus, when the tab is hidden, and stays still for visitors who turn off motion.

## Before it can show
Upload these 12 files from `images/web/2026-race/` to WordPress (Media > Add New),
keeping the file names:

sfhm-2026-02-start.jpg, sfhm-2026-25-smile-mountains.jpg, sfhm-2026-26-mountains-ahead.jpg,
sfhm-2026-04-mountain-trail.jpg, sfhm-2026-12-drummers-2.jpg, sfhm-2026-22-mountain-view.jpg,
sfhm-2026-29-mountain-path.jpg, sfhm-2026-06-water-stop.jpg, sfhm-2026-10-smiles.jpg,
sfhm-2026-20-chamisa-bridge.jpg, sfhm-2026-31-capitol-ford-tent.jpg, sfhm-2026-33-celebration.jpg

The script finds them in /wp-content/uploads/2026/09/, /10/ or /11/ on its own. Until
the first photo loads, it adds nothing to the page.

Tested 2026-09-30 on the live homepage: desktop and phone, EN and ES, autoplay, pause,
Next, and the not-uploaded case.
