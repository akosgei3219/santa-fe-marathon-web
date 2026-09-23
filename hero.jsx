export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-stone-900">
      {/* Warm Southwestern wash behind the content */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-teal-950" />
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-6 py-24 text-center sm:py-32">
        <span className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-4 py-1.5 text-sm font-medium text-teal-300 ring-1 ring-teal-400/30">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          Santa Fe, New Mexico · 7,000 ft
        </span>

        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-stone-50 sm:text-6xl">
          Santa Fe International Half Marathon
        </h1>

        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.1em] text-teal-300">
          Presented by Capitol Ford
        </p>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-stone-300 sm:text-xl">
          High desert air, drums along the route, and a finish line at Railyard
          Park. Four ways to run the City Different over race weekend, September 19–20, 2026.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="https://runsignup.com/Race/Register/?raceId=83604"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-amber-500 px-8 py-3.5 text-base font-semibold text-stone-900 shadow-lg transition hover:bg-amber-400"
          >
            Register Now
          </a>
          <a
            href="#route"
            className="rounded-xl border border-stone-600 px-8 py-3.5 text-base font-semibold text-stone-100 transition hover:border-teal-400 hover:text-teal-300"
          >
            View the Course
          </a>
        </div>

        <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-stone-700/60 pt-8">
          {[
            ["Sep 20", "Race Day 2026"],
            ["4 Races", "Half · Relay · 4K · Dash"],
            ["Santa Fe","Yavapai Mwangaza Athletics Club LLC"],
          ].map(([stat, label]) => (
            <div key={label}>
              <dt className="text-2xl font-bold text-amber-400 sm:text-3xl">{stat}</dt>
              <dd className="mt-1 text-sm text-stone-400">{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
