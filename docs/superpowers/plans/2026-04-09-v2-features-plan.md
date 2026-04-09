# V2 Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 16 new features to the Eisenhower Todo app: Supabase backend, subtasks, tags, search, undo, today widget, streaks, achievements, focus mode, swipe gestures, templates, heatmap, monthly report, weekly timeline, share card themes, and notifications.

**Architecture:** Feature-per-agent parallel execution. Task 0 (foundation) runs first to establish shared types and dependencies. Then Batch 1/2/3 tasks run in parallel within each batch. Each task creates new files and provides exact edit instructions for existing files. Final integration task wires everything into page.tsx and layout.tsx.

**Tech Stack:** Next.js 16, React 19, TypeScript, TailwindCSS 3.4, Framer Motion 12, Chart.js 4.5, @supabase/supabase-js, @supabase/ssr, date-fns 4

---

## Task 0: Foundation — Types, Constants, Dependencies

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/constants.ts`
- Modify: `package.json`
- Create: `src/lib/supabase.ts`
- Create: `src/providers/AuthProvider.tsx`
- Create: `.env.local.example`

**IMPORTANT:** This task MUST complete before all other tasks start.

- [ ] **Step 1: Install Supabase dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: Create .env.local.example**

Create `/.env.local.example`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 3: Update types.ts with all new types**

Replace `src/lib/types.ts` entirely:

```typescript
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
```

- [ ] **Step 4: Update constants.ts — add ACHIEVEMENTS and TAG_COLORS**

Append to end of `src/lib/constants.ts`:

```typescript
export const TAG_COLORS = [
  "#adc6ff", // blue
  "#ffb3ad", // red
  "#ffb95f", // orange
  "#a8d5ba", // green
  "#d4b5ff", // purple
  "#ffd6e0", // pink
  "#80deea", // cyan
  "#fff59d", // yellow
] as const;

export const ACHIEVEMENTS = {
  first_todo: { name: "첫 발걸음", desc: "첫 할 일 추가", icon: "flag" },
  first_complete: { name: "시작이 반", desc: "첫 할 일 완료", icon: "check_circle" },
  streak_7: { name: "일주일 전사", desc: "7일 연속 달성", icon: "local_fire_department" },
  streak_30: { name: "한 달의 기적", desc: "30일 연속 달성", icon: "whatshot" },
  plan_10: { name: "전략가의 길", desc: "PLAN 10개 완료", icon: "psychology" },
  all_clear: { name: "올 클리어", desc: "하루 할 일 전부 완료", icon: "stars" },
  early_bird: { name: "얼리버드", desc: "오전 6시 전 완료", icon: "wb_twilight" },
  centurion: { name: "백전백승", desc: "총 100개 완료", icon: "military_tech" },
  organizer: { name: "정리의 달인", desc: "태그 5개 이상 사용", icon: "label" },
  focus_master: { name: "집중의 신", desc: "포커스 모드 5회 완료", icon: "center_focus_strong" },
} as const;

export type AchievementType = keyof typeof ACHIEVEMENTS;
```

- [ ] **Step 5: Create src/lib/supabase.ts**

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createBrowserClient(url, key);
}
```

- [ ] **Step 6: Create src/providers/AuthProvider.tsx**

```typescript
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) return;
    await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) return;
    await supabase.auth.signUp({ email, password });
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

- [ ] **Step 7: Update TodoProvider.tsx — add undo stack, subtasks/tags defaults, new storage fields**

In `src/providers/TodoProvider.tsx`, make these changes:

1. Add to TodoState interface:
```typescript
interface TodoState {
  todos: Todo[];
  loaded: boolean;
  tags: Tag[];
  templates: Template[];
  streak: StreakData;
  achievements: Achievement[];
  lastAction: UndoAction | null;
}
```

2. Add new imports:
```typescript
import { Todo, Quadrant, RepeatType, Tag, Template, StreakData, Achievement, UndoAction, Subtask } from "@/lib/types";
```

3. Add new actions to TodoAction union:
```typescript
| { type: "SET_TAGS"; tags: Tag[] }
| { type: "ADD_TAG"; tag: Tag }
| { type: "DELETE_TAG"; id: string }
| { type: "SET_TEMPLATES"; templates: Template[] }
| { type: "ADD_TEMPLATE"; template: Template }
| { type: "DELETE_TEMPLATE"; id: string }
| { type: "SET_STREAK"; streak: StreakData }
| { type: "ADD_ACHIEVEMENT"; achievement: Achievement }
| { type: "SET_ACHIEVEMENTS"; achievements: Achievement[] }
| { type: "SET_UNDO"; action: UndoAction | null }
| { type: "UNDO" }
```

4. Ensure `addTodo` callback creates todos with `subtasks: []` and `tags: []` defaults.

5. Add corresponding reducer cases and context methods.

6. Add localStorage keys: `eisenhower-tags`, `eisenhower-templates`, `eisenhower-streak`, `eisenhower-achievements`.

7. Export `useTodoContext` with all new methods: `addTag`, `deleteTag`, `addTemplate`, `deleteTemplate`, `undo`, `setLastAction`.

- [ ] **Step 8: Commit foundation**

```bash
git add -A
git commit -m "feat: foundation — updated types, constants, supabase client, auth provider, extended TodoProvider"
```

---

## Task 1: Undo Toast (Batch 1 — independent)

**Files:**
- Create: `src/components/common/UndoToast.tsx`
- Modify: `src/app/page.tsx` (add UndoToast component)

- [ ] **Step 1: Create UndoToast component**

Create `src/components/common/UndoToast.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTodoContext } from "@/hooks/useTodos";

