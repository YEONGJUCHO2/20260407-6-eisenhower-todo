export type Quadrant = "do" | "plan" | "delegate" | "delete";

export type RepeatType = "none" | "daily" | "weekly" | "monthly" | "yearly";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Todo {
  id: string;
  title: string;
  quadrant: Quadrant;
  date: string; // ISO date string "YYYY-MM-DD"
  completed: boolean;
  completedAt: string | null; // ISO datetime
  repeat: RepeatType;
  repeatDays?: number[]; // 0=Sun..6=Sat for weekly
  repeatDate?: number; // 1-31 for monthly
  repeatMonth?: number; // 0-11 for yearly
  startTime?: string; // "HH:mm"
  endTime?: string;   // "HH:mm"
  memo: string;
  createdAt: string; // ISO datetime
  order: number;
  subtasks: Subtask[];
  tags: string[]; // tag ids
}

export interface Template {
  id: string;
  name: string;
  items: {
    title: string;
    quadrant: Quadrant;
    startTime?: string;
    endTime?: string;
  }[];
  createdAt: string;
}

export interface Achievement {
  type: string;
  unlockedAt: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

export type TabId = "calendar" | "matrix" | "report";

export interface QuadrantInfo {
  id: Quadrant;
  label: string;
  sublabel: string;
  primary: string;
  container: string;
  emptyTitle: string;
  emptySub: string;
}

export type UndoAction =
  | { type: "delete"; todo: Todo }
  | { type: "toggle"; id: string; wasCompleted: boolean }
  | { type: "move"; id: string; fromQuadrant: Quadrant };
