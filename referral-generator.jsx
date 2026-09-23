import { useState } from "react";

// ── Config ──────────────────────────────────────────────────────────
// RACE_URL   → RunSignup registration page.
// REF_PARAM  → the URL param the code rides on. Keep "ref" for a generic
//              passthrough, or set to "groupId" to feed RunSignup Groups/Teams.
const RACE_URL = "https://runsignup.com/Race/Register/?raceId=83604";
const REF_PARAM = "ref";

// Deterministic, URL-safe code: same runner always gets the same code.
export function makeCode(name, email) {
  const base = `${name}|${email}`.trim().toLowerCase();
  let h = 0;
  for (let i = 0; i < base.length; i++) h = (h * 31 + base.charCodeAt(i)) >>> 0;
  const initials =
    name.trim().split(/\s+/).map((w) => w[0] || "").join("").slice(0, 3).toUpperCase() || "SFM";
  return `${initials}-${h.toString(36).toUpperCase().slice(0, 5)}`;
}

export function shareLink(code) {
  return (
    `${RACE_URL}&${REF_PARAM}=${encodeURIComponent(code)}` +
    `&utm_source=runner_referral&utm_medium=share&utm_campaign=sfhm_2026`
  );
}

export default function ReferralGenerator() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  const link = code ? shareLink(code) : "";

  const generate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCode(makeCode(name, email));
    setCopied(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="bg-stone-900 px-6 py-14">
      <div className="mx-auto max-w-xl rounded-2xl bg-stone-800/60 p-8 ring-1 ring-teal-500/20">
        <h2 className="text-center text-2xl font-bold text-stone-50 sm:text-3xl">
          Bring your crew, bank the savings
        </h2>
        <p className="mt-2 text-center text-stone-400">
          Grab your personal referral link. Relay <span className="text-amber-400">$25</span> ·
          Half <span className="text-amber-400">$15</span> · 4K <span className="text-amber-400">$7</span>.
        </p>

        <form onSubmit={generate} className="mt-6 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            aria-label="Your name"
            className="w-full rounded-xl border border-stone-700 bg-stone-900 px-4 py-3 text-stone-100 placeholder-stone-500 focus:border-teal-400 focus:outline-none"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional, keeps your code unique)"
            aria-label="Email"
            className="w-full rounded-xl border border-stone-700 bg-stone-900 px-4 py-3 text-stone-100 placeholder-stone-500 focus:border-teal-400 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-amber-500 px-6 py-3 font-semibold text-stone-900 transition hover:bg-amber-400"
          >
            Generate my referral link
          </button>
        </form>

        {code && (
          <div className="mt-6 rounded-xl bg-stone-900 p-4 ring-1 ring-stone-700">
            <p className="text-sm text-stone-400">Your code</p>
            <p className="text-xl font-bold tracking-wide text-amber-400">{code}</p>
            <p className="mt-3 break-all text-sm text-teal-300">{link}</p>
            <button
              onClick={copy}
              className="mt-4 w-full rounded-lg border border-teal-500/40 px-4 py-2 text-sm font-semibold text-teal-300 transition hover:bg-teal-500/10"
            >
              {copied ? "Copied — go share it!" : "Copy my link"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
