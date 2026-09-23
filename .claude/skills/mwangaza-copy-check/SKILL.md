---
name: mwangaza-copy-check
description: >
  Check and fix any text going on the Mwangaza Athletics Club website
  (mwangazaathletics.com) before it is used: homepage, youth programs, Train in
  Kenya, Run With Us, high-altitude coaching, FAQ, About, the Coach Kosgei page,
  button labels, image captions and alt text, page titles and meta descriptions.
  Use this skill whenever Coach Kosgei or anyone else pastes a brief, a draft or
  AI-written copy for the club's site, asks to put text on a Mwangaza page, or
  whenever you are about to write Mwangaza page copy yourself. Briefs for this club
  have repeatedly invented partners, statistics, athlete names and prices, and mixed
  the club up with the Santa Fe International Half Marathon, so run the check even
  when the text looks finished and confident. Copy for santafehalfmarathon.com goes
  to sfhm-fact-preflight instead; if Mwangaza copy mentions the race, run both.
---

# Mwangaza copy check

The people reading mwangazaathletics.com are parents deciding whether to trust the
club with their child, adults deciding whether to train with Coach Kosgei, and
runners thinking about a trip to Kenya. Every invented partner, statistic, price or
athlete name on that site is a promise the club can't keep, and it spends Coach
Kosgei's credibility. Drafts for this club, from web designers, AI tools and earlier
sessions, have arrived confident, specific and wrong. **Plausible is not the same as
settled, and only settled ships.**

## Read this first: the live site is not the authority

mwangazaathletics.com is being rebuilt because it is out of date. It still says
7,000 ft on /corporate-wellness/ (the club trains at 7,200 ft), ends three pages with
"Contact us →" (arrows are now banned), and says nothing about how Kosgei now
describes the club. So "the live site says so" does not verify a claim. The live
site can confirm only the few long-standing facts listed in
`references/settled-facts.md`. Everything about positioning, programs, audiences and
the Kenya trips comes from Coach Kosgei's rulings.

## Where facts come from, in this order

1. **Coach Kosgei's dated rulings, newest first.** They live in the project memory
   directory (`~/.claude/projects/C--Users-info-OneDrive-Desktop-SantaFeMarathonWeb/memory/`),
   in `mwangaza-content-set.md` and `user-is-coach-kosgei.md`. Read both every time:
   rulings arrive often, and the reference file below can lag behind them.
2. **`references/settled-facts.md`**, a snapshot of those rulings plus the live-site
   facts that still hold. If memory says something newer, memory wins; mention that
   the snapshot is out of date.
