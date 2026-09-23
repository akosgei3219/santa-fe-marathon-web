"""RWAIK page (4493): race-day collection is a WINDOW, not a moment — Kosgei: "in between 9-12pm".

Published as 9:00 AM - 12:00 PM (noon end matches the earlier "at noon" ruling), in the race-day row and
the pre-order note, in the same style as the Friday/Saturday rows. The window sits inside the finish
festival (9:00 AM - 1:00 PM).
usage: python rwaik_raceday_window.py [--commit]
"""
import json, base64, urllib.request, sys

COMMIT = "--commit" in sys.argv
PAGE = 4493
EDITS = [
    ("race-day row",
     'collect your RWAIK at 12:00 PM at Reunity Resources Farm, 1829 San Ysidro Crossing, where every race finishes.',
     'collect your RWAIK at Reunity Resources Farm, 1829 San Ysidro Crossing, where every race finishes '
     '&middot; 9:00 AM &ndash; 12:00 PM.'),
    ("pre-order note",
     'or at Reunity Resources Farm at 12:00 PM on race day.',
     'or at Reunity Resources Farm on race day, 9:00 AM &ndash; 12:00 PM.'),
]

env = {}
for l in open(r"C:\Users\info\mcp-server\.env", encoding="utf-8-sig"):
    l = l.strip()
    if l and not l.startswith("#") and "=" in l:
        k, v = l.split("=", 1); env[k.strip()] = v.strip().strip('"').strip("'")
A = "Basic " + base64.b64encode(f"{env['WP_USER']}:{env['WP_APP_PASSWORD']}".encode()).decode()


def call(m, p, pay=None):
    r = urllib.request.Request("https://santafehalfmarathon.com" + p, method=m)
    r.add_header("Authorization", A); r.add_header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140.0")
    d = None
    if pay is not None:
        d = json.dumps(pay).encode(); r.add_header("Content-Type", "application/json")
    return json.loads(urllib.request.urlopen(r, d, timeout=90).read().decode())


old = call("GET", f"/wp-json/wp/v2/pages/{PAGE}?context=edit&_fields=id,content")["content"]["raw"]
new = old
for label, o, r in EDITS:
    n = old.count(o)
    print(f"  {label:15s} occurs {n}x (expect 1)")
    if n != 1 or r in old:
        sys.exit(f"FATAL {label}")
    new = new.replace(o, r)
assert len(new) - len(old) == sum(len(r) - len(o) for _, o, r in EDITS)
assert "Railyard" not in new
assert new.count("9:00 AM &ndash; 12:00 PM") == 2, "both spots must carry the window"
assert "at 12:00 PM at Reunity" not in new
print("GUARDS PASS -- race-day window 9:00 AM - 12:00 PM in both spots")
if not COMMIT:
    print("*** DRY RUN ***"); sys.exit(0)
call("POST", f"/wp-json/wp/v2/pages/{PAGE}", {"content": new})
back = call("GET", f"/wp-json/wp/v2/pages/{PAGE}?context=edit&_fields=id,content")["content"]["raw"]
if back != new:
    call("POST", f"/wp-json/wp/v2/pages/{PAGE}", {"content": old})
    sys.exit("FATAL: read-back differs -- original restored")
print("READ-BACK identical to what was sent")
