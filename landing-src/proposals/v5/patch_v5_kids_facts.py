"""v5 DRAFT patch 10 -- carry the canonical Kids-copy fix into v5 so it cannot regress.

v5 was copied from the canonical source BEFORE Kosgei's 9/17 ruling ("NO ORGANIC FINISHER SNACK
PACKS. DON'T MAKE UP STUFF."), so it still carried the invented snack pack, the wrong event name
and the unverified Railyard history. Shipping v5 on Monday would have put back a claim Kosgei had
just rejected.

The replacement values are READ from ../../fix_kids_copy.py rather than retyped, so the canonical
fix and this one cannot drift apart.

Written as a file on purpose: the same logic run through a shell heredoc had its regex
backslashes halved and died on "unterminated character set" -- the escaping trap this project
keeps hitting.

usage: python patch_v5_kids_facts.py
"""
import io, re, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
FIX = os.path.join(HERE, "..", "..", "fix_kids_copy.py")
SRC = os.path.join(HERE, "run-santa-fe-2026.src.html")

fix = io.open(FIX, encoding="utf-8").read()
start, end = fix.index("NEW = {"), fix.index("s = io.open(UNIT")
ns = {}
exec(fix[start:end], ns)
NEW = ns["NEW"]

s = io.open(SRC, encoding="utf-8").read()
VAL = r'"((?:[^"\\]|\\.)*)"'
for key, (en, es) in NEW.items():
    hits = list(re.finditer(re.escape(key) + ":" + VAL, s))
    if len(hits) != 2:
        sys.exit(f"FATAL: {key} found {len(hits)} times in v5, expected 2")
    for m, val in ((hits[1], es), (hits[0], en)):
        s = s[:m.start()] + f'{key}:"{val}"' + s[m.end():]

for bad in ("snack pack", "refrigerio", "International Kids Run", "Railyard time slot",
            "custom-made medal", "traffic-free course loops"):
    if bad.lower() in s.lower():
        sys.exit(f"FATAL: '{bad}' survived in v5")

io.open(SRC, "w", encoding="utf-8", newline="").write(s)
print("v5: Kids copy now matches the canonical fix -- invented claims gone in EN and ES")
