# Template 2365 Nav Migration Playbook

**Status: the two-tier header migration described here is ALREADY DEPLOYED (2026-09-10).**
This document records the method that was used, so it can be repeated, audited, or reversed.

Live verification, 2026-09-10:

| Check | Result |
|---|---|
| Two-tier ribbon (`#sitenavRibbon`) | live |
| IA v4 tracks (The Races / Runner Info / Experience Santa Fe) | live |
| Store disabled "Soon" chip | live |
| 4th-column Visual CTA card (`.mega-ctacard`) | live |
| IA v3 top-level triggers (Event Info / Race Weekend) | removed by design |
| `data-es` attributes in served HTML | 95 |
| AA-safe `#AD4A2E` | 6 uses |

---

## PART 1 - Extracting the current widget's hooks

The nav does **not** live in an Elementor header template. Hello Elementor's header
location never renders on this install, so the widget lives in **footer template 2365**
and relocates itself to the top of `<body>` on load. Everything below assumes that.

### 1.1 Pull the widget out intact

```python
import json, base64, urllib.request

env = {}
for line in open(r"C:\Users\info\mcp-server\.env"):
    if "=" in line and not line.startswith("#"):
        k, v = line.strip().split("=", 1); env[k] = v
auth = base64.b64encode(f"{env['WP_USER']}:{env['WP_APP_PASSWORD']}".encode()).decode()

r = urllib.request.Request(
    env["WP_URL"].rstrip("/") + "/wp-json/santafe/v1/elementor/2365",
    headers={"Authorization": "Basic " + auth, "User-Agent": "Mozilla/5.0 sfhm"})
j = json.loads(urllib.request.urlopen(r, timeout=30).read().decode())
raw = j["data"] if isinstance(j["data"], str) else json.dumps(j["data"])

# ALWAYS write both backups before touching anything
open("backups/template-2365-pre-change.json", "w", encoding="utf-8").write(raw)
widget = json.loads(raw)[0]["elements"][0]["settings"]["html"]
open("backups/navwidget-pre-change.html", "w", encoding="utf-8").write(widget)
```

### 1.2 Reuse existing fragments rather than retyping them

This is the core of the zero-translation-loss guarantee. Never retype a link; **cut the
existing one out of the old widget and paste it into the new structure**, so its
`data-en` / `data-es` pair, entities, and href travel together as one unit.

```python
def cut(w, start, end, include_end=True, frm=0):
    """Slice a verbatim fragment out of the old widget HTML."""
    i = w.find(start, frm); assert i >= 0, "start not found: " + start[:60]
    j = w.find(end, i + len(start)); assert j >= 0, "end not found: " + end[:60]
    return w[i:j + (len(end) if include_end else 0)]

BRAND   = cut(w, '<a class="brand"', '</a>')
LANG    = cut(w, '<div class="lang-toggle"', '</div>')
BURGER  = cut(w, '<button class="hamburger"', '</button>')
MAPS    = cut(w, '<div class="mega-col"><h3 data-en="Maps', '</a></div>')
TRAVEL  = cut(w, '<div class="mega-col"><h3 data-en="Travel', '</a></div>')
RULES   = cut(w, '<div class="mega-col"><h3 data-en="Rules', '</a></div>')
UTIL    = cut(w, '<div class="mega-util">', '</a></div>')
CARD    = cut(w, '<div class="mega-col mega-ctacard">', '</a></div>')
```

Machinery that must survive untouched:

- The `<script>` block (relocation to top of body, language toggle, mega click-toggle,
  `aria-controls` wiring, a11y landmark and contrast passes)
- Class contracts: `#sitenav-wrap`, `.nav`, `.nav-item.has-mega`, `.nav-trigger`,
  `.mega`, `.mega-inner`, `.mega-cols`, `.mega-col`, `.mega-x`, `.mx-name`, `.mx-desc`,
  `.mega-util`, `.lang-toggle`, `.lang-btn`, `#sitenavMobile`, `.m-group`, `.m-sub`,
  `.m-desc`, `.m-cta`
- `body:not(.home){padding-top:NNNpx}` must match the real rendered header height
- The language toggle binds by class, so moving `.lang-toggle` into the ribbon needed
  no JS change at all

### 1.3 Guards that must pass before writing

```python
import re
hrefs_before = set(re.findall(r'href="([^"]+)"', w))
hrefs_after  = set(re.findall(r'href="([^"]+)"', new))
lost = hrefs_before - hrefs_after
assert not lost, "LOST LINKS: " + str(lost)                       # zero page drops
assert w[w.find('<script'):] in new, "script block changed!"      # machinery intact
assert new.count('data-es=') >= w.count('data-es='), "lost translations"
for tag in ("div", "a", "button", "nav", "span"):                  # per-tag balance
    assert (w.count("<"+tag) - w.count("</"+tag)) == (new.count("<"+tag) - new.count("</"+tag)), tag
```

