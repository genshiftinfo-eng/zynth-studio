import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsAndConditions from "@/pages/terms-and-conditions";
import { MainLayout } from "./components/MainLayout";
import { Cursor } from "./components/Cursor";
import { SocialDock } from "./components/SocialDock";
import { NavDock } from "./components/NavDock";

const queryClient = new QueryClient();

const greetings = [
  { text: "Hello",          font: "'Archivo', sans-serif",             dir: "ltr" },
  { text: "Nǐ hǎo",        font: "'Noto Sans SC', sans-serif",         dir: "ltr" },
  { text: "Namaste",        font: "'Noto Sans Devanagari', sans-serif", dir: "ltr" },
  { text: "Bonjour",        font: "'Archivo', sans-serif",             dir: "ltr" },
  { text: "Hola",           font: "'Archivo', sans-serif",             dir: "ltr" },
  { text: "السلام عليكم",  font: "'Noto Naskh Arabic', serif",         dir: "rtl" },
  { text: "নমস্কার",       font: "'Noto Sans Bengali', sans-serif",    dir: "ltr" },
  { text: "Olá",            font: "'Archivo', sans-serif",             dir: "ltr" },
  { text: "Здравствуйте",  font: "'Noto Sans', sans-serif",            dir: "ltr" },
  { text: "Halo",           font: "'Archivo', sans-serif",             dir: "ltr" },
  { text: "こんにちは",     font: "'Noto Sans JP', sans-serif",         dir: "ltr" },
  { text: "أهلاً",         font: "'Noto Naskh Arabic', serif",         dir: "rtl" },
];

function Boot({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"greet" | "boot" | "done">("greet");
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (phase !== "greet") return;
    if (idx >= greetings.length) { setPhase("boot"); return; }
    setVisible(true);
    const t1 = setTimeout(() => setVisible(false), 300);
    const t2 = setTimeout(() => setIdx(i => i + 1), 450);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase, idx]);

  useEffect(() => {
    if (phase !== "boot") return;
    let v = 0;
    const id = setInterval(() => {
      v = Math.min(100, v + Math.random() * 20 + 12);
      setProgress(Math.floor(v));
      if (v >= 100) {
        clearInterval(id);
        setTimeout(() => { setPhase("done"); onDone(); }, 400);
      }
    }, 80);
    return () => clearInterval(id);
  }, [phase, onDone]);

  if (phase === "done") return null;

  const g = greetings[idx] ?? greetings[greetings.length - 1];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "#000", color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>

      {phase === "greet" && (
        <div key={idx} style={{
          fontFamily: g.font,
          direction: g.dir as "ltr" | "rtl",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-12px)",
          transition: "opacity 0.15s ease, transform 0.15s ease",
          textAlign: "center",
          width: "100%",
          padding: "0 32px",
        }}>
          <span style={{ fontSize: "clamp(36px, 10vw, 88px)", fontWeight: 700, lineHeight: 1 }}>
            {g.text}
          </span>
        </div>
      )}

      {phase === "boot" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: "fadeIn .3s ease both" }}>
          <div style={{
            fontSize: "clamp(64px, 14vw, 180px)",
            fontWeight: 900,
            letterSpacing: "-0.05em",
            lineHeight: 1,
            fontFamily: "'Archivo', sans-serif",
          }}>
            ZYNTH
          </div>
          <div style={{ marginTop: 24, width: "min(420px, 80vw)", height: 1, background: "rgba(255,255,255,0.15)" }}>
            <div style={{ height: 1, background: "#fff", width: `${progress}%`, transition: "width .25s linear" }} />
          </div>
          <div style={{ marginTop: 12, fontFamily: "monospace", fontSize: 10, letterSpacing: "0.32em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
            Compiling shaders · {String(progress).padStart(3, "0")}%
          </div>
        </div>
      )}
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  const prevLocation = useRef(location);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prevLocation.current === location) return;
    prevLocation.current = location;
    window.scrollTo(0, 0);
    const el = contentRef.current;
    if (el) {
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "pageEnter 0.4s cubic-bezier(0.16,1,0.3,1) both";
    }
  }, [location]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:font-mono focus:text-[11px] focus:uppercase focus:tracking-[0.28em]"
      >
        Skip to content
      </a>
      <style>{`@keyframes pageEnter{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div ref={contentRef}>
        <Switch>
          <Route path="/" component={MainLayout} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-and-conditions" component={TermsAndConditions} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </>
  );
}

function App() {
  const [booted, setBooted] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Cursor />
        <SocialDock />
        <NavDock />
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
        {!booted && <Boot onDone={() => setBooted(true)} />}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
