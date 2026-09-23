"""Logged-out verification of the /new-mexican-subscribers/ takedown: every realistic link shape must 301 to
the homepage with its query string preserved (flag_query "pass"), on desktop AND mobile user agents
(WP-Optimize keeps a separate mobile cache); the unpublished page must not be reachable by id; and it
must be gone from the sitemap. Checks X-Redirect-By to learn which layer answered."""
import urllib.request, urllib.error, sys, time

BASE = "https://santafehalfmarathon.com"
DESK = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36"
MOB = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36"


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


raw = urllib.request.build_opener(NoRedirect)
ok = True


def first_hop(path, ua):
    try:
        r = raw.open(urllib.request.Request(BASE + path, headers={"User-Agent": ua}), timeout=60)
        return r.status, r.headers.get("Location"), r.headers.get("X-Redirect-By"), r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.headers.get("Location"), e.headers.get("X-Redirect-By"), e.read().decode("utf-8", "replace")


SHAPES = ["/new-mexican-subscribers/", "/new-mexican-subscribers",
          "/new-mexican-subscribers/?utm_source=santafenewmexican&utm_medium=email&utm_campaign=subscriber",
          "/new-mexican-subscribers/?fbclid=IwAR0test"]
for ua_name, ua in (("desktop", DESK), ("mobile", MOB)):
    for s in SHAPES:
        code, loc, by, _ = first_hop(s, ua)
        q = s.split("?", 1)[1] if "?" in s else ""
        good = code == 301 and loc is not None and loc.split("?")[0].rstrip("/") in (BASE, "") and (not q or q in loc)
        ok &= good
        print(f"  {'PASS' if good else 'FAIL'} [{ua_name}] {s[:70]:70s} -> {code} {loc} (by {by})")
        time.sleep(0.8)

# the landing page itself: follow the redirect once and confirm it is the live homepage
r = urllib.request.urlopen(urllib.request.Request(BASE + SHAPES[2], headers={"User-Agent": DESK}), timeout=60)
body = r.read().decode("utf-8", "replace")
good = r.status == 200 and "Sold out - registration closed" in body and "Subscriber exclusive" not in body
ok &= good
print(f"  {'PASS' if good else 'FAIL'} landed on {r.url} [{r.status}] homepage bundle present, no subscriber copy")

for path in ("/?page_id=4484", "/?p=4484"):
    code, loc, by, body = first_hop(path, DESK)
    good = code in (404, 301, 302) and "Subscriber exclusive" not in body
    ok &= good
    print(f"  {'PASS' if good else 'FAIL'} {path} -> {code} {loc or ''} (subscriber copy served: {'Subscriber exclusive' in body})")
    time.sleep(0.8)

try:
    sm = urllib.request.urlopen(urllib.request.Request(BASE + "/page-sitemap.xml", headers={"User-Agent": DESK}), timeout=60).read().decode()
    good = "new-mexican-subscribers" not in sm
    ok &= good
    print(f"  {'PASS' if good else 'FAIL'} page-sitemap.xml lists it: {not good}")
except urllib.error.HTTPError as e:
    print("  (page-sitemap.xml HTTP", e.code, ")")
print("ALL PASS" if ok else "*** FAILURES ***")
sys.exit(0 if ok else 1)
