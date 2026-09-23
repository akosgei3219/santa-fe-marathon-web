import { useState, useEffect } from "react";

// Counts down to gun time: Sunday, September 20, 2026, 7:30 AM Mountain —
// when the Kudu Horn sends runners off at the Eldorado start line.
const RACE_DAY = new Date("2026-09-20T07:30:00-06:00");

function getRemaining() {
  const diff = RACE_DAY - new Date();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: false,
  };
}

function Unit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-stone-900/90 text-3xl font-bold tabular-nums text-amber-400 shadow-lg ring-1 ring-teal-500/30 sm:h-28 sm:w-28 sm:text-5xl">
        {String(value).padStart(2, "0")}
      </div>
      <span className="mt-2 text-xs font-medium uppercase tracking-widest text-stone-500 sm:text-sm">
        {label}
      </span>
    </div>
  );
}

export default function Timer() {
  const [time, setTime] = useState(getRemaining());

  useEffect(() => {
    const id = setInterval(() => setTime(getRemaining()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="bg-stone-100 px-6 py-14">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
          Sunday · September 20 · 2026 · 7:30 AM
        </p>
        <h2 className="mt-2 text-2xl font-bold text-stone-900 sm:text-3xl">
          {time.done ? "It's race day. Go get it." : "Until the gun goes off"}
        </h2>

        <div className="mt-8 flex items-start justify-center gap-3 sm:gap-6">
          <Unit value={time.days} label="Days" />
          <Unit value={time.hours} label="Hours" />
          <Unit value={time.minutes} label="Minutes" />
          <Unit value={time.seconds} label="Seconds" />
        </div>

        <p className="mt-8 text-stone-600">
          Toe the line at 7,000 feet. We'll see you at the Plaza start.
        </p>
      </div>
    </section>
  );
}