3. **The open-question list.** `settled-facts.md` lists what Coach Kosgei has not yet
   supplied (prices, schedules, trip details, certifications and so on). The full list
   is the "What only you can supply" section of the Mwangaza Rebuild hub
   (https://claude.ai/artifact/3BzeXqDR7Lf7WGiXAWAJE7). **A claim that answers an open
   question is unsettled by definition**, however specific or confident it sounds. A
   price, a meeting point or a trip date appearing in a draft does not answer the
   question; it means someone guessed.
4. **The live site**, for the long-standing facts only (see above).

When two sources disagree, say so in the report instead of quietly picking one.

## The verdicts

Every checkable claim gets one:

- **Settled**: matches a source above. Keep it.
- **Wrong**: conflicts with a settled fact. Correct it to the settled fact.
- **Unsettled**: appears in no source, or answers an open question. Take it out. If
  the sentence needs the fact to make sense, put a placeholder in its place, written
  as `[CONFIRM: what Coach Kosgei needs to supply]`, and add it to the questions.
  Don't keep an invented specific "for now": once it is published it starts to look
  like a source, and the next check verifies against it.

## What counts as a claim

Numbers (ages, elevation, group sizes, counts, prices, distances, dates, days and
times); names (people, athletes, partners, camps, places in Kenya, organisations);
who does what (who runs the trips, who coaches, who leads a session, who took a photo);
what a program includes (what a workout or ride contains, what a trip includes);
credentials (certifications, background checks, nonprofit status, awards); promises
("first run free", "book today", results); audience (who can join what); superlatives
("the only club in New Mexico"); and tense (a date that has passed).

Quiet claims count too: button labels, alt text, captions, meta descriptions, stat
labels ("The ages we coach"), and headings.

## Rule gates (set by Coach Kosgei, check even when no fact is wrong)

- **No emoji and no arrows** anywhere on the website: →, ➜, ▶, "»" used as an arrow,
  and their HTML entities or unicode escapes (`&rarr;`, `&#8594;`, `→`). "Learn
  more →" becomes "Learn more". (Kosgei, 15 Sep 2026.) Quoting the original inside your
  change table is fine — it is the text that ships that has to be clean.
- **Never sell on personal bests, race times, wins or "elite" results**, Coach
  Kosgei's or anyone's. That includes the former elite athletes on the Kenya trips:
  describe what they do with the group, not what they ran. The brand sells heritage,
  altitude and the Kalenjin way of training.
- **Never say where Coach Kosgei lives.** "Coaches in Santa Fe" is fine; a home town
  is not.
- **The credit is "Coach Kosgei".** Kosgei's pronouns haven't been stated, so don't
  add he or she; repeat the name or write in the first person. If Kosgei's own text
  uses a pronoun for themself, that is their choice: keep it, and mention it so the
  memory file can be updated.
- **Never invent partners, programs, testimonials, statistics, certifications or
  athlete names.** The only named partners are Pecos Trail Inn and Santa Fe Treehouse
  Camp.
- **Never mention or compare Mwangaza with Gaynor Train.**
- **Never write waiver, liability or booking-terms language.** If copy needs it (Kenya
  bookings, bike rides), leave a placeholder for their lawyer.
- **Kenya trips are adults only, run by Mwangaza.** The button stays an enquiry ("Ask
  about the next trip", "Get in touch") until dates, a price and a way to book exist.
  Anything near youth content that could suggest children can go should say "adults".
- **Photos:** the 15 Sep photos are credited "Photos: Coach Kosgei". The Jay
  Waltmunson-watermarked photo of children racing in Kenya and the "CHASING 3" race
  start photo are not cleared for use.

## The club is not the race

This is the mistake most likely to recur. Coach Kosgei is behind both Mwangaza
Athletics Club and the Santa Fe International Half Marathon, so briefs blend them. A
fact that is true of the race is not a club fact:

- 7,000 ft is the race venue; the club trains at 7,200 ft. Never change either to
  match the other.
- Santa Fe YouthWorks cooks the race's post-race brunch. It is not a club partner.
- The race's charities, Capitol Ford (presenting sponsor), RunSignup, aid stations,
  Maasai-made medals, Reunity Resources Farm, the September 20 race date and hotel
  discount codes all belong to the race.

A line on the Mwangaza site that is clearly about the race (an announcement bar
pointing to the race site, say) is allowed. Check its race facts with
sfhm-fact-preflight, and watch the date: it goes stale after race day.

## Procedure

1. **Read** the two memory files, `references/settled-facts.md`, and (the first time in
   a session) `references/error-catalog.md`. The catalog is what past mistakes on this
   client looked like; new ones tend to look similar.
2. **List every claim** in the text, quiet ones included.
3. **Give each claim a verdict**, and note which source settled it.
4. **Run the rule gates** and the club-versus-race check over the whole text.
5. **Fix the text.** Keep the author's voice, structure and length; change only what
   needs changing. The fix must not add claims of its own: don't swap an invented price
   for a different number, or an invented partner for a real one the text never
   mentioned. Removing or placeholding is almost always right for unsettled facts.

   The commonest failure in testing was answering an invented fact with a *different*
   unsettled one: filling the hole left by a deleted claim with "runners aged 8 to 18",
   "the Kalenjin principles" or "train alongside former elite athletes" in copy that
   never mentioned them. True sentences from a settled-facts file are still new claims
   the author didn't make, and on someone else's page they read as scope creep. Every
   sentence you hand back should trace to the draft or to a correction you can name.

   Hand back **one** corrected version, not a menu of drafts. Whoever asked wants
   something they can paste; two versions hands the decision back to them, which is the
   work they were trying to delegate. If there is a genuine fork (two honest readings of
   what they meant), take the safer one and put the fork in the questions.
6. **Report** in the format below. Don't publish, edit site files or send anything
   unless asked; the check produces text for Coach Kosgei to use.

## Report format

Coach Kosgei reads this, not a developer, so keep it plain.

```
## Copy check: <what the text is>, for <page>
Result: Ready to use | Fixed, ready to use | Fixed, needs your answers

### Corrected text
<the full corrected text, ready to paste>

### What I changed
| Was | Now | Why |
|---|---|---|

### Questions for Coach Kosgei
1. <each unsettled fact: what is needed and where it goes>

### Checked and fine
<the claims that matched settled facts, briefly, so Kosgei can see what was checked>
```

If nothing needed changing, say "Ready to use", give the text back unchanged, and
leave out the change table.
