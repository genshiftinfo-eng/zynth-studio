import { useEffect, useRef } from "react";
import Lenis from "lenis";

export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      // lerp gives a snappier, lighter feel than long durations
      lerp: 0.12,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.6,
      smoothWheel: true,
      syncTouch: false,
    });
    lenisRef.current = lenis;

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return lenisRef;
}

export function scrollToSection(target: string) {
  const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
  const el = document.querySelector(target);
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el as HTMLElement, { offset: 0, duration: 1.6 });
  } else {
    (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
  }
}
