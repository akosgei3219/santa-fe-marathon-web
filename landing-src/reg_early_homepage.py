"""Homepage: switch to walk-up mode now, and make the walk-up copy name the real close.

Kosgei 9/18: online registration closed early on purpose (RunSignup: Thu 9/17 11:59 PM MDT), 5K
walk-ups still on, pickup still Warehouse 21 -- "yes, proceed now".

1. REG_CLOSE  Sat 9/19 17:00  ->  Thu 9/17 23:59 MDT. The single point of truth: REG_STATE, the hero
   CTA (rule 9), the race cards, the FAQ and the concierge all follow it. WALKUP_CLOSE (Sun 7:45 AM)
   is untouched, so the site stays in walk-up mode until race morning.
2. The walk-up answers said "closed Saturday, September 19 at 5:00 PM" -- once walk-up mode is live
   that is false. Now "closed Thursday, September 17", in both languages:
     EN  FAQ + concierge (same phrase, 2x)
     ES  FAQ stores literal accented letters; the concierge stores \\u escapes -- matched separately.
   The OPEN-state answers ("closes Saturday...", "cierra el sabado...") are present tense and are no
   longer reachable; the replacements are keyed on the PAST tense, so they cannot touch them.
3. The code comment above REG_CLOSE is corrected so the source does not contradict itself.

Rule 8: no dollar amount is introduced (the homepage walk-up answers already carry none).
Both canonical copies are written identically -- the driver refuses to build if they differ.

Written as a file: shell heredocs have halved regex/escape backslashes twice this session.
usage: python reg_early_homepage.py [--commit]
"""
import io, sys, shutil, hashlib

sys.exit("SUPERSEDED 2026-09-19 -- never run. Its walk-up wording ('only race', Saturday-era) was retired by the 9/18\n"
         "walk-in ruling, and the live homepage was changed IN PLACE instead (live-inplace/reg_walkin_home_live.py).\n"
         "Kept only because its OLD strings show the source form for the back-port. Read memory note\n"
         "sfhm-homepage-live-ahead-of-source-2026-09-19 before touching the homepage.")

COMMIT = "--commit" in sys.argv
UNIT, REPO = "run-santa-fe-2026.src.html", "../run-santa-fe-2026.src.html"

EDITS = [
    ("REG_CLOSE", 1,
     'const REG_CLOSE = new Date("2026-09-19T17:00:00-06:00");',
     'const REG_CLOSE = new Date("2026-09-17T23:59:00-06:00");'),
    ("comment", 1,
     "/* online registration closes Saturday Sept 19, 5:00 PM MDT for every race; register buttons switch to a closed state after it */",
     "/* 2026-09-18 (Kosgei): online registration closed EARLY, Thursday Sept 17, 11:59 PM MDT (RunSignup), for every race;\n"
     "   register buttons switch to the walk-up state after it. Originally Saturday Sept 19, 5:00 PM. */"),
    ("EN walk-up (FAQ + concierge)", 2,
     "Online registration closed Saturday, September 19 at 5:00 PM.",
     "Online registration closed Thursday, September 17."),
    ("ES walk-up FAQ (literal)", 1,
     "cerró el sábado 19 de septiembre a las 5:00 PM.",
     "cerró el jueves 17 de septiembre."),
    ("ES walk-up concierge (escaped)", 1,
     "cerr\\u00f3 el s\\u00e1bado 19 de septiembre a las 5:00 PM.",
     "cerr\\u00f3 el jueves 17 de septiembre."),
]

s = io.open(UNIT, encoding="utf-8").read()
if io.open(REPO, encoding="utf-8").read() != s:
    sys.exit("FATAL: the two canonical copies differ -- a parallel session may be editing; reconcile first")
before = hashlib.md5(s.encode()).hexdigest()
print(f"starting md5 {before}  (expected 94750c1a... from the bib deploy)")
if before != "94750c1a1303667108841bd1796cd455":
    sys.exit("FATAL: source changed since the last deploy -- inspect before editing")

new, delta = s, 0
for what, count, old, rep in EDITS:
    n = new.count(old)
    print(f"  {what:32s} occurs {n}x (expect {count})")
    if n != count:
        sys.exit(f"FATAL: {what}")
    new = new.replace(old, rep)
    delta += (len(rep) - len(old)) * count

assert len(new) - len(s) == delta, "byte delta mismatch"
for bad in ("closed Saturday, September 19", "cerró el sábado 19", "cerr\\u00f3 el s\\u00e1bado 19",
            '"2026-09-19T17:00:00-06:00"'):
    assert bad not in new, f"stale phrase survived: {bad}"
# the OPEN-state (present tense) answers must be untouched
for keep in ("closes Saturday, September 19 at 5:00 PM", "cierra el s"):
    assert new.count(keep) == s.count(keep), f"an open-state answer changed: {keep}"
assert "$" not in "".join(rep for _, _, _, rep in EDITS), "a dollar amount crept in (rule 8)"
print("\nGUARDS PASS -- 6 replacements, open-state answers untouched, no fees added")

if not COMMIT:
    print("*** DRY RUN ***"); sys.exit(0)
io.open(UNIT, "w", encoding="utf-8", newline="").write(new)
shutil.copyfile(UNIT, REPO)
a = hashlib.md5(io.open(UNIT, "rb").read()).hexdigest()
b = hashlib.md5(io.open(REPO, "rb").read()).hexdigest()
print(f"written. md5 {before} -> {a}   canonical copies identical: {a == b}")
