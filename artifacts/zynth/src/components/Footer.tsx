import { useLocation } from "wouter";

export function Footer() {
  const year = new Date().getFullYear();
  const [, navigate] = useLocation();
  return (
    <footer className="relative bg-black border-t border-white/10" data-testid="section-footer">
      <div className="px-6 md:px-10 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-6 overflow-hidden">
            <div className="font-display text-[60px] sm:text-[88px] md:text-[180px] font-black leading-[0.85] tracking-[-0.05em] truncate">
              ZYNTH
            </div>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.32em] text-white/55">
              A studio for the obsessed · Est. 2026 · Islamabad, Pakistan
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
              <li><a href="https://www.instagram.com/zynthvisuals/" target="_blank" rel="noopener noreferrer" className="ink-stroke text-[14px]">Instagram</a></li>
              <li><a href="https://www.youtube.com/@zynthvisuals" target="_blank" rel="noopener noreferrer" className="ink-stroke text-[14px]">YouTube</a></li>
              <li><a href="https://www.tiktok.com/@zynthvisuals" target="_blank" rel="noopener noreferrer" className="ink-stroke text-[14px]">TikTok</a></li>
              <li><a href="https://x.com/zynthvisuals" target="_blank" rel="noopener noreferrer" className="ink-stroke text-[14px]">X</a></li>
              <li><a href="https://www.facebook.com/profile.php?id=61571001161752" target="_blank" rel="noopener noreferrer" className="ink-stroke text-[14px]">Facebook</a></li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">Counsel</div>
            <ul className="mt-3 space-y-1 text-white/85">
              <li><a href="#" className="ink-stroke text-[14px]">Engagement</a></li>
              <li><button onClick={() => navigate("/privacy-policy")} className="ink-stroke text-[14px]">Privacy Policy</button></li>
              <li><button onClick={() => navigate("/terms-and-conditions")} className="ink-stroke text-[14px]">Terms & Conditions</button></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
            © {year} ZYNTH Studio · All artifacts hand-engineered
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
            v1.0.0 · Built for Excellence · 1.6s TTI · Made by ZYNTH Studio
          </div>
        </div>
      </div>
    </footer>
  );
}
