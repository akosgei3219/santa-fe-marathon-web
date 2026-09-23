"""Kosgei 9/19: "take down the New Mexican subscriber page". The race is sold out; /new-mexican-subscribers/
(page 4484) still sold registration with a subscriber discount.

  1. Redirection rule: /new-mexican-subscribers/ -> / (301). match_data copied from the four verified rules
     (flag_query "pass" keeps UTM tags and forwards them, flag_trailing ignores the slash). Created FIRST,
     so there is no window where campaign links 404. Precedent: the retired legacy landing page (rule #1).
  2. Page 4484 -> status "draft" (unpublished, not deleted; restore by setting status back to publish).
Backup: backups/page-4484-new-mexican-subscribers-before-takedown-2026-09-19.json
usage: python sfnm_takedown.py [--commit]
"""
import json, base64, urllib.request, sys

COMMIT = "--commit" in sys.argv
SRC = "/new-mexican-subscribers/"
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
    return json.loads(urllib.request.urlopen(r, d, timeout=60).read().decode())


rules = call("GET", "/wp-json/redirection/v1/redirect?per_page=50").get("items", [])
if any(r["url"].rstrip("/") == SRC.rstrip("/") for r in rules):
    sys.exit("FATAL: a Redirection rule for this path already exists")
page = call("GET", "/wp-json/wp/v2/pages/4484?context=edit&_fields=id,status,slug")
assert page["slug"] == "new-mexican-subscribers" and page["status"] == "publish", page
body = {"url": SRC, "match_type": "url", "action_type": "url", "action_code": 301, "group_id": 1,
        "action_data": {"url": "/"},
        "match_data": {"source": {"flag_query": "pass", "flag_case": True, "flag_trailing": True, "flag_regex": False}}}
print("rule to create:", json.dumps(body))
if not COMMIT:
    print("*** DRY RUN ***"); sys.exit(0)

call("POST", "/wp-json/redirection/v1/redirect", body)
rules = call("GET", "/wp-json/redirection/v1/redirect?per_page=50").get("items", [])
mine = [r for r in rules if r["url"].rstrip("/") == SRC.rstrip("/")]
assert len(mine) == 1, "rule not created"
r = mine[0]
print(f"rule #{r['id']}: {r['url']} -> {r['action_data']} {r['action_code']} enabled={r.get('enabled')} "
      f"match_data={json.dumps(r['match_data'])}")
assert r["match_data"]["source"]["flag_query"] == "pass", "flag_query did not land as pass"

call("POST", "/wp-json/wp/v2/pages/4484", {"status": "draft"})
st = call("GET", "/wp-json/wp/v2/pages/4484?context=edit&_fields=id,status")["status"]
print("page 4484 status now:", st)
assert st == "draft"
