import { useEffect, useMemo, useRef, useState } from "react";

type Field = "name" | "email" | "message";
type Stage = "pre" | "pinning" | "ready" | "folding" | "flying" | "submitted";

const FIELDS: { key: Field; label: string; placeholder: string; type: "text" | "email" | "textarea"; max: number }[] = [
  { key: "name", label: "01 · Your Name", placeholder: "Last, first.", type: "text", max: 60 },
  { key: "email", label: "02 · Channel", placeholder: "you@studio.com", type: "email", max: 80 },
  { key: "message", label: "03 · The Brief", placeholder: "What are we building?", type: "textarea", max: 300 },
];

type Erase = { id: number; field: Field; from: number; to: number; t: number };

function useTypewriterStrokes(value: string, _: Field) {
  return useMemo(() => {
    const seed = (s: string) => {
      let h = 2166136261;
      for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
      return (h >>> 0) / 0xffffffff;
    };
    return value.split("").map((ch, i) => {
      const r = seed(`${ch}-${i}`);
      return {
        ch,
        rotate: (r - 0.5) * 4,
        ty: (r - 0.5) * 3,
        weight: 700 + Math.floor(r * 200),
        ink: 0.85 + r * 0.15,
      };
    });
  }, [value]);
}

function PaperGrain() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <filter id="paper-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0   0 0 0 0.06 0"
          />
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="#ffffff" />
      <rect width="100%" height="100%" filter="url(#paper-noise)" />
      {/* subtle paper edges shadow */}
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="none"
        stroke="rgba(0,0,0,0.08)"
        strokeWidth="1"
      />
    </svg>
  );
}

function PushPin({ delay = 0, position }: { delay?: number; position: "tl" | "tr" | "bl" | "br" }) {
  const positions: Record<string, React.CSSProperties> = {
    tl: { top: -10, left: -10 },
    tr: { top: -10, right: -10 },
    bl: { bottom: -10, left: -10 },
    br: { bottom: -10, right: -10 },
  };
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute z-30"
      style={{
        ...positions[position],
        width: 24,
        height: 24,
        animation: `pin-stamp 600ms cubic-bezier(.4,1.7,.5,1) ${delay}ms both`,
        transformOrigin: "center",
        filter: "drop-shadow(0 2px 2px rgba(0,0,0,.5))",
      }}
    >
      <svg viewBox="0 0 24 24" width="24" height="24">
        {/* Pin head shadow / outer ring */}
        <circle cx="12" cy="12" r="10" fill="#000" />
        {/* Pin head */}
        <circle cx="12" cy="12" r="9" fill="#fff" stroke="#000" strokeWidth="1" />
        {/* Highlight */}
        <ellipse cx="9" cy="9" rx="3.5" ry="2.5" fill="#fff" opacity="0.9" />
        <ellipse cx="9" cy="9" rx="2" ry="1.4" fill="#fff" />
        {/* Center dot */}
        <circle cx="12" cy="12" r="2" fill="#000" />
      </svg>
    </span>
  );
}