**Do not** use a naive `count('<') == count('>')` balance check on this widget - the CSS
contains child combinators, so that assertion always fails. Per-tag deltas are correct.

---

## PART 2 - The migrated template code

### 2.1 IMPORTANT: architecture conflict in the request

The brief asks for **IA v3's five root tracks** (Register / Event Info / Race Weekend /
Stories / Volunteer) while also asking for **IA v4 components** (Store "Soon" chip,
magnifier, 4th-column CTA card). Those belong to two different generations of the nav:

- **IA v3** shipped 2026-09-08. Five tracks, no ribbon, no Store, no magnifier.
- **IA v4** shipped 2026-09-10 on the "migrate" order and is what is live now. Four
  tracks (The Races / Runner Info / Experience Santa Fe / Store-Soon), two-tier dark
  utility ribbon, Register pill moved right, CTA card in Runner Info.

Deploying the five-track version would **revert** the two-tier migration. Nothing in this
document does that automatically; it requires an explicit decision.

### 2.2 What is deployed (source of truth)

The exact deployed widget is saved verbatim at:

```
backups/navwidget-twotier-DEPLOYED.html
```

Structure, top level:

```html
<div class="sfhm" id="sitenav-wrap">
  <style> ... tokens, nav, mega, ribbon, soon-chip, ctacard ... </style>

  <div class="ribbon" id="sitenavRibbon">          <!-- TIER 1 -->
    <div class="ribbon-in">
      <div class="lang-toggle">EN | ES</div>        <!-- reused fragment -->
      <nav class="ribbon-util" aria-label="Account">
        <a href="https://runsignup.com/Login" data-en="Sign In" data-es="Iniciar sesi&oacute;n">Sign In</a>
        <a href="..." data-en="Create Account" data-es="Crear cuenta">Create Account</a>
        <a href="/contact-us/" data-en="Help" data-es="Ayuda">Help</a>
      </nav>
    </div>
  </div>

  <header class="nav" id="sitenav">                 <!-- TIER 2 -->
    <a class="brand" href="/"> ... </a>             <!-- reused fragment -->
    <nav class="nav-links" id="sitenavLinks" aria-label="Main">
      <div class="nav-item has-mega"> The Races          -> mega: strip + Maps + Rules + Race Day </div>
      <div class="nav-item has-mega"> Runner Info        -> mega-has-cta: Logistics + Travel + Schedule + CARD + util </div>
      <div class="nav-item has-mega"> Experience Santa Fe-> mega-two: Experience + Community </div>
      <div class="nav-item"><span class="nav-soon">Store<span class="soon-chip">Soon</span></span></div>
    </nav>
    <div class="nav-right">
      <a class="nav-cta" href="...runsignup...">Register</a>
      <button class="hamburger" ...>                <!-- reused fragment -->
    </div>
  </header>

  <nav id="sitenavMobile"> ... 4 m-groups mirroring the tracks + m-cta ... </nav>

  <script> ... untouched machinery ... </script>
</div>
```

### 2.3 Key CSS (deployed)

```css
/* SFHM-TWOTIER */
#sitenav-wrap .ribbon{position:fixed;top:0;left:0;right:0;z-index:9991;background:#222222;color:rgba(251,249,246,.85)}
#sitenav-wrap .ribbon-in{max-width:var(--maxw);margin:0 auto;padding:0 var(--pad);display:flex;
  justify-content:space-between;align-items:center;gap:16px;font-size:11px;font-weight:600;
  letter-spacing:.08em;text-transform:uppercase;height:31px}
#sitenav-wrap .ribbon .lang-btn{min-height:0;min-width:0;height:auto;padding:2px 8px;font-size:11px;line-height:1.4}
#sitenav-wrap .nav{top:31px}
body:not(.home){padding-top:122px}

#sitenav-wrap .nav-soon{color:var(--ink-2);opacity:.5;display:inline-flex;align-items:center;
  gap:6px;padding:6px 0;white-space:nowrap;cursor:default}
#sitenav-wrap .soon-chip{font-size:9px;letter-spacing:.12em;border:1px solid var(--line);
  border-radius:999px;padding:2px 7px;text-transform:uppercase}

/* SFHM-CTA-CARD v2 */
#sitenav-wrap .mega-has-cta{grid-template-columns:repeat(4,minmax(0,1fr));gap:1.5rem;align-items:start;padding:1.5rem}
#sitenav-wrap .mega-ctacard{display:flex;flex-direction:column;background:#fcfbfa;padding:1rem;
  border-radius:6px;border:1px solid #eae6e1}
#sitenav-wrap .mega-ctacard img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:4px;margin-bottom:.75rem}
#sitenav-wrap .mcc-btn{display:block;margin-top:auto;text-align:center;background:#AD4A2E;color:#fff;
  font-weight:700;text-transform:uppercase;font-size:.85rem;letter-spacing:.05em;padding:.6rem 1rem;border-radius:4px}
#sitenav-wrap .mcc-btn:hover,#sitenav-wrap .mcc-btn:focus-visible{background:#8C3A24;transform:translateY(-1px)}
@media (max-width:1100px){#sitenav-wrap .mega-has-cta{grid-template-columns:repeat(3,1fr)}
  #sitenav-wrap .mega-ctacard{display:none}}
```

