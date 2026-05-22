"use client";

import { useRef } from "react";

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 50 }: UseSwipeOptions) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const cancelled = useRef(false);
  // Tracks whether the most recent pointer interaction registered as a swipe,
  // so click handlers on the same element can skip when true.
  const lastWasSwipe = useRef(false);

  const handlers = {
    onPointerDown(e: React.PointerEvent) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      startX.current = e.clientX;
      startY.current = e.clientY;
      cancelled.current = false;
      lastWasSwipe.current = false;
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    },
    onPointerMove(e: React.PointerEvent) {
      if (startX.current === null || startY.current === null || cancelled.current) return;
      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
        cancelled.current = true;
      }
    },
    onPointerUp(e: React.PointerEvent) {
      if (startX.current === null || cancelled.current) {
        startX.current = null;
        startY.current = null;
        return;
      }
      const dx = e.clientX - startX.current;
      startX.current = null;
      startY.current = null;
      if (Math.abs(dx) < threshold) return;
      lastWasSwipe.current = true;
      if (dx < 0) onSwipeLeft?.();
      else onSwipeRight?.();
    },
    onPointerCancel() {
      startX.current = null;
      startY.current = null;
      cancelled.current = true;
    },
  };

  return { handlers, didSwipe: () => lastWasSwipe.current };
}