export default function UndoToast() {
  const { lastAction, undo, setLastAction } = useTodoContext();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (lastAction) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => setLastAction(null), 300);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [lastAction, setLastAction]);

  const handleUndo = () => {
    undo();
    setVisible(false);
  };

  const label = lastAction?.type === "delete" ? "삭제됨" : lastAction?.type === "toggle" ? "완료 변경됨" : "이동됨";

  return (
    <AnimatePresence>
      {visible && lastAction && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] bg-surface-container-highest rounded-full px-5 py-3 flex items-center gap-3 shadow-xl border border-white/10"
        >
          <span className="text-body-sm text-on-surface">{label}</span>
          <button
            onClick={handleUndo}
            className="text-body-sm font-semibold text-quadrant-plan-primary"
          >
            되돌리기
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Wire into page.tsx**

Add `import UndoToast from "@/components/common/UndoToast";` and place `<UndoToast />` inside the main div, before `<FAB>`.

- [ ] **Step 3: Commit**

```bash
git add src/components/common/UndoToast.tsx src/app/page.tsx
git commit -m "feat: add undo toast — 5-second undo for delete/toggle/move actions"
```

---

## Task 2: Search & Filter (Batch 1 — independent)

**Files:**
- Create: `src/components/common/SearchOverlay.tsx`
- Create: `src/hooks/useSearch.ts`
- Modify: `src/components/layout/Header.tsx` (add search icon)
- Modify: `src/app/page.tsx` (add search state + overlay)

- [ ] **Step 1: Create useSearch hook**

Create `src/hooks/useSearch.ts`:

```typescript
"use client";

import { useMemo, useState } from "react";
import { Todo, Quadrant } from "@/lib/types";

interface SearchFilters {
  query: string;
  quadrant: Quadrant | "all";
  completed: "all" | "done" | "todo";
  tag: string | "all";
}

export function useSearch(todos: Todo[]) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    quadrant: "all",
    completed: "all",
    tag: "all",
  });

  const results = useMemo(() => {
    return todos.filter((t) => {
      if (filters.query && !t.title.toLowerCase().includes(filters.query.toLowerCase())) return false;
      if (filters.quadrant !== "all" && t.quadrant !== filters.quadrant) return false;
      if (filters.completed === "done" && !t.completed) return false;
      if (filters.completed === "todo" && t.completed) return false;
      if (filters.tag !== "all" && !t.tags?.includes(filters.tag)) return false;
      return true;
    });
  }, [todos, filters]);

  return { filters, setFilters, results };
}
```

- [ ] **Step 2: Create SearchOverlay component**

Create `src/components/common/SearchOverlay.tsx`:

Full-screen overlay with:
- Search input at top with auto-focus
- Filter chips row: quadrant buttons (전체/DO/PLAN/DELEGATE/DELETE) + completed toggle (전체/완료/미완료)
- Scrollable results list showing matching todos with quadrant color dot, title, date
- Each result clickable → calls `onSelectTodo(id)` prop
- Close button (X) top-right
- Uses `useSearch` hook internally
- Styled with glass-card background, surface-container backdrop

- [ ] **Step 3: Add search icon to Header**

In `src/components/layout/Header.tsx`, add a search button before the theme toggle:

```tsx
<button
  onClick={onSearchOpen}
  className="w-8 h-8 flex items-center justify-center rounded-full text-outline hover:text-on-surface transition-colors"
  aria-label="검색"
>
  <span className="material-symbols-outlined text-[18px]">search</span>
</button>
```

Add `onSearchOpen?: () => void` to HeaderProps.

- [ ] **Step 4: Wire into page.tsx**

Add `showSearch` state, pass `onSearchOpen` to Header, render SearchOverlay when open.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useSearch.ts src/components/common/SearchOverlay.tsx src/components/layout/Header.tsx src/app/page.tsx
git commit -m "feat: add search & filter — full-screen overlay with text search and quadrant/status filters"
```

---

## Task 3: Today Widget (Batch 1 — independent)

**Files:**
- Create: `src/components/matrix/TodayWidget.tsx`
- Modify: `src/components/matrix/MatrixView.tsx` (add widget above grid)

- [ ] **Step 1: Create TodayWidget**

Create `src/components/matrix/TodayWidget.tsx`:

```typescript
"use client";

import { useTodoContext } from "@/hooks/useTodos";
import { toDateString } from "@/lib/date-utils";

interface TodayWidgetProps {
  date: string;
  onTap?: () => void;
}

export default function TodayWidget({ date, onTap }: TodayWidgetProps) {
  const { getTodosForQuadrant } = useTodoContext();
  const today = toDateString(new Date());
  if (date !== today) return null;

  const doTodos = getTodosForQuadrant("do", date);
  const pending = doTodos.filter((t) => !t.completed);

  if (pending.length === 0 && doTodos.length > 0) {
    return (
      <div className="mb-2 px-3 py-2.5 rounded-lg bg-green-500/10 border border-green-500/20" onClick={onTap}>
        <span className="text-body-sm text-green-400 font-medium">오늘 할 일 완료! 🎉</span>
      </div>
    );
  }

  if (pending.length === 0) return null;

  return (
    <div className="mb-2 px-3 py-2.5 rounded-lg bg-quadrant-do-container/10 border border-quadrant-do-primary/20 cursor-pointer" onClick={onTap}>
      <div className="flex items-center justify-between">
        <span className="text-body-sm text-on-surface">
          <span className="font-semibold text-quadrant-do-primary">{pending.length}개</span> 긴급 할 일
        </span>
        <span className="text-[11px] text-on-surface-variant truncate max-w-[140px] ml-2">
          {pending[0]?.title}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add to MatrixView**

In `MatrixView.tsx`, import TodayWidget and place it before the grid div:

```tsx
<div className="px-lg" style={{ height: "calc(100dvh - 148px)" }}>
  <TodayWidget date={date} />
  <AxisArrows />
  ...
```

Adjust height calc to account for widget when present.

- [ ] **Step 3: Commit**

```bash
git add src/components/matrix/TodayWidget.tsx src/components/matrix/MatrixView.tsx
git commit -m "feat: add today widget — shows pending DO count above matrix"
```

---

## Task 4: Subtasks (Batch 1 — independent)

**Files:**
- Create: `src/components/ui/SubtaskList.tsx`
- Modify: `src/components/modals/TaskDetailModal.tsx` (add subtask section)
- Modify: `src/components/matrix/TaskCard.tsx` (add progress indicator)

- [ ] **Step 1: Create SubtaskList component**

Create `src/components/ui/SubtaskList.tsx`:

Inline checklist component with:
- List of subtasks with checkbox + title + delete button
- "Add subtask" input at bottom (press Enter to add)
- Each subtask toggleable
- Progress display: "2/5 완료"
- Props: `subtasks: Subtask[]`, `onChange: (subtasks: Subtask[]) => void`
- Use `crypto.randomUUID()` for new subtask IDs

- [ ] **Step 2: Add to TaskDetailModal**

In `TaskDetailModal.tsx`:
- Add subtask state: `const [subtasks, setSubtasks] = useState<Subtask[]>(todo?.subtasks ?? []);`
- Add SubtaskList component between memo and time sections
- Include subtasks in handleSave: `updateTodo(todo.id, { ..., subtasks })`

- [ ] **Step 3: Add progress to TaskCard**

In `TaskCard.tsx`, after the repeat badge, show subtask progress if `todo.subtasks?.length > 0`:

```tsx
{todo.subtasks && todo.subtasks.length > 0 && (
  <span className="text-[10px] text-on-surface-variant">
    {todo.subtasks.filter(s => s.completed).length}/{todo.subtasks.length}
  </span>
)}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/SubtaskList.tsx src/components/modals/TaskDetailModal.tsx src/components/matrix/TaskCard.tsx
git commit -m "feat: add subtasks — inline checklist with progress indicator on task cards"
```

---

## Task 5: Tags & Labels (Batch 1 — independent)

**Files:**
- Create: `src/components/ui/TagSelector.tsx`
- Create: `src/components/ui/TagChip.tsx`
- Modify: `src/components/modals/AddTodoModal.tsx` (add tag selector)
- Modify: `src/components/modals/TaskDetailModal.tsx` (add tag selector)
- Modify: `src/components/matrix/TaskCard.tsx` (show tag chips)

- [ ] **Step 1: Create TagChip component**

Create `src/components/ui/TagChip.tsx`:

```typescript
"use client";

interface TagChipProps {
  name: string;
  color: string;
  size?: "sm" | "md";
  onRemove?: () => void;
}

export default function TagChip({ name, color, size = "md", onRemove }: TagChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${
        size === "sm" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[11px]"
      }`}
      style={{ borderColor: color + "40", backgroundColor: color + "15", color }}
    >
      {name}
      {onRemove && (
        <button onClick={onRemove} className="hover:opacity-70">×</button>
      )}
    </span>
  );
}
```

- [ ] **Step 2: Create TagSelector component**

Create `src/components/ui/TagSelector.tsx`:

Tag picker with:
- Shows existing tags as selectable chips (toggle on/off)
- "New tag" inline input with color picker (8 preset colors from TAG_COLORS)
- Selected tags highlighted with filled background
- Props: `selectedIds: string[]`, `onChange: (ids: string[]) => void`
- Uses `useTodoContext` to access `tags`, `addTag`

- [ ] **Step 3: Add TagSelector to modals**

In AddTodoModal: add `tags` state, TagSelector in a CollapsibleSection, pass tags to addTodo.
In TaskDetailModal: load tags from todo, add TagSelector, save tags in handleSave.

- [ ] **Step 4: Show tags on TaskCard**

In TaskCard.tsx, after the title area, show first 2 tags as small TagChips:

```tsx
{todo.tags && todo.tags.length > 0 && (
  <div className="flex gap-1 mt-0.5">
    {todo.tags.slice(0, 2).map(tagId => {
      const tag = tags.find(t => t.id === tagId);
      return tag ? <TagChip key={tag.id} name={tag.name} color={tag.color} size="sm" /> : null;
    })}
    {todo.tags.length > 2 && <span className="text-[9px] text-outline">+{todo.tags.length - 2}</span>}
  </div>
)}
```

Note: will need to access tags from context.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/TagChip.tsx src/components/ui/TagSelector.tsx src/components/modals/AddTodoModal.tsx src/components/modals/TaskDetailModal.tsx src/components/matrix/TaskCard.tsx
git commit -m "feat: add tags — custom color labels with inline creation and filter support"
```

