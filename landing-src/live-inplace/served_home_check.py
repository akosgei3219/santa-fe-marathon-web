"""Logged-out check of what VISITORS get from the homepage after the in-place registration edit.

Stored content can be byte-perfect while the served page is broken: WordPress texturizes at OUTPUT
(it blanked the homepage twice: && -> &#038;&#038; on 9/15, a stripped JSON-LD script on 9/16).
So: fetch the public URL with no credentials, report the page-cache header, confirm each new string
arrives verbatim (a verbatim match is the texturize test), confirm the stale ones are gone, confirm
the other session's pickup copy is still there, and `node --check` every served inline script.
"""
import urllib.request, re, subprocess, tempfile, os, sys

req = urllib.request.Request("https://santafehalfmarathon.com/", headers={
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36"})
resp = urllib.request.urlopen(req, timeout=90)
html = resp.read().decode("utf-8", "replace")
print("HTTP", resp.status, "| WPO-Cache-Status:", resp.headers.get("WPO-Cache-Status"), "| bytes", len(html))

MUST = [
    'new Date("2026-09-17T23:59:00-06:00")',
    "Online registration closed Thursday, September 17. You can register in person for any race during packet "
    "pickup hours and pay on site. On race morning, the Santa Fe 5K also takes walk-up entries at the 5K start "
    "line at Reunity Resources Farm, until 7:45 AM.",
    r"cerr\xF3 el jueves 17 de septiembre. Puedes inscribirte en persona para cualquier carrera durante el "
    r"horario de entrega de paquetes y pagar ah\xED mismo.",
    'regClosed:"Online registration closed"',
    r'regClosed:"Inscripci\xF3n en l\xEDnea cerrada"',
    "Pick up your bib and shirt at the Running Hub, 1100 Don Diego Ave, Suite B",   # other session's copy survives
    "walk-in registration: the Running Hub, 1100 Don Diego Ave, Suite B",
]
GONE = ['"2026-09-19T17:00:00-06:00"', "closed Saturday, September 19", "Only the Santa Fe 5K",
        "only race still", "Solo el Santa Fe 5K", 'regClosed:"Registration closed"', "Warehouse 21, Railyard"]
ok = True
for s in MUST:
    n = html.count(s)
    good = n >= 1
    ok &= good
    print(f"  {'PASS' if good else 'FAIL'}  present x{n}: {s[:70]}")
for s in GONE:
    n = html.count(s)
    ok &= n == 0
    print(f"  {'PASS' if n == 0 else 'FAIL'}  absent  x{n}: {s}")

bodies = re.findall(r"<script\b([^>]*)>([\s\S]*?)</script>", html)
checked = 0
for attrs, body in bodies:
    if "application/ld+json" in attrs or not body.strip() or re.search(r"type=[\"'](?!text/javascript|module)", attrs):
        continue
    fd, p = tempfile.mkstemp(suffix=".js"); os.close(fd)
    open(p, "w", encoding="utf-8").write(body)
    r = subprocess.run(["node", "--check", p], capture_output=True, text=True)
    os.remove(p)
    checked += 1
    if r.returncode != 0:
        ok = False
        print(f"  FAIL  served inline script #{checked} ({len(body)} chars) does not parse:\n{r.stderr[:600]}")
print(f"  node --check: {checked} served inline scripts checked")
print("ALL PASS" if ok else "*** FAILURES ABOVE ***")
sys.exit(0 if ok else 1)
