import { Todo, Quadrant } from "./types";
import { toDateString } from "./date-utils";
import {
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";

export interface MonthlyStats {
  total: number;
  completed: number;
  ratios: Record<Quadrant, number>;
  counts: Record<Quadrant, number>;
  weeklyTrend: {
    week: string;
    do: number;
    plan: number;
    delegate: number;
    delete: number;
  }[];
  prevMonthComparison: Record<Quadrant, number>;
}

export function calculateMonthlyStats(
  todos: Todo[],
  monthDate: Date
): MonthlyStats {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const dateStrings = new Set(days.map((d) => toDateString(d)));

  const monthTodos = todos.filter((t) => dateStrings.has(t.date));
  const completed = monthTodos.filter((t) => t.completed);

  const counts: Record<Quadrant, number> = {
    do: 0,
    plan: 0,
    delegate: 0,
    delete: 0,
  };
  monthTodos.forEach((t) => counts[t.quadrant]++);

  const total = monthTodos.length;
  const ratios: Record<Quadrant, number> = {
    do: total > 0 ? counts.do / total : 0,
    plan: total > 0 ? counts.plan / total : 0,
    delegate: total > 0 ? counts.delegate / total : 0,
    delete: total > 0 ? counts.delete / total : 0,
  };

  // Weekly trend
  const weeks = eachWeekOfInterval(
    { start: monthStart, end: monthEnd },
    { weekStartsOn: 1 }
  );
  const weeklyTrend = weeks.map((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekDates = new Set(
      eachDayOfInterval({ start: weekStart, end: weekEnd }).map((d) =>
        toDateString(d)
      )
    );
    const weekTodos = monthTodos.filter((t) => weekDates.has(t.date));
    return {
      week: toDateString(weekStart),
      do: weekTodos.filter((t) => t.quadrant === "do").length,
      plan: weekTodos.filter((t) => t.quadrant === "plan").length,
      delegate: weekTodos.filter((t) => t.quadrant === "delegate").length,
      delete: weekTodos.filter((t) => t.quadrant === "delete").length,
    };
  });

  // Previous month comparison
  const prevMonth = new Date(monthDate);
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  const prevStart = startOfMonth(prevMonth);
  const prevEnd = endOfMonth(prevMonth);
  const prevDays = eachDayOfInterval({ start: prevStart, end: prevEnd });
  const prevDateStrings = new Set(prevDays.map((d) => toDateString(d)));
  const prevTodos = todos.filter((t) => prevDateStrings.has(t.date));
  const prevTotal = prevTodos.length;
  const prevRatios: Record<Quadrant, number> = {
    do:
      prevTotal > 0
        ? prevTodos.filter((t) => t.quadrant === "do").length / prevTotal
        : 0,
    plan:
      prevTotal > 0
        ? prevTodos.filter((t) => t.quadrant === "plan").length / prevTotal
        : 0,
    delegate:
      prevTotal > 0
        ? prevTodos.filter((t) => t.quadrant === "delegate").length / prevTotal
        : 0,
    delete:
      prevTotal > 0
        ? prevTodos.filter((t) => t.quadrant === "delete").length / prevTotal
        : 0,
  };

  const prevMonthComparison: Record<Quadrant, number> = {
    do: Math.round((ratios.do - prevRatios.do) * 100),
    plan: Math.round((ratios.plan - prevRatios.plan) * 100),
    delegate: Math.round((ratios.delegate - prevRatios.delegate) * 100),
    delete: Math.round((ratios.delete - prevRatios.delete) * 100),
  };

  return {
    total,
    completed: completed.length,
    ratios,
    counts,
    weeklyTrend,
    prevMonthComparison,
  };
}