---

## Task 6: Streak Tracker (Batch 2 — independent)

**Files:**
- Create: `src/lib/streak-utils.ts`
- Create: `src/hooks/useStreak.ts`
- Modify: `src/components/calendar/CalendarGrid.tsx` (add fire emoji on active dates)
- Modify: `src/components/layout/Header.tsx` (show streak badge)

- [ ] **Step 1: Create streak-utils.ts**

Create `src/lib/streak-utils.ts`:

```typescript
import { Todo, StreakData } from "./types";
import { toDateString, addDays } from "./date-utils";

export function calculateStreak(todos: Todo[]): StreakData {
  const completedDates = new Set<string>();
  todos.forEach((t) => {
    if (t.completed && t.completedAt) {
      completedDates.add(t.completedAt.substring(0, 10));
    }
  });

  const today = toDateString(new Date());
  let currentStreak = 0;
  let date = new Date();

  // Check if today is active
  if (completedDates.has(today)) {
    currentStreak = 1;
    date = addDays(date, -1);
  } else {
    // Check yesterday — streak might still be alive
    date = addDays(date, -1);
    if (!completedDates.has(toDateString(date))) {
      return { currentStreak: 0, longestStreak: calculateLongest(completedDates), lastActiveDate: null };
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
```

- [ ] **Step 2: Add fire indicator to CalendarGrid**

