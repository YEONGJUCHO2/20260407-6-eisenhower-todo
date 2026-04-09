"use client";

import { useMemo } from "react";
import { useTodoContext } from "@/hooks/useTodos";
import {
  getWeekRange,
  toDateString,
  format,
  eachDayOfInterval,
} from "@/lib/date-utils";
import { QUADRANTS } from "@/lib/constants";
import { Todo } from "@/lib/types";
import { ko } from "date-fns/locale";

interface WeeklyTimelineProps {
  selectedDate: Date;
  onTaskTap?: (todoId: string) => void;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export default function WeeklyTimeline({
  selectedDate,
  onTaskTap,
}: WeeklyTimelineProps) {
  const { getTodosForDate } = useTodoContext();
  const { start, end } = getWeekRange(selectedDate);
  const days = eachDayOfInterval({ start, end });

  const { dayTodos, startHour, endHour } = useMemo(() => {
    const byDay: Record<string, Todo[]> = {};
    let minMin = 24 * 60;
    let maxMin = 0;

    days.forEach((day) => {
      const dateStr = toDateString(day);
      const todos = getTodosForDate(dateStr).filter(
        (t) => t.startTime && t.endTime
      );
      byDay[dateStr] = todos;
      todos.forEach((t) => {
        minMin = Math.min(minMin, timeToMinutes(t.startTime!));
        maxMin = Math.max(maxMin, timeToMinutes(t.endTime!));
      });
    });

    const sh = minMin < 24 * 60 ? Math.max(0, Math.floor(minMin / 60) - 1) : 8;
    const eh = maxMin > 0 ? Math.min(24, Math.ceil(maxMin / 60) + 1) : 20;
    const finalSh = Math.min(sh, eh - 6);
    const finalEh = Math.max(eh, finalSh + 6);

    return { dayTodos: byDay, startHour: finalSh, endHour: finalEh };
  }, [days, getTodosForDate]);

  const totalHours = endHour - startHour;
  const hours: number[] = [];
  for (let h = startHour; h <= endHour; h++) hours.push(h);

  return (
    <div className="px-lg mt-4 overflow-x-auto">
      <div className="flex" style={{ minWidth: "600px" }}>
        {/* Hour labels */}
        <div className="w-12 flex-shrink-0">
          <div className="h-8" /> {/* header spacer */}
          {hours.map((h) => (
            <div
              key={h}
              className="text-label-lg text-on-surface-variant text-right pr-1"
              style={{ height: `${200 / totalHours}px` }}
            >
              {h}시
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day) => {
          const dateStr = toDateString(day);
          const todos = dayTodos[dateStr] ?? [];
          const isToday = toDateString(new Date()) === dateStr;

          return (
            <div key={dateStr} className="flex-1 min-w-[70px]">
              {/* Day header */}
              <div
                className={`h-8 flex flex-col items-center justify-center text-center ${
                  isToday ? "text-quadrant-plan-primary" : "text-on-surface-variant"
                }`}
              >
                <span className="text-label-lg font-semibold">
                  {format(day, "EEE", { locale: ko })}
                </span>
                <span className="text-body-sm font-semibold">
                  {format(day, "d")}
                </span>
              </div>

              {/* Time grid */}
              <div
                className="relative border-l border-white/5"
                style={{ height: 200 }}
              >
                {/* Hour lines */}
                {hours.map((h) => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-on-surface-variant/15"
                    style={{
                      top: `${((h - startHour) / totalHours) * 100}%`,
                    }}
                  />
                ))}

                {/* Task blocks */}
                {todos.map((todo) => {
                  const q = QUADRANTS[todo.quadrant];
                  const startPct =
                    ((timeToMinutes(todo.startTime!) - startHour * 60) /
                      (totalHours * 60)) *
                    100;
                  const endPct =
                    ((timeToMinutes(todo.endTime!) - startHour * 60) /
                      (totalHours * 60)) *
                    100;

                  return (
                    <div
                      key={todo.id}
                      className="absolute left-[2px] right-[2px] rounded-[3px] overflow-hidden cursor-pointer hover:brightness-110 transition-all"
                      style={{
                        top: `${startPct}%`,
                        height: `${endPct - startPct}%`,
                        backgroundColor: q.container,
                        minHeight: 16,
                      }}
                      onClick={() => onTaskTap?.(todo.id)}
                    >
                      <span className="text-[8px] text-white font-medium px-1 leading-tight block truncate">
                        {todo.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
