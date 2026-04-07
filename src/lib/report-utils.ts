import { Todo, Quadrant } from "./types";
import { PERSONALITY_TYPES } from "./constants";
import { getWeekRange, toDateString } from "./date-utils";
import { eachDayOfInterval } from "date-fns";

export interface WeeklyStats {
  total: number;
  completed: number;
  ratios: Record<Quadrant, number>;
  counts: Record<Quadrant, number>;
  personalityType: (typeof PERSONALITY_TYPES)[keyof typeof PERSONALITY_TYPES];
  recurringTasks: RecurringTaskStat[];
}

export interface RecurringTaskStat {
  title: string;
  quadrant: Quadrant;
  achieved: number;
  total: number;
}

export function calculateWeeklyStats(
  todos: Todo[],
  weekDate: Date
): WeeklyStats {
  const { start, end } = getWeekRange(weekDate);
  const days = eachDayOfInterval({ start, end });
  const dateStrings = days.map((d) => toDateString(d));

  const weekTodos = todos.filter((t) => dateStrings.includes(t.date));
  const completed = weekTodos.filter((t) => t.completed);

  const counts: Record<Quadrant, number> = { do: 0, plan: 0, delegate: 0, delete: 0 };

  weekTodos.forEach((t) => {
    counts[t.quadrant]++;
  });

  const total = weekTodos.length;
  const ratios: Record<Quadrant, number> = {
    do: total > 0 ? counts.do / total : 0,
    plan: total > 0 ? counts.plan / total : 0,
    delegate: total > 0 ? counts.delegate / total : 0,
    delete: total > 0 ? counts.delete / total : 0,
  };

  const types = Object.values(PERSONALITY_TYPES);
  const personalityType =
    types.find((t) => t.condition(ratios)) ?? PERSONALITY_TYPES.balancer;

  // Recurring task stats
  const recurringTemplates = todos.filter((t) => t.repeat !== "none");
  const seen = new Set<string>();
  const recurringTasks: RecurringTaskStat[] = [];

  recurringTemplates.forEach((template) => {
    const key = template.title;
    if (seen.has(key)) return;
    seen.add(key);

    const instances = weekTodos.filter(
      (t) => t.title === template.title && t.repeat !== "none"
    );
    const achieved = instances.filter((t) => t.completed).length;
    const expectedDays =
      template.repeat === "daily" ? 7
        : template.repeat === "weekly" ? 1
        : template.repeat === "monthly" ? 1
        : 1;

    recurringTasks.push({
      title: template.title,
      quadrant: template.quadrant,
      achieved,
      total: Math.max(expectedDays, instances.length),
    });
  });

  return {
    total,
    completed: completed.length,
    ratios,
    counts,
    personalityType,
    recurringTasks,
  };
}
