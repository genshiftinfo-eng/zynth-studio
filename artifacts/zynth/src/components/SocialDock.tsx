import { useEffect, useState } from "react";
import { FaInstagram, FaYoutube, FaTiktok, FaXTwitter, FaFacebook } from "react-icons/fa6";

const socials = [
  { icon: FaInstagram, href: "https://www.instagram.com/zynthvisuals/",                label: "Instagram" },
  { icon: FaYoutube,   href: "https://www.youtube.com/@zynthvisuals",                  label: "YouTube"   },
  { icon: FaTiktok,    href: "https://www.tiktok.com/@zynthvisuals",                   label: "TikTok"    },
  { icon: FaXTwitter,  href: "https://x.com/zynthvisuals",                             label: "X"         },
  { icon: FaFacebook,  href: "https://www.facebook.com/profile.php?id=61571001161752", label: "Facebook"  },
];

// Perfect semicircle: 5 icons spread from -90deg to +90deg (right-facing half circle)
const RADIUS = 64;
const ICON_SIZE = 34;
const TOGGLE_W = 28;
const TOGGLE_H = 52;

export function SocialDock() {
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const obs = new MutationObserver(() => {
      setModalOpen(document.body.hasAttribute("data-modal"));
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ["data-modal"] });
    return () => obs.disconnect();
  }, []);

  if (modalOpen) return null;

  // Origin = center of toggle button
  const ox = TOGGLE_W / 2;
  const oy = TOGGLE_H / 2;

  return (
    <>
      <style>{`
        @keyframes spin-cw {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes dock-pulse {
          0%,100% { opacity: 0.6; }
          50%      { opacity: 1; }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 9000,
          width: TOGGLE_W + RADIUS + ICON_SIZE,
          height: RADIUS * 2 + ICON_SIZE,
          pointerEvents: "none",
        }}
      >
        {/* fan icons — each positioned relative to toggle center */}
        {socials.map((s, i) => {
          const total = socials.length - 1;
          const angle = -90 + (180 / total) * i; // -90 to +90 degrees
          const rad = (angle * Math.PI) / 180;
          const tx = open ? ox + Math.cos(rad) * RADIUS - ICON_SIZE / 2 : ox - ICON_SIZE / 2;
          const ty = open
            ? oy + Math.sin(rad) * RADIUS - ICON_SIZE / 2 + RADIUS
            : oy - ICON_SIZE / 2 + RADIUS;
          const Icon = s.icon;

          return (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              onClick={() => { setSpinning(i); setTimeout(() => setSpinning(null), 650); }}
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
                transition: `left 0.4s cubic-bezier(0.34,1.4,0.64,1) ${i * 40}ms, top 0.4s cubic-bezier(0.34,1.4,0.64,1) ${i * 40}ms, opacity 0.25s ease ${i * 40}ms`,
                textDecoration: "none",
                backdropFilter: "blur(8px)",
              }}
            >
              <Icon
                size={14}
                style={{
                  animation: spinning === i ? "spin-cw 0.65s ease both" : "none",
                  display: "block",
                  flexShrink: 0,
                }}
              />
            </a>
          );
        })}

        {/* toggle tab */}
        <button
          onClick={() => setOpen(v => !v)}
          aria-label="Toggle social links"
          style={{
            position: "absolute",
            left: 0,
            top: RADIUS,
            width: TOGGLE_W,
            height: TOGGLE_H,
            background: "rgba(0,0,0,0.9)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderLeft: "none",
            borderRadius: "0 999px 999px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.7)",
            cursor: "pointer",
            pointerEvents: "auto",
            backdropFilter: "blur(8px)",
            animation: "dock-pulse 3s ease infinite",
          }}
        >
          <svg
            width="8" height="10" viewBox="0 0 8 10"
            style={{
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          >
            <polyline
              points="1.5,1 6.5,5 1.5,9"
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
