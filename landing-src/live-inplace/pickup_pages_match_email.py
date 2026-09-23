r"""Kosgei 9/19: "match the website to the email". The participant email (RunSignup #4361713, sent 9/19) says:
  * packet pickup is at the Santa Fe Running Hub, 1100 Don Diego Ave # B -- Friday 12-6, Saturday 10-5
  * "Do NOT go to Warehouse 21 or the Railyard -- nothing is happening there"; the expo is cancelled
  * "Half Marathon and 3-Amigos Relay runners can still collect race morning, 6:00-7:00 AM at Romero's Park.
     5K runners, please pick up Friday or Saturday at the Running Hub."
This fixes the inner pages that still said otherwise (the shared course banner was fixed by
banner_pickup_moved.py; the homepage is edited in place by a separate script). Nothing here adds a fact
the email or an existing Kosgei ruling does not carry. RWAIK collection (4493) and the dated press
release (4505) are deliberately NOT touched -- those need Kosgei.

Every edit is an exact single-occurrence replacement in the layer the page RENDERS from. Per page: all
old strings exactly once and no new string already present, JSON parses before/after (Elementor), write,
read back, must be identical -- else the original is written back and the run STOPS. Paced for HostGator.
usage: python pickup_pages_match_email.py [--commit]
"""
import json, base64, urllib.request, urllib.error, sys, time

COMMIT = "--commit" in sys.argv