In `CalendarGrid.tsx`, import `getActiveDates` and show 🔥 on dates that have completions.

- [ ] **Step 3: Add streak badge to Header**

Show `🔥 {currentStreak}` next to the date when streak > 0.

- [ ] **Step 4: Commit**

```bash
git add src/lib/streak-utils.ts src/components/calendar/CalendarGrid.tsx src/components/layout/Header.tsx
git commit -m "feat: add streak tracker — fire indicators on calendar and header badge"
```

---

## Task 7: Achievements/Badges (Batch 2 — independent)

**Files:**
- Create: `src/lib/achievements.ts`
- Create: `src/hooks/useAchievements.ts`
- Create: `src/components/report/AchievementGrid.tsx`
- Create: `src/components/common/AchievementToast.tsx`
- Modify: `src/components/report/ReportView.tsx` (add achievement section)

- [ ] **Step 1: Create achievements.ts — unlock logic**

Create `src/lib/achievements.ts`:

```typescript
import { Todo, Achievement } from "./types";
import { AchievementType, ACHIEVEMENTS } from "./constants";
import { StreakData } from "./types";

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
  const hasAllClear = Array.from(byDate.values()).some((d) => d.total > 0 && d.total === d.done);
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
```

- [ ] **Step 2: Create AchievementGrid component**

Create `src/components/report/AchievementGrid.tsx`:

Grid of achievement cards. Each shows:
- Icon (Material Symbols)
- Name
- Description
- Locked: dimmed with lock icon overlay
- Unlocked: gold border + glow effect + unlock date
- Uses ACHIEVEMENTS constant

