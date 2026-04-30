import { useEffect, useRef, useState } from "react";

/**
 * Returns [ref, inView] — observes the element with an IntersectionObserver.
 * Used to pause heavy R3F canvases when they leave the viewport.
 */
export function useInView<T extends HTMLElement>(
  rootMargin = "200px",
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setInView(e.isIntersecting);
      },
      { rootMargin, threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin]);
  return [ref, inView];
}
