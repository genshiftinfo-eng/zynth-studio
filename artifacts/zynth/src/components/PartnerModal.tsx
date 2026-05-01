import { useEffect, useMemo, useState } from "react";

type PartnerForm = {
  name: string;
  email: string;
  phone: string;
  role: string;
  otherRole: string;
  portfolios: [string, string, string, string, string];
  message: string;
};

const initial: PartnerForm = {
  name: "",
  email: "",
  phone: "",
  role: "",
  otherRole: "",
  portfolios: ["", "", "", "", ""],
  message: "",
};

const roles = [
  "Web Engineer",
  "UI / UX Designer",
  "Motion Designer",
  "Brand Designer",
  "Copywriter",
  "Growth / SEO",
  "Other",
];

const inputCls =
  "w-full border border-white/20 bg-black/40 px-4 py-3 text-[14px] text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/55";

export function PartnerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState<PartnerForm>(initial);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof PartnerForm, string>>>({});
  const [agreed, setAgreed] = useState(false);
  const [agreeError, setAgreeError] = useState(false);
  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    if (open) {
      document.body.style.overflow = "hidden";
      lenis?.stop();
    } else {
      document.body.style.overflow = "";
      lenis?.start();
    }
    return () => {
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const validation = useMemo(() => {
    const errors: Partial<Record<keyof PartnerForm, string>> = {};
    if (form.name.trim().length < 2) errors.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Enter a valid email.";
    if (form.phone.trim().length < 7) errors.phone = "Enter a valid phone number.";
    if (!form.role) errors.role = "Select your discipline.";
    if (form.role === "Other" && form.otherRole.trim().length < 2) errors.otherRole = "Describe your skill.";
    if (form.message.trim().length < 20) errors.message = "Tell us more — at least 20 characters.";
    return errors;
  }, [form]);

  const canSubmit = useMemo(() => Object.keys(validation).length === 0, [validation]);

  function update<K extends keyof PartnerForm>(key: K, value: PartnerForm[K]) {
    setForm((p) => ({ ...p, [key]: value }));
    setFieldErrors((p) => ({ ...p, [key]: undefined }));
    setSubmitError("");
  }

  function updatePortfolio(index: number, value: string) {
    const next = [...form.portfolios] as PartnerForm["portfolios"];
    next[index] = value;
    update("portfolios", next);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) { setFieldErrors(validation); return; }
    if (!agreed) { setAgreeError(true); return; }
    setBusy(true);
    setSubmitError("");
    try {
      const payload = {
        ...form,
        role: form.role === "Other" ? `Other: ${form.otherRole}` : form.role,
        portfolios: form.portfolios.filter(Boolean).join(", "),
        _subject: "Partner Application — ZYNTH",
      };
      const res = await fetch("https://formspree.io/f/xqenkzdp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: { error?: string } = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not submit. Please try again.");
      setSent(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not submit. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setForm(initial);
    setSent(false);
    setBusy(false);
    setSubmitError("");
    setFieldErrors({});
    setAgreed(false);
    setAgreeError(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-start sm:items-center justify-center" style={{ cursor: "none" }}>
      <style>{`
        @keyframes partner-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes partner-up { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        style={{ animation: "partner-fade .3s ease both" }}
        onClick={onClose}
      />

      {/* panel */}
      <div
        className="relative z-10 w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-0 sm:mx-4 h-full sm:h-auto sm:max-h-[92svh] overflow-y-auto border-0 sm:border border-white/15 bg-black"
        style={{ animation: "partner-up .4s ease both", overscrollBehavior: "contain" }}
      >
        {/* top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8 sm:py-5 bg-black">
          <div>
            <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.32em] text-white/45">
              N° 007 / Partnership
            </div>
            <div className="mt-0.5 font-display text-[20px] sm:text-[26px] font-black tracking-[-0.04em] text-white leading-none">
              Apply to Partner
            </div>
          </div>
          <button
            onClick={onClose}
            data-cursor="Close"
            className="flex h-8 w-8 items-center justify-center border border-white/20 text-white/60 hover:border-white/60 hover:text-white transition-colors font-mono text-[12px]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          {!sent ? (
            <>
              <p className="mb-6 sm:mb-8 max-w-[52ch] text-[11px] sm:text-[12px] leading-[1.7] text-white/50 font-mono uppercase tracking-[0.16em] sm:tracking-[0.18em]">
                We work with a tight circle of independent specialists. If your craft is obsessive and your standards are uncompromising — let's talk.
              </p>

              <form onSubmit={onSubmit} noValidate className="space-y-4 sm:space-y-5">

                {/* name + email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <label className="block">
                    <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">Full Name</span>
                    <input value={form.name} onChange={(e) => update("name", e.target.value)} type="text" placeholder="Your name" className={inputCls} />
                    {fieldErrors.name && <span className="mt-1.5 block text-[11px] text-red-300">{fieldErrors.name}</span>}
                  </label>
                  <label className="block">
                    <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">Email</span>
                    <input value={form.email} onChange={(e) => update("email", e.target.value)} type="email" placeholder="you@domain.com" className={inputCls} />
                    {fieldErrors.email && <span className="mt-1.5 block text-[11px] text-red-300">{fieldErrors.email}</span>}
                  </label>
                </div>

                {/* phone + role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <label className="block">
                    <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">Phone</span>
                    <input value={form.phone} onChange={(e) => update("phone", e.target.value)} type="tel" placeholder="+1 000 000 0000" className={inputCls} />
                    {fieldErrors.phone && <span className="mt-1.5 block text-[11px] text-red-300">{fieldErrors.phone}</span>}
                  </label>
                  <label className="block">
                    <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">Discipline</span>
                    <select
                      value={form.role}
                      onChange={(e) => { update("role", e.target.value); if (e.target.value !== "Other") update("otherRole", ""); }}
                      className={`${inputCls} appearance-none`}
                    >
                      <option value="" disabled>Select your role</option>
                      {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {fieldErrors.role && <span className="mt-1.5 block text-[11px] text-red-300">{fieldErrors.role}</span>}
                  </label>
                </div>

                {/* other role */}
                {form.role === "Other" && (
                  <label className="block" style={{ animation: "partner-up .3s ease both" }}>
                    <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">Describe Your Skill</span>
                    <input value={form.otherRole} onChange={(e) => update("otherRole", e.target.value)} type="text" placeholder="e.g. 3D Artist, Video Editor, AR Developer..." className={inputCls} />
                    {fieldErrors.otherRole && <span className="mt-1.5 block text-[11px] text-red-300">{fieldErrors.otherRole}</span>}
                  </label>
                )}

                {/* portfolio links */}
                <div>
                  <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
                    Portfolio Links <span className="text-white/30">(Up to 5)</span>
                  </span>
                  <div className="space-y-2.5">
                    {form.portfolios.map((val, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-white/30 w-4 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                        <input
                          value={val}
                          onChange={(e) => updatePortfolio(i, e.target.value)}
                          type="url"
                          placeholder={i === 0 ? "https://yourportfolio.com" : `https://link-${i + 1}.com`}
                          className={inputCls}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* message */}
                <label className="block">
                  <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">Why ZYNTH?</span>
                  <textarea
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    rows={4}
                    placeholder="Tell us about your craft, your standards, and what you'd bring to the studio."
                    className={`${inputCls} resize-y`}
                  />
                  {fieldErrors.message && <span className="mt-1.5 block text-[11px] text-red-300">{fieldErrors.message}</span>}
                </label>

                {/* caution notice */}
                <div className="border border-white/15 bg-white/[0.03] p-4 sm:p-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-white mb-3">
                    ⚠ Read Before Submitting
                  </div>
                  <ul className="space-y-2 text-[12px] leading-[1.75] text-white/55 font-mono">
                    <li>— Submitting this form does <span className="text-white">not</span> guarantee a partner seat or project allocation.</li>
                    <li>— You will be engaged on a per-project basis at ZYNTH's sole discretion.</li>
                    <li>— Compensation is paid <span className="text-white">only after client payment</span> is received.</li>
                    <li>— 50% for collaborative delivery · 75% for full independent delivery.</li>
                    <li>— You are solely responsible for delivering your scope to the agreed standard.</li>
                    <li>— ZYNTH is not liable for any inconvenience, lost income, or damages from rejection or termination.</li>
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.22em]">
                    <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white underline underline-offset-4 transition-colors">Privacy Policy</a>
                    <span className="text-white/20">·</span>
                    <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white underline underline-offset-4 transition-colors">Terms &amp; Conditions</a>
                  </div>
                </div>

                {/* agreement checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group select-none">
                  <div
                    onClick={() => { setAgreed((v) => !v); setAgreeError(false); }}
                    className={`mt-0.5 h-4 w-4 shrink-0 border transition-colors flex items-center justify-center ${
                      agreeError ? "border-red-400" : agreed ? "border-white bg-white" : "border-white/30 group-hover:border-white/60"
                    }`}
                  >
                    {agreed && <span className="text-black text-[10px] font-black leading-none">✓</span>}
                  </div>
                  <span className="text-[12px] leading-[1.65] text-white/55 font-mono">
                    I have carefully read and agree to the{" "}
                    <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-2 hover:text-white/70 transition-colors">Privacy Policy</a>
                    {" "}and{" "}
                    <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-2 hover:text-white/70 transition-colors">Terms &amp; Conditions</a>.
                    {" "}I understand that submitting this form does not guarantee a partner seat or any compensation.
                  </span>
                </label>
                {agreeError && (
                  <p className="text-[11px] text-red-300 font-mono">
                    You must read and agree to the terms before submitting.
                  </p>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/10 pt-5 sm:pt-6">
                  <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-white/35">
                    Six engagements per year · Standards are non-negotiable
                  </div>
                  <button
                    type="submit"
                    disabled={busy}
                    data-cursor="Apply"
                    className="group inline-flex items-center justify-center gap-3 border border-white/35 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white transition-all hover:bg-white hover:text-black disabled:cursor-wait disabled:opacity-40 w-full sm:w-auto"
                  >
                    {busy ? "Sending..." : "Apply Now"}
                    <span className="inline-block h-2 w-2 rotate-45 bg-current transition-transform group-hover:translate-x-1" />
                  </button>
                </div>

                {submitError && <p className="text-[12px] text-red-300 font-mono" role="alert">{submitError}</p>}
              </form>
            </>
          ) : (
            <div style={{ animation: "partner-up .45s ease both" }}>
              <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/45">
                Application received · {new Date().toLocaleDateString("en-PK", { timeZone: "Asia/Karachi", day: "2-digit", month: "short", year: "numeric" })}
              </div>
              <h3 className="mt-4 font-display text-[32px] sm:text-[48px] font-black leading-none tracking-[-0.04em] text-white">
                You're in the pipeline.
              </h3>
              <p className="mt-4 max-w-[50ch] text-[14px] leading-[1.7] text-white/60">
                Thanks, <span className="text-white">{form.name || "there"}</span>. We've received your application as a{" "}
                <span className="text-white">{form.role === "Other" ? form.otherRole : form.role}</span>. Our team reviews every submission personally — if your craft meets our bar, we'll reach out to{" "}
                <span className="text-white">{form.email}</span> within 5 business days.
              </p>
              <div className="mt-6 space-y-2 border-t border-white/10 pt-6 font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">
                <div>Discipline · {form.role === "Other" ? form.otherRole : form.role}</div>
                {form.phone && <div>Contact · {form.phone}</div>}
                {form.portfolios.filter(Boolean).length > 0 && (
                  <div>Portfolio links submitted · {form.portfolios.filter(Boolean).length}</div>
                )}
              </div>
              <button
                onClick={reset}
                data-cursor="Again"
                className="mt-8 inline-flex items-center gap-3 border border-white/30 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white transition-colors hover:bg-white hover:text-black"
              >
                Submit another application
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
