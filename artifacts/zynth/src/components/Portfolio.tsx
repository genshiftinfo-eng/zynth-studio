import { useReveal } from "@/hooks/useReveal";

const capabilities = [
  { n: "01", title: "Web Engineering", tags: ["React", "Next.js", "WebGL", "GLSL", "Three.js", "TypeScript"] },
  { n: "02", title: "Brand & Identity", tags: ["Wordmarks", "Type Systems", "Motion Identity", "Packaging", "Art Direction"] },
  { n: "03", title: "Digital Marketing", tags: ["Performance Creative", "SEO Architecture", "Lifecycle", "Attribution", "Analytics"] },
  { n: "04", title: "Motion & 3D", tags: ["Shader Pipelines", "GSAP", "Framer Motion", "WebGL", "Lottie", "Cinema 4D"] },
];

const numbers = [
  { value: "6", label: "Engagements / Year" },
  { value: "100%", label: "Hand-Engineered" },
  { value: "0", label: "Templates Used" },
  { value: "60fps", label: "Target Frame Rate" },
  { value: "∞", label: "Standards Applied" },
  { value: "PKT", label: "Islamabad, Pakistan" },
];

function CapabilityCard({ c, delay }: { c: typeof capabilities[0]; delay: string }) {
  const [ref, revealed] = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`bg-black p-8 md:p-10 reveal ${delay} ${revealed ? "is-revealed" : ""}`}>
      <div className="flex items-start justify-between mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/35">{c.n}</span>
        <span className="inline-block h-px w-8 bg-white/20 mt-2" />
      </div>
      <h3 className="font-display text-[28px] md:text-[36px] font-black tracking-[-0.04em] text-white leading-none mb-6">{c.title}</h3>
      <div className="flex flex-wrap gap-2">
        {c.tags.map((tag) => (
          <span key={tag} className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 border border-white/15 px-2.5 py-1">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Portfolio() {
  const [headRef, headRevealed] = useReveal<HTMLDivElement>();
  const [numbersRef, numbersRevealed] = useReveal<HTMLDivElement>();

  return (
    <section
      id="proof"
      className="relative bg-black py-24 md:py-32 border-t border-white/10"
      data-testid="section-proof"
    >
      <div className="px-6 md:px-10">
        <div ref={headRef} className={`grid grid-cols-1 md:grid-cols-12 gap-8 mb-20 reveal ${headRevealed ? "is-revealed" : ""}`}>
          <div className="md:col-span-4 font-mono text-[10px] tracking-[0.32em] uppercase text-white/55">
            <div>N° 005 / Capabilities</div>
            <div className="mt-2 text-white/35">— What we engineer</div>
          </div>
          <div className="md:col-span-8">
            <h2 className="font-display text-[44px] md:text-[88px] leading-[0.92] font-black tracking-[-0.045em] text-white">
              Built to<br />
              <span className="font-serif italic font-light text-white/70">obsessive standard.</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px border border-white/10 bg-white/10">
          {capabilities.map((c, i) => (
            <CapabilityCard key={c.n} c={c} delay={`reveal-delay-${i + 1}`} />
          ))}
        </div>

        <div ref={numbersRef} className={`mt-20 reveal ${numbersRevealed ? "is-revealed" : ""}`}>
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/35 mb-10">By the numbers</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px border border-white/10 bg-white/10">
            {numbers.map((n, i) => (
              <div key={n.label} className={`bg-black px-6 py-8 reveal reveal-delay-${i + 1} ${numbersRevealed ? "is-revealed" : ""}`}>
                <div className="font-display text-[36px] md:text-[48px] font-black leading-none tracking-[-0.04em] text-white">{n.value}</div>
                <div className="mt-3 font-mono text-[9px] uppercase tracking-[0.24em] text-white/40 leading-[1.5]">{n.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
