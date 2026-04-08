"use client";

interface MonthDatePickerProps {
  selectedDate: number;
  onChange: (date: number) => void;
}

export default function MonthDatePicker({
  selectedDate,
  onChange,
}: MonthDatePickerProps) {
  const increment = () => onChange(selectedDate >= 31 ? 1 : selectedDate + 1);
  const decrement = () => onChange(selectedDate <= 1 ? 31 : selectedDate - 1);

  return (
    <div className="flex items-center justify-center gap-3">
      <span className="text-body-sm text-outline">매월</span>
      <div className="flex items-center gap-2">
        <div className="bg-surface-container-high rounded-[10px] px-4 py-[10px]">
          <span className="text-[24px] font-bold text-quadrant-plan-primary">
            {selectedDate}
          </span>
        </div>
        <span className="text-body-sm text-outline">일</span>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={increment}
            className="w-7 h-7 rounded-md bg-surface-container-highest flex items-center justify-center text-[12px] text-on-surface active:bg-white/10"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={decrement}
            className="w-7 h-7 rounded-md bg-surface-container-highest flex items-center justify-center text-[12px] text-on-surface active:bg-white/10"
          >
            ▼
          </button>
        </div>
      </div>
    </div>
  );
}
