"use client";

import { useState } from "react";
import { Subtask } from "@/lib/types";

interface SubtaskListProps {
  subtasks: Subtask[];
  onChange: (subtasks: Subtask[]) => void;
}

export default function SubtaskList({ subtasks, onChange }: SubtaskListProps) {
  const [newTitle, setNewTitle] = useState("");

  const completedCount = subtasks.filter((s) => s.completed).length;

  const handleToggle = (id: string) => {
    onChange(
      subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleDelete = (id: string) => {
    onChange(subtasks.filter((s) => s.id !== id));
  };

  const handleAdd = () => {
    const title = newTitle.trim();
    if (!title) return;
    onChange([
      ...subtasks,
      {
        id: crypto.randomUUID(),
        title,
        completed: false,
        order: subtasks.length,
      },
    ]);
    setNewTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      {subtasks.length > 0 && (
        <p className="text-body-sm text-outline">
          서브태스크 {completedCount}/{subtasks.length} 완료
        </p>
      )}

      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="flex items-center gap-2 group"
          >
            <button
              type="button"
              onClick={() => handleToggle(subtask.id)}
              className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
                subtask.completed
                  ? "bg-quadrant-plan-container border-quadrant-plan-container"
                  : "border-outline bg-transparent"
              }`}
              aria-label={subtask.completed ? "완료 해제" : "완료 처리"}
            >
              {subtask.completed && (
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 10 10"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M2 5.5L4 7.5L8 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            <span
              className={`text-body-sm flex-1 transition-colors ${
                subtask.completed
                  ? "line-through text-outline"
                  : "text-on-surface"
              }`}
            >
              {subtask.title}
            </span>

            <button
              type="button"
              onClick={() => handleDelete(subtask.id)}
              className="w-5 h-5 flex items-center justify-center text-outline opacity-0 group-hover:opacity-100 transition-opacity hover:text-on-surface"
              aria-label="서브태스크 삭제"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
              >
                <path
                  d="M2 2L8 8M8 2L2 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <input
        type="text"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="서브태스크 추가..."
        className="w-full bg-surface-container-high text-body-sm text-on-surface placeholder:text-outline rounded-sm px-3 py-2 outline-none focus:ring-1 focus:ring-outline/50 transition-shadow"
      />
    </div>
  );
}
