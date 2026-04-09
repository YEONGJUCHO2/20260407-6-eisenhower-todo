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

  const getColor = (count: number) => {
    if (count === 0) return "var(--color-surface-container-low)";
    if (count <= 2) return "rgba(173,198,255,0.2)";
    if (count <= 4) return "rgba(173,198,255,0.4)";
    return "rgba(173,198,255,0.7)";
  };

  const dayLabels = ["", "월", "", "수", "", "금", ""];

  return (
    <div>
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
                return (
                  <div
                    key={dayIdx}
                    className="w-[14px] h-[14px] rounded-[2px] cursor-pointer transition-all hover:ring-1 hover:ring-white/20"
                    style={{ backgroundColor: getColor(count) }}
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
          {format(new Date(tooltip.date), "M월 d일", { locale: ko })}: {tooltip.count}개 완료
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-2">
        <span className="text-[9px] text-outline">적음</span>
        {[0, 1, 3, 5].map((n) => (
          <div
            key={n}
            className="w-[10px] h-[10px] rounded-[2px]"
            style={{ backgroundColor: getColor(n) }}
          />
        ))}
        <span className="text-[9px] text-outline">많음</span>
      </div>
    </div>
  );
}
