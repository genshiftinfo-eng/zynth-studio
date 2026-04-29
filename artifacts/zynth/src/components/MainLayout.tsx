import { useEffect, useState } from "react";
import { Cursor } from "./Cursor";
import { Nav } from "./Nav";
import { Monolith } from "./Monolith";
import { Marquee } from "./Marquee";
import { Arsenal } from "./Arsenal";
import { Manifesto } from "./Manifesto";
import { Process } from "./Process";
import { Portfolio } from "./Portfolio";
import { Contact } from "./Contact";
import { Footer } from "./Footer";
import { useLenis, scrollToSection } from "@/hooks/useLenis";

function Boot() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(() => {
    if (typeof window === "undefined") return false;
    if (window.location.hash) return true;
    return window.sessionStorage.getItem("zynth_booted") === "1";
  });

  useEffect(() => {
    if (done) return;
    let v = 0;
    const id = window.setInterval(() => {
      v = Math.min(100, v + Math.random() * 18 + 14);
      setProgress(Math.floor(v));
      if (v >= 100) {
        window.clearInterval(id);
        window.setTimeout(() => {
          window.sessionStorage.setItem("zynth_booted", "1");
          setDone(true);
        }, 320);
      }
    }, 80);
    return () => window.clearInterval(id);
  }, [done]);

  if (done) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-black text-white transition-opacity duration-700"
      style={{ opacity: progress >= 100 ? 0 : 1 }}
      data-testid="boot-screen"
    >
      <div className="font-display text-[88px] md:text-[180px] font-black leading-none tracking-[-0.05em]">
        ZYNTH
      </div>
      <div className="mt-6 w-[280px] md:w-[420px] h-px bg-white/15">
        <div className="h-px bg-white" style={{ width: `${progress}%`, transition: "width .25s linear" }} />
      </div>
      <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.32em] text-white/55">
        Compiling shaders · {String(progress).padStart(3, "0")}%
      </div>
    </div>
  );
}

export function MainLayout() {
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
      <Cursor />
      <Nav />
      <main>
        <Monolith />
        <Marquee />
        <Arsenal />
        <Manifesto />
        <Process />
        <Portfolio />
        <Contact />
      </main>
      <Footer />
      <Boot />

      {/* Hidden semantic content for SEO and screen readers */}
      <div className="sr-only" aria-hidden="false">
        <h1>ZYNTH — Bespoke Digital Studio</h1>
        <p>
          ZYNTH is a bespoke digital studio in San Francisco engineering award-winning websites,
          identity systems, and growth programs for ultra high-end clients. We build only six
          engagements per year. Every artifact is hand-engineered by senior partners.
        </p>
        <h2>Services</h2>
        <ul>
          <li>Web Engineering — bespoke React, Next.js, custom WebGL and shader pipelines.</li>
          <li>Graphic Design — wordmarks, kinetic identity, editorial, packaging.</li>
          <li>Digital Marketing — performance creative, lifecycle, SEO, attribution.</li>
        </ul>
        <h2>Selected Clients</h2>
        <ul>
          <li>Maison Volterra — couture brand and editorial system.</li>
          <li>Obsidian Capital — investment platform identity and portal.</li>
          <li>Hokusai Distillery — single-malt rebrand and cellar tour.</li>
          <li>Atelier Noir — Parisian art-collector gallery site.</li>
          <li>Stratum Architects — practice site for a brutalist firm.</li>
          <li>Helios Yachts — custom yacht configurator with WebGL hull rendering.</li>
        </ul>
        <h2>Contact</h2>
        <p>partners@zynth.studio · press@zynth.studio · By appointment only.</p>
      </div>
    </div>
  );
}
