"""Course banner (duplicated on ~24 objects, no template include): the pickup sentence.

  STALE  "Friday and Saturday packet pickup is still downtown at the Railyard."
  NEW    "Friday and Saturday packet pickup has moved to <strong>the Running Hub, 1100 Don Diego Ave,
          Suite B</strong>. The Health &amp; Wellness Expo at the Railyard is cancelled."
NEW is copied byte for byte from the banner already live on /packet-pickup/ (1261), so every page reads
the same. Kosgei 9/19: "match the website to the email", and the 9/19 participant email says "Do NOT go
to Warehouse 21 or the Railyard -- nothing is happening there. Pickup is at the Santa Fe Running Hub only."

Each page is edited in the layer it RENDERS from (Elementor pages: _elementor_data via the bridge; classic
pages: post_content via wp/v2), and only if the stale sentence occurs exactly once there. JSON must parse
before and after (Elementor). Every write is read back and must equal what was sent; on a mismatch the
original is written back and the run STOPS. Writes are paced for HostGator. Purge once at the end.
usage: python banner_pickup_moved.py [--commit]
"""
import json, base64, urllib.request, sys, time

COMMIT = "--commit" in sys.argv
STALE = "Friday and Saturday packet pickup is still downtown at the Railyard."
NEW = ("Friday and Saturday packet pickup has moved to <strong>the Running Hub, 1100 Don Diego Ave, Suite B</strong>. "
       "The Health &amp; Wellness Expo at the Railyard is cancelled.")
ELEMENTOR = [4329, 3963, 2539, 2538, 2537, 2370, 1612, 1609, 1606, 1603, 1601, 1599, 1263, 1258, 1256, 1253, 871]
CLASSIC = [4116, 4115, 3968, 2680, 1505]

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


def rest_type(pid):
    for kind in ("pages", "posts"):
        try:
            call("GET", f"/wp-json/wp/v2/{kind}/{pid}?context=edit&_fields=id"); return kind
        except urllib.error.HTTPError:
            pass
    raise SystemExit(f"FATAL: {pid} is neither a page nor a post")


import urllib.error
done = []
for pid in ELEMENTOR:
    el = call("GET", f"/wp-json/santafe/v1/elementor/{pid}")["data"]
    json.loads(el)
    n_old, n_new = el.count(STALE), el.count(NEW)
    if n_old != 1 or n_new != 0:
        sys.exit(f"FATAL {pid}: stale x{n_old}, new x{n_new} -- not the expected state; stopping")
    new = el.replace(STALE, NEW); json.loads(new)
    assert len(new) - len(el) == len(NEW) - len(STALE)
    if COMMIT:
        call("POST", f"/wp-json/santafe/v1/elementor/{pid}", {"data": new})
        back = call("GET", f"/wp-json/santafe/v1/elementor/{pid}")["data"]
        if back != new:
            call("POST", f"/wp-json/santafe/v1/elementor/{pid}", {"data": el})
            sys.exit(f"FATAL {pid}: read-back differs -- original written back; stopping")
        time.sleep(1.5)
    done.append(pid); print(f"  {'WROTE' if COMMIT else 'ok   '} {pid} elementor")
    time.sleep(0.6)

for pid in CLASSIC:
    kind = rest_type(pid)
    pc = call("GET", f"/wp-json/wp/v2/{kind}/{pid}?context=edit&_fields=id,content")["content"]["raw"]
    n_old, n_new = pc.count(STALE), pc.count(NEW)
    if n_old != 1 or n_new != 0:
        sys.exit(f"FATAL {pid}: stale x{n_old}, new x{n_new} -- not the expected state; stopping")
    new = pc.replace(STALE, NEW)
    if COMMIT:
        call("POST", f"/wp-json/wp/v2/{kind}/{pid}", {"content": new})
        back = call("GET", f"/wp-json/wp/v2/{kind}/{pid}?context=edit&_fields=id,content")["content"]["raw"]
        if back != new:
            call("POST", f"/wp-json/wp/v2/{kind}/{pid}", {"content": pc})
            sys.exit(f"FATAL {pid}: read-back differs -- original written back; stopping")
        time.sleep(1.5)
    done.append(pid); print(f"  {'WROTE' if COMMIT else 'ok   '} {pid} {kind} post_content")
    time.sleep(0.6)

print(f"\n{'COMMITTED' if COMMIT else 'DRY RUN OK'}: {len(done)} objects -- purge caches once, then verify served pages")
