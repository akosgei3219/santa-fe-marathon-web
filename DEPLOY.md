# Deploying the Dark Theme (`index-dark.html`)

This is the "premium dark" homepage. It's **self-contained** — all CSS and JS
are inline in the file. The only external thing it needs is the **`images/`
folder** (it uses photos from `images/web/`).

> Note: this is a **standalone HTML page**, separate from your WordPress site
> (santafehalfmarathon.com runs WordPress + Elementor). Going live with this
> means hosting it as a static page — it does not "drop into" WordPress like the
> small Custom HTML blocks did.

---

## What to publish
Just two things:
1. **`index-dark.html`** — rename it to **`index.html`** on the host so it's the default page.
2. **The `images/` folder** (keep the same relative path — the page points at `images/web/...`).

Everything else in this project (the warm theme, WordPress blocks, captions, etc.) is **not** needed for the dark site.

---

## Easiest way to go live (pick one)

**Option A — Netlify Drop (fastest, free, ~2 min)**
1. Make a folder containing `index.html` (your renamed `index-dark.html`) + the `images/` folder.
2. Go to **app.netlify.com/drop** and drag that folder in.
3. You get a live URL instantly. Point your domain at it later if you want.

**Option B — Vercel / Cloudflare Pages / GitHub Pages**
- Same idea: upload the folder (`index.html` + `images/`). All three host static sites free.

**Option C — Your existing web host (cPanel / FTP)**
- Upload `index.html` + `images/` to a subfolder (e.g. `/2026/`) so it doesn't overwrite your current WordPress site, then link to it.

---

## ✅ Finish these BEFORE a public launch
The page works now, but several spots are placeholders:

- [x] **Course map** — official map added as `images/web/course-map.jpg` (rendered from SFCFM.pdf). Frame + download link active.
- [ ] **Hero photo** — save your landscape race photo as `images/web/hero.jpg` (overwrites the current placeholder).
- [ ] **Coach photo** — optional: `images/web/coach.jpg` to replace the "CK" avatar.
- [ ] **Sponsor logos** — the gold/silver boxes are text placeholders; drop in real logos.
- [ ] **Story stats** — "40+ years" and "2,500 finishers" are *inferred* — replace with your real numbers.
- [ ] **Newsletter form** — it's front-end only; wire it to Mailchimp/Brevo or remove it.
- [ ] **Pick one theme** — you have warm (`index.html`) + dark (`index-dark.html`). Choose one for production.
- [x] **Confirm facts** — done 2026-09-22 against CLAUDE.md canon. Start is Romero’s Park, Agua Fría;
      finish Reunity Resources Farm, 1829 San Ysidro Crossing; the old “4K Fitness” is the Santa Fe 5K
      (8:00 AM); Kids 1K Dash is Sunday 9:00–10:00 AM at Reunity, ages 3–12; the expo is CANCELLED and
      packet pickup is the Santa Fe Running Hub, 1100 Don Diego Ave # B; registration is SOLD OUT/closed.
- [x] **Repurposed as a post-race page** — done 2026-09-22. Hero, coach note, kids and pickup
      sections read in past tense; the countdown now targets 2027 race weekend (Sat Sept 18, 2027,
      no gun time asserted because none is published); every registration CTA now links to the 2026
      results at /race-information/results-photos/. Title and social meta point at Sept 18–19, 2027.

---

## Verified & ready
- Registration CTAs now link to the 2026 results page. The JSON-LD still records the 2026 event
  accurately (real dates, all four offers SoldOut).
- Responsive (mobile nav, stacking grids), working countdown, sticky header
- Real race photos wired (welcome, kids, sponsors, hero placeholder)
- Sections: header → welcome → races → course → expo → kids → plan → sponsors → story → footer
