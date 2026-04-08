"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quadrant, RepeatType } from "@/lib/types";
import { toDateString } from "@/lib/date-utils";
import { useTodoContext } from "@/hooks/useTodos";
import QuadrantSelector from "@/components/ui/QuadrantSelector";
import RepeatSelector from "@/components/ui/RepeatSelector";
import TimePicker from "../ui/TimePicker";
import CollapsibleSection from "../ui/CollapsibleSection";

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
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [repeatDate, setRepeatDate] = useState(1);
  const [startTime, setStartTime] = useState<string | undefined>();
  const [endTime, setEndTime] = useState<string | undefined>();
  const [hasTime, setHasTime] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle("");
    setQuadrant(defaultQuadrant ?? "plan");
    setDate(toDateString(defaultDate ?? new Date()));
    setRepeat("none");
    setError(false);
    setRepeatDays([]);
    setRepeatDate(1);
    setStartTime(undefined);
    setEndTime(undefined);
    setHasTime(false);
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      repeatDays: repeat === "weekly" ? repeatDays : undefined,
      repeatDate: repeat === "monthly" ? repeatDate : undefined,
      startTime: hasTime ? startTime : undefined,
      endTime: hasTime ? endTime : undefined,
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
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

            {/* Time section */}
            <div className="mt-2">
              <CollapsibleSection
                icon="⏰"
                label="시간 설정"
                summary={hasTime && startTime && endTime ? `⏰ ${startTime} → ${endTime}` : undefined}
              >
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hasTime}
                      onChange={(e) => {
                        setHasTime(e.target.checked);
                        if (e.target.checked && !startTime) {
                          setStartTime("09:00");
                          setEndTime("10:00");
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-body-sm text-on-surface-variant">시간 지정</span>
                  </label>
                  {hasTime && startTime && endTime && (
                    <TimePicker
                      startTime={startTime}
                      endTime={endTime}
                      onChange={(s, e) => { setStartTime(s); setEndTime(e); }}
                    />
                  )}
                </div>
              </CollapsibleSection>
            </div>

            {/* Repeat section */}
            <div className="mt-2">
              <CollapsibleSection
                icon="🔁"
                label="반복"
                summary={repeat !== "none" ? `🔁 ${repeat === "daily" ? "매일" : repeat === "weekly" ? `매주` : repeat === "monthly" ? `매월 ${repeatDate}일` : "매년"}` : undefined}
              >
                <RepeatSelector
                  value={repeat}
                  onChange={setRepeat}
                  repeatDays={repeatDays}
                  onRepeatDaysChange={setRepeatDays}
                  repeatDate={repeatDate}
                  onRepeatDateChange={setRepeatDate}
                />
              </CollapsibleSection>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              className="w-full mt-6 py-3.5 rounded-full bg-gradient-to-r from-quadrant-plan-container to-[#0450b0] text-white text-body-lg font-semibold transition-all active:scale-[0.98]"
            >
              추가하기
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
