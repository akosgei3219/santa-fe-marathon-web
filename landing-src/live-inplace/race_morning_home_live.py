r"""LIVE homepage (page 5103), IN PLACE: race-morning pickup now matches the 9/19 participant email.

  email: "Half Marathon and 3-Amigos Relay runners can still collect race morning, 6:00-7:00 AM at Romero's
          Park. 5K runners, please pick up Friday or Saturday at the Running Hub."
  was:   out-of-town runners only, by arranging it on Facebook (the other session's 9/18 copy)

4 strings, built form (esbuild writes non-ASCII as \xNN, the FAQ keeps \u2013): FAQ "Where is packet
pickup?" EN + ES, concierge pickup answer EN + ES. New text has no &, no quotes, no " - " and no "--",
so WordPress texturize has nothing to rewrite.

Guards: live content must be byte-identical to the snapshot taken after last night's registration edit
(so any change by another session aborts this); each old string exactly once; position-based splice;
everything outside the 4 strings verified unchanged; the inline script passes node --check before and
after; read back must equal what was sent, else the original is written back.
usage: python race_morning_home_live.py [--commit]
"""
import json, base64, urllib.request, sys, os, re, subprocess, tempfile

COMMIT = "--commit" in sys.argv
PAGE = 5103
# 10:58 MDT 9/19: the other session switched the homepage to SOLD OUT in place; this edit sits on top of that.
SNAP = r"C:\Users\info\OneDrive\Desktop\SantaFeMarathonWeb\backups\homepage-5103-live-2026-09-19-1058-other-session.html"
OUT = r"C:\Users\info\OneDrive\Desktop\SantaFeMarathonWeb\backups\homepage-5103-live-2026-09-19-after-race-morning.html"

EDITS = [
    ("EN FAQ",
     r"Traveling from out of town and can't make either window? Message us on Facebook to arrange race-morning pickup at Romero's Park (the start line), 6:00\u20137:00 AM.",
     r"Half Marathon and 3-Amigos Relay runners can also pick up race morning, 6:00\u20137:00 AM at Romero's Park (the start line). 5K runners pick up at the Running Hub."),
    ("ES FAQ",
     r"Si vienes de fuera y no puedes recogerlo esos d\xEDas, escr\xEDbenos por Facebook para recogerlo la ma\xF1ana de la carrera en Romero's Park (la salida), de 6:00 a 7:00 AM.",
     r"Los corredores del Medio Marat\xF3n y del Relevo 3-Amigos tambi\xE9n pueden recogerlo la ma\xF1ana de la carrera, de 6:00 a 7:00 AM en Romero's Park (la salida). Los del 5K lo recogen en The Running Hub."),
    ("EN concierge",
     r"Out-of-town runners who can't make either window can message us on Facebook to arrange race-morning pickup at Romero's Park, 6:00-7:00 AM.",
     r"Half Marathon and 3-Amigos Relay runners can also pick up race morning, 6:00-7:00 AM at Romero's Park, the start line. 5K runners pick up at the Running Hub."),
    ("ES concierge",
     r"Si vienes de fuera y no puedes esos d\xEDas, escr\xEDbenos por Facebook para recogerlo la ma\xF1ana de la carrera en Romero's Park, de 6:00 a 7:00 AM.",
     r"Los corredores del Medio Marat\xF3n y del Relevo 3-Amigos tambi\xE9n pueden recogerlo la ma\xF1ana de la carrera, de 6:00 a 7:00 AM en Romero's Park, la salida. Los del 5K lo recogen en The Running Hub."),
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
    return json.loads(urllib.request.urlopen(r, d, timeout=120).read().decode())


def get_live():
    pages = call("GET", "/wp-json/wp/v2/pages?slug=run-santa-fe-2026&status=publish&context=edit&_fields=id,modified_gmt,content")
    assert len(pages) == 1
    return pages[0]["id"], pages[0]["modified_gmt"], pages[0]["content"]["raw"]


def check_scripts(content, label):
    n = 0
    for attrs, body in re.findall(r"<script\b([^>]*)>([\s\S]*?)</script>", content):
        if "application/ld+json" in attrs or not body.strip():
            continue
        fd, path = tempfile.mkstemp(suffix=".js"); os.close(fd)
        open(path, "w", encoding="utf-8").write(body)
        res = subprocess.run(["node", "--check", path], capture_output=True, text=True); os.remove(path)
        if res.returncode != 0:
            sys.exit(f"FATAL: {label} inline script {n} fails node --check:\n{res.stderr[:800]}")
        n += 1
    print(f"  node --check: {n} inline script(s) in {label} parse")


pid, mod, live = get_live()
snap = open(SNAP, encoding="utf-8").read()
print(f"page {pid}  modified_gmt {mod}  live {len(live)} chars")
if pid != PAGE:
    sys.exit(f"FATAL: front page is now {pid} -- someone redeployed; re-diff first")
if live != snap:
    sys.exit("FATAL: live homepage changed since last night's snapshot -- another session edited it; re-diff first")

spots = []
for what, old, rep in EDITS:
    n = live.count(old)
    print(f"  {what:14s} occurs {n}x (expect 1)")
    if n != 1 or rep in live:
        sys.exit(f"FATAL: {what}")
    for bad in ("&", "--", '"', " - "):
        assert bad not in rep, f"texturize-sensitive {bad!r} in {what}"
    spots.append((live.index(old), old, rep, what))
spots.sort()
for (a, o, _, w1), (b, _, _, w2) in zip(spots, spots[1:]):
    assert a + len(o) <= b, f"overlap {w1}/{w2}"
parts, cur = [], 0
for pos, old, rep, _ in spots:
    parts.append(live[cur:pos]); parts.append(rep); cur = pos + len(old)
parts.append(live[cur:])
new = "".join(parts)
undo, cur, shift = [], 0, 0
for pos, old, rep, _ in spots:
    npos = pos + shift
    assert new[npos:npos + len(rep)] == rep
    undo.append(new[cur:npos]); undo.append(old); cur = npos + len(rep); shift += len(rep) - len(old)
undo.append(new[cur:])
assert "".join(undo) == live, "an edit touched something beyond its own string"
assert "Facebook to arrange" not in new and "de fuera" not in new
check_scripts(live, "LIVE (before)")
check_scripts(new, "NEW")
print("GUARDS PASS -- 4 strings, nothing else moved")
if not COMMIT:
    print("*** DRY RUN ***"); sys.exit(0)
r = call("POST", f"/wp-json/wp/v2/pages/{PAGE}", {"content": new})
_, mod2, back = get_live()
if back != new:
    print("!!! STORED CONTENT DIFFERS -- restoring the snapshot")
    call("POST", f"/wp-json/wp/v2/pages/{PAGE}", {"content": live})
    _, _, rest = get_live()
    sys.exit(f"RESTORED: {rest == live}")
open(OUT, "w", encoding="utf-8").write(back)
print(f"READ-BACK identical ({len(back)} chars), modified_gmt {mod2}; snapshot saved to backups/")
