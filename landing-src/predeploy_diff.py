"""What would a homepage deploy ACTUALLY change? Diff the fresh build against what is live.

Written because the canonical source changed underneath this session: every md5 check today
read 3194e8f1..., then a fix script reported df5f05ed... as its starting point with nothing of
this session's in between. The ledger warns that a parallel session merges into landing-src
between rebuilds. Deploying blind would publish their unreviewed changes along with ours.

Method: pull every user-facing string literal out of the live page's inline bundle and out of
the freshly built artifact, then diff the two sets. Minification keeps string literals intact,
so copy changes show up exactly; code-only changes do not, and are reported by byte size.

Read-only. Never writes to WordPress.
"""
import io, json, re, base64, urllib.request

ENV = r"C:\Users\info\mcp-server\.env"
BASE = "https://santafehalfmarathon.com"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36")

env = {}
for line in open(ENV, encoding="utf-8-sig"):
    line = line.strip()
    if line and not line.startswith("#") and "=" in line:
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
AUTH = "Basic " + base64.b64encode(f"{env['WP_USER']}:{env['WP_APP_PASSWORD']}".encode()).decode()


def call(path):
    r = urllib.request.Request(BASE + path)
    r.add_header("Authorization", AUTH)
    r.add_header("User-Agent", UA)
    return json.loads(urllib.request.urlopen(r, timeout=90).read().decode())


# resolve the front page by SLUG -- its id churns on every deploy
pages = call("/wp-json/wp/v2/pages?slug=run-santa-fe-2026&status=publish&context=edit"
             "&_fields=id,modified,content")
if len(pages) != 1:
    raise SystemExit(f"expected 1 front page, found {len(pages)}")
live = pages[0]
live_raw = live["content"]["raw"]
fresh = io.open("run-santa-fe-2026.prod.src.html", encoding="utf-8").read()
print(f"live front page id {live['id']}  modified {live['modified']}  {len(live_raw):,} chars")
print(f"fresh artifact                              {len(fresh):,} chars\n")


def bundle(html):
    """The big inline app script (not the React CDN tags, not JSON-LD)."""
    scripts = re.findall(r"<script>([\s\S]*?)</script>", html)
    return max(scripts, key=len) if scripts else ""


def strings(js):
    out = set()
    for m in re.finditer(r'"((?:[^"\\]|\\.){18,})"', js):
        v = m.group(1)
        try:
            v = json.loads('"' + v + '"')
        except Exception:
            pass
        if re.search(r"[A-Za-z]{3,} [A-Za-z]{2,}", v) and not v.startswith(("http", "data:")):
            out.add(v.strip())
    return out


lb, fb = bundle(live_raw), bundle(fresh)
ls, fs = strings(lb), strings(fb)
gone, added = sorted(ls - fs), sorted(fs - ls)

print(f"live bundle {len(lb):,} bytes  |  fresh bundle {len(fb):,} bytes  "
      f"({len(fb)-len(lb):+,})\n")
print("=" * 78)
print(f"COPY THAT WOULD DISAPPEAR FROM THE LIVE SITE  ({len(gone)})")
print("=" * 78)
for g in gone:
    print("  -", g[:180])
print()
print("=" * 78)
print(f"COPY THAT WOULD APPEAR ON THE LIVE SITE  ({len(added)})")
print("=" * 78)
for a in added:
    print("  +", a[:180])
