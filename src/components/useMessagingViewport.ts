import { useEffect, useRef } from "react";

// Mobile browsers can shrink only the visual viewport when the keyboard opens.
// Keep the entire messaging shell inside that visible area, including its composer.
export default function useMessagingViewport(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shell = ref.current;
    const viewport = window.visualViewport;
    if (!enabled || !shell || !viewport) return;

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // Preserve normal browser zoom behavior.
        if (viewport.scale !== 1) return;
        shell.style.setProperty("--messaging-height", `${viewport.height}px`);
        shell.style.setProperty("--messaging-top", `${viewport.offsetTop}px`);
      });
    };
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      shell.style.removeProperty("--messaging-height");
      shell.style.removeProperty("--messaging-top");
    };
  }, [enabled]);

  return ref;
}
