import { useEffect, useState, lazy, Suspense } from "react";
import { Nav } from "./Nav";
import { Monolith } from "./Monolith";
import { Marquee } from "./Marquee";
import { PartnerModal } from "./PartnerModal";
import { useLenis, scrollToSection } from "@/hooks/useLenis";

const Arsenal = lazy(() => import("./Arsenal").then(m => ({ default: m.Arsenal })));
const Manifesto = lazy(() => import("./Manifesto").then(m => ({ default: m.Manifesto })));
const Process = lazy(() => import("./Process").then(m => ({ default: m.Process })));
const Portfolio = lazy(() => import("./Portfolio").then(m => ({ default: m.Portfolio })));
const Contact = lazy(() => import("./Contact").then(m => ({ default: m.Contact })));
const Footer = lazy(() => import("./Footer").then(m => ({ default: m.Footer })));

function SectionFallback() {
  return <div className="w-full py-32 bg-black" />;
}

export function MainLayout() {
  const [partnerOpen, setPartnerOpen] = useState(false);
  useLenis();
  useEffect(() => {
    function handleHash() {
      const hash = window.location.hash;
      if (hash) {
        // wait one tick so layout settles & lenis is initialized
        window.setTimeout(() => scrollToSection(hash), 120);
      }
    }
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);
  return (
    <div className="relative bg-black text-white grain min-h-screen" data-testid="main-layout">
      <Nav onPartnerOpen={() => setPartnerOpen(true)} />
      <main id="main-content">
        <Monolith />
        <Marquee />
        <Suspense fallback={<SectionFallback />}><Arsenal /></Suspense>
        <Suspense fallback={<SectionFallback />}><Manifesto /></Suspense>
        <Suspense fallback={<SectionFallback />}><Process /></Suspense>
        <Suspense fallback={<SectionFallback />}><Portfolio /></Suspense>
        <Suspense fallback={<SectionFallback />}><Contact /></Suspense>
      </main>
      <Suspense fallback={null}><Footer /></Suspense>
      <PartnerModal open={partnerOpen} onClose={() => setPartnerOpen(false)} />

      {/* Hidden semantic content for SEO and screen readers */}
      <div className="sr-only" aria-hidden="false">
        <h1>ZYNTH — Bespoke Digital Studio · Islamabad, Pakistan</h1>
        <p>
          ZYNTH is a bespoke digital studio in Islamabad, Pakistan engineering award-winning websites,
          identity systems, and growth programs for ultra high-end clients. We build only six
          engagements per year. Every artifact is hand-engineered by senior partners.
        </p>
        <h2>Services</h2>
        <ul>
          <li>Web Engineering — bespoke React, Next.js, custom WebGL and shader pipelines.</li>
          <li>Graphic Design — wordmarks, kinetic identity, editorial, packaging.</li>
          <li>Digital Marketing — performance creative, lifecycle, SEO, attribution.</li>
        </ul>
        <h2>Contact</h2>
        <p>hello@zynthstudio.org · By appointment only · Islamabad, Pakistan</p>
      </div>
    </div>
  );
}
