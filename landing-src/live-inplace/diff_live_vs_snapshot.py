"""READ-ONLY: what changed on the live homepage since a snapshot? Lists every differing region.
usage: python diff_live_vs_snapshot.py <snapshot.html> [save_live_to.html]"""
import json, base64, urllib.request, sys, difflib

SNAP = sys.argv[1]
env = {}
for l in open(r"C:\Users\info\mcp-server\.env", encoding="utf-8-sig"):
    l = l.strip()
    if l and not l.startswith("#") and "=" in l:
        k, v = l.split("=", 1); env[k.strip()] = v.strip().strip('"').strip("'")
A = "Basic " + base64.b64encode(f"{env['WP_USER']}:{env['WP_APP_PASSWORD']}".encode()).decode()
r = urllib.request.Request("https://santafehalfmarathon.com/wp-json/wp/v2/pages?slug=run-santa-fe-2026&status=publish&context=edit&_fields=id,modified_gmt,content")
r.add_header("Authorization", A); r.add_header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140.0")
p = json.loads(urllib.request.urlopen(r, timeout=120).read().decode())[0]
live = p["content"]["raw"]
snap = open(SNAP, encoding="utf-8").read()
if len(sys.argv) > 2:
    open(sys.argv[2], "w", encoding="utf-8").write(live)
print(f"page {p['id']} modified_gmt {p['modified_gmt']}  snapshot {len(snap)}  live {len(live)}")
sm = difflib.SequenceMatcher(None, snap, live, autojunk=False)
n = 0
for tag, i1, i2, j1, j2 in sm.get_opcodes():
    if tag == "equal":
        continue
    n += 1
    print(f"\n--- region {n} ({tag}) @snap {i1} ---")
    print("  BEFORE:", json.dumps(snap[max(0, i1 - 60):i2 + 60])[:700])
    print("  AFTER :", json.dumps(live[max(0, j1 - 60):j2 + 60])[:700])
print(f"\n{n} differing region(s)")
