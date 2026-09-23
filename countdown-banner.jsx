// Welcoming headline banner that sits directly above the countdown <Timer />.
// Warm Southwestern wash (stone → teal) that hands off into the timer's light
// stone-100 section below it. Purely presentational — no countdown here.
export default function CountdownBanner() {
  return (
    <section className="relative overflow-hidden bg-stone-900">
      {/* Same palette as the hero so the page reads as one piece */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-teal-950" />
      <div className="absolute -left-20 -top-24 h-80 w-80 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-teal-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-6 py-16 text-center sm:py-20">
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-300 ring-1 ring-amber-400/30">
          <span className="h-2 w-2 rounded-full bg-teal-400" />
          September 20, 2026 · Plaza Start
        </span>

        <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-stone-50 sm:text-5xl">
          You belong on this start line.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-stone-300">
          Every September, the whole town turns out for you. Drums on the corners,
          neighbors handing out water, strangers cheering your name like they've
          known you for years. First-timer or chasing a PR—this is your race, and
          we saved you a spot.
        </p>

        <p className="mt-6 text-sm font-medium uppercase tracking-[0.2em] text-teal-300">
          The clock's already running ↓
        </p>
      </div>
    </section>
  );
}