- [ ] **Step 3: Create AchievementToast**

Create `src/components/common/AchievementToast.tsx`:

Celebratory toast popup that shows when a new achievement is unlocked:
- Gold background gradient
- Icon + "업적 해금!" + achievement name
- Auto-dismiss after 3 seconds
- Slide-up animation

- [ ] **Step 4: Add to ReportView**

In `ReportView.tsx`, add AchievementGrid section after the recurring tasks section.

- [ ] **Step 5: Commit**

```bash
git add src/lib/achievements.ts src/components/report/AchievementGrid.tsx src/components/common/AchievementToast.tsx src/components/report/ReportView.tsx
git commit -m "feat: add achievement system — 10 badges with unlock detection and celebratory toast"
```

---

## Task 8: Focus Mode + Pomodoro (Batch 2 — independent)

**Files:**
- Create: `src/components/focus/FocusMode.tsx`
- Create: `src/components/focus/PomodoroTimer.tsx`
- Modify: `src/app/page.tsx` (add focus mode state and rendering)

- [ ] **Step 1: Create PomodoroTimer component**

Create `src/components/focus/PomodoroTimer.tsx`:

Circular progress timer with:
- 25min work / 5min break cycle
- SVG circle progress indicator
- Time display (mm:ss) in center
- Start / Pause / Reset buttons
- Phase label: "집중" or "휴식"
- Props: `onComplete: () => void` (called when work phase ends)
- Uses `useEffect` with `setInterval` for countdown

- [ ] **Step 2: Create FocusMode component**

Create `src/components/focus/FocusMode.tsx`:

Full-screen overlay:
- Dark background, hide nav/header
- Current DO task displayed large (title + memo)
- PomodoroTimer below
- "완료" button to mark task done and advance to next
- "건너뛰기" to skip to next DO task
- Task counter: "1/3"
- Close (X) button top-right
- Props: `date: string`, `onClose: () => void`
- Gets DO todos from context, tracks currentIndex

- [ ] **Step 3: Wire into page.tsx**

Add `showFocusMode` state. Add a way to trigger it (e.g., from TodayWidget or a dedicated button).

- [ ] **Step 4: Commit**

```bash
git add src/components/focus/FocusMode.tsx src/components/focus/PomodoroTimer.tsx src/app/page.tsx
git commit -m "feat: add focus mode — fullscreen DO tasks with pomodoro timer"
```

---

## Task 9: Swipe Gestures (Batch 2 — independent)

**Files:**
- Create: `src/components/calendar/SwipeableTask.tsx`
- Modify: `src/components/calendar/DayTaskList.tsx` (wrap tasks with SwipeableTask)

- [ ] **Step 1: Create SwipeableTask component**

Create `src/components/calendar/SwipeableTask.tsx`:

```typescript
"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";

interface SwipeableTaskProps {
  children: React.ReactNode;
  onSwipeLeft: () => void;  // delete
  onSwipeRight: () => void; // complete toggle
}

export default function SwipeableTask({ children, onSwipeLeft, onSwipeRight }: SwipeableTaskProps) {
  const x = useMotionValue(0);
  const bgOpacity = useTransform(x, [-100, -50, 0, 50, 100], [1, 0.5, 0, 0.5, 1]);
  const [swiping, setSwiping] = useState(false);

  const handleDragEnd = (_: any, info: PanInfo) => {
    setSwiping(false);
    if (info.offset.x > 80) {
      onSwipeRight();
    } else if (info.offset.x < -80) {
      onSwipeLeft();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-md">
      {/* Background indicators */}
      <motion.div
        className="absolute inset-0 flex items-center justify-between px-4"
        style={{ opacity: bgOpacity }}
      >
        <div className="flex items-center gap-2 text-green-400">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="text-body-sm font-medium">완료</span>
        </div>
        <div className="flex items-center gap-2 text-red-400">
          <span className="text-body-sm font-medium">삭제</span>
          <span className="material-symbols-outlined">delete</span>
        </div>
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={() => setSwiping(true)}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Wrap DayTaskList items**

In `DayTaskList.tsx`, wrap each task card with `<SwipeableTask>`:
- `onSwipeRight` → `toggleComplete(todo.id)`
- `onSwipeLeft` → `deleteTodo(todo.id)` (with undo support)

- [ ] **Step 3: Commit**

```bash
git add src/components/calendar/SwipeableTask.tsx src/components/calendar/DayTaskList.tsx
git commit -m "feat: add swipe gestures — swipe right to complete, left to delete in calendar view"
```

---

## Task 10: Templates (Batch 2 — independent)

**Files:**
- Create: `src/components/modals/TemplateModal.tsx`
- Modify: `src/components/modals/AddTodoModal.tsx` (add "from template" button)

- [ ] **Step 1: Create TemplateModal**

Create `src/components/modals/TemplateModal.tsx`:

Bottom sheet modal:
- Tab 1: "템플릿 선택" — list of saved templates, tap to apply
- Tab 2: "새 템플릿" — name input + item list builder
- Each template shows: name, item count, quadrant color dots
- "적용" button adds all template items to the specified date
- Props: `isOpen: boolean`, `onClose: () => void`, `date: string`

- [ ] **Step 2: Add template button to AddTodoModal**

In `AddTodoModal.tsx`, add a secondary button next to the submit button:

```tsx
<button
  onClick={() => { onClose(); onOpenTemplate?.(); }}
  className="text-body-sm text-quadrant-plan-primary underline"
