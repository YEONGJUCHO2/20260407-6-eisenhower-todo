"use client";

interface TimePickerProps {
  startTime: string;
  endTime: string;
  onChange: (start: string, end: string) => void;
}

function parseTime(t: string): [number, number] {
  const [h, m] = t.split(":").map(Number);
  return [h, m];
}

function formatTime(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function adjustTime(time: string, delta: number): string {
  const [h, m] = parseTime(time);
  let total = h * 60 + m + delta * 30;
  if (total < 0) total = 23 * 60 + 30;
  if (total >= 24 * 60) total = 0;
  return formatTime(Math.floor(total / 60), total % 60);
}

function TimeBox({
  value,
  color,
  onIncrement,
  onDecrement,
}: {
  value: string;
  color: string;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const [h, m] = value.split(":");
  return (
    <div className="flex items-center gap-1">
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={onIncrement}
          className="w-7 h-5 flex items-center justify-center text-[10px] text-outline active:text-on-surface"
        >
          ▲
        </button>
        <div className="flex items-center gap-[3px]">
          <div className="bg-surface-container-high rounded-lg px-[10px] py-[6px]">
            <span className="text-[18px] font-bold" style={{ color }}>
              {h}
            </span>
          </div>
          <span className="text-outline text-[16px]">:</span>
          <div className="bg-surface-container-high rounded-lg px-[10px] py-[6px]">
            <span className="text-[18px] font-bold" style={{ color }}>
              {m}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onDecrement}
          className="w-7 h-5 flex items-center justify-center text-[10px] text-outline active:text-on-surface"
        >
          ▼
        </button>
      </div>
    </div>
  );
}

export default function TimePicker({
  startTime,
  endTime,
  onChange,
}: TimePickerProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <TimeBox
        value={startTime}
        color="#adc6ff"
        onIncrement={() => onChange(adjustTime(startTime, 1), endTime)}
        onDecrement={() => onChange(adjustTime(startTime, -1), endTime)}
      />
      <span className="text-outline text-[14px]">→</span>
      <TimeBox
        value={endTime}
        color="#ffb3ad"
        onIncrement={() => onChange(startTime, adjustTime(endTime, 1))}
        onDecrement={() => onChange(startTime, adjustTime(endTime, -1))}
      />
    </div>
  );
}
