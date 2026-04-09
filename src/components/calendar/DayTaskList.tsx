"use client";

import { useRef, useState, useCallback } from "react";
import { formatDateKR, toDateString } from "@/lib/date-utils";
import { QUADRANTS } from "@/lib/constants";
import { useTodoContext } from "@/hooks/useTodos";
import { Todo } from "@/lib/types";
import SwipeableTask from "./SwipeableTask";

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
  timelineRef,
}: {
  todo: Todo;
  onUpdate: (id: string, start: string, end: string) => void;
  onTap: (id: string) => void;
  startHour: number;
  endHour: number;
  timelineRef: React.RefObject<HTMLDivElement | null>;
}) {
  const q = QUADRANTS[todo.quadrant];
  const dragState = useRef<{
    type: "move" | "resize-left" | "resize-right";
    startX: number;
    origStartMin: number;
    origEndMin: number;
  } | null>(null);
  const [dragDelta, setDragDelta] = useState({ startDelta: 0, endDelta: 0 });
  const moved = useRef(false);

  const startMin = timeToMinutes(todo.startTime!);
  const endMin = timeToMinutes(todo.endTime!);
  const rangeMin = (endHour - startHour) * 60;

  const pxToMinutes = useCallback(
    (px: number) => {
      const el = timelineRef.current;
      if (!el) return 0;
      return (px / el.getBoundingClientRect().width) * rangeMin;
    },
    [timelineRef, rangeMin]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, type: "move" | "resize-left" | "resize-right") => {
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      moved.current = false;
      dragState.current = { type, startX: e.clientX, origStartMin: startMin, origEndMin: endMin };
    },
    [startMin, endMin]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState.current) return;
      const ds = dragState.current;
      const deltaMin = pxToMinutes(e.clientX - ds.startX);
      if (Math.abs(e.clientX - ds.startX) > 3) moved.current = true;

      const snap = (m: number) => Math.round(m / 30) * 30;
      const floorH = startHour * 60;
      const ceilH = endHour * 60;

      if (ds.type === "move") {
        const dur = ds.origEndMin - ds.origStartMin;
        let newStart = snap(ds.origStartMin + deltaMin);
        newStart = Math.max(floorH, Math.min(ceilH - dur, newStart));
        setDragDelta({ startDelta: newStart - startMin, endDelta: newStart + dur - endMin });
      } else if (ds.type === "resize-left") {
        let newStart = snap(ds.origStartMin + deltaMin);
        newStart = Math.max(floorH, Math.min(ds.origEndMin - 30, newStart));
        setDragDelta({ startDelta: newStart - startMin, endDelta: 0 });
      } else {
        let newEnd = snap(ds.origEndMin + deltaMin);
        newEnd = Math.max(ds.origStartMin + 30, Math.min(ceilH, newEnd));
        setDragDelta({ startDelta: 0, endDelta: newEnd - endMin });
      }
    },
    [startMin, endMin, startHour, endHour, pxToMinutes]
  );

  const handlePointerUp = useCallback(() => {
    if (!dragState.current) return;
    if (!moved.current) {
      dragState.current = null;
      setDragDelta({ startDelta: 0, endDelta: 0 });
      onTap(todo.id);
      return;
    }
    const fmtTime = (m: number) => {
      const h = Math.floor(m / 60) % 24;
      const min = m % 60;
      return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    };
    const newStart = fmtTime(startMin + dragDelta.startDelta);
    const newEnd = fmtTime(endMin + dragDelta.endDelta);
    if (newStart !== newEnd) onUpdate(todo.id, newStart, newEnd);
    dragState.current = null;
    setDragDelta({ startDelta: 0, endDelta: 0 });
  }, [startMin, endMin, dragDelta, todo.id, onUpdate, onTap]);

  const curStart = startMin + dragDelta.startDelta;
  const curEnd = endMin + dragDelta.endDelta;
  const leftPct = ((curStart - startHour * 60) / rangeMin) * 100;
  const widthPct = ((curEnd - curStart) / rangeMin) * 100;

  return (
    <div
      className="absolute top-0 h-full flex items-center"
      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        className="w-full h-[32px] rounded-md flex items-center overflow-hidden cursor-grab active:cursor-grabbing shadow-sm relative"
        style={{
          backgroundColor: q.container,
          border: `1px solid color-mix(in srgb, ${q.primary} 40%, transparent)`,
        }}
        onPointerDown={(e) => handlePointerDown(e, "move")}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize z-10 flex items-center justify-center"
          onPointerDown={(e) => handlePointerDown(e, "resize-left")}
        >
          <div className="w-[3px] h-3 rounded-full bg-white/30" />
        </div>
        <span className="text-[11px] text-white font-semibold truncate px-4 pointer-events-none drop-shadow-sm">
          {todo.title}
        </span>
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
  const timelineRef = useRef<HTMLDivElement>(null);

  // 1시간 단위 눈금 생성
  const hours: number[] = [];
  for (let h = startHour; h <= endHour; h++) {
    hours.push(h);
  }

  return (
    <div className="mb-5 bg-surface-container-low rounded-lg p-3 overflow-hidden">
      {/* Hour labels */}
      <div className="relative h-5 mb-1">
        {hours.map((h, i) => (
          <span
            key={h}
            className="absolute text-[10px] font-medium text-on-surface-variant"
            style={{
              left: `${((h - startHour) / totalHours) * 100}%`,
              transform: i === hours.length - 1 ? "translateX(-100%)" : i === 0 ? "none" : "translateX(-50%)",
            }}
          >
            {h}시
          </span>
        ))}
      </div>

      {/* Timeline with vertical grid lines spanning full height */}
      <div className="relative">
        {/* Vertical grid lines — full height behind track + bars */}
        {hours.map((h) => (
          <div
            key={h}
            className="absolute top-0 bottom-0 w-px bg-outline/30 z-0"
            style={{ left: `${((h - startHour) / totalHours) * 100}%` }}
          />
        ))}

        {/* Timeline track */}
        <div className="relative bg-outline/20 rounded-full h-[8px] mb-2 z-[1]">
          {hours.map((h) => (
            <div
              key={h}
              className="absolute top-0 bottom-0 w-px bg-outline/40"
              style={{ left: `${((h - startHour) / totalHours) * 100}%` }}
            />
          ))}
        </div>

        {/* Task bars — packed into rows to save space */}
        {(() => {
          const rows: Todo[][] = [];
          const sorted = [...scheduled].sort(
            (a, b) => timeToMinutes(a.startTime!) - timeToMinutes(b.startTime!)
          );
          for (const todo of sorted) {
            const start = timeToMinutes(todo.startTime!);
            let placed = false;
            for (const row of rows) {
              const lastEnd = timeToMinutes(row[row.length - 1].endTime!);
              if (start >= lastEnd) {
                row.push(todo);
                placed = true;
                break;
              }
            }
            if (!placed) rows.push([todo]);
          }

          const ROW_H = 36;
          const GAP = 2;
          const totalH = rows.length * ROW_H + Math.max(0, rows.length - 1) * GAP;

          return (
            <div ref={timelineRef} className="relative z-[1]" style={{ height: `${totalH}px` }}>
              {rows.map((row, ri) =>
                row.map((todo) => (
                  <div
                    key={todo.id}
                    className="absolute"
                    style={{
                      top: `${ri * (ROW_H + GAP)}px`,
                      left: 0,
                      right: 0,
                      height: `${ROW_H}px`,
                    }}
                  >
                    <DraggableBar
                      todo={todo}
                      onUpdate={onUpdate}
                      onTap={onTap}
                      startHour={startHour}
                      endHour={endHour}
                      timelineRef={timelineRef}
                    />
                  </div>
                ))
              )}
            </div>
          );
        })()}

        {/* Bottom hour labels */}
        <div className="relative h-4 mt-1">
          {hours.map((h, i) => (
            <span
              key={h}
              className="absolute text-[9px] font-medium text-outline"
              style={{
                left: `${((h - startHour) / totalHours) * 100}%`,
                transform: i === hours.length - 1 ? "translateX(-100%)" : i === 0 ? "none" : "translateX(-50%)",
              }}
            >
              {h}시
            </span>
          ))}
        </div>
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
  const { getTodosForDate, toggleComplete, deleteTodo, updateTodo } = useTodoContext();
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
                <SwipeableTask
                  key={todo.id}
                  onSwipeRight={() => toggleComplete(todo.id)}
                  onSwipeLeft={() => deleteTodo(todo.id)}
                >
                <div
                  className="rounded-md px-3 py-3 flex items-center gap-3 cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                  style={{
                    backgroundColor: todo.quadrant === "do" ? "rgba(255,180,173,0.15)" : todo.quadrant === "plan" ? "rgba(173,198,255,0.15)" : todo.quadrant === "delegate" ? "rgba(255,185,95,0.15)" : "rgba(140,144,159,0.10)",
                    border: `1px solid ${q.primary}20`,
                    transform: `rotate(${((todo.id.charCodeAt(0) % 5) - 2) * 0.5}deg)`,
                  }}
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
                </SwipeableTask>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
