import { useState, useEffect } from "react";

// "Registration closes" urgency banner. Mirrors the countdown logic in
// timer.jsx so the two stay in lockstep: same tick interval, same units,
// same Mountain-time anchoring. The race gun is Sep 20, 2026 — registration
// closes the evening before, at the expo. Adjust the date below.
//
//   REG_CLOSE → when online registration shuts off (local Mountain time).
//   Sat, Sep 19, 2026 at 5:30 PM Mountain (MDT, UTC-6).
const REG_CLOSE = new Date("2026-09-19T17:30:00-06:00");

function getRemaining() {
  const diff = REG_CLOSE - new Date();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, closed: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    closed: false,
  };
}

function Pill({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-stone-950/70 text-xl font-bold tabular-nums text-amber-400 ring-1 ring-amber-500/30 sm:h-14 sm:w-14 sm:text-2xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
        {label}
      </span>
    </div>
  );
}

export default function RegistrationUrgency() {
  const [time, setTime] = useState(getRemaining());

  useEffect(() => {
    const id = setInterval(() => setTime(getRemaining()), 1000);
    return () => clearInterval(id);
  }, []);

  // Once registration closes, swap to an honest "sold out" state instead of
  // a dead zero-countdown that makes the page look broken.
  if (time.closed) {
    return (
      <section className="bg-stone-900 px-6 py-8 text-center">
        <p className="text-lg font-bold text-stone-100">
          Online registration is closed for 2026.
        </p>
        <p className="mt-2 text-sm text-stone-400">
          The field filled up. Get on the list now so you're first in line when
          2027 opens.
        </p>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-stone-900 via-stone-900 to-teal-950 px-6 py-10">
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-7 text-center lg:flex-row lg:justify-between lg:text-left">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
            Registration closes soon
          </p>
          <h3 className="mt-2 text-2xl font-extrabold text-stone-50 sm:text-3xl">
            We cap the field every year. It always fills.
          </h3>
          <p className="mt-3 text-sm text-stone-300 sm:text-base">
            We keep the course runnable and the finish line personal, so spots
            are limited—and at 7,000 feet, the half sells through first. When the
            link stops working, that's it until next year. Don't be the one
            refreshing a closed page.
          </p>
        </div>

        <div className="flex flex-col items-center gap-5">
          <div className="flex items-start gap-3 sm:gap-4">
            <Pill value={time.days} label="Days" />
            <Pill value={time.hours} label="Hrs" />
            <Pill value={time.minutes} label="Min" />
            <Pill value={time.seconds} label="Sec" />
          </div>
          <a
            href="https://runsignup.com/Race/Register/?raceId=83604"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-amber-500 px-7 py-3 text-sm font-bold text-stone-900 shadow-lg transition hover:bg-amber-400"
          >
            Claim your spot before it's gone
          </a>
        </div>
      </div>
    </section>
  );
}
