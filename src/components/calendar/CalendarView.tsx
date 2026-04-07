"use client";

import { useState } from "react";
import CalendarGrid from "./CalendarGrid";
import DayTaskList from "./DayTaskList";

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

  return (
    <div className="py-4">
      <CalendarGrid
        currentMonth={currentMonth}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        onMonthChange={setCurrentMonth}
      />
      <DayTaskList selectedDate={selectedDate} onTaskTap={onTaskTap} />
    </div>
  );
}
