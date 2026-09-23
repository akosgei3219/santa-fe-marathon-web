"""LIVE homepage (page 5103): switch to walk-up now and correct the walk-up copy -- IN PLACE.

Why in place, not a source deploy: the other session edited page 5103's content directly on 9/18
(2:28 PM MDT), 17 pickup regions (Running Hub, walk-in line, Tricia Downing talk) that are NOT in
landing-src. A delete-and-recreate from source would put Warehouse 21 -- now an emergency shelter --
back on the homepage on pickup day. So this edits the live content string itself, touching only
registration strings, exactly as that session did.

Edits (built/minified form -- esbuild writes non-ASCII as \\xNN escapes):
  1. REG_CLOSE  2026-09-19T17:00 -> 2026-09-17T23:59 MDT (RunSignup's actual close). WALKUP_CLOSE
     (Sun 7:45 AM) untouched, so the page sits in walk-up state until race morning.
  2-5. walk-up answers, FAQ + concierge, EN + ES: "closed Saturday ... 5:00 PM" and "only race" /
     "Only the Santa Fe 5K" / "Solo el" -> the 9/18 walk-in ruling, same wording as template 2365.
  6-7. regClosed "Registration closed" -> "Online registration closed" (EN + ES). In walk-up state
     the Half, Relay and Kids cards show it; the FAQ on this same page (other session) says walk-in
     registration is open at pickup, so a bare "Registration closed" contradicts the page.
No venue, no hours, no prices are added. The hero stays "5K walk-ups until 7:45 AM" -> #races,
the wording Kosgei approved 9/18.

Guards: live content must be byte-identical to the snapshot taken before this was written (so a
concurrent edit aborts it); every old string exactly once; new text free of & -- and quotes;
every inline script in the new content passes `node --check`. After the write, the stored content
is re-read and must equal what was sent; otherwise the snapshot is written back.
usage: python reg_walkin_home_live.py [--commit]
"""
import json, base64, urllib.request, sys, os, re, subprocess, tempfile, datetime

COMMIT = "--commit" in sys.argv
HERE = os.path.dirname(os.path.abspath(__file__))
SNAP = os.path.join(HERE, "live_home_5103.html")
PAGE = 5103

EN_NEW = ("Online registration closed Thursday, September 17. You can register in person for any race "
          "during packet pickup hours and pay on site. On race morning, the Santa Fe 5K also takes walk-up "
          "entries at the 5K start line at Reunity Resources Farm, until 7:45 AM.")
ES_NEW = (r"La inscripci\xF3n en l\xEDnea cerr\xF3 el jueves 17 de septiembre. Puedes inscribirte en persona "
          r"para cualquier carrera durante el horario de entrega de paquetes y pagar ah\xED mismo. La ma\xF1ana "
          r"de la carrera, el Santa Fe 5K tambi\xE9n acepta inscripciones en la salida del 5K en Reunity "
          r"Resources Farm, hasta las 7:45 AM.")

EDITS = [
    ("REG_CLOSE", 'new Date("2026-09-19T17:00:00-06:00")', 'new Date("2026-09-17T23:59:00-06:00")'),
    ("EN FAQ walk-up",
     'walkup:"Online registration closed Saturday, September 19 at 5:00 PM. The Santa Fe 5K is the only race '
     'still taking entries: walk-up registration runs on race morning at the 5K start line at Reunity Resources '
     'Farm, until 7:45 AM."',
     'walkup:"' + EN_NEW + '"'),
    ("EN concierge walk-up",
     'walkup:"Online registration closed Saturday, September 19 at 5:00 PM. Only the Santa Fe 5K still takes '
     'entries: walk-up registration on race morning at the 5K start line at Reunity Resources Farm, until 7:45 AM."',
     'walkup:"' + EN_NEW + '"'),
    ("ES FAQ walk-up",
     r'walkup:"La inscripci\xF3n en l\xEDnea cerr\xF3 el s\xE1bado 19 de septiembre a las 5:00 PM. El Santa Fe 5K '
     r'es la \xFAnica carrera que a\xFAn acepta inscripciones: la inscripci\xF3n en persona es la ma\xF1ana de la '
     r'carrera, en la salida del 5K en Reunity Resources Farm, hasta las 7:45 AM."',
     'walkup:"' + ES_NEW + '"'),
    ("ES concierge walk-up",
     r'walkup:"La inscripci\xF3n en l\xEDnea cerr\xF3 el s\xE1bado 19 de septiembre a las 5:00 PM. Solo el Santa '
     r'Fe 5K acepta inscripciones: en persona la ma\xF1ana de la carrera en la salida del 5K en Reunity Resources '
     r'Farm, hasta las 7:45 AM."',
     'walkup:"' + ES_NEW + '"'),
    ("EN regClosed", 'regClosed:"Registration closed"', 'regClosed:"Online registration closed"'),
    ("ES regClosed", 'regClosed:"Inscripciones cerradas"', r'regClosed:"Inscripci\xF3n en l\xEDnea cerrada"'),
]

