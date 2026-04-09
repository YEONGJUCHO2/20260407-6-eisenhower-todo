import { Todo } from "./types";

const STORAGE_KEY = "eisenhower-todos";
const ONBOARDING_KEY = "eisenhower-onboarding-done";

export function loadTodos(): Todo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const todos = raw ? JSON.parse(raw) : [];
    // Migrate old todos without subtasks/tags
    return todos.map((t: Todo) => ({
      ...t,
      subtasks: t.subtasks ?? [],
      tags: t.tags ?? [],
    }));
  } catch {
    return [];
  }
}

export function saveTodos(todos: Todo[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // localStorage full or unavailable — silent fail
  }
}

export function isOnboardingDone(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(ONBOARDING_KEY) === "true";
}

export function markOnboardingDone(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_KEY, "true");
}

export type ThemeMode = "system" | "light" | "dark";

const THEME_KEY = "eisenhower-theme";

export function loadTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem(THEME_KEY) as ThemeMode) ?? "system";
}

export function saveTheme(theme: ThemeMode): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_KEY, theme);
}

// Generic JSON helpers for new data types
export function loadJSON<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveJSON<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // silent fail
  }
}
