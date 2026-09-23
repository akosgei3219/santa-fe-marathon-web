"""Template 2365 (sitewide nav): the PHONE menu's expo link gets the "(cancelled)" label the desktop
mega menu already carries (the other session changed only the desktop one on 9/18).

  phone drawer  nav#sitenavMobile  <a href="/health-and-wellness-expo/" data-en=... data-es=...>
  EN  "Health & Wellness Expo"      -> "Health & Wellness Expo (cancelled)"
  ES  "Expo de salud y bienestar"   -> "Expo de salud y bienestar (cancelada)"
Wording copied from the desktop mega item, so the two menus now read the same.

Guards: JSON parses before and after; the old link exactly once; the desktop item (already
cancelled) untouched; exactly two "(cancelled)" labels before (desktop data-en + text) and four
after; byte delta exact; read back identical (2365 writes can report success and not persist).
usage: python expo_label_phone_2365.py [--commit]
"""
import json, base64, urllib.request, sys

COMMIT = "--commit" in sys.argv
PAGE = 2365
OLD = (r'<a href=\"/health-and-wellness-expo/\" data-en=\"Health &amp; Wellness Expo\" '
       r'data-es=\"Expo de salud y bienestar\">Health &amp; Wellness Expo</a>')
NEW = (r'<a href=\"/health-and-wellness-expo/\" data-en=\"Health &amp; Wellness Expo (cancelled)\" '
       r'data-es=\"Expo de salud y bienestar (cancelada)\">Health &amp; Wellness Expo (cancelled)</a>')
DESKTOP = (r'<span class=\"mx-name\" data-en=\"Health &amp; Wellness Expo (cancelled)\" '
           r'data-es=\"Expo de salud y bienestar (cancelada)\">Health &amp; Wellness Expo (cancelled)</span>')

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
print(f"  phone link (old)   occurs {el.count(OLD)}x (expect 1)")
print(f"  desktop item       occurs {el.count(DESKTOP)}x (expect 1)")
print(f"  '(cancelled)'      occurs {el.count('(cancelled)')}x (expect 2)")
if el.count(OLD) != 1 or el.count(DESKTOP) != 1 or el.count("(cancelled)") != 2 or NEW in el:
    sys.exit("FATAL: the template is not in the state this script expects -- another session may have edited it")
new = el.replace(OLD, NEW)
json.loads(new)
assert len(new) - len(el) == len(NEW) - len(OLD), "byte delta mismatch"
assert new.count(DESKTOP) == 1 and new.count("(cancelled)") == 4 and new.count("(cancelada)") == 2
assert new.count(NEW) == 1
print("GUARDS PASS -- phone link relabelled, desktop item untouched")
if not COMMIT:
    print("*** DRY RUN ***"); sys.exit(0)
r = call("POST", f"/wp-json/santafe/v1/elementor/{PAGE}", {"data": new})
back = call("GET", f"/wp-json/santafe/v1/elementor/{PAGE}")["data"]
print("POST backup_saved:", r.get("backup_saved"), "| READ-BACK identical:", back == new,
      "| new link present:", back.count(NEW) == 1)
