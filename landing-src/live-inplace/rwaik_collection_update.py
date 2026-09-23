"""RWAIK page (4493, /race-history/rwaik/, classic post_content): where buyers collect their shirts.

Kosgei 9/19, asked directly: collection is at the **Santa Fe Running Hub with packet pickup**, "and to at
the Reunity Resources" -> **and at Reunity Resources Farm on race day**. The page said "the sponsor booths
during the Railyard Expo", which no longer exists (expo cancelled, the City is using the space as an
emergency shelter). Buyers have already paid, so no location is guessed here: both come from Kosgei.
Hours for Friday/Saturday are the ruled packet-pickup windows (Fri 12-6, Sat 10-5). No time is stated for
race day, because none was ruled -- only the place, which is where every race finishes.

Backup is written before the edit; each replacement is an exact single occurrence; read back after.
usage: python rwaik_collection_update.py [--commit]
"""
import json, base64, urllib.request, sys, os

COMMIT = "--commit" in sys.argv
PAGE = 4493
BK = r"C:\Users\info\OneDrive\Desktop\SantaFeMarathonWeb\backups\page-4493-rwaik-before-collection-update-2026-09-19.json"
HUB = "The Santa Fe Running Hub, 1100 Don Diego Ave, Suite B"

EDITS = [
    ("eyebrow",
     '<p class="rw-eyebrow">Ultra-limited sponsor drop &middot; Santa Fe Railyard Expo &middot; Sept 18&ndash;19</p>',
     '<p class="rw-eyebrow">Ultra-limited sponsor drop &middot; Collect at packet pickup or at the finish</p>'),
    ("pre-order note",
     'Pick your design and size at checkout, then collect at the sponsor booths during the Railyard Expo.',
     'Pick your design and size at checkout, then collect at packet pickup &mdash; ' + HUB +
     ' &mdash; or at Reunity Resources Farm on race day.'),
    ("friday row",
     '<div><div class="k">Collect &middot; Friday</div><p>Sponsor booths, Santa Fe Railyard Expo &middot; 12:00 PM &ndash; 6:00 PM</p></div>',
     '<div><div class="k">Collect &middot; Friday</div><p>' + HUB + ' &middot; 12:00 PM &ndash; 6:00 PM</p></div>'),
    ("saturday row",
     '<div><div class="k">Collect &middot; Saturday</div><p>Sponsor booths, Santa Fe Railyard Expo &middot; 10:00 AM &ndash; 5:00 PM</p></div>',
     '<div><div class="k">Collect &middot; Saturday</div><p>' + HUB + ' &middot; 10:00 AM &ndash; 5:00 PM</p></div>'),
    ("race day row",
     '<div><div class="k">Race morning</div><p>No downtown pickup on Sunday. The race starts at Romero&rsquo;s Park in Agua Fr&iacute;a &mdash; collect your RWAIK at the Expo.</p></div>',
     '<div><div class="k">Collect &middot; Race day</div><p>No downtown pickup on Sunday. The race starts at Romero&rsquo;s Park in Agua Fr&iacute;a &mdash; collect your RWAIK at Reunity Resources Farm, 1829 San Ysidro Crossing, where every race finishes.</p></div>'),
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


page = call("GET", f"/wp-json/wp/v2/pages/{PAGE}?context=edit")
old = page["content"]["raw"]
assert page["slug"] == "rwaik" and page["status"] == "publish", page["slug"]
if not os.path.exists(BK):
    json.dump(page, open(BK, "w", encoding="utf-8"), ensure_ascii=False)
    print("backup ->", BK)

new = old
for label, o, r in EDITS:
    n = old.count(o)
    print(f"  {label:16s} occurs {n}x (expect 1)")
    if n != 1 or r in old:
        sys.exit(f"FATAL {label}")
    new = new.replace(o, r)
assert len(new) - len(old) == sum(len(r) - len(o) for _, o, r in EDITS)
for gone in ("Railyard", "Railyard Expo", "sponsor booths", "at the Expo"):
    assert gone not in new, f"{gone!r} survived"
assert new.count("Running Hub") == 3 and new.count("Reunity Resources Farm") == 2
print("GUARDS PASS -- 5 replacements; no Railyard/expo collection left; Running Hub x3, Reunity x2")
if not COMMIT:
    print("*** DRY RUN ***"); sys.exit(0)
call("POST", f"/wp-json/wp/v2/pages/{PAGE}", {"content": new})
back = call("GET", f"/wp-json/wp/v2/pages/{PAGE}?context=edit&_fields=id,content")["content"]["raw"]
if back != new:
    call("POST", f"/wp-json/wp/v2/pages/{PAGE}", {"content": old})
    rest = call("GET", f"/wp-json/wp/v2/pages/{PAGE}?context=edit&_fields=id,content")["content"]["raw"]
    sys.exit(f"FATAL: read-back differs -- original restored: {rest == old}")
print("READ-BACK identical to what was sent")