function Mailbox({ stage }: { stage: Stage }) {
  const visible = stage === "flying" || stage === "submitted";
  // door is open during the first portion of "flying", closed once the letter is in
  const doorAnim = stage === "flying" ? "door-open-close 1.5s ease-in-out forwards" : "none";
  const flagRotate = stage === "submitted" ? 0 : 90; // 90 = horizontal/down, 0 = vertical/up
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-40"
      style={{
        top: -84,
        right: -20,
        width: 170,
        height: 150,
        opacity: visible ? 1 : 0,
        transform: visible ? "translate(0,0)" : "translate(70px,-30px)",
        transition: "opacity .55s ease, transform .7s cubic-bezier(.4,1.4,.4,1)",
      }}
    >
      <svg viewBox="0 0 170 150" width="170" height="150" style={{ overflow: "visible" }}>
        {/* Post */}
        <rect x="78" y="118" width="14" height="32" fill="#000" />
        {/* Ground shadow */}
        <ellipse cx="85" cy="120" rx="60" ry="3.5" fill="rgba(0,0,0,0.45)" />
        {/* Mailbox body — tunnel side view */}
        <path
          d="M 8 118 L 8 60 Q 8 18 85 18 Q 162 18 162 60 L 162 118 Z"
          fill="#fff"
          stroke="#000"
          strokeWidth="2.5"
        />
        {/* Body horizontal seams (depth detail) */}
        <line x1="8" y1="60" x2="162" y2="60" stroke="#000" strokeWidth="0.6" opacity="0.18" />
        <line x1="8" y1="90" x2="162" y2="90" stroke="#000" strokeWidth="0.6" opacity="0.14" />
        {/* Bottom band */}
        <line x1="8" y1="118" x2="162" y2="118" stroke="#000" strokeWidth="2.5" />
        {/* Door — hinged at the bottom-right corner so it swings outward/down */}
        <g
          style={{
            transformOrigin: "162px 118px",
            transform: "rotate(0deg)",
            animation: doorAnim,
          }}
        >
          <path
            d="M 162 118 L 162 60 Q 162 18 130 18 L 142 18 Q 162 18 162 38 L 162 118 Z"
            fill="#fff"
            stroke="#000"
            strokeWidth="2.5"
          />
          <circle cx="148" cy="60" r="2.4" fill="#000" />
          <line x1="148" y1="56" x2="148" y2="64" stroke="#000" strokeWidth="1.4" />
        </g>
        {/* Flag — rises when mail is delivered */}
        <g
          style={{
            transformOrigin: "162px 70px",
            transform: `rotate(${flagRotate}deg)`,
            transition: "transform .55s cubic-bezier(.4,1.7,.5,1)",
          }}
        >
          <line x1="162" y1="70" x2="162" y2="22" stroke="#000" strokeWidth="2.5" />
          <path d="M 162 22 L 188 30 L 162 40 Z" fill="#000" />
        </g>
      </svg>
      {stage === "submitted" && (
        <span
          className="absolute font-mono text-[9px] uppercase tracking-[0.3em] text-white/80"
          style={{ top: -16, right: 12 }}
        >
          ↑ Outgoing
        </span>
      )}
    </div>
  );
}

/** A real-looking pencil eraser: rubber body, dark ferrule cap, slightly worn corner. */
function EraserSprite({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute z-30"
      style={{
        bottom: -2,
        right: -6,
        width: 38,
        height: 26,
        transformOrigin: "70% 50%",
        animation: active ? "eraser-wiggle 220ms ease-in-out infinite" : "none",
      }}
    >
      <svg viewBox="0 0 38 26" width="38" height="26" style={{ display: "block", overflow: "visible" }}>
        <ellipse cx="19" cy="25" rx="14" ry="2" fill="rgba(0,0,0,.35)" />
        <rect x="2" y="0" width="34" height="6" fill="#000" />
        <rect x="2" y="2" width="34" height="0.6" fill="#fff" opacity="0.5" />
        <rect x="2" y="4.5" width="34" height="0.6" fill="#fff" opacity="0.5" />
        <path
          d="M 1 6 L 37 6 L 35 22 Q 34 24 32 24 L 6 24 Q 4 24 3 22 Z"
          fill="#fff"
          stroke="#000"
          strokeWidth="1.2"
        />
        <path d="M 32 24 Q 34 24 35 22 L 37 6 L 36 6 L 34 21 Q 33 23 32 23 Z" fill="#000" opacity="0.18" />
        <line x1="6" y1="11" x2="32" y2="11" stroke="#000" strokeWidth="0.4" opacity="0.18" />
        <line x1="7" y1="16" x2="31" y2="16" stroke="#000" strokeWidth="0.4" opacity="0.12" />
        <text
          x="19"
          y="20"
          textAnchor="middle"
          fontSize="3.6"
          fontFamily="Archivo, sans-serif"
          fontWeight="900"
          fill="#000"
          opacity="0.6"
          letterSpacing="0.4"
        >
          ZYNTH
        </text>
      </svg>
      {active && (
        <>
          <span
            className="absolute"
            style={{ left: 4, top: 22, width: 3, height: 3, background: "#000", borderRadius: 1, animation: "crumb-fall 600ms ease-in 0ms forwards" }}
          />
          <span
            className="absolute"
            style={{ left: 14, top: 22, width: 2, height: 2, background: "#000", borderRadius: 1, animation: "crumb-fall 700ms ease-in 80ms forwards" }}
          />
          <span
            className="absolute"
            style={{ left: 24, top: 22, width: 2.5, height: 2.5, background: "#000", borderRadius: 1, animation: "crumb-fall 650ms ease-in 40ms forwards" }}
          />
          <span
            className="absolute"
            style={{ left: 30, top: 22, width: 1.6, height: 1.6, background: "#000", borderRadius: 1, animation: "crumb-fall 800ms ease-in 130ms forwards" }}
          />
        </>
      )}
    </span>
  );
}

