import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const navItems = [
  { label: "Index",        href: "/#monolith",           icon: "◆" },
  { label: "Arsenal",      href: "/#arsenal",            icon: "I" },
  { label: "Doctrine",     href: "/#manifesto",          icon: "II" },
  { label: "Method",       href: "/#process",            icon: "III" },
  { label: "Capabilities", href: "/#proof",              icon: "IV" },
  { label: "Contact",      href: "/#contact",            icon: "V" },
  { label: "Privacy",      href: "/privacy-policy",      icon: "§" },
  { label: "Terms",        href: "/terms-and-conditions", icon: "¶" },
];

const RADIUS = 80;
const ICON_SIZE = 34;
const TOGGLE_W = 28;
const TOGGLE_H = 52;

export function NavDock() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const obs = new MutationObserver(() => {
      setModalOpen(document.body.hasAttribute("data-modal"));
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ["data-modal"] });
    return () => obs.disconnect();
  }, []);

  if (modalOpen) return null;

  const total = navItems.length - 1;
  const ox = TOGGLE_W / 2;
  const oy = TOGGLE_H / 2;

  function handleNav(href: string, i: number) {
    setActive(i);
    setTimeout(() => setActive(null), 500);
    setOpen(false);
    if (href.startsWith("/#")) {
      if (window.location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const id = href.replace("/#", "");
          const el = document.getElementById(id);
          el?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      } else {
        const id = href.replace("/#", "");
        const lenis = (window as unknown as { __lenis?: { scrollTo: (el: HTMLElement, opts: object) => void } }).__lenis;
        const el = document.getElementById(id);
        if (el && lenis) lenis.scrollTo(el, { offset: 0, duration: 1.6 });
        else el?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(href);
    }
  }

  return (
    <>
      <style>{`
        @keyframes nav-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 9000,
          width: TOGGLE_W + RADIUS + ICON_SIZE,
          height: RADIUS * 2 + ICON_SIZE,
          pointerEvents: "none",
        }}
      >
        {/* fan icons — fan to the LEFT */}
        {navItems.map((item, i) => {
          const angle = -90 + (180 / total) * i;
          const rad = (angle * Math.PI) / 180;
          // fan LEFT (negative x direction from right edge)
          const tx = open ? TOGGLE_W + RADIUS - Math.cos(rad) * RADIUS - ICON_SIZE / 2 : TOGGLE_W + RADIUS / 2 - ICON_SIZE / 2;
          const ty = open
            ? oy + Math.sin(rad) * RADIUS - ICON_SIZE / 2 + RADIUS
            : oy - ICON_SIZE / 2 + RADIUS;

          return (
            <button
              key={item.label}
              aria-label={item.label}
              onClick={() => handleNav(item.href, i)}
              style={{
                position: "absolute",
                left: tx,
                top: ty,
                width: ICON_SIZE,
                height: ICON_SIZE,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.9)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "rgba(255,255,255,0.75)",
                opacity: open ? 1 : 0,
                pointerEvents: open ? "auto" : "none",
                transition: `left 0.4s cubic-bezier(0.34,1.4,0.64,1) ${i * 35}ms, top 0.4s cubic-bezier(0.34,1.4,0.64,1) ${i * 35}ms, opacity 0.25s ease ${i * 35}ms`,
                backdropFilter: "blur(8px)",
                cursor: "pointer",
                fontSize: "9px",
                fontFamily: "var(--app-font-mono)",
                letterSpacing: "0.05em",
              }}
              title={item.label}
            >
              <span
                style={{
                  animation: active === i ? "nav-spin 0.5s ease both" : "none",
                  display: "block",
                  fontSize: item.icon.length > 1 ? "7px" : "10px",
                }}
              >
                {item.icon}
              </span>
            </button>
          );
        })}

        {/* toggle tab — right side, opens to left */}
        <button
          onClick={() => setOpen(v => !v)}
          aria-label="Toggle navigation"
          style={{
            position: "absolute",
            right: 0,
            top: RADIUS,
            width: TOGGLE_W,
            height: TOGGLE_H,
            background: "rgba(0,0,0,0.9)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRight: "none",
            borderRadius: "999px 0 0 999px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.7)",
            cursor: "pointer",
            pointerEvents: "auto",
            backdropFilter: "blur(8px)",
          }}
        >
          <svg
            width="8" height="10" viewBox="0 0 8 10"
            style={{
              transform: open ? "rotate(0deg)" : "rotate(180deg)",
              transition: "transform 0.3s ease",
            }}
          >
            <polyline
              points="6.5,1 1.5,5 6.5,9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </>
  );
}
