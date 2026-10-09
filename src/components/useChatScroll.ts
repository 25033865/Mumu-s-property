import { useLayoutEffect, useRef } from "react";

// Following the latest message is a user choice. Once the reader moves upward,
// neither live updates nor late image loads may pull them back to the bottom.
export function createChatScrollController(history: HTMLDivElement, content: HTMLDivElement) {
  let following = true;
  let lastTop = history.scrollTop;
  let lastHeight = history.scrollHeight;
  let lastClientHeight = history.clientHeight;
  let touchY: number | undefined;
  let frame = 0;

  const pause = () => {
    following = false;
    cancelAnimationFrame(frame);
    frame = 0;
  };
  const refresh = () => {
    if (!following || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!following) return;
      history.scrollTop = history.scrollHeight;
      // Record our own scroll before its asynchronous scroll event arrives.
      lastTop = history.scrollTop;
      lastHeight = history.scrollHeight;
      lastClientHeight = history.clientHeight;
    });
  };
  const onScroll = () => {
    const top = history.scrollTop;
    const layoutChanged = history.scrollHeight !== lastHeight || history.clientHeight !== lastClientHeight;
    // Keyboard closing and browser scroll anchoring can change scrollTop without
    // user scrolling. Keep the existing follow/reading mode in that case.
    if (layoutChanged) refresh();
    else if (top < lastTop) pause();
    else if (top > lastTop && history.scrollHeight - top - history.clientHeight <= 2) {
      following = true;
    }
    lastTop = top;
    lastHeight = history.scrollHeight;
    lastClientHeight = history.clientHeight;
  };
  const onWheel = (event: WheelEvent) => {
    if (event.deltaY < 0) pause();
  };
  const onTouchStart = (event: TouchEvent) => {
    touchY = event.touches[0]?.clientY;
  };
  const onTouchMove = (event: TouchEvent) => {
    const nextY = event.touches[0]?.clientY;
    if (nextY !== undefined && touchY !== undefined && nextY > touchY) pause();
    touchY = nextY;
  };
  const onKeyDown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest("input, textarea, [contenteditable='true']")) return;
    if (["ArrowUp", "PageUp", "Home"].includes(event.key) || (event.key === " " && event.shiftKey)) pause();
  };

  history.addEventListener("scroll", onScroll, { passive: true });
  history.addEventListener("wheel", onWheel, { passive: true });
  history.addEventListener("touchstart", onTouchStart, { passive: true });
  history.addEventListener("touchmove", onTouchMove, { passive: true });
  history.addEventListener("keydown", onKeyDown);
  const observer = new ResizeObserver(refresh);
  observer.observe(history);
  observer.observe(content);
  refresh();

  return {
    refresh,
    scrollToLatest: () => { following = true; refresh(); },
    dispose: () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      history.removeEventListener("scroll", onScroll);
      history.removeEventListener("wheel", onWheel);
      history.removeEventListener("touchstart", onTouchStart);
      history.removeEventListener("touchmove", onTouchMove);
      history.removeEventListener("keydown", onKeyDown);
    },
  };
}

export default function useChatScroll(threadId: string, messages: readonly unknown[]) {
  const historyRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const controller = useRef<ReturnType<typeof createChatScrollController> | null>(null);

  useLayoutEffect(() => {
    if (!historyRef.current || !contentRef.current) return;
    const current = createChatScrollController(historyRef.current, contentRef.current);
    controller.current = current;
    return () => { current.dispose(); controller.current = null; };
  }, [threadId]);

  useLayoutEffect(() => { controller.current?.refresh(); }, [messages]);

  return { historyRef, contentRef, scrollToLatest: () => controller.current?.scrollToLatest() };
}
