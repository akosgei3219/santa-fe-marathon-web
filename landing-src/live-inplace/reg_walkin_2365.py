"""Template 2365 (sitewide): correct the walk-up concierge answer that reg_early_2365.py made live.

Moving CLOSE to Thursday surfaced a walk-up answer written 9/13, before the 9/18 rulings:
  "Only the Santa Fe 5K still takes entries ... $50 ..."
The 9/18 rulings (memory sfhm-expo-cancellation-2026-09-18, and ALREADY LIVE on the homepage FAQ,
"Not registered yet? Walk-in registration is open there during the same hours."):
  * every race takes walk-in entries at packet pickup; pay on site; NO prices in comms
  * the 5K also takes walk-ups race morning at the Reunity start line until 7:45 AM
So "Only" is false and "$50" breaks the no-prices ruling.

New wording follows the pre-flighted participant email (race-week-change-email-2026-09-18.md).
It names NO venue and NO hours ("during packet pickup hours"): the venue lives on /packet-pickup/
and in the nav line the other session already fixed, and the Saturday start hour is unsettled.
"during packet pickup hours" also keeps the sentence true after Saturday's pickup closes.

Spanish keeps this script's String.fromCharCode pattern (c(237)=i-acute, c(241)=n-tilde,
c(233)=e-acute) so the script stays pure ASCII. No apostrophes, ampersands, quotes or double
hyphens, so WordPress texturize has nothing to rewrite.
usage: python reg_walkin_2365.py [--commit]
"""
import json, base64, urllib.request, sys

COMMIT = "--commit" in sys.argv
PAGE = 2365
EDITS = [
    ("EN walk-up answer",
     "'Online registration closed Thursday, September 17. Only the Santa Fe 5K still takes entries: "
     "walk-up registration on race morning at the 5K start line at Reunity Resources Farm, $50, until 7:45 AM.'",
     "'Online registration closed Thursday, September 17. You can register in person for any race during "
     "packet pickup hours and pay on site. On race morning, the Santa Fe 5K also takes walk-up entries at "
     "the 5K start line at Reunity Resources Farm, until 7:45 AM.'"),
    ("ES walk-up answer",
     "' el jueves 17 de septiembre. Solo el Santa Fe 5K acepta inscripciones: en persona la ma' + c(241) + "
     "'ana de la carrera en la salida del 5K en Reunity Resources Farm, $50, hasta las 7:45 AM.'",
     "' el jueves 17 de septiembre. Puedes inscribirte en persona para cualquier carrera durante el horario "
     "de entrega de paquetes y pagar ah' + c(237) + ' mismo. La ma' + c(241) + 'ana de la carrera, el Santa Fe "
     "5K tambi' + c(233) + 'n acepta inscripciones en la salida del 5K en Reunity Resources Farm, hasta las 7:45 AM.'"),
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


el = call("GET", f"/wp-json/santafe/v1/elementor/{PAGE}")["data"]
json.loads(el)
new, delta = el, 0
for what, old, rep in EDITS:
    n = new.count(old)
    print(f"  {what:18s} occurs {n}x (expect 1)")
    if n != 1:
        sys.exit(f"FATAL: {what} -- live text is not what this session wrote; another session may have changed it")
    if rep in new:
        sys.exit(f"FATAL: {what} replacement already present")
    new = new.replace(old, rep); delta += len(rep) - len(old)
json.loads(new)
assert len(new) - len(el) == delta, "byte delta mismatch"
i = new.find("var CLOSE = "); j = new.find("})();", i)
script = new[i:j]
assert not [ch for ch in script if ord(ch) > 127], "non-ASCII in script"
for gone in ("$50", "Only the Santa Fe 5K", "Solo el Santa Fe 5K"):
    assert gone not in script, f"{gone!r} still in the registration script"
for bad in ("&", "--", '"'):
    for _, _, rep in EDITS:
        assert bad not in rep, f"texturize-sensitive {bad!r} in new text"
assert "var CLOSE = 1789711140000" in script, "the Thursday switch must stay"
assert script.count("relabel(r, ") == 2, "walk-up and closed branches must both remain"
print("GUARDS PASS -- EN + ES replaced once each; no $50, no 'Only'; Thursday switch kept; script pure ASCII")
for _, _, rep in EDITS:
    print("   NEW:", rep)
if not COMMIT:
    print("*** DRY RUN ***"); sys.exit(0)
r = call("POST", f"/wp-json/santafe/v1/elementor/{PAGE}", {"data": new})
print("POST:", {k: r.get(k) for k in ("success", "backup_saved", "bytes")})
back = call("GET", f"/wp-json/santafe/v1/elementor/{PAGE}")["data"]
json.loads(back)
print("READ-BACK (2365 writes can report success and not persist):")
for what, old, rep in EDITS:
    print(f"   {what:18s} new present: {rep in back}   old gone: {old not in back}")
print("   identical to what was sent:", back == new)
