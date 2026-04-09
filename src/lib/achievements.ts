import { Todo, Achievement, StreakData } from "./types";
import { AchievementType } from "./constants";

export function checkAchievements(
  todos: Todo[],
  streak: StreakData,
  existing: Achievement[],
  focusCompletions: number,
  tagCount: number
): AchievementType[] {
  const unlocked = new Set(existing.map((a) => a.type));
  const newlyUnlocked: AchievementType[] = [];

  const check = (type: AchievementType, condition: boolean) => {
    if (!unlocked.has(type) && condition) newlyUnlocked.push(type);
  };

  const completed = todos.filter((t) => t.completed);
  const planCompleted = completed.filter((t) => t.quadrant === "plan");

  check("first_todo", todos.length > 0);
  check("first_complete", completed.length > 0);
  check("streak_7", streak.currentStreak >= 7);
  check("streak_30", streak.currentStreak >= 30);
  check("plan_10", planCompleted.length >= 10);
  check("centurion", completed.length >= 100);
  check("focus_master", focusCompletions >= 5);
  check("organizer", tagCount >= 5);

  // all_clear: check if any day has all todos completed
  const byDate = new Map<string, { total: number; done: number }>();
  todos.forEach((t) => {
    const d = byDate.get(t.date) ?? { total: 0, done: 0 };
    d.total++;
    if (t.completed) d.done++;
    byDate.set(t.date, d);
  });
  const hasAllClear = Array.from(byDate.values()).some(
    (d) => d.total > 0 && d.total === d.done
  );
  check("all_clear", hasAllClear);

  // early_bird: completed before 6am
  const hasEarlyBird = completed.some((t) => {
    if (!t.completedAt) return false;
    const hour = new Date(t.completedAt).getHours();
    return hour < 6;
  });
  check("early_bird", hasEarlyBird);

  return newlyUnlocked;
}
