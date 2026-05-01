import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();
  return (
    <div className="relative bg-black text-white min-h-screen grain flex flex-col items-center justify-center px-6" lang="en">
      <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/45 mb-6">
        Error · 404
      </div>
      <h1 className="font-display text-[80px] sm:text-[140px] md:text-[200px] font-black leading-none tracking-[-0.05em] text-white">
        404
      </h1>
      <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.28em] text-white/50 max-w-[36ch] text-center">
        This artifact does not exist. It may have been moved, deleted, or never engineered.
      </p>
      <button
        onClick={() => navigate("/")}
        className="mt-10 inline-flex items-center gap-3 border border-white/30 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white transition-all hover:bg-white hover:text-black"
      >
        <span className="h-1.5 w-1.5 bg-white animate-pulse" />
        Return to Index
      </button>
      <div className="absolute bottom-8 font-mono text-[10px] uppercase tracking-[0.24em] text-white/25">
        © {new Date().getFullYear()} ZYNTH Studio
      </div>
    </div>
  );
}
