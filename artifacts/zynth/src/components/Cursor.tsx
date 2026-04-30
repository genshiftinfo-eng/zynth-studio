import { useEffect, useRef, useState } from "react";

function PenSvg() {
  // Vertical pen with the tip at viewBox (10, 100). The wrapper translates
  // the svg by (-10, -100) so that (10, 100) aligns with the parent's origin,
  // which itself sits on the cursor coordinates. The parent is then rotated
  // around that origin to give the pen its writing tilt.
  return (
    <svg
      width="22"
      height="104"
      viewBox="0 0 22 104"
      style={{ display: "block", transform: "translate(-10px, -100px)", overflow: "visible" }}
      aria-hidden="true"
    >
      {/* Cap */}
      <rect x="3" y="0" width="16" height="10" fill="#ffffff" stroke="#000" strokeWidth="1.4" />
      {/* Cap clip */}
      <rect x="14" y="2" width="2.4" height="14" fill="#000" />
      {/* Barrel */}
      <rect x="3.5" y="10" width="15" height="58" fill="#000" stroke="#fff" strokeWidth="1.2" />
      {/* Brand band */}
      <rect x="3.5" y="34" width="15" height="2" fill="#fff" />
      <rect x="3.5" y="38" width="15" height="0.8" fill="#fff" opacity="0.6" />
      {/* Ferrule */}
      <rect x="2.5" y="68" width="17" height="6" fill="#fff" stroke="#000" strokeWidth="1.2" />
      {/* Tip wedge */}
      <polygon points="5,74 17,74 11,98" fill="#000" stroke="#fff" strokeWidth="1.1" />
      {/* Ink at tip */}
      <circle cx="11" cy="99.5" r="2.2" fill="#fff" />
    </svg>
  );
}

export function Cursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const penRef = useRef<HTMLDivElement | null>(null);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [writing, setWriting] = useState(false);
  const target = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const pen = useRef({ x: 0, y: 0, press: 0, pressVel: 0 });

  useEffect(() => {
    function onMove(e: MouseEvent) {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
    }
    function onOver(e: MouseEvent) {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const cursorEl = t.closest<HTMLElement>("[data-cursor]");
      if (cursorEl) {
        setHovering(true);
        const next = cursorEl.dataset.cursor || null;
        setLabel(next);
        setWriting(next === "Writing");
      } else {
        setHovering(false);
        setLabel(null);
        setWriting(false);
      }
    }
    function onPenStroke() {
      // small downward press impulse
      pen.current.pressVel += 1.0;
    }
    let raf = 0;
    function loop() {
      // Ring (default cursor)
      ring.current.x += (target.current.x - ring.current.x) * 0.18;
      ring.current.y += (target.current.y - ring.current.y) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%)`;
      }
      // Pen — slightly tighter follow so the tip feels precise
      pen.current.x += (target.current.x - pen.current.x) * 0.45;
      pen.current.y += (target.current.y - pen.current.y) * 0.45;
      // Spring for the press impulse on each keystroke
      pen.current.pressVel += -pen.current.press * 0.22; // restoring force
      pen.current.pressVel *= 0.78; // damping
      pen.current.press += pen.current.pressVel;
      if (penRef.current) {
        const tilt = -32; // writing angle
        const press = pen.current.press;
        const dy = press * 4; // downward press
        const dx = press * 2;
        penRef.current.style.transform = `translate3d(${pen.current.x + dx}px, ${pen.current.y + dy}px, 0) rotate(${tilt + press * 4}deg)`;
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("zynth:pen-stroke", onPenStroke as EventListener);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("zynth:pen-stroke", onPenStroke as EventListener);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Default ring — hidden while in writing mode */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] mix-blend-difference"
        style={{
          width: hovering ? 88 : 28,
          height: hovering ? 88 : 28,
          border: "1px solid #fff",
          borderRadius: 999,
          opacity: writing ? 0 : 1,
          transition:
            "width .35s cubic-bezier(.2,.8,.2,1), height .35s cubic-bezier(.2,.8,.2,1), opacity .2s ease",
        }}
      >
        {label && !writing ? (
          <span className="absolute inset-0 flex items-center justify-center text-[10px] tracking-[0.2em] uppercase text-white">
            {label}
          </span>
        ) : null}
      </div>

      {/* Pen — visible only while writing */}
      <div
        ref={penRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999]"
        style={{
          transformOrigin: "0 0",
          opacity: writing ? 1 : 0,
          transition: "opacity .18s ease",
          filter: "drop-shadow(0 6px 8px rgba(0,0,0,.45))",
          willChange: "transform",
        }}
      >
        <PenSvg />
      </div>

      {/* Tiny dot at exact cursor — hidden in writing mode (tip replaces it) */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] mix-blend-difference"
        style={{
          width: 6,
          height: 6,
          background: "#fff",
          borderRadius: 999,
          opacity: writing ? 0 : 1,
          transition: "opacity .15s ease",
        }}
      />
    </>
  );
}