PAGES = [
    # ---------------- race-morning pickup (the explicit ask) ----------------
    (1261, "elementor", None, "/packet-pickup/", [
        ("intro: out-of-town paragraph",
         r'<p><strong>Traveling from out of town</strong> and can’t make either pickup window? <a href=\"https://www.facebook.com/RunSantaFe\" target=\"_blank\">message us on Facebook</a> to arrange race-morning pickup at <strong>Romero’s Park in Agua Fría</strong> (the start line) between <strong>6:00 and 7:00 AM</strong>.</p>',
         r'<p><strong>Race-morning pickup:</strong> Half Marathon and 3-Amigos Relay runners can also pick up on race morning at <strong>Romero’s Park in Agua Fría</strong> (the start line) between <strong>6:00 and 7:00 AM</strong>. 5K runners, please pick up at the Running Hub.</p>'),
        ("card badge", r'>BY ARRANGEMENT</div>', r'>HALF &amp; RELAY</div>'),
        ("card audience",
         r'<div class=\"sfhm-schedule-audience\"> Out-of-Town Runners Only</div>',
         r'<div class=\"sfhm-schedule-audience\"> Half Marathon &amp; 3-Amigos Relay</div>'),
        ("card note",
         r'<p class=\"sfhm-schedule-note\">Traveling from out of town and can’t make Friday or Saturday? <a href=\"https://www.facebook.com/RunSantaFe\" target=\"_blank\">message us on Facebook</a> to arrange pickup at Romero’s Park in Agua Fría (the start line). Roads into the start close at 7:00 AM.</p>',
         r'<p class=\"sfhm-schedule-note\">Pick up at Romero’s Park in Agua Fría (the start line). 5K runners pick up at the Running Hub. Roads into the start close at 7:00 AM.</p>'),
        ("getting-there line",
         r'Out-of-town runners who can’t make either window: <a href=\"https://www.facebook.com/RunSantaFe\" target=\"_blank\">message us on Facebook</a> to arrange race-morning pickup at Romero’s Park, 6:00–7:00 AM.',
         r'Half Marathon and 3-Amigos Relay runners can also pick up race morning at Romero’s Park, 6:00–7:00 AM. 5K runners pick up here.'),
    ]),
    (1185, "elementor", None, "/event-schedule/", [
        ("race-day 6:00 line",
         r'<li><strong>6:00 AM:</strong> Venue opens &middot; gear bag drop open (Half &amp; Relay); pre-arranged packet pickup for out-of-town runners</li>',
         r'<li><strong>6:00 AM:</strong> Venue opens &middot; gear bag drop and race-morning packet pickup open (Half &amp; Relay)</li>'),
        ("pro tip",
         r'Pickup closes at 5:00 PM Saturday. Traveling from out of town and can’t make Friday or Saturday? Message us on Facebook to arrange race-morning pickup at Romero’s Park, 6:00–7:00 AM.</p>',
         r'Pickup closes at 5:00 PM Saturday. Half Marathon and 3-Amigos Relay runners can also pick up race morning at Romero’s Park, 6:00–7:00 AM; 5K runners pick up at the Running Hub.</p>'),
        ("bag drop paragraph",
         r'Bag drop runs 6:00 to 7:00, along with pre-arranged packet pickup for out-of-town runners — and the roads',
         r'Bag drop runs 6:00 to 7:00, along with race-morning packet pickup for Half and Relay runners — and the roads'),
    ]),
    # ---------------- pages still routing people to Warehouse 21 / the Railyard ----------------
    (4857, "content", "pages", "/host-city-guide/", [
        ("race week in town",
         '<p>Packet pickup and the expo run <strong>Friday 12&ndash;6 PM and Saturday 10 AM&ndash;5 PM at Warehouse 21</strong> in the Railyard district &mdash; details on the <a href="/packet-pickup/">Packet Pickup</a> page.',
         '<p>Packet pickup runs <strong>Friday 12&ndash;6 PM and Saturday 10 AM&ndash;5 PM at the Running Hub, 1100 Don Diego Ave, Suite B</strong>. The Health &amp; Wellness Expo is cancelled &mdash; details on the <a href="/packet-pickup/">Packet Pickup</a> page.'),
    ]),
    (2370, "elementor", None, "/volunteer/", [
        ("pickup role card",
         r'<p>Help runners collect their bibs, shirts, and race packets at the Health &amp; Wellness Expo at Warehouse 21.</p>',
         r'<p>Help runners collect their bibs, shirts, and race packets at the Running Hub, 1100 Don Diego Ave, Suite B.</p>'),
        ("roles intro", r'with expo shifts on September 18–19', r'with packet-pickup shifts on September 18–19'),
        ("key dates",
         r'<li><strong>Sept 18–19, 2026</strong> &mdash; Health &amp; Wellness Expo &amp; Packet Pickup (Warehouse 21, Railyard)</li>',
         r'<li><strong>Sept 18–19, 2026</strong> &mdash; Packet Pickup at the Running Hub, 1100 Don Diego Ave, Suite B (the Health &amp; Wellness Expo is cancelled)</li>'),
        ("expo role card",
         r'<h3>Health &amp; Wellness Expo</h3><p>Assist vendors, guide attendees, and help host the cultural demonstrations. (The Kids Indigo T-Shirt Workshop is a separate event at Reunity Resources.)</p><span class=\"vol-role-time\">Sept 18–19 &middot; All day</span>',
         r'<h3>Health &amp; Wellness Expo (cancelled)</h3><p>The expo is cancelled so the City of Santa Fe can use the space for temporary emergency shelter. (The Kids Indigo T-Shirt Workshop was a separate event at Reunity Resources.)</p><span class=\"vol-role-time\">Sept 18–19 &middot; Cancelled</span>'),
    ]),
    (4181, "content", "posts", "/race-weekend-guide-2026/", [
        ("friday-saturday section",
         '<h2>Friday &amp; Saturday, September 18&ndash;19 &mdash; Expo and packet pickup</h2><p>The <a href="/health-and-wellness-expo/">Capitol Ford Health &amp; Wellness Expo</a> runs both days at the Railyard, and this part of the weekend has not moved. Come grab your <a href="/packet-pickup/">packet</a> &mdash; bib, chip, shirt &mdash; browse the vendors, and soak up some pre-race energy. Picking up',
         '<h2>Friday &amp; Saturday, September 18&ndash;19 &mdash; Packet pickup at the Running Hub</h2><p><strong>This part of the weekend changed.</strong> The <a href="/health-and-wellness-expo/">Capitol Ford Health &amp; Wellness Expo</a> is cancelled so the City of Santa Fe can use the Railyard space for temporary emergency shelter. Do not go to Warehouse 21 or the Railyard. Grab your <a href="/packet-pickup/">packet</a> &mdash; bib, chip, shirt &mdash; at <strong>the Running Hub, 1100 Don Diego Ave, Suite B</strong>: Friday 12&ndash;6 PM and Saturday 10 AM&ndash;5 PM. Half Marathon and 3-Amigos Relay runners can also pick up race morning, 6:00&ndash;7:00 AM at Romero&rsquo;s Park; 5K runners pick up at the Running Hub. Picking up'),
        ("railyard walking guide: heading + intro removed, widget hidden",
         '<h3>The walk from the garage to your bib</h3><p>Picking up at the Railyard? Here is the whole walk &mdash; five checkpoints from the parking garage to the expo floor. Tap through it once now and race week runs itself.</p><style> #sfhm-trail{',
         '<style> #sfhm-trail{display:none !important;'),
        ("lodging line",
         'has host hotels and Railyard-area options &mdash; ideal for the expo and packet pickup, with the start line',
         'has host hotels and Railyard-area options, with the start line'),
    ]),
    (4484, "content", "pages", "/new-mexican-subscribers/", [
        ("notice", 'Packet pickup is still downtown at the Railyard.',
         'Packet pickup has moved to the Running Hub, 1100 Don Diego Ave, Suite B; the Health &amp; Wellness Expo is cancelled.'),
        ("friday", '<p>Health &amp; Wellness Expo and packet pickup, downtown at the Railyard. Meet the vendors, grab your bib.</p>',
         '<p>Packet pickup at the Running Hub, 1100 Don Diego Ave, Suite B, 12&ndash;6&nbsp;PM. The Health &amp; Wellness Expo is cancelled.</p>'),
        ("saturday", '<p>Second packet-pickup day at the Railyard, 10&nbsp;AM&ndash;5&nbsp;PM.</p>',
         '<p>Second packet-pickup day at the Running Hub, 10&nbsp;AM&ndash;5&nbsp;PM.</p>'),
    ]),
    (1256, "elementor", None, "/relays-exchange-zones/", [
        ("sash pickup",
         r"with the team packet - at the Railyard expo on Friday or Saturday, or at race-morning pickup",
         r"with the team packet - at packet pickup at the Running Hub on Friday or Saturday, or at race-morning pickup"),
    ]),
    (1606, "elementor", None, "/lodging-travel/", [
        ("Guadalupe Inn tagline",
         r'<p class=\"sfhm-hotel-tagline\">Charming inn near the downtown expo and packet pickup</p>',
         r'<p class=\"sfhm-hotel-tagline\">Charming inn near downtown Santa Fe</p>'),
    ]),
    (871, "elementor", None, "/health-and-wellness-expo/", [
        ("fri 12 row", r'<span data-path-to-node=\"25,1,1,0\">Doors Open: Packet Pickup &amp; Vendor Village</span>',
         r'<span data-path-to-node=\"25,1,1,0\">Cancelled. Packet pickup moved to the Running Hub, 1100 Don Diego Ave, Suite B</span>'),
        ("sat 10 row", r'<span data-path-to-node=\"25,3,1,0\">Expo Re-Opens: Health Screenings &amp; Product Demos</span>',
         r'<span data-path-to-node=\"25,3,1,0\">Cancelled. Packet pickup at the Running Hub, 10 AM–5 PM</span>'),
        ("sat 1 row", r'<b data-path-to-node=\"25,4,1,0\" data-index-in-node=\"0\">\"Catalyst for Change\" Panel:</b> Adaptive Sports &amp; Global Wellness',
         r'Tricia Downing talk: adaptive sports, perseverance &amp; accessibility (the Running Hub)'),
        ("sat 5 row", r'<span data-path-to-node=\"25,5,1,0\">Expo Closes</span>',
         r'<span data-path-to-node=\"25,5,1,0\">Packet pickup closes (the Running Hub)</span>'),
    ]),
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


def read(pid, layer, kind):
    if layer == "elementor":
        return call("GET", f"/wp-json/santafe/v1/elementor/{pid}")["data"]
    return call("GET", f"/wp-json/wp/v2/{kind}/{pid}?context=edit&_fields=id,content")["content"]["raw"]


def write(pid, layer, kind, text):
    if layer == "elementor":
        call("POST", f"/wp-json/santafe/v1/elementor/{pid}", {"data": text})
    else:
        call("POST", f"/wp-json/wp/v2/{kind}/{pid}", {"content": text})


for pid, layer, kind, url, edits in PAGES:
    old_text = read(pid, layer, kind)
    if layer == "elementor":
        json.loads(old_text)
    new_text = old_text
    for label, old, rep in edits:
        n = old_text.count(old)
        if n != 1 or rep in old_text:
            sys.exit(f"FATAL {pid} {url} [{label}]: old x{n}, new already present={rep in old_text}; stopping")
        new_text = new_text.replace(old, rep)
    if layer == "elementor":
        json.loads(new_text)
    assert len(new_text) - len(old_text) == sum(len(r) - len(o) for _, o, r in edits), f"{pid} delta"
    if COMMIT:
        write(pid, layer, kind, new_text)
        back = read(pid, layer, kind)
        if back != new_text:
            write(pid, layer, kind, old_text)
            sys.exit(f"FATAL {pid} {url}: read-back differs -- original written back; stopping")
        time.sleep(1.5)
    print(f"  {'WROTE' if COMMIT else 'ok   '} {pid} {url:28s} {len(edits)} edit(s): " + "; ".join(l for l, _, _ in edits))
    time.sleep(0.6)
print("\nCOMMITTED" if COMMIT else "\nDRY RUN OK")
