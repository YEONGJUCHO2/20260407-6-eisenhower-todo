"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quadrant, RepeatType } from "@/lib/types";
import { toDateString } from "@/lib/date-utils";
import { useTodoContext } from "@/hooks/useTodos";
import QuadrantSelector from "@/components/ui/QuadrantSelector";
import RepeatSelector from "@/components/ui/RepeatSelector";

interface AddTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: Date;
  defaultQuadrant?: Quadrant;
}

export default function AddTodoModal({
  isOpen,
  onClose,
  defaultDate,
  defaultQuadrant,
}: AddTodoModalProps) {
  const { addTodo } = useTodoContext();
  const [title, setTitle] = useState("");
  const [quadrant, setQuadrant] = useState<Quadrant>(defaultQuadrant ?? "plan");
  const [date, setDate] = useState(toDateString(defaultDate ?? new Date()));
  const [repeat, setRepeat] = useState<RepeatType>("none");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setQuadrant(defaultQuadrant ?? "plan");
      setDate(toDateString(defaultDate ?? new Date()));
      setRepeat("none");
      setError(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, defaultDate, defaultQuadrant]);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError(true);
      return;
    }
    addTodo({
      title: trimmed,
      quadrant,
      date,
      repeat,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-[90]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[100] bg-surface-container rounded-t-xl px-lg pt-4 pb-6 safe-bottom max-w-2xl mx-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-outline/30" />
            </div>

            {/* Title input */}
            <div className="mb-5">
              <label className="text-label-lg text-on-surface-variant mb-2 block">
                할 일 입력
              </label>
              <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="무엇을 해야 하나요?"
                className={`w-full bg-surface-container-high text-on-surface text-body-lg px-4 py-3 rounded-sm outline-none placeholder:text-outline transition-all ${
                  error
                    ? "ring-2 ring-error animate-[shake_0.3s_ease-in-out]"
                    : "focus:ring-1 focus:ring-quadrant-plan-primary/30"
                }`}
              />
            </div>

            {/* Quadrant selector */}
            <div className="mb-5">
              <label className="text-label-lg text-on-surface-variant mb-2 block">
                사분면 선택
              </label>
              <QuadrantSelector selected={quadrant} onChange={setQuadrant} />
            </div>

            {/* Date */}
            <div className="mb-5">
              <label className="text-label-lg text-on-surface-variant mb-2 block">
                날짜
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-surface-container-high text-on-surface text-body-md px-4 py-2.5 rounded-sm outline-none w-full"
              />
            </div>

            {/* Repeat */}
            <div className="mb-6">
              <label className="text-label-lg text-on-surface-variant mb-2 block">
                반복 설정
              </label>
              <RepeatSelector selected={repeat} onChange={setRepeat} />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-quadrant-plan-container to-[#0450b0] text-white text-body-lg font-semibold transition-all active:scale-[0.98]"
            >
              추가하기
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
