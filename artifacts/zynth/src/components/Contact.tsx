import { useMemo, useState } from "react";
import { useReveal } from "@/hooks/useReveal";

type FormState = {
  name: string;
  email: string;
  company: string;
  budget: string;
  message: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  company: "",
  budget: "",
  message: "",
};

export function Contact() {
  const [ref, revealed] = useReveal<HTMLElement>();
  const [form, setForm] = useState<FormState>(initialForm);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const validation = useMemo(() => {
    const errors: Partial<Record<keyof FormState, string>> = {};
    const email = form.email.trim();
    if (form.name.trim().length < 2) errors.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
    if (form.message.trim().length < 20) errors.message = "Brief should be at least 20 characters.";
    return errors;
  }, [form]);

  const canSubmit = useMemo(() => Object.keys(validation).length === 0, [validation]);
  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    setSubmitError("");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) {
      setFieldErrors(validation);
      return;
    }
    setBusy(true);
    setSubmitError("");
    try {
      const response = await fetch("https://formspree.io/f/xkoywdla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data: { error?: string } = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Could not submit. Please try again.");
      }
      setSent(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not submit. Please try again.";
      setSubmitError(message);
    } finally {
      setBusy(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setSent(false);
    setBusy(false);
    setSubmitError("");
    setFieldErrors({});
  }

  return (
    <section
      ref={ref}
      id="contact"
      className={`relative overflow-hidden border-t border-white/10 bg-black py-24 md:py-32 reveal ${revealed ? "is-revealed" : ""}`}
      data-testid="section-contact"
    >
      <style>{`
        @keyframes zynth-orb-drift {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: .22; }
          50% { transform: translate3d(0, -18px, 0) scale(1.08); opacity: .34; }
          100% { transform: translate3d(0, 0, 0) scale(1); opacity: .22; }
        }
        @keyframes zynth-fade-up {
          0% { transform: translateY(26px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-[8%] top-[18%] h-52 w-52 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 72%)",
            animation: "zynth-orb-drift 7.2s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-[12%] right-[10%] h-72 w-72 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 74%)",
            animation: "zynth-orb-drift 8.5s ease-in-out infinite 400ms",
          }}
        />
      </div>

      <div className="relative px-6 md:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-14">
          <div className="md:col-span-5" style={{ animation: "zynth-fade-up .7s ease both" }}>
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/55">
              N° 006 / Contact
            </div>
            <h2 className="mt-4 font-display text-[44px] font-black leading-[0.92] tracking-[-0.045em] text-white md:text-[86px]">
              Build with us.
              <br />
              <span className="font-serif text-white/80 italic font-light">No generic templates.</span>
            </h2>
            <p className="mt-8 max-w-[58ch] text-[15px] leading-[1.75] text-white/65">
              Share your project, timeline, and goals. We reply with a strategic plan and execution
              path within 48 hours.
            </p>

            <div className="mt-10 space-y-5 border-t border-white/10 pt-8 font-mono text-[10px] uppercase tracking-[0.26em]">
              <div className="flex items-center gap-3 text-white">
                <span className="h-1.5 w-1.5 bg-white animate-pulse" />
                Studio · Islamabad, Pakistan
              </div>
              <div className="text-white">Partners · Become a Partner with ZYNTH Studio</div>
              <div className="text-white">Response window · {"< 48h"}</div>
            </div>
          </div>

          <div className="md:col-span-7" style={{ animation: "zynth-fade-up .7s ease 120ms both" }}>
            <div className="relative overflow-hidden border border-white/15 bg-white/[0.04] p-6 backdrop-blur-sm md:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_55%)]" />

              {!sent ? (
                <form className="relative z-10" onSubmit={onSubmit} noValidate>
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    className="absolute -left-[9999px] top-0 h-px w-px opacity-0"
                    aria-hidden="true"
                  />
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
                        Full Name
                      </span>
                      <input
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        type="text"
                        name="name"
                        required
                        autoComplete="name"
                        aria-invalid={!!fieldErrors.name}
                        aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
                        placeholder="Your name"
                        className="w-full border border-white/20 bg-black/40 px-4 py-3 text-[14px] text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/55"
                      />
                      {fieldErrors.name && (
                        <span id="contact-name-error" className="mt-2 block text-[12px] text-red-300">
                          {fieldErrors.name}
                        </span>
                      )}
                    </label>

                    <label className="block">
                      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
                        Email
                      </span>
                      <input
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        type="email"
                        name="email"
                        required
                        autoComplete="email"
                        aria-invalid={!!fieldErrors.email}
                        aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
                        placeholder="you@brand.com"
                        className="w-full border border-white/20 bg-black/40 px-4 py-3 text-[14px] text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/55"
                      />
                      {fieldErrors.email && (
                        <span id="contact-email-error" className="mt-2 block text-[12px] text-red-300">
                          {fieldErrors.email}
                        </span>
                      )}
                    </label>

                    <label className="block">
                      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
                        Company
                      </span>
                      <input
                        value={form.company}
                        onChange={(e) => updateField("company", e.target.value)}
                        type="text"
                        name="company"
                        autoComplete="organization"
                        placeholder="Brand or company"
                        className="w-full border border-white/20 bg-black/40 px-4 py-3 text-[14px] text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/55"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
                        Budget Range
                      </span>
                      <input
                        value={form.budget}
                        onChange={(e) => updateField("budget", e.target.value)}
                        type="text"
                        name="budget"
                        placeholder="e.g. $15k - $40k"
                        className="w-full border border-white/20 bg-black/40 px-4 py-3 text-[14px] text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/55"
                      />
                    </label>
                  </div>

                  <label className="mt-5 block">
                    <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
                      Project Brief
                    </span>
                    <textarea
                      value={form.message}
                      onChange={(e) => updateField("message", e.target.value)}
                      name="message"
                      required
                      aria-invalid={!!fieldErrors.message}
                      aria-describedby={fieldErrors.message ? "contact-message-error" : undefined}
                      placeholder="What are you building, and when do you want to launch?"
                      rows={6}
                      className="w-full resize-y border border-white/20 bg-black/40 px-4 py-3 text-[14px] text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/55"
                    />
                    {fieldErrors.message && (
                      <span id="contact-message-error" className="mt-2 block text-[12px] text-red-300">
                        {fieldErrors.message}
                      </span>
                    )}
                  </label>

                  <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center">
                    <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">
                      High-impact digital design, engineering, and launch strategy.
                    </div>
                    <button
                      type="submit"
                      disabled={busy}
                      data-testid="contact-submit"
                      className="group inline-flex items-center gap-3 border border-white/35 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white transition-all hover:bg-white hover:text-black disabled:cursor-wait disabled:opacity-40"
                    >
                      {busy ? "Sending..." : "Send Inquiry"}
                      <span className="inline-block h-2 w-2 rotate-45 bg-current transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                  <p className="sr-only" role="status" aria-live="polite">
                    {busy ? "Submitting your inquiry." : sent ? "Inquiry submitted." : ""}
                  </p>
                  {submitError && (
                    <p className="mt-4 text-[12px] text-red-300" role="alert">
                      {submitError}
                    </p>
                  )}
                </form>
              ) : (
                <div
                  className="relative z-10 border border-white/20 bg-black/30 p-8 text-white"
                  data-testid="contact-confirmation"
                  style={{ animation: "zynth-fade-up .55s ease both" }}
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/55">
                    Inquiry received
                  </div>
                  <h3 className="mt-4 font-display text-[36px] font-black leading-[1] tracking-[-0.04em] md:text-[58px]">
                    We are in.
                  </h3>
                  <p className="mt-4 max-w-[56ch] text-[15px] leading-[1.7] text-white/70">
                    Thanks, {form.name || "there"}. Your brief is now in our pipeline. We will review
                    and send a strategic response to <span className="text-white">{form.email}</span>.
                  </p>
                  <button
                    onClick={resetForm}
                    className="mt-8 inline-flex items-center gap-3 border border-white/35 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white transition-colors hover:bg-white hover:text-black"
                  >
                    Submit another brief
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
