"use client";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface WeekDayPickerProps {
  selectedDays: number[];
  onChange: (days: number[]) => void;
}

export default function WeekDayPicker({
  selectedDays,
  onChange,
}: WeekDayPickerProps) {
  const toggle = (day: number) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((d) => d !== day));
    } else {
      onChange([...selectedDays, day].sort());
    }
  };

  return (
    <div className="flex gap-[6px] justify-center">
      {DAYS.map((label, i) => {
        const selected = selectedDays.includes(i);
        return (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] transition-colors ${
              selected
                ? "bg-quadrant-plan-container text-white font-semibold"
                : "bg-surface-container-high text-outline"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
