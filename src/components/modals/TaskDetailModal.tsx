"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Todo, Quadrant } from "@/lib/types";
import { QUADRANTS } from "@/lib/constants";
import { useTodoContext } from "@/hooks/useTodos";
import QuadrantSelector from "@/components/ui/QuadrantSelector";

interface TaskDetailModalProps {
  todoId: string | null;
  onClose: () => void;
}

export default function TaskDetailModal({
  todoId,
  onClose,
}: TaskDetailModalProps) {
  const { todos, updateTodo, deleteTodo, moveQuadrant } = useTodoContext();
  const todo = todoId ? todos.find((t) => t.id === todoId) : null;

  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [quadrant, setQuadrant] = useState<Quadrant>("plan");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setMemo(todo.memo);
      setQuadrant(todo.quadrant);
      setConfirmDelete(false);
    }
  }, [todo]);

  if (!todo) return null;

  const handleSave = () => {
    updateTodo(todo.id, { title: title.trim() || todo.title, memo });
    if (quadrant !== todo.quadrant) {
      moveQuadrant(todo.id, quadrant);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteTodo(todo.id);
    onClose();
  };

  return (
    <AnimatePresence>
      {todoId && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-[90]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[100] bg-surface-container rounded-t-xl px-lg pt-4 pb-6 safe-bottom max-w-2xl mx-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-outline/30" />
            </div>

            {/* Title */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-on-surface text-headline font-display outline-none mb-4"
            />

            {/* Memo */}
            <div className="mb-5">
              <label className="text-label-lg text-on-surface-variant mb-2 block">
                메모
              </label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="메모를 추가하세요"
                rows={3}
                className="w-full bg-surface-container-high text-on-surface text-body-md px-4 py-3 rounded-sm outline-none placeholder:text-outline resize-none"
              />
            </div>

            {/* Quadrant change */}
            <div className="mb-5">
              <label className="text-label-lg text-on-surface-variant mb-2 block">
                사분면 변경
              </label>
              <QuadrantSelector selected={quadrant} onChange={setQuadrant} />
            </div>

            {/* Repeat info */}
            {todo.repeat !== "none" && (
              <div className="mb-5 px-3 py-2 bg-surface-container-high rounded-sm">
                <span className="text-body-sm text-on-surface-variant">
                  반복: {todo.repeat === "daily" && "매일"}
                  {todo.repeat === "weekly" && "매주"}
                  {todo.repeat === "monthly" && "매월"}
                  {todo.repeat === "yearly" && "매년"}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className={`px-5 py-3 rounded-full text-body-md font-medium transition-all ${
                  confirmDelete
                    ? "bg-error-container text-error"
                    : "bg-surface-container-high text-outline hover:text-error"
                }`}
              >
                {confirmDelete ? "정말 삭제" : "삭제"}
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-full bg-gradient-to-r from-quadrant-plan-container to-[#0450b0] text-white text-body-md font-semibold"
              >
                저장
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
