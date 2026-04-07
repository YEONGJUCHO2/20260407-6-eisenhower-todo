"use client";

import { motion } from "framer-motion";
import { Todo } from "@/lib/types";
import { QUADRANTS } from "@/lib/constants";
import { useTodoContext } from "@/hooks/useTodos";

interface TaskCardProps {
  todo: Todo;
  onTap?: () => void;
}

export default function TaskCard({ todo, onTap }: TaskCardProps) {
  const { toggleComplete } = useTodoContext();
  const q = QUADRANTS[todo.quadrant];

  return (
    <motion.div
      layout
      layoutId={todo.id}
      className={`glass-card rounded-md px-3 py-[10px] flex items-center gap-2 cursor-pointer select-none ${
        todo.completed ? "opacity-40" : ""
      }`}
      onClick={onTap}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: todo.completed ? 0.4 : 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleComplete(todo.id);
        }}
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

      {/* Title */}
      <span
        className={`text-body-sm text-on-surface flex-1 truncate ${
          todo.completed ? "line-through opacity-60" : ""
        }`}
      >
        {todo.title}
      </span>

      {/* Repeat badge */}
      {todo.repeat !== "none" && (
        <span className="text-[10px] text-outline border border-white/10 px-1.5 py-0.5 rounded-sm">
          반복
        </span>
      )}
    </motion.div>
  );
}
