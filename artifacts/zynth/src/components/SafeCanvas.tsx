import React from "react";

let cachedWebGLSupport: boolean | null = null;

export function detectWebGL(): boolean {
  if (cachedWebGLSupport !== null) return cachedWebGLSupport;
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    cachedWebGLSupport = !!gl;
  } catch {
    cachedWebGLSupport = false;
  }
  return cachedWebGLSupport;
}

type State = { hasError: boolean; supported: boolean };

export class CanvasFallback extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  State
> {
  state: State = { hasError: false, supported: detectWebGL() };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (typeof window !== "undefined") {
      console.warn("[Zynth] WebGL unavailable, rendering fallback.");
    }
  }

  render() {
    if (this.state.hasError || !this.state.supported) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

export function StaticHeroFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <div
        className="font-display text-[18vw] md:text-[14vw] font-black tracking-[-0.05em] text-white leading-none"
        style={{
          WebkitTextStroke: "1px #fff",
          textShadow: "0 0 60px rgba(255,255,255,.1)",
        }}
      >
        ZYNTH
      </div>
    </div>
  );
}

export function StaticTopologyFallback({ kind }: { kind: "wire" | "cloth" | "stream" }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-black overflow-hidden">
      {kind === "wire" && (
        <svg viewBox="0 0 200 200" className="h-3/4 w-3/4 text-white/70">
          {[40, 60, 80].map((r, i) => (
            <circle
              key={i}
              cx="100"
              cy="100"
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.5}
            />
          ))}
          <rect x="40" y="40" width="120" height="120" fill="none" stroke="currentColor" strokeWidth={0.5} />
          <rect x="55" y="55" width="90" height="90" fill="none" stroke="currentColor" strokeWidth={0.5} />
        </svg>
      )}
      {kind === "cloth" && (
        <svg viewBox="0 0 200 200" className="h-3/4 w-3/4 text-white/70">
          {Array.from({ length: 18 }).map((_, i) => (
            <path
              key={i}
              d={`M0 ${20 + i * 10} Q 50 ${10 + i * 10} 100 ${20 + i * 10} T 200 ${20 + i * 10}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.4}
            />
          ))}
        </svg>
      )}
      {kind === "stream" && (
        <svg viewBox="0 0 200 200" className="h-3/4 w-3/4 text-white/70">
          {Array.from({ length: 60 }).map((_, i) => {
            const x = 20 + Math.sin(i * 1.7) * 70 + 80;
            const y = 20 + Math.cos(i * 1.3) * 70 + 80;
            return <circle key={i} cx={x} cy={y} r="1.4" fill="currentColor" />;
          })}
          {Array.from({ length: 30 }).map((_, i) => {
            const x1 = 20 + Math.sin(i * 1.7) * 70 + 80;
            const y1 = 20 + Math.cos(i * 1.3) * 70 + 80;
            const x2 = 20 + Math.sin((i + 4) * 1.7) * 70 + 80;
            const y2 = 20 + Math.cos((i + 4) * 1.3) * 70 + 80;
            return (
              <line key={`l${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.3" opacity="0.6" />
            );
          })}
        </svg>
      )}
    </div>
  );
}

export function StaticPortfolioFallback() {
  return (
    <div className="absolute inset-0 grid grid-cols-3 md:grid-cols-6 gap-3 p-6 bg-black">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border border-white/30 bg-white/5 relative overflow-hidden">
          <div
            className="absolute inset-3"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(255,255,255,.5) 0 1px, transparent 1px 12px)",
            }}
          />
        </div>
      ))}
    </div>
  );
}
