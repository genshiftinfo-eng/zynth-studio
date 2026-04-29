export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative bg-black border-t border-white/10" data-testid="section-footer">
      <div className="px-6 md:px-10 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-6">
            <div className="font-display text-[88px] md:text-[180px] font-black leading-[0.85] tracking-[-0.05em]">
              ZYNTH
            </div>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.32em] text-white/55">
              A studio for the obsessed · Est. MMXXII · San Francisco / Tokyo
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">Index</div>
            <ul className="mt-3 space-y-1 text-white/85">
              {["Monolith", "Arsenal", "Doctrine", "Proof", "Contact"].map((l) => (
                <li key={l}>
                  <a href={`#${l.toLowerCase()}`} className="ink-stroke text-[14px]">{l}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">Channels</div>
            <ul className="mt-3 space-y-1 text-white/85">
              {["Awwwards", "FWA", "Are.na", "Instagram"].map((l) => (
                <li key={l}>
                  <a href="#" className="ink-stroke text-[14px]">{l}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">Counsel</div>
            <ul className="mt-3 space-y-1 text-white/85">
              <li><a href="#" className="ink-stroke text-[14px]">Engagement</a></li>
              <li><a href="#" className="ink-stroke text-[14px]">Privacy</a></li>
              <li><a href="#" className="ink-stroke text-[14px]">Colophon</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
            © {year} ZYNTH Studio · All artifacts hand-engineered
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
            v1.0.0 · Built for 60fps · 1.6s TTI · Made in WebGL
          </div>
        </div>
      </div>
    </footer>
  );
}