Color rule, non-negotiable: `#C2593F` is for **borders, accents and large display type only**.
White text on it measures 4.38:1 and fails WCAG AA. Every fill behind small text or a CTA
label uses **`#AD4A2E`** (about 5.5:1), hover **`#8C3A24`**.

### 2.4 Magnifier - ASCII-safe pattern (NOT deployed, see note)

Elementor's HTML widget truncates scripts containing raw `<` or `>`. That rules out arrow
functions (`=>` contains `>`), comparison operators, and template literals building markup.
The compliant pattern:

```js
(function(){
  var btn=document.getElementById("sfhm-ask-trigger");
  var target=document.getElementById("mock-search-target");
  if(!btn||!target)return;
  btn.addEventListener("click",function(){
    var reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({behavior:reduced?"auto":"smooth",block:"center"});
    var field=target.querySelector("input");
    if(field)field.focus({preventScroll:true});
  });
})();
```

Rules for any script in this widget: `function` keywords only (no `=>`), `Math.sign(a-b)`
instead of comparison operators, `createElement` + `textContent` instead of `innerHTML`,
and `promise["catch"](fn)` rather than `.catch(fn)` if a minifier is in play. Verify with
`assert "<" not in SCRIPT and ">" not in SCRIPT` before writing.

**Why it is not deployed:** `#mock-search-target` does not exist on any inner page, so the
magnifier would be a dead control. The working Race Concierge lives on the homepage
(React). Porting it to 2365 means rewriting the modal in this ASCII dialect - a real task,
not a paste.

---

## PART 3 - Rollback (three steps, about 60 seconds)

### Step 1 - Restore the previous `_elementor_data`

```python
raw = open("backups/template-2365-pre-twotier-2026-09-10.json", encoding="utf-8").read()
json.loads(raw)  # must parse before sending
req(BASE + "/wp-json/santafe/v1/elementor/2365", json.dumps({"data": raw}).encode())
```

Alternative with no script: call `wp_restore_elementor_data` on post **2365** through the
bridge, which reverts to the automatic pre-write backup.

### Step 2 - Purge both cache layers

```
wp_purge_cache targets: ["elementor_files", "wpo_cache"]
```

Elementor CSS regeneration and the WP-Optimize page cache are separate layers; skipping
either shows a stale header and fakes a failed rollback. In the WP-Optimize UI use the
plain **Purge cache** button - "Purge cache for all pages" silently does nothing.

### Step 3 - Verify logged out, not as admin

```bash
curl -s -A "Mozilla/5.0 ... Chrome/128" "https://santafehalfmarathon.com/event-schedule/?rb=1" -o check.html
grep -c 'sitenavRibbon' check.html      # 0 after a successful rollback
grep -o 'data-es=' check.html | wc -l   # must still be 95
```

Admins bypass page cache, so an admin view proves nothing. Confirm the `WPO-Cache-Status`
header and count `data-es` to prove translations survived the round trip.

### Critical caveat

Writes to 2365 can **report success without persisting**. Always re-read the widget after
writing and assert your marker string is present. Treat a write as unconfirmed until the
read-back passes.

---

## Backup inventory (2026-09-10)

| File | Contents |
|---|---|
| `backups/template-2365-pre-twotier-2026-09-10.json` | full data, pre two-tier migration |
| `backups/navwidget-pre-twotier.html` | widget HTML, pre migration |
| `backups/navwidget-twotier-DEPLOYED.html` | widget HTML, as deployed |
| `backups/template-2365-pre-ctacard-2026-09-10.json` | pre CTA-card insert |
| `backups/template-2365-pre-ctacss2-2026-09-10.json` | pre CTA-card v2 CSS |
| `backups/template-2365-pre-mobilelinks-2026-09-10.json` | pre mobile-drawer link parity |
| `backups/template-2365-pre-rebrand-2026-09-10-105932.json` | pre color rebrand |
| `backups/page-1601-pre-podium-2026-09-10.json` | Results page, pre podium widget |
