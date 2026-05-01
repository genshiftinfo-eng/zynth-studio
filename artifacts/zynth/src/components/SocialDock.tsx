import { useState } from "react";
import { FaInstagram, FaYoutube, FaTiktok, FaXTwitter, FaFacebook } from "react-icons/fa6";

const socials = [
  { icon: FaInstagram, href: "https://www.instagram.com/zynthvisuals/",                  label: "Instagram" },
  { icon: FaYoutube,   href: "https://www.youtube.com/@zynthvisuals",                    label: "YouTube"   },
  { icon: FaTiktok,    href: "https://www.tiktok.com/@zynthvisuals",                     label: "TikTok"    },
  { icon: FaXTwitter,  href: "https://x.com/zynthvisuals",                               label: "X"         },
  { icon: FaFacebook,  href: "https://www.facebook.com/profile.php?id=61571001161752",   label: "Facebook"  },
];

export function SocialDock() {
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState<number | null>(null);

  function handleClick(idx: number, href: string) {
    setSpinning(idx);
    setTimeout(() => {
      setSpinning(null);
      window.open(href, "_blank", "noopener,noreferrer");
    }, 600);
  }

  // Each icon fans out in a semicircle on the right side of the toggle button
  // angles: spread from -90deg (top) to +90deg (bottom) = left-side half circle
  const angles = [-90, -45, 0, 45, 90];

  return (
    <>
      <style>{`
        @keyframes spin-cw {
          0%   { transform: rotate(0deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes dock-in {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes toggle-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.15); }
          50%       { box-shadow: 0 0 0 6px rgba(255,255,255,0); }
        }
      `}</style>

      {/* fixed container — left center */}
      <div
        className="fixed left-0 top-1/2 z-[9000]"
        style={{ transform: "translateY(-50%)" }}
      >
        {/* fan icons */}
        {socials.map((s, i) => {
          const angle = angles[i];
          const rad = (angle * Math.PI) / 180;
          const radius = 72;
          // fan to the RIGHT of the toggle (positive x)
          const x = open ? Math.cos(rad) * radius : 0;
          const y = open ? Math.sin(rad) * radius : 0;
          const Icon = s.icon;

          return (
            <button
              key={s.label}
              aria-label={s.label}
              onClick={() => handleClick(i, s.href)}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                transform: `translate(${x}px, ${y}px)`,
                opacity: open ? 1 : 0,
                pointerEvents: open ? "auto" : "none",
                transition: `transform 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 40}ms, opacity 0.3s ease ${i * 40}ms`,
                animation: open ? `dock-in 0.35s ease ${i * 40}ms both` : "none",
              }}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-black border border-white/20 text-white/70 hover:text-white hover:border-white/60 hover:bg-white/10 transition-colors"
            >
              <Icon
                size={15}
                style={{
                  animation: spinning === i ? "spin-cw 0.6s ease both" : "none",
                }}
              />
            </button>
          );
        })}

        {/* toggle button — the half circle tab */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle social links"
          className="relative flex items-center justify-center w-8 h-14 bg-black border border-white/20 text-white/60 hover:text-white hover:border-white/50 transition-all"
          style={{
            borderRadius: "0 999px 999px 0",
            borderLeft: "none",
            animation: "toggle-pulse 3s ease infinite",
          }}
        >
          {/* animated chevron */}
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            style={{
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.35s ease",
            }}
          >
            <polyline
              points="2,2 8,5 2,8"
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
