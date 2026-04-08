"use client";

import { formatDateKR, toDateString } from "@/lib/date-utils";
import { QUADRANTS } from "@/lib/constants";
import { useTodoContext } from "@/hooks/useTodos";
import { Todo } from "@/lib/types";

function timeToPercent(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return ((h * 60 + m) / (24 * 60)) * 100;
}

function TimelineBar({ todos }: { todos: Todo[] }) {
  const scheduled = todos.filter((t) => t.startTime && t.endTime);
  if (scheduled.length === 0) return null;

  const HOURS = [0, 3, 6, 9, 12, 15, 18, 21, 24];

  return (
    <div className="mb-4">
      {/* Hour labels */}
      <div className="relative h-4 mb-1">
        {HOURS.map((h) => (
          <span
            key={h}
            className="absolute text-[8px] text-outline -translate-x-1/2"
            style={{ left: `${(h / 24) * 100}%` }}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Timeline track */}
      <div className="relative bg-surface-container-high rounded-full h-[6px] mb-2">
        {/* Hour tick marks */}
        {HOURS.map((h) => (
          <div
            key={h}
            className="absolute top-0 bottom-0 w-px bg-outline/20"
            style={{ left: `${(h / 24) * 100}%` }}
          />
        ))}
      </div>

      {/* Task bars */}
      <div className="space-y-[3px]">
        {scheduled.map((todo) => {
          const q = QUADRANTS[todo.quadrant];
          const left = timeToPercent(todo.startTime!);
          const right = timeToPercent(todo.endTime!);
          const width = Math.max(right - left, 1);

          return (
            <div key={todo.id} className="relative h-5 flex items-center">
              <div
                className="absolute h-4 rounded-sm flex items-center px-1 overflow-hidden"
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  backgroundColor: q.container,
                  minWidth: "4px",
                }}
              >
                <span className="text-[8px] text-white font-medium truncate">
                  {todo.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
        <>
          {/* Timeline bar graph */}
          <TimelineBar todos={todos} />

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
                    aria-label={todo.completed ? "완료 취소" : "완료"}
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

                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-body-sm block truncate ${
                        todo.completed
                          ? "line-through text-outline"
                          : "text-on-surface"
                      }`}
                    >
                      {todo.title}
                    </span>
                    {todo.startTime && todo.endTime && (
                      <span className="text-[11px] text-on-surface-variant">
                        {todo.startTime} - {todo.endTime}
                      </span>
                    )}
                  </div>

                  {todo.repeat !== "none" && (
                    <span className="text-[10px] text-outline border border-white/10 px-1.5 py-0.5 rounded-sm">
                      반복
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
