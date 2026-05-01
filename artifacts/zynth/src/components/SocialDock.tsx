import { useState } from "react";
import { FaInstagram, FaYoutube, FaTiktok, FaXTwitter, FaFacebook } from "react-icons/fa6";

const socials = [
  { icon: FaInstagram, href: "https://www.instagram.com/zynthvisuals/",                label: "Instagram" },
  { icon: FaYoutube,   href: "https://www.youtube.com/@zynthvisuals",                  label: "YouTube"   },
  { icon: FaTiktok,    href: "https://www.tiktok.com/@zynthvisuals",                   label: "TikTok"    },
  { icon: FaXTwitter,  href: "https://x.com/zynthvisuals",                             label: "X"         },
  { icon: FaFacebook,  href: "https://www.facebook.com/profile.php?id=61571001161752", label: "Facebook"  },
];

const angles = [-90, -45, 0, 45, 90];
const RADIUS = 68;

export function SocialDock() {
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState<number | null>(null);

  return (
    <>
      <style>{`
        @keyframes spin-cw {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes toggle-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.12); }
          50%      { box-shadow: 0 0 0 5px rgba(255,255,255,0); }
        }
      `}</style>

      <div
        className="fixed left-0 z-[9000]"
        style={{ top: "50%", transform: "translateY(-50%)" }}
      >
        {/* fan icons */}
        {socials.map((s, i) => {
          const rad = (angles[i] * Math.PI) / 180;
          const x = open ? Math.cos(rad) * RADIUS : 0;
          const y = open ? Math.sin(rad) * RADIUS : 0;
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
                left: 0,
                top: 0,
                width: 36,
                height: 36,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#000",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.7)",
                transform: `translate(${x}px, calc(-50% + ${y}px))`,
                opacity: open ? 1 : 0,
                pointerEvents: open ? "auto" : "none",
                transition: `transform 0.4s cubic-bezier(0.34,1.56,0.64,1) ${i * 45}ms, opacity 0.25s ease ${i * 45}ms`,
                textDecoration: "none",
                zIndex: 9001,
              }}
            >
              <Icon
                size={14}
                style={{
                  animation: spinning === i ? "spin-cw 0.65s ease both" : "none",
                  display: "block",
                }}
              />
            </a>
          );
        })}

        {/* toggle tab */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle social links"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 52,
            background: "#000",
            border: "1px solid rgba(255,255,255,0.2)",
            borderLeft: "none",
            borderRadius: "0 999px 999px 0",
            color: "rgba(255,255,255,0.6)",
            cursor: "none",
            animation: "toggle-pulse 3s ease infinite",
            zIndex: 9002,
          }}
        >
          <svg
            width="9" height="9" viewBox="0 0 9 9"
            style={{
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          >
            <polyline
              points="2,1.5 7,4.5 2,7.5"
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
