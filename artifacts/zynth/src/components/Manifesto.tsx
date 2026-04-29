const principles = [
  {
    n: "01",
    t: "The Anti-Template",
    b: "Zero Webflow drag-drops, zero stock UI kits, zero generative slop. Every pixel is hand-engineered.",
  },
  {
    n: "02",
    t: "Engineering is the Aesthetic",
    b: "We measure beauty in milliseconds. A 1.6s TTI is not a constraint; it is the design.",
  },
  {
    n: "03",
    t: "We Take Less Work",
    b: "Six engagements per year. No retainers we cannot defend. We say no, often, and visibly.",
  },
  {
    n: "04",
    t: "Bespoke or Nothing",
    b: "If a competitor could deliver it from a template by Tuesday, we are not the studio for the job.",
  },
];

const stats = [
  { v: "60", l: "frames per second, locked" },
  { v: "1.8s", l: "max time to interactive" },
  { v: "06", l: "engagements per year" },
  { v: "100%", l: "in-house, in-name" },
];

export function Manifesto() {
  return (
    <section
      id="manifesto"
      className="relative bg-white text-black py-24 md:py-32"
      data-testid="section-manifesto"
    >
      <div className="px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 font-mono text-[10px] tracking-[0.32em] uppercase text-black/55">
            <div>N° 003 / Doctrine</div>
            <div className="mt-2 text-black/35">— Four laws, signed and load-bearing</div>
          </div>
          <div className="md:col-span-8">
            <h2 className="font-display text-[44px] md:text-[96px] leading-[0.92] font-black tracking-[-0.045em]">
              Doctrine,
              <br />
              <span className="font-serif italic font-light">not deck.</span>
            </h2>
            <p className="mt-8 max-w-[58ch] text-black/65 text-[15px] leading-[1.65]">
              These are the four laws that govern every engagement at ZYNTH. They are not aspirational.
              They are load-bearing. Break one and the studio collapses.
            </p>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-14 md:gap-y-20">
          {principles.map((p) => (
            <article key={p.n} className="border-t border-black pt-6">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[10px] tracking-[0.32em] uppercase text-black/55">
                  Article {p.n}
                </span>
                <span className="inline-block h-2 w-2 bg-black" />
              </div>
              <h3 className="mt-4 font-display text-[28px] md:text-[40px] leading-[1.02] font-black tracking-[-0.04em]">
                {p.t}
              </h3>
              <p className="mt-4 text-black/70 text-[15px] leading-[1.6] max-w-[44ch]">{p.b}</p>
            </article>
          ))}
        </div>

        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-black pt-10">
          {stats.map((s) => (
            <div key={s.l}>
              <div className="font-display text-[48px] md:text-[88px] font-black leading-none tracking-[-0.045em]">
                {s.v}
              </div>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.28em] text-black/55 max-w-[18ch]">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
