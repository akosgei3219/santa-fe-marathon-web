# Homepage: "Why run Santa Fe?" section

Seven short tiles that take the place of the old story section ("Why we run
this one"), in English and Spanish (follows the ES/EN toggle).

Placement: if the page still has the story section (`#story`), the tiles go in
its place and the story is hidden. The live page stopped showing the story on
2026-09-28, so today the tiles sit where it used to be: after the course
section and just above "Two charities. Two community partners." (`#impact`).

The snippet also removes the three-friends founding story wherever the homepage
shows it: a paragraph naming Joseph Karnes or Antonio Lopez is hidden and the
community paragraph ("My modern chapter is written by this community...") is
shown instead, and an "Our Story" menu link to `#story` is pointed at the new
section. Three across on computers, two on tablets,
one on phones; the "Every entry gives back" tile closes the section as a full row.

## Fact check (2026-09-28)

Every line was checked before shipping. Kept out on purpose:
- "PR-perfect" framing: the site does not sell on PRs or fast courses.
- Exact weather figures (48-52°F starts, 74°F highs, "near-zero humidity"): unverifiable promises.
- Live music and craft beverages at the finish: music was removed from the festival copy
  on purpose; drinks in 2026 were a happy hour afterward at Nuckolls Brewing, not at the farm.
- "Fields of chamisa in bloom": not confirmed for the course.
- Who makes the medals/medallions: the race records disagree; unruled.

Altitude: Santa Fe is branded at 7,000 ft; the half itself runs 6,567-6,883 ft
(2026 GPS data), so the tile states both rather than implying the course is at 7,000 ft.

The 2027 festival is described only as "details coming".

## Install (WordPress)

New code snippet, front page only: `style.css` as CSS, `script.js` as JavaScript
(footer). Purge cache and check logged out. Switch the snippet off to remove it.
