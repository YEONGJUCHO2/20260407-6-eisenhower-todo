"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quadrant } from "@/lib/types";
import { QUADRANTS, QUADRANT_ORDER } from "@/lib/constants";
import { useTodoContext } from "@/hooks/useTodos";
import { useSearch } from "@/hooks/useSearch";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTodo: (id: string) => void;
}

const QUADRANT_CHIPS: { value: Quadrant | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  ...QUADRANT_ORDER.map((q) => ({
    value: q,
    label: QUADRANTS[q].sublabel,
  })),
];

const COMPLETED_CHIPS: {
  value: "all" | "done" | "todo";
  label: string;
}[] = [
  { value: "all", label: "전체" },
  { value: "done", label: "완료" },
  { value: "todo", label: "미완료" },
];

export default function SearchOverlay({
  isOpen,
  onClose,
  onSelectTodo,
}: SearchOverlayProps) {
  const { todos } = useTodoContext();
  const { filters, setFilters, results } = useSearch(todos);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const hasQuery =
    filters.query !== "" ||
    filters.quadrant !== "all" ||
    filters.completed !== "all" ||
    filters.tag !== "all";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[150] bg-surface/95 backdrop-blur-[32px] flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-lg pt-4 pb-3">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
                search
              </span>
              <input
                ref={inputRef}
                type="text"
                value={filters.query}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, query: e.target.value }))
                }
                placeholder="할 일 검색..."
                className="w-full bg-surface-container-high text-on-surface text-body-lg pl-10 pr-4 py-3 rounded-full outline-none placeholder:text-outline focus:ring-1 focus:ring-quadrant-plan-primary/30 transition-all"
              />
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-outline hover:text-on-surface hover:bg-white/[0.08] transition-colors"
              aria-label="닫기"
            >
              <span className="material-symbols-outlined text-[22px]">
                close
              </span>
            </button>
          </div>

          {/* Filter chips */}
          <div className="px-lg space-y-2 pb-3">
            {/* Quadrant filter */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {QUADRANT_CHIPS.map((chip) => {
                const isActive = filters.quadrant === chip.value;
                const quadrantColor =
                  chip.value !== "all"
                    ? QUADRANTS[chip.value].primary
                    : undefined;

                return (
                  <button
                    key={chip.value}
                    onClick={() =>
                      setFilters((f) => ({ ...f, quadrant: chip.value }))
                    }
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-label-lg transition-colors ${
                      isActive
                        ? "text-on-surface"
                        : "text-outline hover:text-on-surface-variant"
                    }`}
                    style={{
                      backgroundColor: isActive
                        ? quadrantColor
                          ? `color-mix(in srgb, ${quadrantColor} 25%, transparent)`
                          : "rgba(255,255,255,0.1)"
                        : "rgba(255,255,255,0.05)",
                    }}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* Completed filter */}
            <div className="flex gap-1.5">
              {COMPLETED_CHIPS.map((chip) => {
                const isActive = filters.completed === chip.value;
                return (
                  <button
                    key={chip.value}
                    onClick={() =>
                      setFilters((f) => ({ ...f, completed: chip.value }))
                    }
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-label-lg transition-colors ${
                      isActive
                        ? "bg-white/10 text-on-surface"
                        : "bg-white/[0.05] text-outline hover:text-on-surface-variant"
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/5 mx-lg" />

          {/* Results */}
          <div className="flex-1 overflow-y-auto px-lg py-3 space-y-1">
            {hasQuery && results.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <span className="material-symbols-outlined text-[48px] text-outline/40 mb-3">
                  search_off
                </span>
                <p className="text-body-md text-on-surface-variant">
                  검색 결과가 없습니다
                </p>
                <p className="text-body-sm text-outline mt-1">
                  다른 키워드로 검색해보세요
                </p>
              </div>
            ) : (
              results.map((todo) => {
                const q = QUADRANTS[todo.quadrant];
                return (
                  <motion.button
                    key={todo.id}
                    onClick={() => onSelectTodo(todo.id)}
                    className="w-full glass-card rounded-md px-3 py-[10px] flex items-center gap-3 text-left hover:bg-white/[0.08] transition-colors"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* Quadrant color dot */}
                    <span
                      className="flex-shrink-0 w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: q.primary }}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-body-sm text-on-surface truncate block ${
                          todo.completed ? "line-through opacity-60" : ""
                        }`}
                      >
                        {todo.title}
                      </span>
                      <span className="text-[11px] text-on-surface-variant">
                        {todo.date}
                        {todo.startTime && ` ${todo.startTime}`}
                      </span>
                    </div>

                    {/* Completed status */}
                    {todo.completed && (
                      <span
                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: q.primary }}
                      >
                        <span className="material-symbols-outlined text-[14px] text-surface">
                          check
                        </span>
                      </span>
                    )}
                  </motion.button>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
