"""Strip invented claims from the homepage Kids section -- EN and ES.

Kosgei 2026-09-17: "NO ORGANIC FINISHER SNACK PACKS. DON'T MAKE UP STUFF. STICK ON REAL, NOT
FAKE OR MADE UP THINGS."

The snack pack was the claim Kosgei caught, but read against what is actually verified, the rest
of the same two paragraphs is no better. Rewritten from VERIFIED FACTS ONLY -- CLAUDE.md, "The
event": "Kids 1K Dash 9:00-10:00 AM at Reunity", "All races finish at Reunity Resources Farm,
1829 San Ysidro Crossing", "Kids 1K Dash is NOT chip-timed (confirmed by Kosgei + timing co.).
Ages 3-12, free, every finisher gets a medal."

REMOVED, and why:
  * "post-race local organic snack pack prepared by Santa Fe YouthWorks"   FALSE -- Kosgei 9/17.
  * "safe, traffic-free course loops entirely contained within the
     agricultural grounds of the farm"                                      unverified course claim
  * "official commemorative race bib"                                        bib is in no source
  * "custom-made medal"                                                      "custom-made" unverified;
                                                                             the medal itself is real
  * "rescheduled from its previous Saturday Railyard time slot"              the Railyard location is
                                                                             unverified, and the line is
                                                                             the shape rule 3 bans
  * "comprehensive schedule overhaul" / "centralizes our youth events
     directly at the main finish line precinct"                             inflated, not facts
  * Title "Santa Fe International Kids Run"                                  WRONG NAME -- the event is
                                                                             the Kids 1K Dash everywhere
                                                                             else on the site, and in
                                                                             RunSignup

KEPT: kidsMeta (date / 9:00 AM / Reunity -- accurate), kidsCta, kidsKicker, kidsTag.

Edits BOTH canonical copies identically -- the build driver refuses to build if
landing-src/run-santa-fe-2026.src.html and ../run-santa-fe-2026.src.html differ.

usage: python fix_kids_copy.py            (dry run: shows current and new values)
       python fix_kids_copy.py --commit
"""
import io, re, sys, hashlib, shutil

COMMIT = "--commit" in sys.argv
UNIT = "run-santa-fe-2026.src.html"
REPO = "../run-santa-fe-2026.src.html"

NEW = {
    "kidsTitle": ("Kids 1K Dash",
                  "Kids 1K Dash"),
    "kidsP1": ("The Kids 1K Dash runs Sunday, September 20, from 9:00 to 10:00 AM at Reunity "
               "Resources Farm, 1829 San Ysidro Crossing \\u2014 the same place every race finishes.",
               "El Kids 1K Dash es el domingo 20 de septiembre, de 9:00 a 10:00 AM, en Reunity "
               "Resources Farm, 1829 San Ysidro Crossing \\u2014 el mismo lugar donde terminan todas "
               "las carreras."),
    # 2026-09-17 Kosgei: "add the bib back" -- the bib is real. Restored PLAIN: the old copy called it
    # an "official commemorative race bib", and those adjectives were never sourced. Every kid gets a
    # bib (it is worn to run); only finishers get the medal. ES uses "dorsal", the site's own term
    # ("Entrega de dorsales"), not the old copy's "numero".
    "kidsP2": ("It\\u2019s free for kids ages 3 to 12. Every kid gets a bib, and every finisher gets a "
               "medal. It isn\\u2019t chip-timed.",
               "Es gratis para ni\\u00f1os de 3 a 12 a\\u00f1os. Cada ni\\u00f1o recibe un dorsal y, al "
               "llegar a la meta, una medalla. No se cronometra con chip."),
}

s = io.open(UNIT, encoding="utf-8").read()
if io.open(REPO, encoding="utf-8").read() != s:
    sys.exit("FATAL: the two canonical copies already differ -- reconcile before editing")
before_md5 = hashlib.md5(s.encode()).hexdigest()

# A JS string value, escapes included: "..." with \" or \\ allowed inside.
VAL = r'"((?:[^"\\]|\\.)*)"'
for key, (en, es) in NEW.items():
    hits = list(re.finditer(re.escape(key) + ":" + VAL, s))
    if len(hits) != 2:
        sys.exit(f"FATAL: {key} found {len(hits)} times, expected 2 (EN then ES)")
    print(f"--- {key}")
    print(f"  EN now: {hits[0].group(1)[:150]}")
    print(f"  ES now: {hits[1].group(1)[:150]}")
    print(f"  EN new: {en}")
    print(f"  ES new: {es}")
    # right-to-left so the earlier match offsets stay valid
    for m, val in ((hits[1], es), (hits[0], en)):
        s = s[:m.start()] + f'{key}:"{val}"' + s[m.end():]

# Guards: the false claim is gone in both languages; nothing else in the file moved.
for bad in ("snack pack", "refrigerio", "Railyard time slot", "International Kids Run",
            "custom-made medal", "traffic-free course loops"):
    if bad.lower() in s.lower():
        sys.exit(f"FATAL: '{bad}' survived")
if s.count("kidsP1:") != 2 or s.count("kidsP2:") != 2 or s.count("kidsTitle:") != 2:
    sys.exit("FATAL: key count changed")

if not COMMIT:
    print("\n*** DRY RUN -- nothing written. Re-run with --commit ***")
    sys.exit(0)

io.open(UNIT, "w", encoding="utf-8", newline="").write(s)
shutil.copyfile(UNIT, REPO)
a = hashlib.md5(io.open(UNIT, "rb").read()).hexdigest()
b = hashlib.md5(io.open(REPO, "rb").read()).hexdigest()
print(f"\nwritten.  before {before_md5}  ->  after {a}")
print(f"both canonical copies identical: {a == b}")
