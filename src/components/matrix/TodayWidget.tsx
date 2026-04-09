"use client";

import { useTodoContext } from "@/hooks/useTodos";
import { toDateString } from "@/lib/date-utils";

interface TodayWidgetProps {
  date: string;
  onTap?: () => void;
}

export default function TodayWidget({ date, onTap }: TodayWidgetProps) {
  const { getTodosForQuadrant } = useTodoContext();
  const today = toDateString(new Date());
  if (date !== today) return null;

  const doTodos = getTodosForQuadrant("do", date);
  const pending = doTodos.filter((t) => !t.completed);

  // All done state
  if (pending.length === 0 && doTodos.length > 0) {
    return (
      <div className="mb-2 px-3 py-2.5 rounded-lg bg-green-500/10 border border-green-500/20" onClick={onTap}>
        <span className="text-body-sm text-green-400 font-medium">
          오늘 할 일 완료! 🎉
        </span>
      </div>
    );
  }

  // No DO tasks
  if (pending.length === 0) return null;

  // Pending tasks
  return (
    <div
      className="mb-2 px-3 py-2.5 rounded-lg bg-quadrant-do-container/10 border border-quadrant-do-primary/20 cursor-pointer"
      onClick={onTap}
    >
      <div className="flex items-center justify-between">
        <span className="text-body-sm text-on-surface">
          <span className="font-semibold text-quadrant-do-primary">{pending.length}개</span> 긴급 할 일
        </span>
        <span className="text-[11px] text-on-surface-variant truncate max-w-[140px] ml-2">
          {pending[0]?.title}
        </span>
      </div>
    </div>
  );
}
