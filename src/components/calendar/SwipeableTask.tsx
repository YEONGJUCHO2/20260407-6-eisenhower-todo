"use client";

import { useRef } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";

interface SwipeableTaskProps {
  children: React.ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export default function SwipeableTask({
  children,
  onSwipeLeft,
  onSwipeRight,
}: SwipeableTaskProps) {
  const x = useMotionValue(0);
  const bgOpacity = useTransform(
    x,
    [-100, -50, 0, 50, 100],
    [1, 0.5, 0, 0.5, 1]
  );
  const swiped = useRef(false);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 80) {
      swiped.current = true;
      onSwipeRight();
    } else if (info.offset.x < -80) {
      swiped.current = true;
      onSwipeLeft();
    }
    // Reset after a tick to block the click event
    setTimeout(() => { swiped.current = false; }, 100);
  };

  return (
    <div
      className="relative overflow-hidden rounded-md"
      onClickCapture={(e) => {
        if (swiped.current) {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
    >
      {/* Background indicators */}
      <motion.div
        className="absolute inset-0 flex items-center justify-between px-4"
        style={{ opacity: bgOpacity }}
      >
        <div className="flex items-center gap-2 text-red-400">
          <span className="material-symbols-outlined text-[18px]">
            delete
          </span>
          <span className="text-body-sm font-medium">삭제</span>
        </div>
        <div className="flex items-center gap-2 text-green-400">
          <span className="text-body-sm font-medium">완료</span>
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
        </div>
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}
