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
    <div className="flex flex-col" style={{ height: "calc(100dvh - 120px)" }}>
      {/* Fixed: Calendar grid */}
      <div className="flex-shrink-0 py-4">
        <CalendarGrid
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          onMonthChange={setCurrentMonth}
        />
      </div>

      {/* Fixed: View mode toggle */}
      <div className="flex-shrink-0 flex gap-2 px-lg mb-2">
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

      {/* Scrollable: Task list */}
      <div className="flex-1 overflow-y-auto pb-4">
        {viewMode === "day" ? (
          <DayTaskList selectedDate={selectedDate} onTaskTap={onTaskTap} />
        ) : (
          <WeeklyTimeline selectedDate={selectedDate} onTaskTap={onTaskTap} />
        )}
      </div>
    </div>
  );
}
