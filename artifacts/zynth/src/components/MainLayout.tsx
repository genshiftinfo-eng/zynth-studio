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

const greetings = [
  { text: "Hello",            lang: "English",          font: "'Archivo', sans-serif",                dir: "ltr" },
  { text: "Nǐ hǎo",          lang: "Mandarin Chinese",  font: "'Noto Sans SC', sans-serif",           dir: "ltr" },
  { text: "Namaste",          lang: "Hindi",             font: "'Noto Sans Devanagari', sans-serif",   dir: "ltr" },
  { text: "Bonjour",          lang: "French",            font: "'Archivo', sans-serif",                dir: "ltr" },
  { text: "Hola",             lang: "Spanish",           font: "'Archivo', sans-serif",                dir: "ltr" },
  { text: "\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064a\u0643\u0645", lang: "Arabic", font: "'Noto Naskh Arabic', serif", dir: "rtl" },
  { text: "\u09a8\u09ae\u09b8\u09cd\u0995\u09be\u09b0",  lang: "Bengali",  font: "'Noto Sans Bengali', sans-serif",      dir: "ltr" },
  { text: "Ol\u00e1",         lang: "Portuguese",        font: "'Archivo', sans-serif",                dir: "ltr" },
  { text: "\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435", lang: "Russian", font: "'Noto Sans', sans-serif", dir: "ltr" },
  { text: "Halo",             lang: "Indonesian",        font: "'Archivo', sans-serif",                dir: "ltr" },
  { text: "\u3053\u3093\u306b\u3061\u306f", lang: "Japanese", font: "'Noto Sans JP', sans-serif",      dir: "ltr" },
  { text: "\u0623\u0647\u0644\u0627\u064b", lang: "Egyptian Arabic", font: "'Noto Naskh Arabic', serif", dir: "rtl" },
];

function Boot() {
  const alreadyBooted = () => {
    if (typeof window === "undefined") return false;
    if (window.location.hash) return true;
    return window.sessionStorage.getItem("zynth_booted") === "1";
  };

  const [phase, setPhase] = useState<"greet" | "boot" | "done">(alreadyBooted() ? "done" : "greet");
  const [greetIdx, setGreetIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  // greeting phase — cycle through each greeting
  useEffect(() => {
    if (phase !== "greet") return;
    if (greetIdx >= greetings.length) {
      setPhase("boot");
      return;
    }
    setVisible(true);
    const showTimer = window.setTimeout(() => setVisible(false), 280);
    const nextTimer = window.setTimeout(() => setGreetIdx((i) => i + 1), 400);
    return () => { window.clearTimeout(showTimer); window.clearTimeout(nextTimer); };
  }, [phase, greetIdx]);

  // boot phase — progress bar
  useEffect(() => {
    if (phase !== "boot") return;
    let v = 0;
    const id = window.setInterval(() => {
      v = Math.min(100, v + Math.random() * 18 + 14);
      setProgress(Math.floor(v));
      if (v >= 100) {
        window.clearInterval(id);
        window.setTimeout(() => {
          window.sessionStorage.setItem("zynth_booted", "1");
          setPhase("done");
        }, 320);
      }
    }, 80);
    return () => window.clearInterval(id);
  }, [phase]);

  if (phase === "done") return null;

  const g = greetings[greetIdx] ?? greetings[greetings.length - 1];

  return (
    <div className="fixed inset-0 z-[300] bg-black text-white" style={{ display: "flex", alignItems: "center", justifyContent: "center" }} data-testid="boot-screen">
      {phase === "greet" && (
          <div
            key={greetIdx}
            style={{
              fontFamily: g.font,
              direction: g.dir as "ltr" | "rtl",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(-14px)",
              transition: "opacity 0.12s ease, transform 0.12s ease",
              textAlign: "center",
              width: "100%",
              padding: "0 24px",
            }}
          >
            <div className="text-[40px] sm:text-[64px] md:text-[88px] font-bold leading-none text-white">
              {g.text}
            </div>
          </div>
      )}

      {phase === "boot" && (
        <div
          style={{ animation: "fadeIn .3s ease both" }}
          className="flex flex-col items-center"
        >
          <style>{`@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }`}</style>
          <div className="font-display text-[88px] md:text-[180px] font-black leading-none tracking-[-0.05em]">
            ZYNTH
          </div>
          <div className="mt-6 w-[280px] md:w-[420px] h-px bg-white/15">
            <div className="h-px bg-white" style={{ width: `${progress}%`, transition: "width .25s linear" }} />
          </div>
          <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.32em] text-white/55">
            Compiling shaders · {String(progress).padStart(3, "000")}%
          </div>
        </div>
      )}
    </div>
  );
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
      <main>
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
      <Boot />

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
