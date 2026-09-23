"""Template 2365: bring the SFHM-REG-STATES header comment in line with the code it describes.

After today's edits the code closes online registration Thu 9/17 11:59 PM MDT and tells walk-ins to
come to packet pickup for any race, but the comment above it still says registration "ends Sat Sept 19
5:00 PM" and "only the Santa Fe 5K takes walk-up entries on race morning, $50". A comment that states
the retired rule is how a later session re-publishes it, so it goes. Comment only: the code between
the comment and the closing "})();" must be byte-identical before and after.
usage: python reg_comment_2365.py [--commit]
"""
import json, base64, urllib.request, sys

COMMIT = "--commit" in sys.argv
PAGE = 2365
START = "/* SFHM-REG-STATES 2026-09-13 (Kosgei)"
NEW_COMMENT = (
    "/* SFHM-REG-STATES 2026-09-13 (Kosgei), revised 2026-09-19: online registration closed EARLY, Thu Sept 17,\\n"
    "   11:59 PM MDT (RunSignup), for every race; the original close was Sat Sept 19, 5:00 PM. Walk-up state runs\\n"
    "   until Sun 7:45 AM: every race takes walk-in entries at packet pickup, pay on site, no prices stated\\n"
    "   (Kosgei 9/18), and the 5K also takes walk-ups at its start line until 7:45 AM. Relabels the Register\\n"
    "   buttons and the concierge registration answer once online registration has closed. Add regnow=epoch-ms\\n"
    "   to a URL to preview. */"
)

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
if el.count(START) != 1:
    sys.exit(f"FATAL: comment start found {el.count(START)}x")
a = el.index(START)
b = el.index("*/", a) + 2
old = el[a:b]
print("OLD COMMENT:", old)
assert "$50" in old and "Sat Sept 19 5:00 PM" in old, "comment is not the one this script expects"
code_end = el.index("})();", b)
code_before = el[b:code_end]
assert "var CLOSE = 1789711140000" in code_before, "code is not in the state this session left it"
new = el[:a] + NEW_COMMENT + el[b:]
json.loads(new)
assert new[a + len(NEW_COMMENT): new.index("})();", a + len(NEW_COMMENT))] == code_before, "code changed"
assert not [ch for ch in NEW_COMMENT if ord(ch) > 127], "non-ASCII"
assert NEW_COMMENT.count("*/") == 1 and NEW_COMMENT.endswith("*/"), "comment would close early"
for bad in ("&", "$", "--"):
    assert bad not in NEW_COMMENT, f"{bad!r} in comment"
print("GUARDS PASS -- comment replaced, code byte-identical, ASCII")
if not COMMIT:
    print("*** DRY RUN ***"); sys.exit(0)
r = call("POST", f"/wp-json/santafe/v1/elementor/{PAGE}", {"data": new})
back = call("GET", f"/wp-json/santafe/v1/elementor/{PAGE}")["data"]
print("POST backup_saved:", r.get("backup_saved"), "| READ-BACK identical:", back == new,
      "| $50 left anywhere in 2365:", back.count("$50"))
