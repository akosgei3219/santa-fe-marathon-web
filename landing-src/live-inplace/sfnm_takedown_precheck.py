"""READ-ONLY before taking down /new-mexican-subscribers/ (page 4484):
  1. back up the page (content, status, slug, parent, template, meta) to backups/
  2. list Redirection rules (full JSON) -- any rule for this path already? copy the shape of a verified one
  3. list AIOSEO redirects (they fire BEFORE Redirection) -- any for this path?
  4. find internal links to /new-mexican-subscribers/ in every published page/post (both layers), 2365, homepage
"""
import json, base64, urllib.request, urllib.error, time, os

BK = r"C:\Users\info\OneDrive\Desktop\SantaFeMarathonWeb\backups"
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


page = call("GET", "/wp-json/wp/v2/pages/4484?context=edit")
out = os.path.join(BK, "page-4484-new-mexican-subscribers-before-takedown-2026-09-19.json")
json.dump(page, open(out, "w", encoding="utf-8"), ensure_ascii=False)
print(f"1. backup -> {out}\n   id {page['id']} status {page['status']} slug {page['slug']} parent {page['parent']} "
      f"template {page.get('template')!r} link {page['link']} content {len(page['content']['raw'])} chars")

rr = call("GET", "/wp-json/redirection/v1/redirect?per_page=50")
print(f"\n2. Redirection rules: total {rr.get('total')}")
for it in rr.get("items", []):
    print(f"   #{it['id']} {it['url']} -> {it.get('action_data')} code {it.get('action_code')} "
          f"match_type {it.get('match_type')} group {it.get('group_id')} hits {it.get('hits')} "
          f"match_data {json.dumps(it.get('match_data'))}")

try:
    ao = call("POST", "/wp-json/aioseo/v1/redirects/all",
              {"orderBy": "id", "orderDir": "asc", "limit": 50, "offset": 0, "searchTerm": "", "filter": "all", "additionalFilters": {}})
    rows = ao.get("rows") or ao.get("redirects") or []
    print(f"\n3. AIOSEO redirects: {len(rows)} row(s)")
    for row in rows:
        print("   ", {k: row.get(k) for k in ("id", "source_url", "target_url", "type", "enabled", "hits")})
except urllib.error.HTTPError as e:
    print("\n3. AIOSEO redirects: HTTP", e.code)

hits = []
items = []
for kind in ("pages", "posts"):
    items += call("GET", f"/wp-json/wp/v2/{kind}?status=publish&per_page=100&context=edit&_fields=id,slug,content")
items.append({"id": 2365, "slug": "TEMPLATE-2365", "content": {"raw": ""}})
for it in items:
    if it["id"] == 4484:
        continue
    texts = {"post_content": it["content"]["raw"]}
    try:
        el = call("GET", f"/wp-json/santafe/v1/elementor/{it['id']}").get("data") or ""
        if el and el != "[]":
            texts["_elementor_data"] = el
    except Exception:
        pass
    for layer, t in texts.items():
        n = t.count("new-mexican-subscribers")
        if n:
            i = t.find("new-mexican-subscribers")
            hits.append((it["id"], it["slug"], layer, n, t[max(0, i - 160): i + 80]))
    time.sleep(0.9)
print(f"\n4. internal references to new-mexican-subscribers outside 4484: {len(hits)}")
for h in hits:
    print(f"   [{h[0]} {h[1]} / {h[2]}] x{h[3]} ...{h[4]}...")
