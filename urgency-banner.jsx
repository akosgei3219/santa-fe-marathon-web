import React, { useState, useEffect } from 'react';

// ───────────────────────────────────────────────────────────────────
// TRACKING LINK CONFIG
//   RACE_URL → the official RunSignup registration page.
// Each tier appends its own utm_content so you can tell which button
// drove the click in your analytics.
// ───────────────────────────────────────────────────────────────────
const RACE_URL = "https://runsignup.com/Race/Register/?raceId=89412";

// Set REFERRAL_CODE to your real RunSignup referral code to switch on referral
// attribution. Left as the placeholder, no referral param is added (links stay
// clean). REFERRAL_PARAM may need to be "rfsn" instead of "referralCode" — see README.
const REFERRAL_CODE = "YOUR_REFERRAL_CODE";
const REFERRAL_PARAM = "referralCode";
const HAS_REFERRAL = REFERRAL_CODE && REFERRAL_CODE !== "YOUR_REFERRAL_CODE";

const buildLink = (tier) =>
  `${RACE_URL}` +
  (HAS_REFERRAL ? `&${REFERRAL_PARAM}=${REFERRAL_CODE}` : ``) +
  `&utm_source=referral_banner&utm_medium=web` +
  `&utm_campaign=july_referral_2026&utm_content=${tier}`;

export default function UrgencyBanner() {
  // Set the campaign target deadline to midnight at the end of July (July 31, 2026)
  const calculateTimeLeft = () => {
    const difference = +new Date("2026-07-31T23:59:59") - +new Date();
    let timeLeft = {};
    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
      };
    }
    return timeLeft;
  };
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000);
    return () => clearTimeout(timer);
  }, [timeLeft]);
  // If the campaign has expired at the end of July, hide the referral banner automatically
  if (Object.keys(timeLeft).length === 0) {
    return null;
  }
  return (
    <div className="w-full bg-slate-900 text-white p-6 border-b-4 border-red-600 shadow-xl font-sans">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">

        {/* Marketing Header Block */}
        <div className="text-center lg:text-left space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-blue-400 flex items-center justify-center lg:justify-start gap-2">
            <span>🇺🇸 4th of July Referral Sparks!</span>
            <span className="animate-pulse">🎆</span>
          </h2>
          <p className="text-slate-300 font-medium text-sm md:text-base max-w-xl">
            Bring your running crew to Santa Fe and blast your registration costs away!
          </p>
        </div>
        {/* Live July Countdown Timer Block */}
        <div className="flex gap-3 text-center bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <div>
            <span className="block text-xl font-black text-red-500">{timeLeft.days || '0'}</span>
            <span className="text-[10px] uppercase font-bold text-slate-400">Days</span>
          </div>
          <span className="text-xl font-bold text-slate-600">:</span>
          <div>
            <span className="block text-xl font-black text-slate-100">{timeLeft.hours || '00'}</span>
            <span className="text-[10px] uppercase font-bold text-slate-400">Hrs</span>
          </div>
          <span className="text-xl font-bold text-slate-600">:</span>
          <div>
            <span className="block text-xl font-black text-slate-100">{timeLeft.minutes || '00'}</span>
            <span className="text-[10px] uppercase font-bold text-slate-400">Min</span>
          </div>
        </div>
        {/* Dynamic Tiered Savings Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <a href={buildLink("relay")} className="flex justify-between items-center bg-blue-700 hover:bg-blue-600 transition px-4 py-2.5 rounded-lg text-sm font-bold shadow-md">
            <span>Relay ➡️ </span>
            <span className="text-emerald-300 ml-2">Save $25</span>
          </a>
          <a href={buildLink("half")} className="flex justify-between items-center bg-slate-800 hover:bg-slate-700 transition px-4 py-2.5 rounded-lg text-sm font-bold shadow-md border border-slate-700">
            <span>Half ➡️ </span>
            <span className="text-emerald-300 ml-2">Save $15</span>
          </a>
          <a href={buildLink("4k")} className="flex justify-between items-center bg-red-700 hover:bg-red-600 transition px-4 py-2.5 rounded-lg text-sm font-bold shadow-md">
            <span>4K ➡️ </span>
            <span className="text-emerald-300 ml-2">Save $7</span>
          </a>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-800 text-center text-xs text-slate-400 tracking-wide font-medium">
        💥 Campaign ends sharp on July 31st. Grab your link, share with friends, and stack your rewards now! 🇺🇸
      </div>
    </div>
  );
}
