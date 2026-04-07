"use client";

import { motion } from "framer-motion";

interface FABProps {
  onClick: () => void;
}

export default function FAB({ onClick }: FABProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-24 right-6 z-50 w-[52px] h-[52px] rounded-lg flex items-center justify-center bg-gradient-to-br from-quadrant-plan-container to-[#0450b0] shadow-[0_4px_16px_rgba(5,102,217,0.4)]"
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      aria-label="할 일 추가"
    >
      <span className="material-symbols-outlined text-white text-[26px]">
        add
      </span>
    </motion.button>
  );
}
