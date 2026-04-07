"use client";

import { RepeatType } from "@/lib/types";

const REPEAT_OPTIONS: { value: RepeatType; label: string }[] = [
  { value: "none", label: "없음" },
  { value: "daily", label: "매일" },
  { value: "weekly", label: "매주" },
  { value: "monthly", label: "매월" },
  { value: "yearly", label: "매년" },
];

interface RepeatSelectorProps {
  selected: RepeatType;
  onChange: (r: RepeatType) => void;
}

export default function RepeatSelector({
  selected,
  onChange,
}: RepeatSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {REPEAT_OPTIONS.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-full text-body-sm whitespace-nowrap border transition-all duration-150 ${
              isSelected
                ? "bg-quadrant-plan-primary/10 border-quadrant-plan-primary/40 text-quadrant-plan-primary"
                : "bg-transparent border-white/5 text-outline hover:text-on-surface-variant"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
