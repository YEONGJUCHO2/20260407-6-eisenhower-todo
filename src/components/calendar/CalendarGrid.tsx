"use client";

import { useMemo } from "react";
import {
  getCalendarGrid,
  formatMonthKR,
  toDateString,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "@/lib/date-utils";
import { QUADRANTS, QUADRANT_ORDER } from "@/lib/constants";
import { useTodoContext } from "@/hooks/useTodos";
import { getActiveDates } from "@/lib/streak-utils";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface CalendarGridProps {
  currentMonth: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onMonthChange: (date: Date) => void;
}

export default function CalendarGrid({
  currentMonth,
  selectedDate,
  onSelectDate,
  onMonthChange,
}: CalendarGridProps) {
  const { todos } = useTodoContext();
  const grid = useMemo(() => getCalendarGrid(currentMonth), [currentMonth]);
  const activeDates = useMemo(() => getActiveDates(todos), [todos]);

  const dateDots = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    todos.forEach((t) => {
      if (!map[t.date]) map[t.date] = new Set();
      map[t.date].add(t.quadrant);
    });
    return map;
  }, [todos]);

  return (
    <div className="px-lg">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface rounded-full"
          aria-label="이전 달"
        >
          <span className="material-symbols-outlined text-[20px]">
            chevron_left
          </span>
        </button>
        <h2 className="font-display text-headline text-on-surface">
          {formatMonthKR(currentMonth)}
        </h2>
        <button
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface rounded-full"
          aria-label="다음 달"
        >
          <span className="material-symbols-outlined text-[20px]">
            chevron_right
          </span>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-label-sm text-outline py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {grid.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} className="h-11" />;
          }

          const dateStr = toDateString(day);
          const isSelected = isSameDay(day, selectedDate);
          const today = isToday(day);
          const dots = dateDots[dateStr];
          const isActive = activeDates.has(dateStr);

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(day)}
              className={`h-11 flex flex-col items-center justify-center rounded-full mx-auto w-11 transition-all ${
                isSelected
                  ? "bg-quadrant-plan-container text-white"
                  : today
                    ? "ring-1 ring-quadrant-plan-primary/40 text-quadrant-plan-primary"
                    : "text-on-surface hover:bg-surface-container-high"
              }`}
              aria-label={dateStr}
            >
              <span className="text-body-sm">
                {isActive ? "🔥" : day.getDate()}
              </span>
              {dots && dots.size > 0 && (
                <div className="flex gap-[1px] mt-[1px]">
                  {QUADRANT_ORDER.filter((q) => dots.has(q))
                    .slice(0, 4)
                    .map((q) => (
                      <span
                        key={q}
                        className="w-[3px] h-[3px] rounded-full"
                        style={{
                          backgroundColor: QUADRANTS[q].primary,
                        }}
                      />
                    ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