function InkText({
  value,
  field,
  erasing,
}: {
  value: string;
  field: Field;
  erasing: Erase | null;
}) {
  const strokes = useTypewriterStrokes(value, field);
  const isErasingHere = !!(erasing && erasing.field === field);

  return (
    <span className="relative inline-block leading-[1.05]" style={{ paddingRight: isErasingHere ? 28 : 0 }}>
      {strokes.map((s, i) => {
        const inActiveErase = erasing && erasing.field === field && i >= erasing.from && i < erasing.to;
        const fade = inActiveErase ? 1 - erasing!.t : 1;
        const tx = inActiveErase ? -erasing!.t * 6 : 0;
        const blur = inActiveErase ? erasing!.t * 1.4 : 0;
        return (
          <span
            key={i}
            className="font-display"
            style={{
              display: "inline-block",
              color: "#000",
              fontWeight: s.weight,
              transform: `translateY(${s.ty}px) translateX(${tx}px) rotate(${s.rotate}deg)`,
              opacity: s.ink * fade,
              filter: `blur(${0.2 + blur}px)`,
              whiteSpace: "pre",
              transition: "opacity .15s linear, transform .25s cubic-bezier(.6,0,.2,1), filter .2s ease",
            }}
          >
            {s.ch === " " ? "\u00A0" : s.ch}
          </span>
        );
      })}
      <span
        aria-hidden
        className="ml-0.5 inline-block h-[0.9em] w-[3px] align-baseline bg-black"
        style={{ transform: "translateY(0.12em)", animation: "ink-blink 1s steps(2) infinite" }}
      />
      {isErasingHere && <EraserSprite active />}
    </span>
  );
}

