# Caught-error catalog — what wrong copy on this project actually looks like

Every entry below was real: confident, specific, and wrong, supplied by the race
director's drafts, parallel AI sessions, or external tools. Patterns repeat.

## 1. Plausible-specific time drift
The most common class. A real event gets a slightly different, very specific time.
- "Half Marathon · **7:00 AM** Start" — 7:00 is when *roads close*; the start is
  7:30. Adjacent true numbers migrate onto the wrong fact.
- "Gear drop closes **6:45 AM** at Start Line" — real window is 6:00–7:00 at
  Romero's Park. Sounded operational; appeared in no source.
- "Gear drop **by 7:15**" (from the director's own fact pack) — same fact,
  different invented number, months apart.
- "Awards at **9:30 / 11:00**" (director's email to the timing company) vs the
  site's 9:45 / 10:45. Ruled 9/12: the SITE was right, the email wrong — being
  in an email from the boss does not make a number true.
- "Shuttles start **5:30**" (fact pack) and "first wave shuttle leaves at
  **5:15 AM**" (external tool) — the operator's plan starts at 6:00. Two
  independent inventions of an earlier first bus.
- **Lesson:** any time that is 15–45 minutes off a real adjacent time is the
  signature of this class. Check the exact fact, not the vibe.

## 2. The phantom fact (invented from nothing)
- "**Mile-9 checkpoint cutoff 9:54 AM**" — no such cutoff exists; mile 9 is just
  the turnaround. It appeared fully-formed in a draft email and survived two
  documents before being killed by a ruling. Oddly precise figures (9:54, not
  9:55) are a tell, not a credential.
- "Return loops start at **9:00 AM**" — return window opens 10:00. Stated in
  passing inside otherwise-plausible shuttle copy.
- "**YouthWorks coffee lab**" — drafted three times, supported nowhere.
  YouthWorks does food; Jirani is a separate coffee sponsor.
- **Lesson:** UNVERIFIABLE is a verdict, not a shrug. These ship as "see the
  <topic> page" links or not at all.

## 3. Stale-era resurrection
Old-course and old-brand facts resurface through templates, reverse-syncs, and
external tools trained on the old site.
- "Point-to-point… **Eldorado start, Railyard finish**", "**7,450 ft** peak",
  "**7,200 ft**" — pre-2026 course. Current: Agua Fría loop + river corridor,
  6,883 ft turnaround, 7,000 ft branding.
- "**4K Fitness**" / "**5K Fitness**" — the event is the Santa Fe 5K. This label
  regressed onto the live homepage once via a stale reverse-sync days after
  being fixed. Fixing a fact once does not keep it fixed.
- "**hand-thrown ceramic** finisher medal" — retired attribution; Maasai
  artisans make medal AND medallions (ruled, deliberate, do not re-split).
- "#CC0033 crimson / Oswald type" — pre-rebrand identity offered back as a
  "new" design direction.
- **Lesson:** anything matching the old era is wrong even when internally
  consistent. The old site was consistent too.

## 4. Name and role drift
- "**Treto's**" as the shuttle operator — Juan Treto is Santa Fe Trails'
  supervisor of operations, a person, not the company.
- "DATA SOURCE: **SANTA FE TRAILS**" on a photo archive — the bus operator
  credited for race photos.
- "municipal transit fleet **partners**" — an operator relabeled a partner.
- "**Santa Fe River Run**" as the event name — unruled; the event is the Santa
  Fe International Half Marathon.
- "phone **505-772-0768**" — wrong; 505-920-9799. One wrong digit block
  survives copy-paste forever.
- **Lesson:** names and roles are facts. Check who an org actually is.

## 5. Scope leaks (true fact, wrong audience)
- Gear-bag instructions sent to ALL participants — the service is Half/Relay
  only; a 5K runner would drive a bag to the wrong venue.
- "parking at **County Fairgrounds**" — parking is a split (Half/Relay at
  Romero's, 5K at Reunity, San Isidro overflow); a single-lot claim is wrong
  for everyone.
- Workshop volunteers recruited for the **expo days** — the workshop moved to a
  different day and venue; the role card kept the old association.
- **Lesson:** ask "true for whom?" — a fact can be accurate and still misdirect
  part of the audience.

## 6. Time bombs (true today, wrong tomorrow)
- "Deferrals available until Sept 10" — three surfaces went silently wrong the
  moment the date passed.
- Any "the workshop runs…", "prices hold through…", "register by…" — flag
  present/future-tense claims whose date is near or past, and ask what happens
  to this sentence the day after.

## Verification technique notes
- Live-page checks: fetch once, reuse the snapshot (the host firewalls sweeps);
  check the `WPO-Cache-Status` header to know what you got; grep served CSS/JS
  **case-insensitively** (the minifier lowercases hex); for Elementor pages
  read rendered HTML or `_elementor_data`, never `post_content`.
- A published wrong fact self-replicates into meta descriptions, og tags, and
  JSON-LD — when correcting, sweep those too.
- The "Open conflicts" section of CLAUDE.md lists claims that must ship NO
  number until ruled. Silence is the correct output for an unruled fact.
