import { useEffect, useState } from "react";
import { scrollToSection } from "@/hooks/useLenis";

const links = [
  { id: "monolith", label: "Index" },
  { id: "arsenal", label: "Arsenal" },
  { id: "manifesto", label: "Doctrine" },
  { id: "proof", label: "Proof" },
  { id: "contact", label: "Contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function update() {
      const d = new Date();
      const utc = d.toISOString().slice(11, 19);
      setTime(`${utc} UTC`);
    }
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-[150]"
      style={{
        backdropFilter: scrolled ? "blur(14px)" : "none",
        background: scrolled ? "rgba(0,0,0,.45)" : "transparent",
        transition: "background .4s, backdrop-filter .4s, border-color .4s",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,.08)" : "1px solid transparent",
      }}
      data-testid="nav-root"
    >
      <div className="flex items-center justify-between px-6 py-5 md:px-10">
        <button
          onClick={() => scrollToSection("#monolith")}
          data-cursor="Index"
          className="font-display text-[20px] font-black tracking-[-0.04em] leading-none"
          data-testid="nav-logo"
        >
          ZYNTH
          <span className="ml-1 inline-block h-1.5 w-1.5 align-middle bg-white" />
        </button>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollToSection(`#${l.id}`)}
              className="ink-stroke text-[11px] tracking-[0.32em] uppercase text-white/85 hover:text-white"
              data-testid={`nav-link-${l.id}`}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-6">
          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/60" data-testid="nav-clock">
            {time}
          </div>
          <button
            onClick={() => scrollToSection("#contact")}
            data-cursor="Engage"
            className="group relative inline-flex items-center gap-3 border border-white/30 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-white hover-elevate"
            data-testid="nav-cta"
          >
            <span className="h-1.5 w-1.5 bg-white animate-pulse" />
            Open a Brief
          </button>
        </div>

        <button
          onClick={() => scrollToSection("#contact")}
          data-cursor="Engage"
          className="md:hidden border border-white/30 px-3 py-2 text-[10px] uppercase tracking-[0.28em] text-white"
        >
          Brief
        </button>
      </div>
    </header>
  );
}
