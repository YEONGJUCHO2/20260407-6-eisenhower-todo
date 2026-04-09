"use client";

import { useRef } from "react";

interface UseSwipeNavOptions {
  onSwipeLeft: () => void;  // next day
  onSwipeRight: () => void; // prev day
  threshold?: number;
}

export function useSwipeNav({ onSwipeLeft, onSwipeRight, threshold = 80 }: UseSwipeNavOptions) {
  const startX = useRef(0);
  const startY = useRef(0);
  const swiping = useRef(false);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    swiping.current = true;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!swiping.current) return;
    swiping.current = false;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - startX.current;
    const dy = endY - startY.current;

    // Only trigger if horizontal swipe is dominant (not vertical scroll)
    if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx > 0) {
        onSwipeRight(); // swipe right = prev day
      } else {
        onSwipeLeft(); // swipe left = next day
      }
    }
  };

  return { onTouchStart, onTouchEnd };
}
