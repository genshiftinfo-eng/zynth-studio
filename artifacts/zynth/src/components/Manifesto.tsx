import { useReveal } from "@/hooks/useReveal";

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
  { v: "6", l: "engagements per year" },
  { v: "100%", l: "in-house, in-name" },
  { v: "0", l: "templates used. ever." },
];

export function Manifesto() {
  const [headRef, headRevealed] = useReveal<HTMLDivElement>();
  const [statsRef, statsRevealed] = useReveal<HTMLDivElement>();

  return (
    <section
      id="manifesto"
      className="relative bg-black text-white py-24 md:py-32 border-t border-white/10"
      data-testid="section-manifesto"
    >
      {/* subtle grid bg */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative px-6 md:px-10">
        <div
          ref={headRef}
          className={`grid grid-cols-1 md:grid-cols-12 gap-8 reveal ${headRevealed ? "is-revealed" : ""}`}
        >
          <div className="md:col-span-4 font-mono text-[10px] tracking-[0.32em] uppercase text-white/55">
            <div>N° 003 / Doctrine</div>
            <div className="mt-2 text-white/35">— Four laws, signed and load-bearing</div>
          </div>
          <div className="md:col-span-8">
            <h2 className="font-display text-[44px] md:text-[96px] leading-[0.92] font-black tracking-[-0.045em] text-white">
              Doctrine,
              <br />
              <span className="font-serif italic font-light text-white/70">not deck.</span>
            </h2>
            <p className="mt-8 max-w-[58ch] text-white/55 text-[15px] leading-[1.65]">
              These are the four laws that govern every engagement at ZYNTH. They are not aspirational.
              They are load-bearing. Break one and the studio collapses.
            </p>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-14 md:gap-y-20">
          {principles.map((p, i) => {
            const [ref, revealed] = useReveal<HTMLElement>();
            return (
              <article
                key={p.n}
                ref={ref}
                className={`border-t border-white/15 pt-6 reveal reveal-delay-${i + 1} ${revealed ? "is-revealed" : ""}`}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[10px] tracking-[0.32em] uppercase text-white/45">
                    Article {p.n}
                  </span>
                  <span className="inline-block h-2 w-2 bg-white/60" />
                </div>
                <h3 className="mt-4 font-display text-[28px] md:text-[40px] leading-[1.02] font-black tracking-[-0.04em] text-white">
                  {p.t}
                </h3>
                <p className="mt-4 text-white/60 text-[15px] leading-[1.6] max-w-[44ch]">{p.b}</p>
              </article>
            );
          })}
        </div>

        <div
          ref={statsRef}
          className={`mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/10 pt-10 reveal ${statsRevealed ? "is-revealed" : ""}`}
        >
          {stats.map((s, i) => (
            <div key={s.l} className={`reveal-delay-${i + 1}`}>
              <div className="font-display text-[48px] md:text-[88px] font-black leading-none tracking-[-0.045em] text-white">
                {s.v}
              </div>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.28em] text-white/45 max-w-[18ch]">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
