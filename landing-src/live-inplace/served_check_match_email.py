"""Logged-out check of every page changed on 9/19 to match the participant email: the new wording must
be served, the old wording must be gone, and on the homepage every served inline script must parse
(WordPress texturizes at OUTPUT). One fetch per page, paced for HostGator."""
import urllib.request, json, base64, re, subprocess, tempfile, os, sys, time

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36"
env = {}
for l in open(r"C:\Users\info\mcp-server\.env", encoding="utf-8-sig"):
    l = l.strip()
    if l and not l.startswith("#") and "=" in l:
        k, v = l.split("=", 1); env[k.strip()] = v.strip().strip('"').strip("'")
A = "Basic " + base64.b64encode(f"{env['WP_USER']}:{env['WP_APP_PASSWORD']}".encode()).decode()
rq = urllib.request.Request("https://santafehalfmarathon.com/wp-json/wp/v2/posts/4181?_fields=link")
rq.add_header("Authorization", A); rq.add_header("User-Agent", UA)
guide = json.loads(urllib.request.urlopen(rq, timeout=60).read().decode())["link"]

CHECKS = [
    ("/", ["Half Marathon and 3-Amigos Relay runners can also pick up race morning", "5K runners pick up at the Running Hub",
           r"Los corredores del Medio Marat\xF3n y del Relevo 3-Amigos tambi\xE9n pueden recogerlo"],
          ["Facebook to arrange race-morning pickup", "escr\\xEDbenos por Facebook"]),
    ("/packet-pickup/", ["Race-morning pickup:</strong> Half Marathon and 3-Amigos Relay runners", ">HALF &amp; RELAY<",
                         "Half Marathon &amp; 3-Amigos Relay</div>", "5K runners pick up here."],
                        ["Out-of-Town Runners Only", "BY ARRANGEMENT", "Facebook</a> to arrange"]),
    ("/event-schedule/", ["gear bag drop and race-morning packet pickup open (Half &amp; Relay)",
                          "race-morning packet pickup for Half and Relay runners"],
                         ["pre-arranged packet pickup", "Message us on Facebook to arrange"]),
    ("/host-city-guide/", ["Packet pickup runs <strong>Friday 12", "at the Running Hub, 1100 Don Diego Ave, Suite B</strong>"],
                          ["at Warehouse 21</strong>"]),
    ("/volunteer/", ["race packets at the Running Hub, 1100 Don Diego Ave, Suite B.", "packet-pickup shifts on September 18",
                     "Health &amp; Wellness Expo (cancelled)</h3>"],
                    ["Expo at Warehouse 21", "(Warehouse 21, Railyard)"]),
    (guide, ["Packet pickup at the Running Hub</h2>", "Do not go to Warehouse 21 or the Railyard.", "#sfhm-trail{display:none !important;"],
            ["runs both days at the Railyard", "Picking up at the Railyard?", "ideal for the expo and packet pickup"]),
    ("/new-mexican-subscribers/", ["Packet pickup has moved to the Running Hub, 1100 Don Diego Ave, Suite B",
                                   "Second packet-pickup day at the Running Hub"],
                                  ["still downtown at the Railyard", "downtown at the Railyard. Meet the vendors"]),
    ("/relays-exchange-zones/", ["at packet pickup at the Running Hub on Friday or Saturday"], ["at the Railyard expo"]),
    ("/lodging-travel/", ["Charming inn near downtown Santa Fe"], ["near the downtown expo and packet pickup"]),
    ("/health-and-wellness-expo/", ["Cancelled. Packet pickup moved to the Running Hub", "Packet pickup closes (the Running Hub)",
                                    "Tricia Downing talk: adaptive sports, perseverance &amp; accessibility (the Running Hub)"],
                                   ["Expo Re-Opens", "Expo Closes<"]),
    ("/course-map/", ["packet pickup has moved to <strong>the Running Hub, 1100 Don Diego Ave, Suite B</strong>"],
                     ["still downtown at the Railyard"]),
]
ok = True
for url, must, gone in CHECKS:
    full = url if url.startswith("http") else "https://santafehalfmarathon.com" + url
    resp = urllib.request.urlopen(urllib.request.Request(full, headers={"User-Agent": UA}), timeout=90)
    html = resp.read().decode("utf-8", "replace")
    res = []
    for s in must:
        good = s in html; ok &= good; res.append(("PASS" if good else "FAIL") + " has  " + s[:60])
    for s in gone:
        good = s not in html; ok &= good; res.append(("PASS" if good else "FAIL") + " gone " + s[:60])
    print(f"\n{full}  [{resp.status}, {resp.headers.get('WPO-Cache-Status')}]")
    for r in res:
        print("   " + r)
    if url == "/":
        n = 0
        for attrs, body in re.findall(r"<script\b([^>]*)>([\s\S]*?)</script>", html):
            if "ld+json" in attrs or not body.strip() or re.search(r"type=[\"'](?!text/javascript|module)", attrs):
                continue
            fd, p = tempfile.mkstemp(suffix=".js"); os.close(fd)
            open(p, "w", encoding="utf-8").write(body)
            rr = subprocess.run(["node", "--check", p], capture_output=True, text=True); os.remove(p); n += 1
            if rr.returncode:
                ok = False; print("   FAIL served script does not parse:", rr.stderr[:300])
        print(f"   node --check: {n} served inline scripts")
        m = re.search(r'regClosed:"([^"]*)"', html)
        print("   served regClosed (EN):", m.group(1) if m else "(not found)")
    time.sleep(1.2)
print("\nALL PASS" if ok else "\n*** FAILURES ABOVE ***")
sys.exit(0 if ok else 1)
