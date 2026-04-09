"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Todo } from "@/lib/types";
import { QUADRANTS } from "@/lib/constants";
import { useTodoContext } from "@/hooks/useTodos";

// Sticky note pastel backgrounds per quadrant
const STICKY_COLORS: Record<string, { bg: string; border: string }> = {
  do: { bg: "rgba(255,180,173,0.15)", border: "rgba(255,84,81,0.25)" },
  plan: { bg: "rgba(173,198,255,0.15)", border: "rgba(5,102,217,0.25)" },
  delegate: { bg: "rgba(255,185,95,0.15)", border: "rgba(202,129,0,0.25)" },
  delete: { bg: "rgba(140,144,159,0.10)", border: "rgba(66,71,84,0.20)" },
};

interface TaskCardProps {
  todo: Todo;
  onTap?: () => void;
}

export default function TaskCard({ todo, onTap }: TaskCardProps) {
  const { toggleComplete, deleteTodo } = useTodoContext();
  const q = QUADRANTS[todo.quadrant];
  const sticky = STICKY_COLORS[todo.quadrant];

  // No rotation — clean aligned cards

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id, data: { todo } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : todo.completed ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={{ ...style, touchAction: "none" }} {...attributes} {...listeners}>
      <motion.div
        layout
        className={`rounded-md px-3 py-[10px] flex items-center gap-2 cursor-grab select-none active:cursor-grabbing ${
          isDragging
            ? "shadow-[0_20px_40px_rgba(0,0,0,0.4)] scale-[1.04] z-50"
            : "shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
        }`}
        style={{
          backgroundColor: sticky.bg,
          border: `1px solid ${sticky.border}`,
          transform: isDragging ? "rotate(-2deg) scale(1.04)" : undefined,
        }}
        onClick={onTap}
      >
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleComplete(todo.id);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex-shrink-0 w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-colors"
          style={{
            borderColor: todo.completed ? q.primary : q.primary + "60",
            backgroundColor: todo.completed ? q.primary : "transparent",
          }}
          aria-label={todo.completed ? "완료 취소" : "완료"}
        >
          {todo.completed && (
            <span className="material-symbols-outlined text-[14px] text-surface">
              check
            </span>
          )}
        </button>

        {/* Title + Time */}
        <div
          className={`flex-1 min-w-0 ${
            todo.completed ? "line-through opacity-60" : ""
          }`}
        >
          <span className="text-body-sm text-on-surface truncate block">
            {todo.title}
          </span>
          {todo.startTime && todo.endTime && (
            <span className="text-[11px] text-on-surface-variant">
              {todo.startTime} - {todo.endTime}
            </span>
          )}
        </div>

        {/* Subtask progress */}
        {todo.subtasks && todo.subtasks.length > 0 && (
          <span className="text-[10px] text-on-surface-variant">
            {todo.subtasks.filter((s) => s.completed).length}/
            {todo.subtasks.length}
          </span>
        )}

        {/* Repeat badge */}
        {todo.repeat !== "none" && (
          <span className="text-[10px] text-outline border border-white/10 px-1.5 py-0.5 rounded-sm">
            반복
          </span>
        )}

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteTodo(todo.id);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-outline/40 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          aria-label="삭제"
        >
          <span className="material-symbols-outlined text-[14px]">close</span>
        </button>
      </motion.div>
    </div>
  );
}
