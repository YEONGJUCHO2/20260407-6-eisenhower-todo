"use client";

import { useRef, useState, useCallback } from "react";
import { formatDateKR, toDateString } from "@/lib/date-utils";
import { QUADRANTS } from "@/lib/constants";
import { useTodoContext } from "@/hooks/useTodos";
import { Todo } from "@/lib/types";

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getTimeRange(todos: Todo[]): { startHour: number; endHour: number } {
  const scheduled = todos.filter((t) => t.startTime && t.endTime);
  if (scheduled.length === 0) return { startHour: 8, endHour: 20 };

  let minMin = 24 * 60;
  let maxMin = 0;
  for (const t of scheduled) {
    minMin = Math.min(minMin, timeToMinutes(t.startTime!));
    maxMin = Math.max(maxMin, timeToMinutes(t.endTime!));
  }

  // 앞뒤 1시간 여유, 1시간 단위 스냅
  const startHour = Math.max(0, Math.floor(minMin / 60) - 1);
  const endHour = Math.min(24, Math.ceil(maxMin / 60) + 1);
  // 최소 6시간 구간 보장
  if (endHour - startHour < 6) {
    const mid = (startHour + endHour) / 2;
    return {
      startHour: Math.max(0, Math.floor(mid - 3)),
      endHour: Math.min(24, Math.ceil(mid + 3)),
    };
  }
  return { startHour, endHour };
}

function timeToPercent(time: string, startHour: number, endHour: number): number {
  const min = timeToMinutes(time);
  const rangeMin = endHour * 60 - startHour * 60;
  return ((min - startHour * 60) / rangeMin) * 100;
}

function percentToTime(pct: number, startHour: number, endHour: number): string {
  const clamped = Math.max(0, Math.min(100, pct));
  const rangeMin = endHour * 60 - startHour * 60;
  const totalMin = startHour * 60 + Math.round((clamped / 100) * rangeMin);
  const snapped = Math.round(totalMin / 30) * 30;
  const h = Math.floor(snapped / 60) % 24;
  const m = snapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function DraggableBar({
  todo,
  onUpdate,
  onTap,
  startHour,
  endHour,
}: {
  todo: Todo;
  onUpdate: (id: string, start: string, end: string) => void;
  onTap: (id: string) => void;
  startHour: number;
  endHour: number;
}) {
  const q = QUADRANTS[todo.quadrant];
  const left = timeToPercent(todo.startTime!, startHour, endHour);
  const right = timeToPercent(todo.endTime!, startHour, endHour);
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
    const newStart = percentToTime(finalLeft, startHour, endHour);
    const newEnd = percentToTime(finalLeft + finalWidth, startHour, endHour);
    if (newStart !== newEnd) {
      onUpdate(todo.id, newStart, newEnd);
    }
    dragState.current = null;
    setDragOffset({ left: 0, width: 0 });
  }, [left, width, dragOffset, todo.id, onUpdate, onTap, startHour, endHour]);

  const currentLeft = left + dragOffset.left;
  const currentWidth = width + dragOffset.width;

  return (
    <div
      ref={containerRef}
      className="relative h-9 flex items-center"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        className="absolute h-8 rounded-md flex items-center overflow-hidden cursor-grab active:cursor-grabbing shadow-sm"
        style={{
          left: `${currentLeft}%`,
          width: `${currentWidth}%`,
          backgroundColor: q.container,
          minWidth: "12px",
          border: `1px solid color-mix(in srgb, ${q.primary} 40%, transparent)`,
        }}
        onPointerDown={(e) => handlePointerDown(e, "move")}
      >
        {/* Left resize handle */}
        <div
          className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize z-10 flex items-center justify-center"
          onPointerDown={(e) => handlePointerDown(e, "resize-left")}
        >
          <div className="w-[3px] h-3 rounded-full bg-white/30" />
        </div>
        <span className="text-[11px] text-white font-semibold truncate px-4 pointer-events-none drop-shadow-sm">
          {todo.title}
        </span>
        {/* Right resize handle */}
        <div
          className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize z-10 flex items-center justify-center"
          onPointerDown={(e) => handlePointerDown(e, "resize-right")}
        >
          <div className="w-[3px] h-3 rounded-full bg-white/30" />
        </div>
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

  const { startHour, endHour } = getTimeRange(todos);
  const totalHours = endHour - startHour;

  // 1시간 단위 눈금 생성
  const hours: number[] = [];
  for (let h = startHour; h <= endHour; h++) {
    hours.push(h);
  }

  return (
    <div className="mb-5 bg-surface-container-low rounded-lg p-3">
      {/* Hour labels */}
      <div className="relative h-5 mb-1">
        {hours.map((h) => (
          <span
            key={h}
            className="absolute text-[10px] font-medium text-on-surface-variant -translate-x-1/2"
            style={{ left: `${((h - startHour) / totalHours) * 100}%` }}
          >
            {h}시
          </span>
        ))}
      </div>

      {/* Timeline track */}
      <div className="relative bg-surface-container-highest rounded-full h-[8px] mb-3">
        {hours.map((h) => (
          <div
            key={h}
            className="absolute top-0 bottom-0 w-px bg-outline/30"
            style={{ left: `${((h - startHour) / totalHours) * 100}%` }}
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
            startHour={startHour}
            endHour={endHour}
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
