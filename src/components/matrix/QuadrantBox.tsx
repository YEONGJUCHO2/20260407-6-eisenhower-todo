"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Quadrant } from "@/lib/types";
import { QUADRANTS } from "@/lib/constants";
import { useTodoContext } from "@/hooks/useTodos";
import TaskCard from "./TaskCard";

interface QuadrantBoxProps {
  quadrant: Quadrant;
  date: string;
  onTaskTap?: (todoId: string) => void;
  isOver?: boolean;
}

export default function QuadrantBox({
  quadrant,
  date,
  onTaskTap,
  isOver = false,
}: QuadrantBoxProps) {
  const { getTodosForQuadrant } = useTodoContext();
  const q = QUADRANTS[quadrant];
  const todos = getTodosForQuadrant(quadrant, date);
  const activeCount = todos.filter((t) => !t.completed).length;

  const { setNodeRef } = useDroppable({
    id: `quadrant-${quadrant}`,
    data: { quadrant },
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg flex flex-col overflow-hidden relative transition-all duration-150 ${
        isOver ? "brightness-110" : ""
      }`}
      style={{
        borderLeft: `2px solid ${isOver ? q.primary : q.container}`,
        boxShadow: isOver ? `inset 0 0 20px ${q.primary}10` : "none",
        backgroundColor: `color-mix(in srgb, ${q.container} 8%, var(--color-surface-container-low))`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: q.primary }}
          />
          <span className="text-body-sm font-semibold text-on-surface">
            {q.label}
          </span>
          {activeCount > 0 && (
            <span className="text-label-sm text-outline">
              · {activeCount}개
            </span>
          )}
        </div>
        <span
          className="text-label-sm uppercase text-on-surface-variant/50"
          style={{ letterSpacing: "0.1em" }}
        >
          {q.sublabel}
        </span>
      </div>

      {/* Task list */}
      <SortableContext
        items={todos.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 overflow-y-auto quadrant-scroll px-2 pb-2 space-y-sm">
          {todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-body-sm text-outline">{q.emptyTitle}</p>
              <p className="text-label-sm text-outline/60 mt-1">
                {q.emptySub}
              </p>
            </div>
          ) : (
            todos.map((todo) => (
              <TaskCard
                key={todo.id}
                todo={todo}
                onTap={() => onTaskTap?.(todo.id)}
              />
            ))
          )}
        </div>
      </SortableContext>

      {/* Scroll fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-4 pointer-events-none"
        style={{ background: `linear-gradient(transparent, var(--color-surface-container-low))` }}
      />
    </div>
  );
}