# the close instant must be RunSignup's: 9/18 01:59 Eastern = 9/17 23:59 MDT = epoch 1789711140000
t = datetime.datetime(2026, 9, 17, 23, 59, tzinfo=datetime.timezone(datetime.timedelta(hours=-6)))
assert int(t.timestamp() * 1000) == 1789711140000, "close instant disagrees with template 2365"

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
    assert len(pages) == 1, "expected exactly one front page"
    return pages[0]["id"], pages[0]["modified_gmt"], pages[0]["content"]["raw"]


def check_scripts(content, label):
    bodies = re.findall(r"<script\b([^>]*)>([\s\S]*?)</script>", content)
    n = 0
    for attrs, body in bodies:
        if "application/ld+json" in attrs or not body.strip():
            continue
        fd, path = tempfile.mkstemp(suffix=".js"); os.close(fd)
        open(path, "w", encoding="utf-8").write(body)
        res = subprocess.run(["node", "--check", path], capture_output=True, text=True)
        os.remove(path)
        if res.returncode != 0:
            sys.exit(f"FATAL: {label} inline script {n} fails node --check:\n{res.stderr[:800]}")
        n += 1
    print(f"  node --check: {n} inline scripts in {label} parse")


pid, mod, live = get_live()
snap = open(SNAP, encoding="utf-8").read()
print(f"page {pid}  modified_gmt {mod}  live {len(live)} chars")
if pid != PAGE:
    sys.exit(f"FATAL: front page is now {pid}, not {PAGE} -- someone redeployed; re-diff first")
if live != snap:
    sys.exit("FATAL: live content changed since the snapshot -- another session is editing; re-diff first")

# Position-based: locate each old string once in the ORIGINAL, then splice. The EN FAQ and EN
# concierge (and the two ES ones) receive the same sentence, so string-replace-in-sequence cannot
# tell "already applied" from "collides"; positions can.
spots = []
for what, old, rep in EDITS:
    n = live.count(old)
    print(f"  {what:22s} occurs {n}x (expect 1)")
    if n != 1:
        sys.exit(f"FATAL: {what}")
    if rep in live:
        sys.exit(f"FATAL: {what} replacement already present in the live page")
    spots.append((live.index(old), old, rep, what))
spots.sort()
for (a, o, _, w1), (b, _, _, w2) in zip(spots, spots[1:]):
    assert a + len(o) <= b, f"edits overlap: {w1} / {w2}"
parts, cur = [], 0
for pos, old, rep, _ in spots:
    parts.append(live[cur:pos]); parts.append(rep); cur = pos + len(old)
parts.append(live[cur:])
new = "".join(parts)
delta = sum(len(rep) - len(old) for _, old, rep in EDITS)
assert len(new) - len(live) == delta, "byte delta mismatch"
for bad in ("closed Saturday, September 19", r"cerr\xF3 el s\xE1bado 19", "only race still", "Only the Santa Fe 5K",
            "Solo el Santa Fe 5K", '"2026-09-19T17:00:00-06:00"', 'regClosed:"Registration closed"'):
    assert bad not in new, f"stale string survived: {bad}"
for _, _, rep in EDITS[1:]:
    body = rep.split(":", 1)[1]
    for bad in ("&", "--", "'", "$"):
        assert bad not in body, f"texturize/price-sensitive {bad!r} in new text: {body[:60]}"
assert new.startswith("<!-- wp:html -->") and new.rstrip().endswith("<!-- /wp:html -->"), "wrapper damaged"
# nothing outside the registration strings may move: undo the splice by position and compare
undo, cur, shift = [], 0, 0
for pos, old, rep, _ in spots:
    npos = pos + shift
    assert new[npos:npos + len(rep)] == rep, "a replacement is not where it should be"
    undo.append(new[cur:npos]); undo.append(old); cur = npos + len(rep); shift += len(rep) - len(old)
undo.append(new[cur:])
assert "".join(undo) == live, "an edit touched something beyond its own string"
check_scripts(live, "LIVE (before)")
check_scripts(new, "NEW")
print(f"\nGUARDS PASS -- 7 registration strings, delta {delta:+d} chars, pickup regions untouched")
if not COMMIT:
    print("*** DRY RUN ***"); sys.exit(0)

r = call("POST", f"/wp-json/wp/v2/pages/{PAGE}", {"content": new})
print("POST ->", r.get("id"), r.get("modified_gmt"))
_, mod2, back = get_live()
if back != new:
    print("!!! STORED CONTENT DIFFERS FROM WHAT WAS SENT -- restoring the snapshot")
    call("POST", f"/wp-json/wp/v2/pages/{PAGE}", {"content": live})
    _, _, rest = get_live()
    sys.exit(f"RESTORED: {rest == live}")
print(f"READ-BACK identical to what was sent ({len(back)} chars), modified_gmt {mod2}")
open(os.path.join(HERE, "live_home_5103_after_reg.html"), "w", encoding="utf-8").write(back)
