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

## Registration links (`urgency-banner.jsx`)

Every tier button links to the **2027** RunSignup race (raceId `89412`). The
2026 race was `83604`; don't reuse it.

```
https://runsignup.com/Race/Register/?raceId=89412
  &utm_source=referral_banner&utm_medium=web
  &utm_campaign=july_referral_2026&utm_content=<tier>
```

`utm_content` is set per button so you can tell tiers apart in analytics:

| Button | Saving | `utm_content` |
|--------|--------|---------------|
| Relay | $25 | `relay` |
| Half | $15 | `half` |
| 4K | $7 | `4k` |

`REFERRAL_CODE` is intentionally left as the placeholder `YOUR_REFERRAL_CODE`.
While it's a placeholder, no referral parameter is added and the links stay
clean. Referrals run through RunSignup Groups/Teams (see below), so fill it in
only with a real team `groupId` when a referral campaign is live.

## Dates baked into the code

- **Race day countdown (`timer.jsx`):** Sep 20, 2026, 07:00 MT.
- **Referral promo expiry (`urgency-banner.jsx`):** July 31, 2026, 23:59:59 —
  the banner returns `null` and disappears on its own after that.

## Preview locally

1. `npm create vite@latest sfm -- --template react`
2. Copy these four files into `src/`.
3. Add Tailwind (https://tailwindcss.com/docs/guides/vite).
4. Import and render `App` in `main.jsx`, then `npm run dev`.

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
   `https://runsignup.com/Race/Register/?raceId=89412&groupId=123456`.
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
