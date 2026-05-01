import { useReveal } from "@/hooks/useReveal";

const steps = [
  {
    n: "Phase 01",
    t: "Brief & Bind",
    b: "A two-week deep-dive. We sign a binding scope only after we are certain we can ship the best work of the studio's year.",
    week: "Week 01–02",
  },
  {
    n: "Phase 02",
    t: "Architecture",
    b: "Sitemap, system, narrative, motion language, and engineering scaffold are drawn before a single screen is composed.",
    week: "Week 03–05",
  },
  {
    n: "Phase 03",
    t: "Build",
    b: "Custom shaders, bespoke components, hand-tuned typography, and surgical performance budgets, in sprints of one.",
    week: "Week 06–14",
  },
  {
    n: "Phase 04",
    t: "Launch & Hold",
    b: "We ship on a Wednesday at 11:00 UTC. We hold the line for sixty days, then transition stewardship.",
    week: "Week 15–22",
  },
];

export function Process() {
  const [headRef, headRevealed] = useReveal<HTMLDivElement>();

  return (
    <section
      id="process"
      className="relative bg-black py-24 md:py-32 border-t border-white/10"
      data-testid="section-process"
    >
      <div className="px-6 md:px-10">
        <div
          ref={headRef}
          className={`grid grid-cols-1 md:grid-cols-12 gap-8 mb-20 reveal ${headRevealed ? "is-revealed" : ""}`}
        >
          <div className="md:col-span-4 font-mono text-[10px] tracking-[0.32em] uppercase text-white/55">
            <div>N° 004 / Method</div>
            <div className="mt-2 text-white/35">— A 22-week protocol</div>
          </div>
          <div className="md:col-span-8">
            <h2 className="font-display text-[44px] md:text-[88px] leading-[0.92] font-black tracking-[-0.045em] text-white">
              The Method
              <br />
              <span className="font-serif italic font-light text-white/70">— a 22-week protocol.</span>
            </h2>
          </div>
        </div>

        <ol className="space-y-2 border-t border-white/10">
          {steps.map((s, i) => {
            const [ref, revealed] = useReveal<HTMLLIElement>();
            return (
              <li
                key={s.n}
                ref={ref}
                className={`grid grid-cols-1 md:grid-cols-12 gap-6 border-b border-white/10 py-10 md:py-14 group reveal reveal-delay-${i + 1} ${revealed ? "is-revealed" : ""}`}
                data-cursor="Phase"
              >
                <div className="md:col-span-2 font-mono text-[10px] tracking-[0.32em] uppercase text-white/55">
                  {s.n}
                </div>
                <div className="md:col-span-7">
                  <h3 className="font-display text-[36px] md:text-[64px] font-black leading-[0.95] tracking-[-0.045em] text-white group-hover:text-white/70 transition-colors duration-300">
                    {s.t}
                  </h3>
                  <p className="mt-4 text-white/65 text-[15px] leading-[1.6] max-w-[58ch]">{s.b}</p>
                </div>
                <div className="md:col-span-3 flex md:justify-end items-start">
                  <span className="font-mono text-[10px] tracking-[0.32em] uppercase text-white/45 border border-white/20 px-3 py-1.5">
                    {s.week}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
