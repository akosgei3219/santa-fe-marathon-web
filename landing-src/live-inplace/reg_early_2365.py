"""Template 2365 (SITEWIDE nav/footer, every page): switch the registration state to walk-up now.

Kosgei 9/18: online registration closed early on purpose (RunSignup: Thu 9/17 11:59 PM MDT), 5K
walk-ups still on, pickup still Warehouse 21 -- then "yes, proceed now".

Three literals in the SFHM-REG-STATES script:
  1. `var CLOSE = 1789858800000` (Sat 9/19 5 PM)  ->  1789711140000 (Thu 9/17 11:59 PM MDT).
     WALK (Sun 7:45 AM) is untouched, so the site sits in walk-up mode until race morning.
  2. EN walk-up concierge answer: "closed Saturday, September 19 at 5:00 PM." -> "closed Thursday,
     September 17."
  3. ES walk-up concierge answer. This script builds Spanish from String.fromCharCode so the source
     stays ASCII and WordPress cannot texturize it; `' el s' + c(225) + 'bado 19 de septiembre a
     las 5:00 PM.` becomes `' el jueves 17 de septiembre.` -- "jueves" needs no accent, so it is a
     plain literal and the c(225) concatenation simply drops out.
The $50 in this answer stays: rule 8 bans fees on the HOMEPAGE only; 2365 serves inner pages.

This template renders on EVERY page, so the guards are strict: JSON parses before and after, each
old literal exactly once before and zero after, each new literal exactly once, the byte delta equals
the three edits, and the edited script contains no non-ASCII character.

usage: python reg_early_2365.py            (dry run)
       python reg_early_2365.py --commit
"""
import json, base64, urllib.request, sys

COMMIT = "--commit" in sys.argv
PAGE = 2365
BASE = "https://santafehalfmarathon.com"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36"

EDITS = [
    ("CLOSE epoch", "var CLOSE = 1789858800000,", "var CLOSE = 1789711140000,"),
    ("EN walk-up answer", "Online registration closed Saturday, September 19 at 5:00 PM.",
                          "Online registration closed Thursday, September 17."),
    ("ES walk-up answer", "' el s' + c(225) + 'bado 19 de septiembre a las 5:00 PM.",
                          "' el jueves 17 de septiembre."),
]

env = {}
for l in open(r"C:\Users\info\mcp-server\.env", encoding="utf-8-sig"):
    l = l.strip()
    if l and not l.startswith("#") and "=" in l:
        k, v = l.split("=", 1); env[k.strip()] = v.strip().strip('"').strip("'")
AUTH = "Basic " + base64.b64encode(f"{env['WP_USER']}:{env['WP_APP_PASSWORD']}".encode()).decode()


def call(m, p, pay=None):
    r = urllib.request.Request(BASE + p, method=m)
    r.add_header("Authorization", AUTH); r.add_header("User-Agent", UA)
    d = None
    if pay is not None:
        d = json.dumps(pay).encode(); r.add_header("Content-Type", "application/json")
    return json.loads(urllib.request.urlopen(r, d, timeout=90).read().decode())


el = call("GET", f"/wp-json/santafe/v1/elementor/{PAGE}")["data"]
json.loads(el)
new, delta = el, 0
for what, old, rep in EDITS:
    n = new.count(old)
    print(f"  {what:18s} occurs {n}x (expect 1)")
    if n != 1:
        sys.exit(f"FATAL: {what} found {n} times")
    if rep in new:
        sys.exit(f"FATAL: {what} replacement already present")
    new = new.replace(old, rep)
    delta += len(rep) - len(old)

json.loads(new)
assert len(new) - len(el) == delta, "byte delta mismatch"
for what, old, rep in EDITS:
    assert new.count(old) == 0 and new.count(rep) == 1, f"{what} not applied exactly once"
i = new.find("var CLOSE = "); j = new.find("})();", i)
script = new[i:j]
bad = [ch for ch in script if ord(ch) > 127]
assert not bad, f"non-ASCII characters in the edited script: {bad[:5]}"
assert "Saturday, September 19" not in script, "Saturday close still in the script"
print("\nGUARDS PASS -- JSON parses, 3 literals swapped exactly once, script is pure ASCII")

if not COMMIT:
    print("*** DRY RUN -- re-run with --commit ***"); sys.exit(0)

r = call("POST", f"/wp-json/santafe/v1/elementor/{PAGE}", {"data": new})
print("POST:", {k: r.get(k) for k in ("success", "backup_saved", "bytes")})
back = call("GET", f"/wp-json/santafe/v1/elementor/{PAGE}")["data"]
json.loads(back)
print("READ-BACK (2365 writes can report success and not persist):")
for what, old, rep in EDITS:
    print(f"   {what:18s} new present: {rep in back}   old gone: {old not in back}")
