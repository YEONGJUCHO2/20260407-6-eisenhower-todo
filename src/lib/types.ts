export type Quadrant = "do" | "plan" | "delegate" | "delete";

export type RepeatType = "none" | "daily" | "weekly" | "monthly" | "yearly";

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
  startTime?: string; // "HH:mm" (예: "09:00")
  endTime?: string;   // "HH:mm" (예: "11:00")
  memo: string;
  createdAt: string; // ISO datetime
  order: number; // sort order within quadrant
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
