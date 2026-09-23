// Sponsors section for the React build — mirrors the #sponsors block in
// index.html. Tiered logo hierarchy, grayscale-until-hover logos, a 3-column
// benefits panel, and a conversion CTA hub wired to a dedicated sponsor inbox.
//
// SPONSOR_EMAIL → dedicated inbox for partner inquiries (confirm this exists).
const SPONSOR_EMAIL = "sponsors@santafehalfmarathon.com";
const inquiry =
  `mailto:${SPONSOR_EMAIL}?subject=` +
  encodeURIComponent("Sponsorship Inquiry — Santa Fe International Half Marathon");

const gold = ["Platinum", "Gold", "Gold", "Gold"];
const silver = Array.from({ length: 6 });

const benefits = [
  {
    icon: "📣",
    title: "Digital Reach",
    points: [
      "Logo placement across this website",
      "Featured on the RunSignup race platform",
      "Newsletter blasts to thousands of registered runners",
    ],
  },
  {
    icon: "🏁",
    title: "On-Course Branding",
    points: [
      "Finish-line banner at Railyard Park",
      "Branded aid stations along the course",
      "Start-line signage at La Tienda at Eldorado",
    ],
  },
  {
    icon: "🤝",
    title: "Community Impact",
    points: [
      "Align with Santa Fe's premier wellness weekend",
      "Reach an active, health-minded local audience",
      "Champion a community-run fitness tradition",
    ],
  },
];

// A single logo cell. `placeholder` text stands in until a real <img> is dropped
// in. Real logos: <img className="max-h-14 w-auto object-contain grayscale opacity-80
// transition group-hover:grayscale-0 group-hover:opacity-100 group-active:grayscale-0" />
function Cell({ children, className = "", tag: Tag = "div", ...rest }) {
  return (
    <Tag
      className={
        "group flex flex-col items-center justify-center gap-1 rounded-2xl border border-stone-700 bg-white/5 p-5 text-center no-underline transition hover:-translate-y-0.5 hover:border-teal-500 " +
        className
      }
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default function Sponsors() {
  return (
    <section id="sponsors" className="bg-stone-900 px-6 py-16 text-stone-50">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Our partners</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Put your brand on the start line</h2>
          <p className="mt-3 text-stone-300">
            Local businesses power this race — and get seen by thousands of runners, families,
            and fans across race weekend. Here's who's already in, and how to join them.
          </p>
        </div>

        {/* Tier 1 — Title & Presenting */}
        <p className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-stone-400 before:h-px before:flex-1 before:bg-stone-700 after:h-px after:flex-1 after:bg-stone-700">
          Title &amp; Presenting Sponsor
        </p>
        <div className="mb-10 grid gap-5 sm:grid-cols-2">
          <Cell className="min-h-[150px] border-2 border-amber-500 bg-amber-500/[0.06] p-8">
            <span className="text-2xl font-bold text-stone-50">Capitol Ford</span>
            <span className="text-[0.68rem] uppercase tracking-[0.1em] text-teal-300">Presenting Sponsor</span>
          </Cell>
          <Cell tag="a" href={inquiry} className="min-h-[150px] border-2 p-8">
            <span className="text-2xl font-bold text-stone-400 transition group-hover:text-stone-50">Title Sponsor</span>
            <span className="text-[0.68rem] uppercase tracking-[0.1em] text-teal-300">Available — claim this spot</span>
          </Cell>
        </div>

        {/* Tier 2 — Platinum & Gold */}
        <p className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-stone-400 before:h-px before:flex-1 before:bg-stone-700 after:h-px after:flex-1 after:bg-stone-700">
          Platinum &amp; Gold Partners
        </p>
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {gold.map((tier, i) => (
            <Cell key={i} className="min-h-[120px]">
              <span className="font-bold text-stone-400 transition group-hover:text-stone-50">Your Logo Here</span>
              <span className="text-[0.68rem] uppercase tracking-[0.1em] text-teal-300">{tier}</span>
            </Cell>
          ))}
        </div>

        {/* Tier 3 — Silver & Community */}
        <p className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-stone-400 before:h-px before:flex-1 before:bg-stone-700 after:h-px after:flex-1 after:bg-stone-700">
          Silver &amp; Community Supporters
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {silver.map((_, i) => (
            <Cell key={i} className="min-h-[80px] p-3">
              <span className="text-sm font-bold text-stone-400 transition group-hover:text-stone-50">Supporter</span>
            </Cell>
          ))}
        </div>

        {/* Benefits panel */}
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-2xl border border-stone-700 border-t-[3px] border-t-teal-500 bg-white/[0.04] p-6">
              <div className="mb-2 text-2xl" aria-hidden="true">{b.icon}</div>
              <h3 className="mb-3 text-lg font-bold text-stone-50">{b.title}</h3>
              <ul className="space-y-2">
                {b.points.map((p) => (
                  <li key={p} className="relative pl-6 text-sm text-stone-300 before:absolute before:left-0 before:font-extrabold before:text-amber-400 before:content-['✓']">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Conversion CTA hub */}
        <div className="mt-12 rounded-2xl border border-stone-700 bg-gradient-to-br from-stone-800 to-teal-950 px-6 py-11 text-center">
          <h3 className="text-2xl font-extrabold text-stone-50 sm:text-3xl">Become a 2026 sponsor</h3>
          <p className="mx-auto mt-2 max-w-xl text-stone-300">
            Tiers run from community supporter to title sponsor — we'll tailor a package to your
            goals and budget. Reach out and we'll get you on the start line.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a href={inquiry} className="rounded-xl bg-amber-500 px-7 py-3 text-base font-bold text-stone-900 shadow-lg transition hover:bg-amber-400">
              Become a Sponsor
            </a>
            <a href="santa-fe-half-sponsorship-2026.pdf" download className="rounded-xl border-2 border-stone-600 px-7 py-3 text-base font-bold text-stone-100 transition hover:border-teal-400 hover:text-teal-300">
              Download Sponsor Package
            </a>
          </div>
          <p className="mt-5 text-sm text-stone-400">
            Questions? Email <a href={`mailto:${SPONSOR_EMAIL}`} className="text-teal-300">{SPONSOR_EMAIL}</a> — we reply within two business days.
          </p>
        </div>
      </div>
    </section>
  );
}
