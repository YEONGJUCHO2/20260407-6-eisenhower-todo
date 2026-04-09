"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTodoContext } from "@/hooks/useTodos";

const ACTION_LABELS: Record<string, string> = {
  delete: "삭제됨",
  toggle: "완료 변경됨",
  move: "이동됨",
};

const AUTO_DISMISS_MS = 5000;

export default function UndoToast() {
  const { lastAction, undo, setLastAction } = useTodoContext();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (lastAction) {
      timerRef.current = setTimeout(() => {
        setLastAction(null);
      }, AUTO_DISMISS_MS);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [lastAction, setLastAction]);

  const handleUndo = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    undo();
  };

  return (
    <AnimatePresence>
      {lastAction && (
        <motion.div
          key="undo-toast"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3 rounded-full bg-surface-container-highest/90 backdrop-blur-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/5"
        >
          <span className="text-body-sm text-on-surface">
            {ACTION_LABELS[lastAction.type]}
          </span>

          <button
            onClick={handleUndo}
            className="text-body-sm font-semibold text-quadrant-plan-primary hover:text-quadrant-plan-primary/80 transition-colors"
          >
            되돌리기
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
