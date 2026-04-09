"use client";

import { useState } from "react";
import CalendarGrid from "./CalendarGrid";
import DayTaskList from "./DayTaskList";
import WeeklyTimeline from "./WeeklyTimeline";

interface CalendarViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onTaskTap?: (todoId: string) => void;
}

export default function CalendarView({
  selectedDate,
  onSelectDate,
  onTaskTap,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");

  return (
    <div className="py-4">
      <CalendarGrid
        currentMonth={currentMonth}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        onMonthChange={setCurrentMonth}
      />

      {/* View mode toggle */}
      <div className="flex gap-2 px-lg mt-4 mb-2">
        <button
          onClick={() => setViewMode("day")}
          className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
            viewMode === "day"
              ? "bg-quadrant-plan-container/20 text-quadrant-plan-primary"
              : "bg-surface-container-high text-outline"
          }`}
        >
          일간
        </button>
        <button
          onClick={() => setViewMode("week")}
          className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
            viewMode === "week"
              ? "bg-quadrant-plan-container/20 text-quadrant-plan-primary"
              : "bg-surface-container-high text-outline"
          }`}
        >
          주간
        </button>
      </div>

      {viewMode === "day" ? (
        <DayTaskList selectedDate={selectedDate} onTaskTap={onTaskTap} />
      ) : (
        <WeeklyTimeline selectedDate={selectedDate} onTaskTap={onTaskTap} />
      )}
    </div>
  );
}
