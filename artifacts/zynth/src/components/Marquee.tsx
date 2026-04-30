const phrases = [
  "WebGL-Powered Experiences",
  "High-Impact Marketing Portfolios",
  "Bespoke User Journeys",
  "Surgical Code Execution",
  "Zero compromise",
  "Digital Growth Engines",
  "Strategic Brand Systems",
  "Custom GSAP Motion Systems",
];

export function Marquee() {
  const items = [...phrases, ...phrases, ...phrases];
  return (
    <section
      className="relative border-y border-white/10 bg-black py-6 overflow-hidden"
      data-testid="section-marquee"
    >
      <div className="marquee-track flex w-max items-center gap-12 whitespace-nowrap">
        {items.map((p, i) => (
          <span
            key={i}
            className="font-display text-[44px] md:text-[68px] font-black uppercase tracking-[-0.04em] leading-none text-white/85"
          >
            {p}
            <span className="mx-12 inline-block align-middle">
              <span className="inline-block h-3 w-3 rotate-45 bg-white" />
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
