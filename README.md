# Santa Fe Marathon — Homepage Components

React + Tailwind CSS components for the marathon homepage. Drop them into a
React project (Vite, Next.js, or a WordPress block/theme that supports React)
and make sure Tailwind CSS is active.

## Files

| File | What it is |
|------|------------|
| `App.jsx` | Homepage preview. Stacks the banner, hero, and countdown. Render `<App />` to see the whole page. |
| `hero.jsx` | Welcome banner — stone/amber/teal Southwestern palette. |
| `timer.jsx` | Live countdown to race day: **Sunday, September 20, 2026, 7:00 AM Mountain**. |
| `urgency-banner.jsx` | July referral promo. Red/white/blue theme, live countdown, tiered referral links. Auto-hides after July 31, 2026. |

## ⚠️ Before you go live — replace these placeholders

All placeholders live at the **top of `urgency-banner.jsx`**:

```js
const RACE_ID = "YOUR_RACE_ID";           // ← your numeric RunSignup race ID
const REFERRAL_CODE = "YOUR_REFERRAL_CODE"; // ← your referral / ambassador code
```

Once both are set, the three tier buttons build their links automatically:

```
https://runsignup.com/Race/Register/?raceId=<RACE_ID>&referralCode=<REFERRAL_CODE>
    &utm_source=referral_banner&utm_medium=web
    &utm_campaign=july_referral_2026&utm_content=<tier>
```

`utm_content` is set per button so you can tell tiers apart in analytics:

| Button | Saving | `utm_content` |
|--------|--------|---------------|
| Relay  | $25    | `relay` |
| Half   | $15    | `half`  |
| 4K     | $7     | `4k`    |

### Double-check with RunSignup

- **Referral parameter name.** The code uses `referralCode=`. RunSignup's
  ambassador/referral program may use a different key or a `/Refer` path.
  Grab one real referral link from your RunSignup dashboard and confirm the
  format matches, or the attribution may not register.
- **Register vs. landing page.** Links point at `/Race/Register/`. Change to
  the race landing page path if you'd rather send people there first.

## Dates baked into the code

- **Race day countdown (`timer.jsx`):** Sep 20, 2026, 07:00 MT.
- **Referral promo expiry (`urgency-banner.jsx`):** July 31, 2026, 23:59:59 —
  the banner returns `null` and disappears on its own after that.

## Preview locally

1. `npm create vite@latest sfm -- --template react`
2. Copy these four files into `src/`.
3. Add Tailwind (https://tailwindcss.com/docs/guides/vite).
4. Import and render `App` in `main.jsx`, then `npm run dev`.

## Referral setup (RunSignup) — ONE step left

Referral **reward tiers** are already correct in `urgency-banner.jsx`:
3-Amigos Relay **$25** · Half Marathon **$15** · 4K Fitness **$7**.

What's still needed is the actual RunSignup referral **link/code format** so the
click actually attributes. RunSignup uses one of a few patterns — we need to see
the real one from your dashboard:

- `https://runsignup.com/Race/83604/Referral/XXXXXX`  (path style), or
- `https://runsignup.com/Race/Register/?raceId=83604&rfsn=XXXXXX`  (param style), or
- `...&referralCode=XXXXXX`

### To finish it
1. In RunSignup: **Race → Promotion → Referral Rewards** (a.k.a. "Refer a Friend").
   Confirm the rewards are set to $25 / $15 / $7.
2. Copy **one real referral link** exactly as RunSignup generates it.
3. Drop that link/code in, then update two places:
   - `urgency-banner.jsx` → `REFERRAL_CODE` + `buildLink()`
   - the site-wide CTA tracking script in the index HTML files
4. Re-run the jsdom link test to confirm the parameter is present on every CTA.

Until the real code is in, `REFERRAL_CODE = "YOUR_REFERRAL_CODE"` stays a
placeholder on purpose — a fake value would silently fail to attribute referrals.

## UPDATE — referral runs through RunSignup Groups/Teams (no code)

There is no referral *code*. The "bring your crew" incentive is handled by
RunSignup **Groups/Teams**: friends register into a team, and the savings apply.
So the links should carry the team's **groupId**, not a referralCode.

The plumbing already supports this — the param name and value are both
configurable in two places:
- `urgency-banner.jsx` → `REFERRAL_PARAM` + `REFERRAL_CODE`
- the CTA tracking `<script>` in the index HTML files → `REFERRAL_PARAM` + `REFERRAL_CODE`

### To turn it on for Groups/Teams
1. In RunSignup: **Race → Groups/Teams**. Open the team you want people to join.
2. Copy its registration link — it contains the group identifier, e.g.
   `https://runsignup.com/Race/Register/?raceId=83604&groupId=123456`.
3. In both files set:
   - `REFERRAL_PARAM = "groupId"`
   - `REFERRAL_CODE  = "123456"`   (the number from that link)
4. Re-run the jsdom link test to confirm `groupId` lands on every CTA.

Until a real team link is pasted in, the placeholder stays and NO group/referral
param ships — links remain clean and valid.

Paste one real Groups/Teams registration link and this is a 2-line change + test.

## Referral passthrough (built + tested) — A + C

The CTA script in all three index files now does two things automatically:

- **A — Groups/Teams param.** `REFERRAL_PARAM` is set to `groupId` (RunSignup
  Groups/Teams). Switch to `ref` if you ever want a plain tag instead.
- **C — incoming passthrough.** A visitor who arrives via a shared link with
  `?ref=CODE` (or `?groupId=CODE`) has that value forwarded onto every RunSignup
  CTA on the page, so the referral rides all the way into registration.

Flow: a runner uses `referral-generator.jsx` to get a link like
`.../?ref=AK-V0HHZ` → they share it → a friend lands on the site → every
Register button now carries `&groupId=AK-V0HHZ` into RunSignup.

Two config knobs (top of the CTA `<script>` in each index file):
- `REFERRAL_PARAM` — `groupId` (default) or `ref`.
- `STATIC_REF` — optional fixed team groupId; placeholder `YOUR_GROUP_ID` = off.

Verified: 8-assertion jsdom test (forwards ?ref and ?groupId, clean when unset,
internal links untouched, malformed input stays URL-safe).

### ⚠️ Reality check on crediting
RunSignup only credits a referral if the forwarded value is something IT
recognizes — i.e. a real **team groupId**. A runner's generated vanity code
(AK-V0HHZ) rides through for YOUR analytics, but RunSignup won't pay a reward on
it unless that value maps to an actual RunSignup Group/Team. To make rewards
fire: either (1) set `STATIC_REF` to a real team groupId, or (2) generate
per-runner teams in RunSignup and share those groupIds. Paste one real team link
and we'll lock it in.