>
  템플릿에서 추가
</button>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/modals/TemplateModal.tsx src/components/modals/AddTodoModal.tsx
git commit -m "feat: add task templates — save and apply reusable task bundles"
```

---

## Task 11: Productivity Heatmap (Batch 3 — independent)

**Files:**
- Create: `src/components/report/Heatmap.tsx`
- Modify: `src/components/report/ReportView.tsx` (add heatmap section)

- [ ] **Step 1: Create Heatmap component**

Create `src/components/report/Heatmap.tsx`:

GitHub-style contribution heatmap:
- 12 weeks (84 days) of data
- 7 rows (Mon-Sun) × 12 columns (weeks)
- Each cell: rounded square, colored by completion count
  - 0: `bg-surface-container-low`
  - 1-2: `rgba(173,198,255,0.2)`
  - 3-4: `rgba(173,198,255,0.4)`
  - 5+: `rgba(173,198,255,0.7)`
- Tap cell shows tooltip: "M월 d일: N개 완료"
- Day labels on left (월, 수, 금)
- Props: `todos: Todo[]`

Calculation:
```typescript
const completionMap = new Map<string, number>();
todos.forEach(t => {
  if (t.completed) {
    const date = t.completedAt?.substring(0, 10) ?? t.date;
    completionMap.set(date, (completionMap.get(date) ?? 0) + 1);
  }
});
```

- [ ] **Step 2: Add to ReportView**

In `ReportView.tsx`, add Heatmap section after the donut chart, before personality card.

- [ ] **Step 3: Commit**

```bash
git add src/components/report/Heatmap.tsx src/components/report/ReportView.tsx
git commit -m "feat: add productivity heatmap — GitHub-style 12-week completion grid"
```

---

## Task 12: Monthly Report & Trends (Batch 3 — independent)

**Files:**
- Create: `src/lib/monthly-report-utils.ts`
- Create: `src/components/report/MonthlyReport.tsx`
- Create: `src/components/report/TrendChart.tsx`
- Modify: `src/components/report/ReportView.tsx` (add weekly/monthly toggle)

- [ ] **Step 1: Create monthly-report-utils.ts**

Create `src/lib/monthly-report-utils.ts`:

```typescript
import { Todo, Quadrant } from "./types";
import { toDateString } from "./date-utils";
import { startOfMonth, endOfMonth, eachWeekOfInterval, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

export interface MonthlyStats {
  total: number;
  completed: number;
  ratios: Record<Quadrant, number>;
  counts: Record<Quadrant, number>;
  weeklyTrend: { week: string; do: number; plan: number; delegate: number; delete: number }[];
  prevMonthComparison: Record<Quadrant, number>; // delta percentages
}

export function calculateMonthlyStats(todos: Todo[], monthDate: Date): MonthlyStats {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const dateStrings = new Set(days.map(d => toDateString(d)));

  const monthTodos = todos.filter(t => dateStrings.has(t.date));
  const completed = monthTodos.filter(t => t.completed);

  const counts: Record<Quadrant, number> = { do: 0, plan: 0, delegate: 0, delete: 0 };
  monthTodos.forEach(t => counts[t.quadrant]++);

  const total = monthTodos.length;
  const ratios: Record<Quadrant, number> = {
    do: total > 0 ? counts.do / total : 0,
    plan: total > 0 ? counts.plan / total : 0,
    delegate: total > 0 ? counts.delegate / total : 0,
    delete: total > 0 ? counts.delete / total : 0,
  };

  // Weekly trend
  const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 });
  const weeklyTrend = weeks.map((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekDates = new Set(eachDayOfInterval({ start: weekStart, end: weekEnd }).map(d => toDateString(d)));
    const weekTodos = monthTodos.filter(t => weekDates.has(t.date));
    return {
      week: toDateString(weekStart),
      do: weekTodos.filter(t => t.quadrant === "do").length,
      plan: weekTodos.filter(t => t.quadrant === "plan").length,
      delegate: weekTodos.filter(t => t.quadrant === "delegate").length,
      delete: weekTodos.filter(t => t.quadrant === "delete").length,
    };
  });

  // Previous month comparison
  const prevMonth = new Date(monthDate);
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  const prevStart = startOfMonth(prevMonth);
  const prevEnd = endOfMonth(prevMonth);
  const prevDays = eachDayOfInterval({ start: prevStart, end: prevEnd });
  const prevDateStrings = new Set(prevDays.map(d => toDateString(d)));
  const prevTodos = todos.filter(t => prevDateStrings.has(t.date));
  const prevTotal = prevTodos.length;
  const prevRatios: Record<Quadrant, number> = {
    do: prevTotal > 0 ? prevTodos.filter(t => t.quadrant === "do").length / prevTotal : 0,
    plan: prevTotal > 0 ? prevTodos.filter(t => t.quadrant === "plan").length / prevTotal : 0,
    delegate: prevTotal > 0 ? prevTodos.filter(t => t.quadrant === "delegate").length / prevTotal : 0,
    delete: prevTotal > 0 ? prevTodos.filter(t => t.quadrant === "delete").length / prevTotal : 0,
  };

  const prevMonthComparison: Record<Quadrant, number> = {
    do: Math.round((ratios.do - prevRatios.do) * 100),
    plan: Math.round((ratios.plan - prevRatios.plan) * 100),
    delegate: Math.round((ratios.delegate - prevRatios.delegate) * 100),
    delete: Math.round((ratios.delete - prevRatios.delete) * 100),
  };

  return { total, completed: completed.length, ratios, counts, weeklyTrend, prevMonthComparison };
}
```

- [ ] **Step 2: Create TrendChart component**

Line chart using Chart.js showing 4 quadrant lines over weeks of the month.

- [ ] **Step 3: Create MonthlyReport component**

Combines donut chart (monthly totals) + TrendChart + comparison text.

- [ ] **Step 4: Add toggle to ReportView**

Add `reportMode: "weekly" | "monthly"` state with toggle buttons at top.

- [ ] **Step 5: Commit**

```bash
git add src/lib/monthly-report-utils.ts src/components/report/MonthlyReport.tsx src/components/report/TrendChart.tsx src/components/report/ReportView.tsx
git commit -m "feat: add monthly report — trend charts and month-over-month comparison"
```

---

## Task 13: Weekly Timeline View (Batch 3 — independent)

**Files:**
- Create: `src/components/calendar/WeeklyTimeline.tsx`
- Modify: `src/components/calendar/CalendarView.tsx` (add day/week toggle)

- [ ] **Step 1: Create WeeklyTimeline component**

Create `src/components/calendar/WeeklyTimeline.tsx`:

7-day horizontal timeline:
- 7 columns (Mon-Sun) with date labels
- Vertical time axis (hours)
- Task blocks rendered as colored rectangles (quadrant colors)
- Click block → onTaskTap
- Horizontal scroll for small screens
- Uses getTodosForDate for each day
- Props: `selectedDate: Date`, `onTaskTap: (id: string) => void`
- Time range: auto-detect from all 7 days' scheduled tasks

- [ ] **Step 2: Add toggle to CalendarView**

Add `viewMode: "day" | "week"` state with toggle buttons:

```tsx
<div className="flex gap-2 px-lg mb-2">
  <button onClick={() => setViewMode("day")} className={...}>일간</button>
  <button onClick={() => setViewMode("week")} className={...}>주간</button>
