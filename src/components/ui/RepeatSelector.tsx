"use client";

import { RepeatType } from "@/lib/types";
import WeekDayPicker from "./WeekDayPicker";
import MonthDatePicker from "./MonthDatePicker";

const OPTIONS: { value: RepeatType; label: string }[] = [
  { value: "none", label: "없음" },
  { value: "daily", label: "매일" },
  { value: "weekly", label: "매주" },
  { value: "monthly", label: "매월" },
  { value: "yearly", label: "매년" },
];

interface RepeatSelectorProps {
  value: RepeatType;
  onChange: (value: RepeatType) => void;
  repeatDays: number[];
  onRepeatDaysChange: (days: number[]) => void;
  repeatDate: number;
  onRepeatDateChange: (date: number) => void;
}

export default function RepeatSelector({
  value,
  onChange,
  repeatDays,
  onRepeatDaysChange,
  repeatDate,
  onRepeatDateChange,
}: RepeatSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex gap-[6px]">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-[10px] py-1 rounded-full text-[11px] transition-colors ${
              value === opt.value
                ? "bg-quadrant-plan-container text-white font-semibold"
                : "bg-surface-container-low text-outline"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {value === "weekly" && (
        <WeekDayPicker selectedDays={repeatDays} onChange={onRepeatDaysChange} />
      )}

      {value === "monthly" && (
        <MonthDatePicker selectedDate={repeatDate} onChange={onRepeatDateChange} />
      )}
    </div>
  );
}
