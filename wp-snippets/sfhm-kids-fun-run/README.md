# Homepage: Kids Fun Dash card says "FUN RUN"

On the homepage race cards, the small tag under "Kids Fun Dash" reads **FUN RUN**
(Spanish: **CARRERA DIVERTIDA**) instead of "1 KM". Nothing else on the card changes.

Why a snippet: the live homepage (page 5229) is ahead of the repo source (live says
"Kids Fun Dash"; the source still says "Kids Dash"), so rebuilding from source would
undo live edits. The snippet changes only this one tag and follows the ES/EN toggle.

Tested 2026-09-28 against the live page: desktop and phone, EN, ES and back to EN;
only the kids card is touched.

## Install (WordPress)

New code snippet, front page only: `script.js` as JavaScript (footer). Purge cache and
check logged out. Switch the snippet off and the tag goes back to "1 KM".

When the homepage source is next rebuilt, set the kids `dist` to "FUN RUN" there and
retire this snippet.