</div>
```

Render DayTaskList or WeeklyTimeline based on viewMode.

- [ ] **Step 3: Commit**

```bash
git add src/components/calendar/WeeklyTimeline.tsx src/components/calendar/CalendarView.tsx
git commit -m "feat: add weekly timeline view — 7-day schedule overview with time blocks"
```

---

## Task 14: Share Card Themes (Batch 3 — independent)

**Files:**
- Create: `src/components/share/ShareCardMinimal.tsx`
- Create: `src/components/share/ShareCardGradient.tsx`
- Create: `src/components/share/ShareCardStats.tsx`
- Create: `src/components/modals/ShareThemeModal.tsx`
- Modify: `src/components/report/ReportView.tsx` (replace direct share with theme picker)

- [ ] **Step 1: Create 3 new share card variants**

Each card is a `forwardRef` component (same as existing ShareCard pattern for html2canvas):

1. **ShareCardMinimal**: White bg, large typography, minimal info (personality name + one-line quote)
2. **ShareCardGradient**: Gradient bg using quadrant colors, bold personality icon + name + ratio bars
3. **ShareCardStats**: Data-heavy — streak count, total completed, achievement count, ratio percentages

All cards: 1080×1350px, same props as existing ShareCard.

- [ ] **Step 2: Create ShareThemeModal**

Bottom sheet showing 4 card previews (thumbnails) in a 2×2 grid. Tap to select → generates and shares.

- [ ] **Step 3: Update ReportView**

Replace `handleShare` with opening ShareThemeModal. Pass stats data.

- [ ] **Step 4: Commit**

```bash
git add src/components/share/ src/components/modals/ShareThemeModal.tsx src/components/report/ReportView.tsx
git commit -m "feat: add 4 share card themes — classic, minimal, gradient, stats"
```

---

## Task 15: Notifications / Reminders (Batch 3 — independent)

**Files:**
- Create: `src/providers/NotificationProvider.tsx`
- Create: `src/hooks/useNotification.ts`
- Modify: `src/app/layout.tsx` (wrap with NotificationProvider)

- [ ] **Step 1: Create NotificationProvider**

Create `src/providers/NotificationProvider.tsx`:

```typescript
"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useTodoContext } from "@/hooks/useTodos";
import { toDateString } from "@/lib/date-utils";

