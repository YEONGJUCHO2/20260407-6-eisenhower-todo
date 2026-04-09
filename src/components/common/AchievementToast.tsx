"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ACHIEVEMENTS, AchievementType } from "@/lib/constants";

interface AchievementToastProps {
  achievementType: AchievementType | null;
  onDismiss: () => void;
}

export default function AchievementToast({
  achievementType,
  onDismiss,
}: AchievementToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (achievementType) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [achievementType, onDismiss]);

  const achievement = achievementType ? ACHIEVEMENTS[achievementType] : null;

  return (
    <AnimatePresence>
      {visible && achievement && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-[200] bg-gradient-to-r from-yellow-600/90 to-amber-500/90 backdrop-blur-xl rounded-xl px-5 py-3 flex items-center gap-3 shadow-xl border border-yellow-400/30"
        >
          <span className="material-symbols-outlined text-[24px] text-yellow-100">
            {achievement.icon}
          </span>
          <div>
            <p className="text-[10px] text-yellow-200 font-semibold uppercase tracking-wider">
              업적 해금!
            </p>
            <p className="text-body-sm text-white font-semibold">
              {achievement.name}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
