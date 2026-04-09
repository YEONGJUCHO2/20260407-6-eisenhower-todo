"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTodoContext } from "@/hooks/useTodos";
import { Quadrant } from "@/lib/types";
import { QUADRANTS, QUADRANT_ORDER } from "@/lib/constants";
import QuadrantSelector from "@/components/ui/QuadrantSelector";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  date: string;
}

export default function TemplateModal({
  isOpen,
  onClose,
  onBack,
  date,
}: TemplateModalProps) {
  const { templates, addTemplate, deleteTemplate, addTodo } = useTodoContext();
  const [tab, setTab] = useState<"select" | "create">("select");
  const [name, setName] = useState("");
  const [items, setItems] = useState<
    { title: string; quadrant: Quadrant }[]
  >([]);
  const [itemTitle, setItemTitle] = useState("");
  const [itemQuadrant, setItemQuadrant] = useState<Quadrant>("plan");

  const handleApplyTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    template.items.forEach((item) => {
      addTodo({
        title: item.title,
        quadrant: item.quadrant,
        date,
        repeat: "none",
        startTime: item.startTime,
        endTime: item.endTime,
      });
    });
    onClose();
  };

  const handleAddItem = () => {
    const trimmed = itemTitle.trim();
    if (!trimmed) return;
    setItems([...items, { title: trimmed, quadrant: itemQuadrant }]);
    setItemTitle("");
  };

  const handleCreateTemplate = () => {
    const trimmedName = name.trim();
    if (!trimmedName || items.length === 0) return;
    addTemplate({
      id: crypto.randomUUID(),
      name: trimmedName,
      items,
      createdAt: new Date().toISOString(),
    });
    setName("");
    setItems([]);
    setTab("select");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-[90]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[100] bg-surface-container rounded-t-xl px-lg pt-4 pb-6 safe-bottom max-w-2xl mx-auto max-h-[70vh] overflow-y-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-outline/30" />
            </div>

            {/* Back button */}
            <button
              onClick={onBack ?? onClose}
              className="text-body-sm text-on-surface-variant mb-3 flex items-center gap-1"
            >
              ← 돌아가기
            </button>

            {/* Tab buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setTab("select")}
                className={`flex-1 py-2 rounded-full text-body-sm font-medium transition-all ${
                  tab === "select"
                    ? "bg-quadrant-plan-container/20 text-quadrant-plan-primary"
                    : "bg-surface-container-high text-outline"
                }`}
              >
                템플릿 선택
              </button>
              <button
                onClick={() => setTab("create")}
                className={`flex-1 py-2 rounded-full text-body-sm font-medium transition-all ${
                  tab === "create"
                    ? "bg-quadrant-plan-container/20 text-quadrant-plan-primary"
                    : "bg-surface-container-high text-outline"
                }`}
              >
                새 템플릿
              </button>
            </div>

            {tab === "select" ? (
              <div className="space-y-2">
                {templates.length === 0 ? (
                  <p className="text-center text-body-sm text-outline py-8">
                    저장된 템플릿이 없습니다
                  </p>
                ) : (
                  templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="glass-card rounded-md p-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-body-sm text-on-surface font-medium">
                          {tpl.name}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {tpl.items.map((item, i) => (
                            <span
                              key={i}
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor:
                                  QUADRANTS[item.quadrant].primary,
                              }}
                            />
                          ))}
                          <span className="text-[10px] text-outline ml-1">
                            {tpl.items.length}개
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApplyTemplate(tpl.id)}
                          className="px-3 py-1.5 rounded-full bg-quadrant-plan-container/20 text-quadrant-plan-primary text-[11px] font-medium"
                        >
                          적용
                        </button>
                        <button
                          onClick={() => deleteTemplate(tpl.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-full text-outline/40 hover:text-red-400"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            close
                          </span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="템플릿 이름"
                  className="w-full bg-surface-container-high text-on-surface text-body-md px-4 py-2.5 rounded-sm outline-none placeholder:text-outline"
                />

                {/* Items list */}
                <div className="space-y-1">
                  {items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-body-sm text-on-surface"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: QUADRANTS[item.quadrant].primary,
                        }}
                      />
                      <span className="flex-1 truncate">{item.title}</span>
                      <button
                        onClick={() =>
                          setItems(items.filter((_, idx) => idx !== i))
                        }
                        className="text-outline/40 hover:text-red-400"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          close
                        </span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add item */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddItem();
                      }
                    }}
                    placeholder="할 일 제목"
                    className="flex-1 bg-surface-container-high text-on-surface text-body-sm px-3 py-2 rounded-sm outline-none placeholder:text-outline"
                  />
                  <button
                    onClick={handleAddItem}
                    className="px-3 py-2 rounded-sm bg-quadrant-plan-container/20 text-quadrant-plan-primary text-body-sm"
                  >
                    추가
                  </button>
                </div>

                {/* Quadrant selector for new items */}
                <div>
                  <label className="text-[11px] text-outline mb-1 block">
                    새 항목 사분면
                  </label>
                  <div className="flex gap-1">
                    {QUADRANT_ORDER.map((q) => (
                      <button
                        key={q}
                        onClick={() => setItemQuadrant(q)}
                        className={`flex-1 py-1.5 rounded-sm text-[10px] font-medium transition-all ${
                          itemQuadrant === q
                            ? "text-white"
                            : "text-outline bg-surface-container-high"
                        }`}
                        style={
                          itemQuadrant === q
                            ? { backgroundColor: QUADRANTS[q].container }
                            : {}
                        }
                      >
                        {QUADRANTS[q].sublabel}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreateTemplate}
                  disabled={!name.trim() || items.length === 0}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-quadrant-plan-container to-[#0450b0] text-white text-body-md font-semibold disabled:opacity-30"
                >
                  템플릿 저장
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
