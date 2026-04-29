import { useEffect, useMemo, useRef, useState } from "react";

type Field = "name" | "email" | "message";

const FIELDS: { key: Field; label: string; placeholder: string; type: "text" | "email" | "textarea"; max: number }[] = [
  { key: "name", label: "01 · Your Name", placeholder: "Last, first.", type: "text", max: 60 },
  { key: "email", label: "02 · Channel", placeholder: "you@studio.com", type: "email", max: 80 },
  { key: "message", label: "03 · The Brief", placeholder: "What are we building?", type: "textarea", max: 300 },
];

type Erase = { id: number; field: Field; from: number; to: number; t: number };

function useTypewriterStrokes(value: string, _: Field) {
  // Synthesize per-character stroke jitter so each glyph rendered on the paper feels hand-laid
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
        rotate: (r - 0.5) * 4, // deg
        ty: (r - 0.5) * 3, // px
        weight: 700 + Math.floor(r * 200),
        ink: 0.85 + r * 0.15,
      };
    });
  }, [value]);
}

function PaperGrain() {
  // Subtle paper texture drawn as inline SVG, layered behind the form
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

function InkText({ value, field, erasing }: { value: string; field: Field; erasing: Erase | null }) {
  const strokes = useTypewriterStrokes(value, field);
  return (
    <div className="relative inline-block leading-[1.05]">
      {strokes.map((s, i) => {
        const inActiveErase =
          erasing &&
          erasing.field === field &&
          i >= erasing.from &&
          i < erasing.to;
        const fade = inActiveErase ? 1 - erasing!.t : 1;
        const tx = inActiveErase ? -erasing!.t * 18 : 0;
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
              filter: "blur(0.2px)",
              whiteSpace: "pre",
              transition: "opacity .25s linear, transform .35s cubic-bezier(.6,0,.2,1)",
            }}
          >
            {s.ch === " " ? "\u00A0" : s.ch}
          </span>
        );
      })}
      {/* Marker tip caret */}
      <span
        aria-hidden
        className="ml-0.5 inline-block h-[0.9em] w-[3px] align-baseline bg-black animate-pulse"
        style={{ transform: "translateY(0.12em)" }}
      />
    </div>
  );
}

function EraserBlock({ erase }: { erase: Erase | null }) {
  if (!erase) return null;
  const x = -40 + erase.t * 540;
  return (
    <div
      className="pointer-events-none absolute z-30"
      style={{
        left: x,
        top: erase.field === "message" ? 86 : 8,
        width: 96,
        height: 64,
        background: "#000",
        boxShadow: "0 18px 32px rgba(0,0,0,.55), inset -2px -3px 0 rgba(255,255,255,.06)",
        transform: "skewX(-6deg)",
      }}
    >
      <div className="absolute -bottom-2 left-2 right-2 h-2 bg-black/70 blur-[2px]" />
      <div className="absolute inset-2 border border-white/10" />
    </div>
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

  // hidden input mirror so keyboard works natively but ink renders custom
  const hiddenRef = useRef<HTMLInputElement | null>(null);
  const hiddenAreaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    // Only auto-focus once the user actively interacts with the form,
    // so the page does not auto-scroll on initial load.
    if (!hasInteracted) return;
    if (active === "message") hiddenAreaRef.current?.focus({ preventScroll: true });
    else hiddenRef.current?.focus({ preventScroll: true });
  }, [active, hasInteracted]);

  function commit(field: Field, next: string) {
    const max = FIELDS.find((f) => f.key === field)!.max;
    const trimmed = next.slice(0, max);
    setValues((v) => ({ ...v, [field]: trimmed }));
  }

  function startErase(field: Field, from: number, to: number) {
    if (from >= to) return;
    const id = ++eraseId.current;
    setErase({ id, field, from, to, t: 0 });
    const start = performance.now();
    const dur = 360;
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
    }
    if (e.key === "Enter" && field !== "message") {
      e.preventDefault();
      const order: Field[] = ["name", "email", "message"];
      const next = order[order.indexOf(field) + 1];
      if (next) setActive(next);
    }
  }

  function handleChange(field: Field, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const v = e.target.value;
    // ignore deletions in synthetic value (handled by erase mechanic)
    if (v.length < values[field].length) return;
    commit(field, v);
  }

  function submit() {
    if (folding || submitted) return;
    if (!values.name.trim() || !values.email.trim() || !values.message.trim()) {
      // Quick visual nudge — start erase on empty field's label
      const missing = (["name", "email", "message"] as Field[]).find((k) => !values[k].trim());
      if (missing) setActive(missing);
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
              ZYNTH does not use forms. Take the marker. Backspace summons the eraser. When you are
              done, the page folds itself and is delivered to the studio.
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
          {/* Tools strip */}
          <div className="mb-8 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
            <span>Tools · Marker 7B · Eraser Mk.II</span>
            <span>Paper 240gsm matte</span>
          </div>

          {/* Paper */}
          <div
            className="relative mx-auto w-full overflow-hidden"
            style={{
              perspective: "1400px",
            }}
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

              {/* Diagonal fold crease (visible during fold) */}
              {folding && (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, transparent 49.5%, rgba(0,0,0,.18) 50%, transparent 50.5%)",
                  }}
                />
              )}

              {/* Form */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-6 p-8 md:p-12">
                {/* Letterhead */}
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
                        className="relative min-h-[64px] border-b-2 border-black px-1 pb-1"
                        style={{ minHeight: f.key === "message" ? 160 : 64 }}
                      >
                        {/* Eraser overlay only when erasing this field */}
                        <EraserBlock erase={erase && erase.field === f.key ? erase : null} />

                        {/* Rendered ink */}
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

                      {/* Counter */}
                      <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-black/45">
                        <span>{isActive ? "● Marker active" : "○ Tap to write"}</span>
                        <span>
                          {values[f.key].length} / {f.max}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Sign + submit */}
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

            {/* Confirmation panel after fold */}
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

        {/* Direct lines as backup */}
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
