"use client";

import { useRef, useState, useCallback } from "react";
import { formatDateKR, toDateString } from "@/lib/date-utils";
import { QUADRANTS } from "@/lib/constants";
import { useTodoContext } from "@/hooks/useTodos";
import { Todo } from "@/lib/types";

function timeToPercent(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return ((h * 60 + m) / (24 * 60)) * 100;
}

function percentToTime(pct: number): string {
  const clamped = Math.max(0, Math.min(100, pct));
  const totalMin = Math.round((clamped / 100) * 24 * 60);
  const snapped = Math.round(totalMin / 30) * 30;
  const h = Math.floor(snapped / 60) % 24;
  const m = snapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function DraggableBar({
  todo,
  onUpdate,
  onTap,
}: {
  todo: Todo;
  onUpdate: (id: string, start: string, end: string) => void;
  onTap: (id: string) => void;
}) {
  const q = QUADRANTS[todo.quadrant];
  const left = timeToPercent(todo.startTime!);
  const right = timeToPercent(todo.endTime!);
  const width = Math.max(right - left, 1);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    type: "move" | "resize-left" | "resize-right";
    startX: number;
    origLeft: number;
    origWidth: number;
  } | null>(null);
  const [dragOffset, setDragOffset] = useState({ left: 0, width: 0 });
  const moved = useRef(false);

  const getPercent = useCallback((clientX: number) => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return 0;
    const rect = parent.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, type: "move" | "resize-left" | "resize-right") => {
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      moved.current = false;
      dragState.current = {
        type,
        startX: e.clientX,
        origLeft: left,
        origWidth: width,
      };
    },
    [left, width]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState.current) return;
      const ds = dragState.current;
      const parent = containerRef.current?.parentElement;
      if (!parent) return;
      const pxPerPercent = parent.getBoundingClientRect().width / 100;
      const deltaPct = (e.clientX - ds.startX) / pxPerPercent;

      if (Math.abs(e.clientX - ds.startX) > 3) moved.current = true;

      if (ds.type === "move") {
        const newLeft = Math.max(0, Math.min(100 - ds.origWidth, ds.origLeft + deltaPct));
        setDragOffset({ left: newLeft - left, width: 0 });
      } else if (ds.type === "resize-left") {
        const newLeft = Math.max(0, Math.min(ds.origLeft + ds.origWidth - 2, ds.origLeft + deltaPct));
        const newWidth = ds.origWidth - (newLeft - ds.origLeft);
        setDragOffset({ left: newLeft - left, width: newWidth - width });
      } else {
        const newWidth = Math.max(2, Math.min(100 - ds.origLeft, ds.origWidth + deltaPct));
        setDragOffset({ left: 0, width: newWidth - width });
      }
    },
    [left, width]
  );

  const handlePointerUp = useCallback(() => {
    if (!dragState.current) return;
    if (!moved.current) {
      dragState.current = null;
      setDragOffset({ left: 0, width: 0 });
      onTap(todo.id);
      return;
    }

    const finalLeft = left + dragOffset.left;
    const finalWidth = width + dragOffset.width;
    const newStart = percentToTime(finalLeft);
    const newEnd = percentToTime(finalLeft + finalWidth);
    if (newStart !== newEnd) {
      onUpdate(todo.id, newStart, newEnd);
    }
    dragState.current = null;
    setDragOffset({ left: 0, width: 0 });
  }, [left, width, dragOffset, todo.id, onUpdate, onTap]);

  const currentLeft = left + dragOffset.left;
  const currentWidth = width + dragOffset.width;

  return (
    <div
      ref={containerRef}
      className="relative h-6 flex items-center"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        className="absolute h-5 rounded flex items-center overflow-hidden cursor-grab active:cursor-grabbing"
        style={{
          left: `${currentLeft}%`,
          width: `${currentWidth}%`,
          backgroundColor: q.container,
          minWidth: "8px",
        }}
        onPointerDown={(e) => handlePointerDown(e, "move")}
      >
        {/* Left resize handle */}
        <div
          className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize z-10"
          onPointerDown={(e) => handlePointerDown(e, "resize-left")}
        />
        <span className="text-[8px] text-white font-medium truncate px-1.5 pointer-events-none">
          {todo.title}
        </span>
        {/* Right resize handle */}
        <div
          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize z-10"
          onPointerDown={(e) => handlePointerDown(e, "resize-right")}
        />
      </div>
    </div>
  );
}

function TimelineBar({
  todos,
  onUpdate,
  onTap,
}: {
  todos: Todo[];
  onUpdate: (id: string, start: string, end: string) => void;
  onTap: (id: string) => void;
}) {
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
        {HOURS.map((h) => (
          <div
            key={h}
            className="absolute top-0 bottom-0 w-px bg-outline/20"
            style={{ left: `${(h / 24) * 100}%` }}
          />
        ))}
      </div>

      {/* Task bars — draggable */}
      <div className="space-y-[2px]">
        {scheduled.map((todo) => (
          <DraggableBar
            key={todo.id}
            todo={todo}
            onUpdate={onUpdate}
            onTap={onTap}
          />
        ))}
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
  const { getTodosForDate, toggleComplete, updateTodo } = useTodoContext();
  const dateStr = toDateString(selectedDate);
  const todos = getTodosForDate(dateStr);

  const handleTimeUpdate = (id: string, start: string, end: string) => {
    updateTodo(id, { startTime: start, endTime: end });
  };

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
          <TimelineBar
            todos={todos}
            onUpdate={handleTimeUpdate}
            onTap={(id) => onTaskTap?.(id)}
          />

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
