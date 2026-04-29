import { useEffect, useMemo, useRef, useState } from "react";

type Field = "name" | "email" | "message";

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
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1   0 0 0 0.32 0"
          />
        </filter>
        <filter id="paper-fibers">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.7" numOctaves="2" seed="9" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.85   0 0 0 0 0.85   0 0 0 0 0.85   0 0 0 0.18 0"
          />
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="#ffffff" />
      <rect width="100%" height="100%" filter="url(#paper-fibers)" />
      <rect width="100%" height="100%" filter="url(#paper-noise)" opacity="0.6" />
    </svg>
  );
}

/** A real-looking pencil eraser: tan/white rubber body, dark ferrule cap, slightly worn corner.
 *  Pure black/white per the brief — uses the cap as a "metal band" and the body as the rubber. */
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
        {/* Soft shadow under the eraser */}
        <ellipse cx="19" cy="25" rx="14" ry="2" fill="rgba(0,0,0,.35)" />
        {/* Ferrule (the metal band that holds the rubber to the pencil) */}
        <rect x="2" y="0" width="34" height="6" fill="#000" />
        <rect x="2" y="2" width="34" height="0.6" fill="#fff" opacity="0.5" />
        <rect x="2" y="4.5" width="34" height="0.6" fill="#fff" opacity="0.5" />
        {/* Eraser body (rubber) — slightly trapezoidal, white with a thin black contour */}
        <path
          d="M 1 6 L 37 6 L 35 22 Q 34 24 32 24 L 6 24 Q 4 24 3 22 Z"
          fill="#fff"
          stroke="#000"
          strokeWidth="1.2"
        />
        {/* Worn / smudged front corner */}
        <path d="M 32 24 Q 34 24 35 22 L 37 6 L 36 6 L 34 21 Q 33 23 32 23 Z" fill="#000" opacity="0.18" />
        {/* Eraser texture lines */}
        <line x1="6" y1="11" x2="32" y2="11" stroke="#000" strokeWidth="0.4" opacity="0.18" />
        <line x1="7" y1="16" x2="31" y2="16" stroke="#000" strokeWidth="0.4" opacity="0.12" />
        {/* The ZYNTH brand stamp on the side */}
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
      {/* Falling rubber crumbs */}
      {active && (
        <>
          <span
            className="absolute"
            style={{
              left: 4,
              top: 22,
              width: 3,
              height: 3,
              background: "#000",
              borderRadius: 1,
              animation: "crumb-fall 600ms ease-in 0ms forwards",
            }}
          />
          <span
            className="absolute"
            style={{
              left: 14,
              top: 22,
              width: 2,
              height: 2,
              background: "#000",
              borderRadius: 1,
              animation: "crumb-fall 700ms ease-in 80ms forwards",
            }}
          />
          <span
            className="absolute"
            style={{
              left: 24,
              top: 22,
              width: 2.5,
              height: 2.5,
              background: "#000",
              borderRadius: 1,
              animation: "crumb-fall 650ms ease-in 40ms forwards",
            }}
          />
          <span
            className="absolute"
            style={{
              left: 30,
              top: 22,
              width: 1.6,
              height: 1.6,
              background: "#000",
              borderRadius: 1,
              animation: "crumb-fall 800ms ease-in 130ms forwards",
            }}
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
        const inActiveErase =
          erasing &&
          erasing.field === field &&
          i >= erasing.from &&
          i < erasing.to;
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
      {/* Pen ink caret at end of text */}
      <span
        aria-hidden
        className="ml-0.5 inline-block h-[0.9em] w-[3px] align-baseline bg-black"
        style={{ transform: "translateY(0.12em)", animation: "ink-blink 1s steps(2) infinite" }}
      />
      {/* Eraser sprite, perched at the end of the text where the rubbing happens */}
      {isErasingHere && <EraserSprite active />}
    </span>
  );
}

