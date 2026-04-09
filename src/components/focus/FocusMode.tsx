"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTodoContext } from "@/hooks/useTodos";
import { QUADRANTS } from "@/lib/constants";
import PomodoroTimer from "./PomodoroTimer";

interface FocusModeProps {
  date: string;
  onClose: () => void;
}

export default function FocusMode({ date, onClose }: FocusModeProps) {
  const { getTodosForQuadrant, toggleComplete } = useTodoContext();
  const doTodos = getTodosForQuadrant("do", date).filter((t) => !t.completed);
  const [currentIndex, setCurrentIndex] = useState(0);

  const current = doTodos[currentIndex];
  const q = QUADRANTS.do;

  const handleComplete = () => {
    if (current) {
      toggleComplete(current.id);
    }
    advance();
  };

  const advance = () => {
    if (currentIndex < doTodos.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      onClose();
    }
  };

  const handlePomodoroComplete = () => {
    // Pomodoro work phase ended — could trigger haptic/sound in future
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] bg-surface flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-lg py-4">
          <span className="text-label-sm text-outline uppercase tracking-widest">
            포커스 모드
          </span>
          <div className="flex items-center gap-3">
            <span className="text-label-sm text-on-surface-variant">
              {currentIndex + 1}/{doTodos.length}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-lg">
          {current ? (
            <>
              {/* Task info */}
              <div className="text-center mb-8 max-w-sm">
                <div
                  className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-4"
                  style={{
                    backgroundColor: q.container + "20",
                    color: q.primary,
                  }}
                >
                  즉시 실행
                </div>
                <h2 className="font-display text-display-md text-on-surface mb-2">
                  {current.title}
                </h2>
                {current.memo && (
                  <p className="text-body-md text-on-surface-variant">
                    {current.memo}
                  </p>
                )}
              </div>

              {/* Timer */}
              <PomodoroTimer onComplete={handlePomodoroComplete} />

              {/* Actions */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={advance}
                  className="px-5 py-3 rounded-full bg-surface-container-high text-outline text-body-md"
                >
                  건너뛰기
                </button>
                <button
                  onClick={handleComplete}
                  className="px-6 py-3 rounded-full bg-green-500/20 text-green-400 text-body-md font-semibold border border-green-500/30"
                >
                  완료
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <span className="material-symbols-outlined text-[48px] text-green-400 mb-4 block">
                check_circle
              </span>
              <h2 className="font-display text-display-md text-on-surface mb-2">
                모두 완료!
              </h2>
              <p className="text-body-md text-on-surface-variant mb-6">
                오늘의 긴급한 일을 모두 처리했습니다
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-quadrant-plan-container to-[#0450b0] text-white text-body-md font-semibold"
              >
                돌아가기
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
