"use client";

import { QUADRANT_ORDER } from "@/lib/constants";
import QuadrantBox from "./QuadrantBox";

interface MatrixViewProps {
  date: string;
  onTaskTap?: (todoId: string) => void;
}

export default function MatrixView({ date, onTaskTap }: MatrixViewProps) {
  return (
    <div
      className="grid grid-cols-2 gap-sm px-sm"
      style={{ height: "calc(100dvh - 148px)" }}
    >
      {QUADRANT_ORDER.map((q) => (
        <QuadrantBox key={q} quadrant={q} date={date} onTaskTap={onTaskTap} />
      ))}
    </div>
  );
}