interface NotificationContextValue {
  permission: NotificationPermission | "unsupported";
  requestPermission: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue>({
  permission: "unsupported",
  requestPermission: async () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("unsupported");
  const { todos } = useTodoContext();

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }, []);

  // Check for upcoming tasks every minute
  useEffect(() => {
    if (permission !== "granted") return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const today = toDateString(now);

      todos
        .filter((t) => t.date === today && t.startTime === currentTime && !t.completed)
        .forEach((t) => {
          new Notification("아이젠하워 투두", {
            body: `⏰ "${t.title}" 시작 시간입니다!`,
            icon: "/favicon.ico",
          });
        });
    }, 60000);

    return () => clearInterval(interval);
  }, [permission, todos]);

  return (
    <NotificationContext.Provider value={{ permission, requestPermission }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
```

- [ ] **Step 2: Create useNotification hook**

Create `src/hooks/useNotification.ts`:

```typescript
export { useNotification } from "@/providers/NotificationProvider";
```

- [ ] **Step 3: Wrap in layout.tsx**

In `layout.tsx`, add NotificationProvider inside TodoProvider:

```tsx
<ThemeProvider>
  <TodoProvider>
    <NotificationProvider>
      {children}
    </NotificationProvider>
  </TodoProvider>
</ThemeProvider>
```

Note: NotificationProvider must be inside TodoProvider since it uses useTodoContext.

- [ ] **Step 4: Commit**

```bash
git add src/providers/NotificationProvider.tsx src/hooks/useNotification.ts src/app/layout.tsx
git commit -m "feat: add browser notifications — remind on task start time"
```

---

## Task 16: Final Integration + page.tsx Wiring

**Files:**
- Modify: `src/app/page.tsx` (wire all new features)
- Modify: `src/app/layout.tsx` (ensure all providers are wrapped)

This task runs LAST after all batch tasks complete.

- [ ] **Step 1: Verify all imports resolve**

```bash
npx tsc --noEmit
```

Fix any type errors.

- [ ] **Step 2: Update page.tsx with all new state and components**

Ensure page.tsx imports and renders:
- UndoToast
- SearchOverlay (with showSearch state)
- FocusMode (with showFocusMode state)
- TemplateModal (with showTemplate state)
- AchievementToast

Pass new callbacks to Header (onSearchOpen).

- [ ] **Step 3: Verify layout.tsx has correct provider nesting**

```tsx
<ThemeProvider>
  <AuthProvider>
    <TodoProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </TodoProvider>
  </AuthProvider>
</ThemeProvider>
```

- [ ] **Step 4: Build check**

```bash
npm run build
```

Fix any build errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: integrate all v2 features — final wiring and build verification"
```

---

## Batch Execution Order

```
Task 0 (Foundation) ──────────────────────────────────┐
                                                       │
├── Batch 1 (parallel): Tasks 1,2,3,4,5              │
│   ├── Task 1: Undo Toast                            │
│   ├── Task 2: Search & Filter                       │
│   ├── Task 3: Today Widget                          │
│   ├── Task 4: Subtasks                              │
│   └── Task 5: Tags                                  │
│                                                      │
├── Batch 2 (parallel): Tasks 6,7,8,9,10             │
│   ├── Task 6: Streak Tracker                        │
│   ├── Task 7: Achievements                          │
│   ├── Task 8: Focus Mode                            │
│   ├── Task 9: Swipe Gestures                        │
│   └── Task 10: Templates                            │
│                                                      │
├── Batch 3 (parallel): Tasks 11,12,13,14,15         │
│   ├── Task 11: Heatmap                              │
│   ├── Task 12: Monthly Report                       │
│   ├── Task 13: Weekly Timeline                      │
│   ├── Task 14: Share Card Themes                    │
│   └── Task 15: Notifications                        │
│                                                      │
└── Task 16 (Integration) ────────────────────────────┘
```
