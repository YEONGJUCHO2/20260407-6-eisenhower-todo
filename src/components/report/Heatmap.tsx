"use client";

import { useMemo, useState } from "react";
import { Todo } from "@/lib/types";
import { toDateString, addDays, format } from "@/lib/date-utils";
import { ko } from "date-fns/locale";

interface HeatmapProps {
  todos: Todo[];
}

export default function Heatmap({ todos }: HeatmapProps) {
  const [tooltip, setTooltip] = useState<{ date: string; count: number } | null>(null);

  const todayStr = useMemo(() => toDateString(new Date()), []);

  const { grid, completionMap } = useMemo(() => {
    const map = new Map<string, number>();
    todos.forEach((t) => {
      if (t.completed) {
        const date = t.completedAt?.substring(0, 10) ?? t.date;
        map.set(date, (map.get(date) ?? 0) + 1);
      }
    });

    // Build 12-week grid (84 days) ending today
    const today = new Date();
    const cells: { date: string; dayOfWeek: number; weekIndex: number }[] = [];
    for (let i = 83; i >= 0; i--) {
      const d = addDays(today, -i);
      const dateStr = toDateString(d);
      const dayOfWeek = d.getDay(); // 0=Sun
      const weekIndex = Math.floor((83 - i) / 7);
      cells.push({ date: dateStr, dayOfWeek, weekIndex });
    }

    return { grid: cells, completionMap: map };
  }, [todos]);

  // Theme-aware color scale using CSS variables for the empty state
  // and the plan-primary color with varying opacity for filled cells
  const getColor = (count: number) => {
    if (count === 0) return "var(--color-surface-container-high)";
    if (count <= 2) return "var(--color-q-plan-container)";
    if (count <= 4) return "var(--color-q-plan-primary)";
    return "#4dabff";
  };

  const getOpacity = (count: number) => {
    if (count === 0) return 1;
    if (count <= 2) return 0.45;
    if (count <= 4) return 0.7;
    return 1;
  };

  const dayLabels = ["월", "화", "수", "목", "금", "토", "일"];

  return (
    <div>
      {/* Title & subtitle */}
      <p className="text-label-sm text-outline mb-3">
        최근 12주간 할 일 완료 현황
      </p>

      <div className="flex gap-[3px]">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] mr-1">
          {dayLabels.map((label, i) => (
            <div
              key={i}
              className="h-[14px] flex items-center text-[9px] text-outline"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-[3px] flex-1 overflow-x-auto">
          {Array.from({ length: 12 }, (_, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-[3px]">
              {Array.from({ length: 7 }, (_, dayIdx) => {
                const cell = grid.find(
                  (c) => c.weekIndex === weekIdx && c.dayOfWeek === dayIdx
                );
                if (!cell)
                  return (
                    <div
                      key={dayIdx}
                      className="w-[14px] h-[14px] rounded-[2px]"
                    />
                  );
                const count = completionMap.get(cell.date) ?? 0;
                const isToday = cell.date === todayStr;
                return (
                  <div
                    key={dayIdx}
                    className={`w-[14px] h-[14px] rounded-[2px] cursor-pointer transition-all hover:ring-1 hover:ring-current/20 ${
                      isToday ? "ring-2 ring-offset-1" : ""
                    }`}
                    style={{
                      backgroundColor: getColor(count),
                      opacity: getOpacity(count),
                      ...(isToday
                        ? {
                            ringColor: "var(--color-q-plan-primary)",
                            outlineOffset: "1px",
                            outline: "2px solid var(--color-q-plan-primary)",
                            borderRadius: "2px",
                          }
                        : {}),
                    }}
                    title={isToday ? "오늘" : undefined}
                    onClick={() =>
                      setTooltip(
                        tooltip?.date === cell.date ? null : { date: cell.date, count }
                      )
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="mt-2 text-[11px] text-on-surface-variant text-center">
          {format(new Date(tooltip.date), "M월 d일", { locale: ko })}
          {tooltip.date === todayStr ? " (오늘)" : ""}: {tooltip.count}개 완료
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-2">
        <span className="text-[9px] text-outline">적음</span>
        {[0, 1, 3, 5].map((n) => (
          <div
            key={n}
            className="w-[10px] h-[10px] rounded-[2px]"
            style={{ backgroundColor: getColor(n), opacity: getOpacity(n) }}
          />
        ))}
        <span className="text-[9px] text-outline">많음</span>
      </div>
    </div>
  );
}
