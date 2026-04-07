import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isSameDay,
  isToday,
  getDay,
  getDate,
  getMonth,
  parseISO,
  addDays,
} from "date-fns";
import { ko } from "date-fns/locale";
import { Todo } from "./types";

export function formatDateKR(date: Date): string {
  return format(date, "M월 d일 EEEE", { locale: ko });
}

export function formatMonthKR(date: Date): string {
  return format(date, "yyyy년 M월", { locale: ko });
}

export function toDateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function getWeekRange(date: Date): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
}

export function getWeekDays(date: Date): Date[] {
  const { start, end } = getWeekRange(date);
  return eachDayOfInterval({ start, end });
}

export function getMonthDays(date: Date): Date[] {
  return eachDayOfInterval({
    start: startOfMonth(date),
    end: endOfMonth(date),
  });
}

export function getCalendarGrid(date: Date): (Date | null)[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start with nulls (week starts on Sunday)
  const startDayOfWeek = getDay(monthStart);
  const grid: (Date | null)[] = Array(startDayOfWeek).fill(null);
  grid.push(...days);

  // Pad end to fill last row
  while (grid.length % 7 !== 0) {
    grid.push(null);
  }

  return grid;
}

export function generateRecurringForDate(
  templates: Todo[],
  targetDate: Date
): Todo[] {
  const dateStr = toDateString(targetDate);
  const dayOfWeek = getDay(targetDate);
  const dayOfMonth = getDate(targetDate);
  const month = getMonth(targetDate);

  return templates
    .filter((t) => {
      if (t.repeat === "none") return false;
      const created = parseISO(t.createdAt);
      if (targetDate < created) return false;

      switch (t.repeat) {
        case "daily":
          return true;
        case "weekly":
          return (t.repeatDays ?? []).includes(dayOfWeek);
        case "monthly":
          return (t.repeatDate ?? 1) === dayOfMonth;
        case "yearly":
          return (
            (t.repeatMonth ?? 0) === month &&
            (t.repeatDate ?? 1) === dayOfMonth
          );
        default:
          return false;
      }
    })
    .map((t) => ({
      ...t,
      id: `${t.id}-${dateStr}`,
      date: dateStr,
      completed: false,
      completedAt: null,
    }));
}

export {
  addMonths,
  subMonths,
  isSameDay,
  isToday,
  parseISO,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  getDay,
  eachDayOfInterval,
};
