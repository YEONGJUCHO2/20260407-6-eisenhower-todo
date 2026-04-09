import { Todo, StreakData } from "./types";
import { toDateString, addDays } from "./date-utils";

export function calculateStreak(todos: Todo[]): StreakData {
  const completedDates = new Set<string>();
  todos.forEach((t) => {
    if (t.completed && t.completedAt) {
      completedDates.add(t.completedAt.substring(0, 10));
    }
  });

  if (completedDates.size === 0) {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: null };
  }

  const today = toDateString(new Date());
  let currentStreak = 0;
  let date = new Date();

  if (completedDates.has(today)) {
    currentStreak = 1;
    date = addDays(date, -1);
  } else {
    date = addDays(date, -1);
    if (!completedDates.has(toDateString(date))) {
      return {
        currentStreak: 0,
        longestStreak: calculateLongest(completedDates),
        lastActiveDate: null,
      };
    }
    currentStreak = 1;
    date = addDays(date, -1);
  }

  while (completedDates.has(toDateString(date))) {
    currentStreak++;
    date = addDays(date, -1);
  }

  return {
    currentStreak,
    longestStreak: Math.max(currentStreak, calculateLongest(completedDates)),
    lastActiveDate: today,
  };
}

function calculateLongest(dates: Set<string>): number {
  if (dates.size === 0) return 0;
  const sorted = Array.from(dates).sort();
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}

export function getActiveDates(todos: Todo[]): Set<string> {
  const dates = new Set<string>();
  todos.forEach((t) => {
    if (t.completed && t.completedAt) {
      dates.add(t.completedAt.substring(0, 10));
    }
  });
  return dates;
}