export function Contact() {
  const [values, setValues] = useState<Record<Field, string>>({ name: "", email: "", message: "" });
  const [active, setActive] = useState<Field>("name");
  const [erase, setErase] = useState<Erase | null>(null);
  const [stage, setStage] = useState<Stage>("pre");
  const [submittedAt, setSubmittedAt] = useState<string>("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const eraseId = useRef(0);

  const sectionRef = useRef<HTMLElement | null>(null);
  const hiddenRef = useRef<HTMLInputElement | null>(null);
  const hiddenAreaRef = useRef<HTMLTextAreaElement | null>(null);

  // Trigger pin-in animation when section enters view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStage((s) => (s === "pre" ? "pinning" : s));
        }
      },
      { threshold: 0.18 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Stage timing: pinning → ready, folding → flying → submitted
  useEffect(() => {
    if (stage === "pinning") {
      const t = window.setTimeout(() => setStage("ready"), 1500);
      return () => window.clearTimeout(t);
    }
    if (stage === "folding") {
      const t = window.setTimeout(() => setStage("flying"), 1000);
      return () => window.clearTimeout(t);
    }
    if (stage === "flying") {
      const t = window.setTimeout(() => setStage("submitted"), 1500);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [stage]);

  useEffect(() => {
    if (!hasInteracted || stage !== "ready") return;
    if (active === "message") hiddenAreaRef.current?.focus({ preventScroll: true });
    else hiddenRef.current?.focus({ preventScroll: true });
  }, [active, hasInteracted, stage]);

  function commit(field: Field, next: string) {
    const max = FIELDS.find((f) => f.key === field)!.max;
    const trimmed = next.slice(0, max);
    setValues((v) => ({ ...v, [field]: trimmed }));
  }

  function dispatchPenStroke() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("zynth:pen-stroke"));
    }
  }

  function startErase(field: Field, from: number, to: number) {
    if (from >= to) return;
    const id = ++eraseId.current;
    setErase({ id, field, from, to, t: 0 });
    const start = performance.now();
    const dur = 320;
    function step(now: number) {
      const t = Math.min(1, (now - start) / dur);
      setErase((cur) => (cur && cur.id === id ? { ...cur, t } : cur));
      if (t < 1) requestAnimationFrame(step);
      else {
        setValues((v) => ({ ...v, [field]: v[field].slice(0, from) + v[field].slice(to) }));
        setErase(null);
      }
    }
    requestAnimationFrame(step);
  }

  function handleKey(field: Field, e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (stage !== "ready") return;
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      const cur = values[field];
      if (!cur) return;
      const sliceFrom = e.key === "Backspace" ? cur.length - 1 : 0;
      const sliceTo = e.key === "Backspace" ? cur.length : 1;
      startErase(field, sliceFrom, sliceTo);
      return;
    }
    if (e.key === "Enter" && field !== "message") {
      e.preventDefault();
      const order: Field[] = ["name", "email", "message"];
      const next = order[order.indexOf(field) + 1];
      if (next) setActive(next);
      return;
    }
    if (e.key.length === 1) dispatchPenStroke();
  }

  function handleChange(field: Field, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (stage !== "ready") return;
    const v = e.target.value;
    if (v.length < values[field].length) return;
    commit(field, v);
  }

  function submit() {
    if (stage !== "ready") return;
    if (!values.name.trim() || !values.email.trim() || !values.message.trim()) {
      const missing = (["name", "email", "message"] as Field[]).find((k) => !values[k].trim());
      if (missing) {
        setActive(missing);
        setHasInteracted(true);
      }
      return;
    }
    setSubmittedAt(new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC");
    setStage("folding");
  }

  function reset() {
    setValues({ name: "", email: "", message: "" });
    setActive("name");
    setStage("pinning");
  }

  const formInteractive = stage === "ready";
  const showPins = stage !== "pre";
  const paperVisible = stage !== "pre";
  const formContentVisible = stage === "ready" || stage === "pinning";
  const folded = stage === "folding" || stage === "flying";
  const flying = stage === "flying";
  const showConfirmation = stage === "submitted";

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative bg-black py-24 md:py-32 border-t border-white/10 overflow-hidden"
      data-testid="section-contact"
    >
      <style>{`
        @keyframes eraser-wiggle {
          0%   { transform: translateX(0)     rotate(-2deg); }
          25%  { transform: translateX(-3px)  rotate(3deg); }
          50%  { transform: translateX(2px)   rotate(-4deg); }
          75%  { transform: translateX(-2px)  rotate(2deg); }
          100% { transform: translateX(0)     rotate(-2deg); }
        }
        @keyframes crumb-fall {
          0%   { transform: translate(0,0) rotate(0deg);   opacity: 1; }
          100% { transform: translate(0,28px) rotate(140deg); opacity: 0; }
        }
        @keyframes ink-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes pin-stamp {
          0%   { transform: translate(0,-40px) scale(2.6) rotate(-12deg); opacity: 0; }
          55%  { transform: translate(0,3px)   scale(0.82) rotate(0deg);  opacity: 1; }
          80%  { transform: translate(0,-1px)  scale(1.06) rotate(0deg);  opacity: 1; }
          100% { transform: translate(0,0)     scale(1)    rotate(0deg);  opacity: 1; }
        }
        @keyframes paper-unroll {
          0%   { transform: scaleX(0.04); filter: blur(2px); opacity: 0.4; }
          60%  { transform: scaleX(1.02); filter: blur(0);   opacity: 1; }
          100% { transform: scaleX(1);    filter: blur(0);   opacity: 1; }
        }
        @keyframes door-open-close {
          0%   { transform: rotate(0deg); }
          12%  { transform: rotate(-118deg); }
          70%  { transform: rotate(-118deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes envelope-flight {
          0%   { transform: translate(0,0) scale(1)    rotate(0deg);  opacity: 1; }
          35%  { transform: translate(28%,-180%) scale(0.42) rotate(18deg); opacity: 1; }
          75%  { transform: translate(48%,-260%) scale(0.16) rotate(-4deg); opacity: 1; }
          100% { transform: translate(48%,-260%) scale(0.08) rotate(0deg);  opacity: 0; }
        }
        @keyframes fold-crease {
          0%   { transform: scaleX(0); opacity: 0; }
          100% { transform: scaleX(1); opacity: 1; }
        }
        @keyframes confirm-rise {
          0%   { transform: translateY(40px); opacity: 0; filter: blur(4px); }
          100% { transform: translateY(0);    opacity: 1; filter: blur(0);   }
        }
        @keyframes board-fade-in {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>

      <div className="px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
          <div className="md:col-span-4 font-mono text-[10px] tracking-[0.32em] uppercase text-white/55">
            <div>N° 006 / Contact</div>
            <div className="mt-2 text-white/35">— Hand-write the brief</div>
          </div>
          <div className="md:col-span-8">
            <h2 className="font-display text-[44px] md:text-[88px] leading-[0.92] font-black tracking-[-0.045em] text-white">
              Open a brief.
              <br />
              <span className="font-serif italic font-light">By hand.</span>
            </h2>
            <p className="mt-8 max-w-[58ch] text-white/65 text-[15px] leading-[1.65]">
              ZYNTH does not use forms. Click a field — your cursor becomes a pen. Backspace summons
              the eraser. When you are done, the page folds itself into an envelope and is delivered
              to the studio mailbox.
            </p>
          </div>
        </div>

        {/* Drafting board */}
        <div
          className="relative mx-auto w-full max-w-5xl"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,.05), transparent 60%), #0a0a0a",
            padding: "44px 28px 72px",
            border: "1px solid rgba(255,255,255,.08)",
          }}
        >
          {/* Cork/board texture */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
            style={{ opacity: 0.55, mixBlendMode: "screen" }}
          >
            <defs>
              <filter id="cork-noise">
                <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" seed="5" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0.18  0 0 0 0 0.18  0 0 0 0 0.18  0 0 0 0.6 0"
                />
              </filter>
              <pattern id="cross-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="8" stroke="#fff" strokeWidth="0.25" opacity="0.06" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" filter="url(#cork-noise)" />
            <rect width="100%" height="100%" fill="url(#cross-hatch)" />
          </svg>

          <div className="relative z-10 mb-8 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
            <span>Tools · Marker 7B · Eraser Mk.II</span>
            <span>Paper 240gsm matte · Drafting Board N°4</span>
          </div>

          <div
            className="relative z-10 mx-auto w-full"
            style={{ perspective: "1600px" }}
          >
            {/* Paper container — also the flight wrapper for the envelope animation */}
            <div
              className="relative mx-auto"
              style={{
                width: "100%",
                maxWidth: 880,
                animation: flying ? "envelope-flight 1.5s cubic-bezier(.4,.0,.25,1) forwards" : "none",
              }}
            >
              {/* The paper */}
              <div
                className="relative mx-auto bg-white text-black"
                data-testid="contact-paper"
                style={{
                  minHeight: 460,
                  transformOrigin: "center center",
                  animation: stage === "pinning" ? "paper-unroll 700ms cubic-bezier(.3,1.4,.4,1) forwards" : "none",
                  transform: paperVisible
                    ? folded
                      ? "scaleY(0.42) scaleX(0.78)"
                      : "scaleX(1)"
                    : "scaleX(0)",
                  transition:
                    stage === "folding"
                      ? "transform .9s cubic-bezier(.6,.04,.3,1)"
                      : stage === "flying"
                        ? "transform .4s ease"
                        : "transform .4s ease",
                  boxShadow:
                    "0 30px 80px rgba(0,0,0,.7), 0 1px 0 rgba(255,255,255,.04) inset",
                  willChange: "transform",
                }}
              >
                <PaperGrain />

                {/* Push pins — appear after paper unrolls */}
                {showPins && stage !== "folding" && stage !== "flying" && (
                  <>
                    <PushPin position="tl" delay={650} />
                    <PushPin position="tr" delay={780} />
                    <PushPin position="bl" delay={910} />
                    <PushPin position="br" delay={1040} />
                  </>
                )}

                {/* Fold creases — appear during folding */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0"
                  style={{
                    top: "33.33%",
                    height: 1,
                    background: "rgba(0,0,0,.35)",
                    transformOrigin: "center",
                    opacity: folded ? 1 : 0,
                    animation: stage === "folding" ? "fold-crease .35s ease-out 80ms both" : "none",
                  }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0"
                  style={{
                    top: "66.66%",
                    height: 1,
                    background: "rgba(0,0,0,.35)",
                    transformOrigin: "center",
                    opacity: folded ? 1 : 0,
                    animation: stage === "folding" ? "fold-crease .35s ease-out 200ms both" : "none",
                  }}
                />

                {/* Envelope flap — appears during folding/flying */}
                <svg
                  aria-hidden
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  style={{
                    opacity: folded ? 1 : 0,
                    transition: "opacity .4s ease",
                  }}
                >
                  <polygon
                    points="0,0 50,55 100,0"
                    fill="rgba(0,0,0,0.04)"
                    stroke="#000"
                    strokeWidth="0.25"
                    vectorEffect="non-scaling-stroke"
                  />
                  <line x1="0" y1="0" x2="100" y2="0" stroke="#000" strokeWidth="0.4" vectorEffect="non-scaling-stroke" opacity="0.4" />
                </svg>

                {/* Form content */}
                <div
                  className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-6 p-8 md:p-12"
                  style={{
                    opacity: formContentVisible ? 1 : 0,
                    transition: "opacity .35s ease",
                    pointerEvents: formInteractive ? "auto" : "none",
                  }}
                >
                  <div className="md:col-span-12 flex items-baseline justify-between border-b border-black pb-4">
                    <div className="font-display text-[28px] md:text-[40px] font-black tracking-[-0.04em]">
                      ZYNTH
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-black/55">
                      Brief Form · MMXXVI
                    </div>
                  </div>

                  {FIELDS.map((f) => {
                    const isActive = active === f.key;
                    return (
                      <div
                        key={f.key}
                        className={`relative ${f.key === "message" ? "md:col-span-12" : "md:col-span-6"}`}
                        onClick={() => {
                          if (!formInteractive) return;
                          setActive(f.key);
                          setHasInteracted(true);
                        }}
                        data-cursor={isActive ? "Writing" : "Click"}
                      >
                        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-black/55 mb-2">
                          {f.label}
                        </div>
                        <div
                          className="relative px-1 pb-1"
                          style={{ minHeight: f.key === "message" ? 160 : 64 }}
                        >
                          <div className="absolute inset-x-0 bottom-0 h-px bg-black" />
                          <div className="absolute inset-x-0 bottom-0 translate-y-[3px] h-px bg-black/40" />

                          <div className="text-[28px] md:text-[40px]" style={{ wordBreak: "break-word" }}>
                            {values[f.key] ? (
                              <InkText value={values[f.key]} field={f.key} erasing={erase} />
                            ) : (
                              <span className="font-display text-black/30 italic">{f.placeholder}</span>
                            )}
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-black/45">
                          <span>{isActive ? "● Pen ready" : "○ Tap to write"}</span>
                          <span>
                            {values[f.key].length} / {f.max}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  <div className="md:col-span-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-t border-black pt-6">
                    <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-black/55 max-w-[42ch]">
                      By submitting, you authorize the studio to fold this page into an envelope and
                      drop it in the outgoing mail.
                    </div>
                    <button
                      onClick={submit}
                      disabled={!formInteractive}
                      data-cursor="Send"
                      data-testid="contact-submit"
                      className="group relative inline-flex items-center gap-4 border-2 border-black bg-black px-6 py-4 font-display text-[14px] uppercase tracking-[0.28em] text-white disabled:opacity-60"
                    >
                      <span>Fold & Mail</span>
                      <span className="inline-block h-3 w-3 rotate-45 bg-white transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mailbox — slides in for flying/submitted */}
              <Mailbox stage={stage} />
            </div>

            {/* Confirmation message */}
            {showConfirmation && (
              <div
                className="mt-12 mx-auto max-w-3xl border border-white/15 bg-black p-10 text-white"
                data-testid="contact-confirmation"
                style={{ animation: "confirm-rise .7s cubic-bezier(.3,1.2,.4,1) forwards" }}
              >
                <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.32em] text-white/55">
                  <span className="inline-block h-1.5 w-1.5 bg-white" />
                  Mail · Delivered · {submittedAt}
                </div>
                <h3 className="mt-4 font-display text-[36px] md:text-[56px] font-black leading-[1] tracking-[-0.04em]">
                  Letter posted.
                </h3>
                <p className="mt-4 max-w-[58ch] text-white/65 text-[15px] leading-[1.65]">
                  Your brief, <span className="text-white">{values.name || "anonymous"}</span>, has
                  been folded, sealed, and dropped in the outgoing box. The flag is up. We answer
                  every transmission within forty-eight hours, in writing, signed.
                </p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
                  <div>
                    <div className="text-white/35">Tracking</div>
                    <div className="mt-1 text-white">ZYN-{submittedAt.slice(2, 10).replace(/-/g, "")}-{values.email.length.toString().padStart(2, "0")}</div>
                  </div>
                  <div>
                    <div className="text-white/35">Recipient</div>
                    <div className="mt-1 text-white">Studio Partners · SoMa</div>
                  </div>
                  <div>
                    <div className="text-white/35">Reply expected</div>
                    <div className="mt-1 text-white">{"≤ 48h · Hand-signed"}</div>
                  </div>
                </div>
                <button
                  onClick={reset}
                  data-cursor="Reset"
                  className="mt-8 inline-flex items-center gap-3 border border-white/30 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.28em] hover-elevate"
                >
                  <span className="inline-block h-1.5 w-1.5 bg-white" />
                  Begin a new brief
                </button>
              </div>
            )}
          </div>

          {/* Hidden inputs for native keyboard handling */}
          <input
            ref={hiddenRef}
            value={active === "message" ? "" : values[active] || ""}
            onChange={(e) => handleChange(active, e)}
            onKeyDown={(e) => handleKey(active, e)}
            type={active === "email" ? "email" : "text"}
            tabIndex={-1}
            aria-hidden="true"
            className="absolute -left-[9999px] top-0 h-px w-px opacity-0"
            autoComplete="off"
            disabled={!formInteractive}
          />
          <textarea
            ref={hiddenAreaRef}
            value={active === "message" ? values.message : ""}
            onChange={(e) => handleChange("message", e)}
            onKeyDown={(e) => handleKey("message", e)}
            tabIndex={-1}
            aria-hidden="true"
            className="absolute -left-[9999px] top-0 h-px w-px opacity-0"
            disabled={!formInteractive}
          />
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/10 pt-10">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">Studio</div>
            <div className="mt-2 font-display text-[20px] text-white">SoMa, San Francisco</div>
            <div className="text-white/55 text-[13px]">By appointment only</div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">Partners</div>
            <a href="mailto:partners@zynth.studio" className="ink-stroke mt-2 block font-display text-[20px] text-white">
              partners@zynth.studio
            </a>
            <div className="text-white/55 text-[13px]">For new engagements</div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">Press</div>
            <a href="mailto:press@zynth.studio" className="ink-stroke mt-2 block font-display text-[20px] text-white">
              press@zynth.studio
            </a>
            <div className="text-white/55 text-[13px]">Awwwards · FWA · CSSDA</div>
          </div>
        </div>
      </div>
    </section>
  );
}