export function Contact() {
  const [values, setValues] = useState<Record<Field, string>>({ name: "", email: "", message: "" });
  const [active, setActive] = useState<Field>("name");
  const [erase, setErase] = useState<Erase | null>(null);
  const [folding, setFolding] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string>("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const eraseId = useRef(0);

  const hiddenRef = useRef<HTMLInputElement | null>(null);
  const hiddenAreaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!hasInteracted) return;
    if (active === "message") hiddenAreaRef.current?.focus({ preventScroll: true });
    else hiddenRef.current?.focus({ preventScroll: true });
  }, [active, hasInteracted]);

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
        setValues((v) => ({
          ...v,
          [field]: v[field].slice(0, from) + v[field].slice(to),
        }));
        setErase(null);
      }
    }
    requestAnimationFrame(step);
  }

  function handleKey(field: Field, e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
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
    // Any other key — likely a character
    if (e.key.length === 1) dispatchPenStroke();
  }

  function handleChange(field: Field, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const v = e.target.value;
    if (v.length < values[field].length) return;
    commit(field, v);
  }

  function submit() {
    if (folding || submitted) return;
    if (!values.name.trim() || !values.email.trim() || !values.message.trim()) {
      const missing = (["name", "email", "message"] as Field[]).find((k) => !values[k].trim());
      if (missing) {
        setActive(missing);
        setHasInteracted(true);
      }
      return;
    }
    setFolding(true);
    setSubmittedAt(new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC");
    window.setTimeout(() => setSubmitted(true), 1100);
  }

  function reset() {
    setValues({ name: "", email: "", message: "" });
    setActive("name");
    setFolding(false);
    setSubmitted(false);
  }

  return (
    <section
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
              the eraser. When you are done, the page folds itself and is delivered to the studio.
            </p>
          </div>
        </div>

        {/* Desk */}
        <div
          className="relative mx-auto w-full max-w-5xl rounded-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,.04), transparent 60%), #0a0a0a",
            padding: "32px 22px 64px",
            border: "1px solid rgba(255,255,255,.08)",
          }}
        >
          <div className="mb-8 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
            <span>Tools · Marker 7B · Eraser Mk.II</span>
            <span>Paper 240gsm matte</span>
          </div>

          <div
            className="relative mx-auto w-full overflow-hidden"
            style={{ perspective: "1400px" }}
          >
            <div
              className="relative mx-auto bg-white text-black"
              data-testid="contact-paper"
              style={{
                width: "100%",
                maxWidth: 880,
                minHeight: 460,
                transformStyle: "preserve-3d",
                transformOrigin: "50% 30%",
                transition:
                  "transform 1.2s cubic-bezier(.6,.05,.2,1), opacity 1.2s ease, filter 1.2s ease",
                transform: folding
                  ? "translate3d(40vw,-40vh,0) rotate3d(1,-1,0.4,68deg) scale(.4)"
                  : "translate3d(0,0,0)",
                opacity: folding && submitted ? 0 : 1,
                boxShadow:
                  "0 30px 80px rgba(0,0,0,.7), 0 1px 0 rgba(255,255,255,.04) inset",
              }}
            >
              <PaperGrain />

              {folding && (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, transparent 49.5%, rgba(0,0,0,.18) 50%, transparent 50.5%)",
                  }}
                />
              )}

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-6 p-8 md:p-12">
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
                        {/* The writing surface — a pencil-ruled line */}
                        <div className="absolute inset-x-0 bottom-0 h-px bg-black" />
                        <div className="absolute inset-x-0 bottom-0 translate-y-[3px] h-px bg-black/40" />

                        <div
                          className="text-[28px] md:text-[40px]"
                          style={{ wordBreak: "break-word" }}
                        >
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
                    By submitting, you authorize the studio to fold this page into a paper plane and deliver it,
                    by hand, to our principal partners.
                  </div>
                  <button
                    onClick={submit}
                    disabled={folding}
                    data-cursor="Send"
                    data-testid="contact-submit"
                    className="group relative inline-flex items-center gap-4 border-2 border-black bg-black px-6 py-4 font-display text-[14px] uppercase tracking-[0.28em] text-white disabled:opacity-60"
                  >
                    <span>Fold & Send</span>
                    <span className="inline-block h-3 w-3 rotate-45 bg-white transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>

            {submitted && (
              <div
                className="mt-12 mx-auto max-w-3xl border border-white/15 bg-black p-10 text-white"
                data-testid="contact-confirmation"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/55">
                  Transmission · Received · {submittedAt}
                </div>
                <h3 className="mt-4 font-display text-[36px] md:text-[56px] font-black leading-[1] tracking-[-0.04em]">
                  The plane is in flight.
                </h3>
                <p className="mt-4 max-w-[58ch] text-white/65 text-[15px] leading-[1.65]">
                  Your brief, <span className="text-white">{values.name || "anonymous"}</span>, has been
                  hand-folded and dispatched. We answer every transmission within forty-eight hours, in writing,
                  signed.
                </p>
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
            disabled={folding}
          />
          <textarea
            ref={hiddenAreaRef}
            value={active === "message" ? values.message : ""}
            onChange={(e) => handleChange("message", e)}
            onKeyDown={(e) => handleKey("message", e)}
            tabIndex={-1}
            aria-hidden="true"
            className="absolute -left-[9999px] top-0 h-px w-px opacity-0"
            disabled={folding}
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
