"use client";

import { QUADRANTS } from "@/lib/constants";
import { RecurringTaskStat } from "@/lib/report-utils";

interface AchievementBarProps {
  task: RecurringTaskStat;
}

export default function AchievementBar({ task }: AchievementBarProps) {
  const q = QUADRANTS[task.quadrant];
  const pct = task.total > 0 ? Math.round((task.achieved / task.total) * 100) : 0;
  const isComplete = task.achieved >= task.total;

  return (
    <div className="flex items-center gap-3">
      <span className="text-body-sm text-on-surface w-24 truncate">
        {task.title}
      </span>
      <div className="flex-1 h-2 bg-surface-container-high rounded-sm overflow-hidden">
        <div
          className="h-full rounded-sm transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: q.primary }}
        />
      </div>
      <span className="text-label-sm text-outline w-20 text-right">
        {isComplete ? (
          <span className="text-[#34d399]">완료</span>
        ) : (
          `${task.achieved}/${task.total} (${pct}%)`
        )}
      </span>
    </div>
  );
}
