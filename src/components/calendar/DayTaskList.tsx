"use client";

import { formatDateKR, toDateString } from "@/lib/date-utils";
import { QUADRANTS } from "@/lib/constants";
import { useTodoContext } from "@/hooks/useTodos";

interface DayTaskListProps {
  selectedDate: Date;
  onTaskTap?: (todoId: string) => void;
}

export default function DayTaskList({
  selectedDate,
  onTaskTap,
}: DayTaskListProps) {
  const { getTodosForDate, toggleComplete } = useTodoContext();
  const dateStr = toDateString(selectedDate);
  const todos = getTodosForDate(dateStr);

  return (
    <div className="px-lg mt-6">
      <h3 className="font-display text-body-lg text-on-surface mb-3">
        {formatDateKR(selectedDate)}
      </h3>

      {todos.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-body-md text-outline">할 일이 없습니다</p>
          <p className="text-label-sm text-outline/60 mt-1">
            + 버튼으로 추가해보세요
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {todos.map((todo) => {
            const q = QUADRANTS[todo.quadrant];
            return (
              <div
                key={todo.id}
                className="glass-card rounded-md px-3 py-3 flex items-center gap-3 cursor-pointer"
                onClick={() => onTaskTap?.(todo.id)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleComplete(todo.id);
                  }}
                  className="flex-shrink-0 w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center"
                  style={{
                    borderColor: todo.completed
                      ? q.primary
                      : q.primary + "60",
                    backgroundColor: todo.completed
                      ? q.primary
                      : "transparent",
                  }}
                >
                  {todo.completed && (
                    <span className="material-symbols-outlined text-[14px] text-surface">
                      check
                    </span>
                  )}
                </button>

                <span
                  className={`text-body-sm flex-1 ${
                    todo.completed
                      ? "line-through text-outline"
                      : "text-on-surface"
                  }`}
                >
                  {todo.title}
                </span>

                {todo.repeat !== "none" && (
                  <span className="text-[10px] text-outline border border-white/10 px-1.5 py-0.5 rounded-sm">
                    반복
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
