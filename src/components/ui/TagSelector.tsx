"use client";

import { useState } from "react";
import { useTodoContext } from "@/hooks/useTodos";
import { TAG_COLORS } from "@/lib/constants";
import TagChip from "./TagChip";

interface TagSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function TagSelector({ selectedIds, onChange }: TagSelectorProps) {
  const { tags, addTag } = useTodoContext();
  const [newName, setNewName] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>(TAG_COLORS[0]);

  const toggleTag = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleCreateTag = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    const id = crypto.randomUUID();
    addTag({ id, name: trimmed, color: selectedColor });
    onChange([...selectedIds, id]);
    setNewName("");
    setSelectedColor(TAG_COLORS[0]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreateTag();
    }
  };

  return (
    <div className="space-y-3">
      {/* Existing tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => {
            const isSelected = selectedIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className="rounded-full transition-all duration-150"
                style={{
                  borderWidth: 1,
                  borderColor: isSelected ? tag.color + "80" : tag.color + "40",
                  backgroundColor: isSelected ? tag.color + "30" : "transparent",
                  color: isSelected ? tag.color : tag.color + "99",
                  padding: "2px 8px",
                  fontSize: 11,
                  fontWeight: 500,
                  lineHeight: "20px",
                }}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      )}

      {/* New tag creation */}
      <div className="space-y-2">
        <p className="text-label-sm text-outline">새 태그</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="태그 이름"
            className="flex-1 bg-surface-container-high text-on-surface text-body-sm rounded-md px-2.5 py-1.5 border border-white/5 outline-none focus:border-white/20 transition-colors placeholder:text-outline/50"
          />
          <TagChip
            name={newName || "미리보기"}
            color={selectedColor}
            size="md"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {TAG_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedColor(c)}
              className="w-5 h-5 rounded-full transition-all duration-150 flex-shrink-0"
              style={{
                backgroundColor: c,
                boxShadow:
                  selectedColor === c
                    ? `0 0 0 2px #131317, 0 0 0 3.5px ${c}`
                    : "none",
                transform: selectedColor === c ? "scale(1.1)" : "scale(1)",
              }}
              aria-label={`색상 ${c} 선택`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
