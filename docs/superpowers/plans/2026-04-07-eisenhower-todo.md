# 아이젠하워 투두 매트릭스 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first Eisenhower Matrix todo app with drag-and-drop, calendar view, weekly reports, and SNS share cards — dark theme only, localStorage persistence.

**Architecture:** Next.js App Router with client-side state management via React Context. All data persists in localStorage. Three main views (Calendar, Matrix, Report) switched via bottom navigation. Modals use bottom-sheet pattern. Drag-and-drop powered by dnd-kit. Charts via Chart.js. Share cards via html2canvas.

**Tech Stack:** Next.js 14 (App Router), Tailwind CSS 3, @dnd-kit/core + @dnd-kit/sortable, framer-motion, chart.js + react-chartjs-2, html2canvas, date-fns

**Design Authority:** DESIGN.md is the single source of truth for all visual decisions. design-brief.md provides interaction details.

---

## File Structure

```
src/
  app/
    layout.tsx                  # Root layout — fonts, metadata, providers
    page.tsx                    # Main page — tab routing via state
    globals.css                 # CSS variables (design tokens), global styles
  components/
    layout/
      Header.tsx                # Sticky header — hamburger + title + date
      BottomNav.tsx             # 3-tab bottom navigation
      FAB.tsx                   # Floating action button
    matrix/
      MatrixView.tsx            # 2x2 grid container with DndContext
      QuadrantBox.tsx           # Single quadrant — droppable area
      TaskCard.tsx              # Single task card — draggable
    calendar/
      CalendarView.tsx          # Calendar page container
      CalendarGrid.tsx          # Monthly grid with color dots
      DayTaskList.tsx           # Selected day's task list
    report/
      ReportView.tsx            # Weekly report page
      DonutChart.tsx            # Quadrant ratio donut (Chart.js)
      PersonalityCard.tsx       # Time-use personality type card
      AchievementBar.tsx        # Single recurring task progress bar
    modals/
      AddTodoModal.tsx          # Bottom sheet — add new todo
      TaskDetailModal.tsx       # Bottom sheet — view/edit/delete todo
    share/
      ShareCard.tsx             # SNS share card (html2canvas-safe)
    onboarding/
      Onboarding.tsx            # 3-step interactive tutorial
    ui/
      QuadrantSelector.tsx      # 2x2 quadrant picker buttons
      RepeatSelector.tsx        # Repeat option chips
      Toast.tsx                 # Toast notification
  hooks/
    useTodos.ts                 # Todo CRUD operations via context
  lib/
    types.ts                    # TypeScript interfaces
    constants.ts                # Quadrant colors, labels, personality types
    storage.ts                  # localStorage read/write with error handling
    date-utils.ts               # Date helpers (week range, format, recurring gen)
    report-utils.ts             # Personality type calculator, stats
  providers/
    TodoProvider.tsx             # React Context — todos state + dispatch
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tailwind.config.ts`, `tsconfig.json`, `next.config.js`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd /Users/user/Documents/project/6-Diagram-Todo
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
```

Select defaults. This creates the project skeleton.

- [ ] **Step 2: Install dependencies**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities framer-motion chart.js react-chartjs-2 html2canvas date-fns
```

- [ ] **Step 3: Configure Tailwind with design tokens**

Replace `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#131317",
          "container-lowest": "#0e0e12",
          "container-low": "#1b1b1f",
          container: "#1f1f23",
          "container-high": "#2a292e",
          "container-highest": "#353439",
        },
        "on-surface": {
          DEFAULT: "#e4e1e7",
          variant: "#c2c6d6",
        },
        outline: "#8c909f",
        quadrant: {
          do: { primary: "#ffb3ad", container: "#ff5451" },
          plan: { primary: "#adc6ff", container: "#0566d9" },
          delegate: { primary: "#ffb95f", container: "#ca8100" },
          delete: { primary: "#8c909f", container: "#424754" },
        },
        error: { DEFAULT: "#ffb4ab", container: "#93000a" },
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["32px", { lineHeight: "1.2", fontWeight: "800" }],
        "display-md": ["24px", { lineHeight: "1.3", fontWeight: "700" }],
        headline: ["18px", { lineHeight: "1.4", fontWeight: "700" }],
        "body-lg": ["16px", { lineHeight: "1.5", fontWeight: "500" }],
        "body-md": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "1.5", fontWeight: "400" }],
        "label-lg": ["12px", { lineHeight: "1.4", fontWeight: "600" }],
        "label-sm": [
          "10px",
          {
            lineHeight: "1.4",
            fontWeight: "600",
            letterSpacing: "0.1em",
          },
        ],
      },
      spacing: {
        "2xs": "2px",
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
      },
      borderRadius: {
        sm: "4px",
        md: "10px",
        lg: "16px",
        xl: "24px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 4: Write globals.css with design tokens**

Replace `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --glass-card-bg: rgba(255, 255, 255, 0.05);
  --glass-blur: 32px;
  --obsidian-gradient: radial-gradient(
    circle at 50% 0%,
    rgba(173, 198, 255, 0.05) 0%,
    rgba(19, 19, 23, 0) 70%
  );
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: "Inter", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background-color: #131317;
  color: #e4e1e7;
  min-height: 100dvh;
  overflow-x: hidden;
}

/* Glass card utility */
.glass-card {
  background: var(--glass-card-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* Obsidian gradient overlay */
.obsidian-gradient {
  background-image: var(--obsidian-gradient);
}

/* Scrollbar styling for quadrants */
.quadrant-scroll::-webkit-scrollbar {
  width: 2px;
}
.quadrant-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.quadrant-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
}

/* Safe area padding for bottom elements */
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

- [ ] **Step 5: Setup root layout with fonts**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "아이젠하워 투두",
  description:
    "긴급한 것은 중요하지 않고, 중요한 것은 긴급하지 않다 — 아이젠하워 매트릭스 기반 할 일 관리",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#131317",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body">{children}</body>
    </html>
  );
}
```

- [ ] **Step 6: Create placeholder main page**

Replace `src/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main className="flex min-h-dvh items-center justify-center">
      <h1 className="font-display text-display-md text-on-surface">
        아이젠하워 투두
      </h1>
    </main>
  );
}
```

- [ ] **Step 7: Verify dev server runs**

```bash
npm run dev
```

Expected: App runs on localhost:3000 with dark background, centered title in Manrope font.

- [ ] **Step 8: Commit**

```bash
git init && git add -A && git commit -m "feat: scaffold Next.js project with Tailwind design tokens"
```

---

## Task 2: Types & Constants

**Files:**
- Create: `src/lib/types.ts`, `src/lib/constants.ts`

- [ ] **Step 1: Define core TypeScript types**

Create `src/lib/types.ts`:

```ts
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
```

- [ ] **Step 2: Define constants**

Create `src/lib/constants.ts`:

```ts
import { Quadrant, QuadrantInfo } from "./types";

export const QUADRANTS: Record<Quadrant, QuadrantInfo> = {
  do: {
    id: "do",
    label: "즉시 실행",
    sublabel: "DO",
    primary: "#ffb3ad",
    container: "#ff5451",
    emptyTitle: "오늘 긴급한 일이 없어요",
    emptySub: "좋은 날이네요! 계획에 집중하세요",
  },
  plan: {
    id: "plan",
    label: "계획 수립",
    sublabel: "PLAN",
    primary: "#adc6ff",
    container: "#0566d9",
    emptyTitle: "장기 목표를 추가해보세요",
    emptySub: "여기가 진짜 인생을 바꾸는 곳이에요",
  },
  delegate: {
    id: "delegate",
    label: "위임",
    sublabel: "DELEGATE",
    primary: "#ffb95f",
    container: "#ca8100",
    emptyTitle: "혼자 다 하지 마세요",
    emptySub: "넘길 수 있는 일을 찾아보세요",
  },
  delete: {
    id: "delete",
    label: "제거",
    sublabel: "DELETE",
    primary: "#8c909f",
    container: "#424754",
    emptyTitle: "정리할 게 없네요",
    emptySub: "깔끔합니다!",
  },
};

export const QUADRANT_ORDER: Quadrant[] = [
  "do",
  "plan",
  "delegate",
  "delete",
];

export const PERSONALITY_TYPES = {
  firefighter: {
    id: "firefighter",
    name: "소방관형",
    icon: "local_fire_department",
    description: "긴급한 불만 끄느라 바쁜 사람",
    advice:
      "당신의 2사분면을 지키세요. 거기에 인생이 있습니다.",
    condition: (ratios: Record<Quadrant, number>) => ratios.do >= 0.5,
  },
  strategist: {
    id: "strategist",
    name: "전략가형",
    icon: "psychology",
    description: "중요한 일에 집중하는 이상적인 사람",
    advice:
      "당신은 이미 아이젠하워의 길을 걷고 있습니다.",
    condition: (ratios: Record<Quadrant, number>) => ratios.plan >= 0.3,
  },
  yesman: {
    id: "yesman",
    name: "예스맨형",
    icon: "handshake",
    description: "남의 일만 처리하는 사람",
    advice:
      "NO라고 말하는 법을 배우세요. 당신의 시간은 당신 것입니다.",
    condition: (ratios: Record<Quadrant, number>) => ratios.delegate >= 0.4,
  },
  wanderer: {
    id: "wanderer",
    name: "방랑자형",
    icon: "explore",
    description: "시간을 흘려보내는 사람",
    advice:
      "계획은 아무것도 아니다. 하지만 계획하기가 전부다.",
    condition: (ratios: Record<Quadrant, number>) => ratios.delete >= 0.3,
  },
  balancer: {
    id: "balancer",
    name: "균형자형",
    icon: "balance",
    description: "모든 영역을 적절히 관리하는 사람",
    advice:
      "균형을 잡은 당신, 이제 2사분면의 비율을 더 높여보세요.",
    condition: () => true, // fallback
  },
} as const;

export const TABS = [
  { id: "calendar" as const, label: "캘린더", icon: "calendar_month" },
  { id: "matrix" as const, label: "매트릭스", icon: "grid_view" },
  { id: "report" as const, label: "리포트", icon: "bar_chart" },
];
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts src/lib/constants.ts
git commit -m "feat: add core TypeScript types and design constants"
```

---

## Task 3: Storage Layer & Todo Provider

**Files:**
- Create: `src/lib/storage.ts`, `src/lib/date-utils.ts`, `src/providers/TodoProvider.tsx`, `src/hooks/useTodos.ts`

- [ ] **Step 1: Create localStorage wrapper**

Create `src/lib/storage.ts`:

```ts
import { Todo } from "./types";

const STORAGE_KEY = "eisenhower-todos";
const ONBOARDING_KEY = "eisenhower-onboarding-done";

export function loadTodos(): Todo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
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
```

- [ ] **Step 2: Create date utility functions**

Create `src/lib/date-utils.ts`:

```ts
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
import { Todo, RepeatType } from "./types";

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

/**
 * Generate recurring todo instances for a given date.
 * Returns new Todo objects with date set to targetDate.
 */
export function generateRecurringForDate(
  templates: Todo[],
  targetDate: Date
): Todo[] {
  const dateStr = toDateString(targetDate);
  const dayOfWeek = getDay(targetDate); // 0=Sun
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
};
```

- [ ] **Step 3: Create TodoProvider with context and reducer**

Create `src/providers/TodoProvider.tsx`:

```tsx
"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { Todo, Quadrant, RepeatType } from "@/lib/types";
import { loadTodos, saveTodos } from "@/lib/storage";
import { toDateString } from "@/lib/date-utils";

interface TodoState {
  todos: Todo[];
  loaded: boolean;
}

type TodoAction =
  | { type: "LOAD"; todos: Todo[] }
  | { type: "ADD"; todo: Todo }
  | { type: "UPDATE"; id: string; updates: Partial<Todo> }
  | { type: "DELETE"; id: string }
  | { type: "TOGGLE_COMPLETE"; id: string }
  | { type: "MOVE_QUADRANT"; id: string; quadrant: Quadrant }
  | { type: "REORDER"; quadrant: Quadrant; date: string; orderedIds: string[] };

function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case "LOAD":
      return { todos: action.todos, loaded: true };

    case "ADD":
      return { ...state, todos: [...state.todos, action.todo] };

    case "UPDATE":
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.id ? { ...t, ...action.updates } : t
        ),
      };

    case "DELETE":
      return {
        ...state,
        todos: state.todos.filter((t) => t.id !== action.id),
      };

    case "TOGGLE_COMPLETE": {
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.id
            ? {
                ...t,
                completed: !t.completed,
                completedAt: !t.completed
                  ? new Date().toISOString()
                  : null,
              }
            : t
        ),
      };
    }

    case "MOVE_QUADRANT":
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.id ? { ...t, quadrant: action.quadrant } : t
        ),
      };

    case "REORDER": {
      const todos = state.todos.map((t) => {
        if (t.quadrant === action.quadrant && t.date === action.date) {
          const idx = action.orderedIds.indexOf(t.id);
          if (idx !== -1) return { ...t, order: idx };
        }
        return t;
      });
      return { ...state, todos };
    }

    default:
      return state;
  }
}

interface TodoContextValue {
  todos: Todo[];
  loaded: boolean;
  addTodo: (params: {
    title: string;
    quadrant: Quadrant;
    date: string;
    repeat: RepeatType;
    repeatDays?: number[];
    repeatDate?: number;
    repeatMonth?: number;
    memo?: string;
  }) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  toggleComplete: (id: string) => void;
  moveQuadrant: (id: string, quadrant: Quadrant) => void;
  reorder: (quadrant: Quadrant, date: string, orderedIds: string[]) => void;
  getTodosForDate: (date: string) => Todo[];
  getTodosForQuadrant: (quadrant: Quadrant, date: string) => Todo[];
}

const TodoContext = createContext<TodoContextValue | null>(null);

export function TodoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(todoReducer, {
    todos: [],
    loaded: false,
  });

  // Load from localStorage on mount
  useEffect(() => {
    dispatch({ type: "LOAD", todos: loadTodos() });
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    if (state.loaded) {
      saveTodos(state.todos);
    }
  }, [state.todos, state.loaded]);

  const addTodo = useCallback(
    (params: {
      title: string;
      quadrant: Quadrant;
      date: string;
      repeat: RepeatType;
      repeatDays?: number[];
      repeatDate?: number;
      repeatMonth?: number;
      memo?: string;
    }) => {
      const todosInQuadrant = state.todos.filter(
        (t) => t.quadrant === params.quadrant && t.date === params.date
      );
      const todo: Todo = {
        id: crypto.randomUUID(),
        title: params.title,
        quadrant: params.quadrant,
        date: params.date,
        completed: false,
        completedAt: null,
        repeat: params.repeat,
        repeatDays: params.repeatDays,
        repeatDate: params.repeatDate,
        repeatMonth: params.repeatMonth,
        memo: params.memo ?? "",
        createdAt: new Date().toISOString(),
        order: todosInQuadrant.length,
      };
      dispatch({ type: "ADD", todo });
    },
    [state.todos]
  );

  const updateTodo = useCallback(
    (id: string, updates: Partial<Todo>) =>
      dispatch({ type: "UPDATE", id, updates }),
    []
  );

  const deleteTodo = useCallback(
    (id: string) => dispatch({ type: "DELETE", id }),
    []
  );

  const toggleComplete = useCallback(
    (id: string) => dispatch({ type: "TOGGLE_COMPLETE", id }),
    []
  );

  const moveQuadrant = useCallback(
    (id: string, quadrant: Quadrant) =>
      dispatch({ type: "MOVE_QUADRANT", id, quadrant }),
    []
  );

  const reorder = useCallback(
    (quadrant: Quadrant, date: string, orderedIds: string[]) =>
      dispatch({ type: "REORDER", quadrant, date, orderedIds }),
    []
  );

  const getTodosForDate = useCallback(
    (date: string) =>
      state.todos
        .filter((t) => t.date === date)
        .sort((a, b) => a.order - b.order),
    [state.todos]
  );

  const getTodosForQuadrant = useCallback(
    (quadrant: Quadrant, date: string) =>
      state.todos
        .filter((t) => t.quadrant === quadrant && t.date === date)
        .sort((a, b) => a.order - b.order),
    [state.todos]
  );

  return (
    <TodoContext.Provider
      value={{
        todos: state.todos,
        loaded: state.loaded,
        addTodo,
        updateTodo,
        deleteTodo,
        toggleComplete,
        moveQuadrant,
        reorder,
        getTodosForDate,
        getTodosForQuadrant,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export function useTodoContext() {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error("useTodoContext must be used within TodoProvider");
  return ctx;
}
```

- [ ] **Step 4: Create useTodos hook**

Create `src/hooks/useTodos.ts`:

```ts
export { useTodoContext } from "@/providers/TodoProvider";
```

- [ ] **Step 5: Wire provider into layout**

Update `src/app/layout.tsx` — wrap `{children}` with the provider:

```tsx
import type { Metadata, Viewport } from "next";
import { TodoProvider } from "@/providers/TodoProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "아이젠하워 투두",
  description:
    "긴급한 것은 중요하지 않고, 중요한 것은 긴급하지 않다 — 아이젠하워 매트릭스 기반 할 일 관리",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#131317",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body">
        <TodoProvider>{children}</TodoProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/storage.ts src/lib/date-utils.ts src/providers/TodoProvider.tsx src/hooks/useTodos.ts src/app/layout.tsx
git commit -m "feat: add localStorage persistence, todo context provider, and date utilities"
```

---

## Task 4: App Shell — Header, BottomNav, FAB, Tab Routing

**Files:**
- Create: `src/components/layout/Header.tsx`, `src/components/layout/BottomNav.tsx`, `src/components/layout/FAB.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create Header component**

Create `src/components/layout/Header.tsx`:

```tsx
"use client";

import { formatDateKR } from "@/lib/date-utils";

interface HeaderProps {
  selectedDate: Date;
}

export default function Header({ selectedDate }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0e]/80 backdrop-blur-[48px]">
      <div className="flex items-center justify-between px-lg py-3">
        <h1 className="font-display text-headline text-on-surface">
          아이젠하워 투두
        </h1>
        <span className="text-body-sm text-on-surface-variant">
          {formatDateKR(selectedDate)}
        </span>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create BottomNav component**

Create `src/components/layout/BottomNav.tsx`:

```tsx
"use client";

import { TabId } from "@/lib/types";
import { TABS } from "@/lib/constants";

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0e]/90 backdrop-blur-[48px] safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 px-5 py-2 rounded-xl transition-all duration-150 ${
                isActive
                  ? "bg-quadrant-plan-container/10 text-quadrant-plan-primary"
                  : "text-outline hover:text-on-surface-variant"
              }`}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{
                  fontVariationSettings: isActive
                    ? "'FILL' 1, 'wght' 500"
                    : "'FILL' 0, 'wght' 400",
                }}
              >
                {tab.icon}
              </span>
              <span className="text-label-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Create FAB component**

Create `src/components/layout/FAB.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";

interface FABProps {
  onClick: () => void;
}

export default function FAB({ onClick }: FABProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-24 right-6 z-50 w-[52px] h-[52px] rounded-lg flex items-center justify-center bg-gradient-to-br from-quadrant-plan-container to-[#0450b0] shadow-[0_4px_16px_rgba(5,102,217,0.4)]"
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      aria-label="할 일 추가"
    >
      <span className="material-symbols-outlined text-white text-[26px]">
        add
      </span>
    </motion.button>
  );
}
```

- [ ] **Step 4: Wire up main page with tab routing**

Replace `src/app/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { TabId } from "@/lib/types";
import { toDateString } from "@/lib/date-utils";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import FAB from "@/components/layout/FAB";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("matrix");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="min-h-dvh bg-surface flex flex-col">
      <Header selectedDate={selectedDate} />

      <main className="flex-1 pb-20">
        {activeTab === "calendar" && (
          <div className="px-lg py-md text-on-surface-variant text-body-md">
            캘린더 뷰 (구현 예정)
          </div>
        )}
        {activeTab === "matrix" && (
          <div className="px-lg py-md text-on-surface-variant text-body-md">
            매트릭스 뷰 (구현 예정)
          </div>
        )}
        {activeTab === "report" && (
          <div className="px-lg py-md text-on-surface-variant text-body-md">
            리포트 뷰 (구현 예정)
          </div>
        )}
      </main>

      <FAB onClick={() => setShowAddModal(true)} />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
```

- [ ] **Step 5: Verify the shell renders**

```bash
npm run dev
```

Expected: Dark page with sticky header, bottom nav with 3 tabs (icons + labels), blue FAB button. Tabs switch and show placeholder text.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/ src/app/page.tsx
git commit -m "feat: add app shell with header, bottom navigation, and FAB"
```

---

## Task 5: Matrix View — Quadrants & Task Cards

**Files:**
- Create: `src/components/matrix/MatrixView.tsx`, `src/components/matrix/QuadrantBox.tsx`, `src/components/matrix/TaskCard.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create TaskCard component**

Create `src/components/matrix/TaskCard.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { Todo } from "@/lib/types";
import { QUADRANTS } from "@/lib/constants";
import { useTodoContext } from "@/hooks/useTodos";

interface TaskCardProps {
  todo: Todo;
  onTap?: () => void;
  isDragging?: boolean;
}

export default function TaskCard({
  todo,
  onTap,
  isDragging = false,
}: TaskCardProps) {
  const { toggleComplete } = useTodoContext();
  const q = QUADRANTS[todo.quadrant];

  return (
    <motion.div
      layout
      layoutId={todo.id}
      className={`glass-card rounded-md px-3 py-[10px] flex items-center gap-2 cursor-pointer select-none ${
        isDragging ? "shadow-[0_20px_40px_rgba(0,0,0,0.4)] z-50" : ""
      } ${todo.completed ? "opacity-40" : ""}`}
      style={
        isDragging
          ? { scale: 1.04, rotate: -1.5, border: `1px solid ${q.primary}40` }
          : undefined
      }
      onClick={onTap}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: todo.completed ? 0.4 : 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleComplete(todo.id);
        }}
        className="flex-shrink-0 w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-colors"
        style={{
          borderColor: todo.completed ? q.primary : q.primary + "60",
          backgroundColor: todo.completed ? q.primary : "transparent",
        }}
        aria-label={todo.completed ? "완료 취소" : "완료"}
      >
        {todo.completed && (
          <span className="material-symbols-outlined text-[14px] text-surface">
            check
          </span>
        )}
      </button>

      {/* Title */}
      <span
        className={`text-body-sm text-on-surface flex-1 truncate ${
          todo.completed ? "line-through" : ""
        }`}
      >
        {todo.title}
      </span>

      {/* Repeat badge */}
      {todo.repeat !== "none" && (
        <span className="text-[10px] text-outline border border-white/10 px-1.5 py-0.5 rounded-sm">
          반복
        </span>
      )}
    </motion.div>
  );
}
```

- [ ] **Step 2: Create QuadrantBox component**

Create `src/components/matrix/QuadrantBox.tsx`:

```tsx
"use client";

import { Quadrant } from "@/lib/types";
import { QUADRANTS } from "@/lib/constants";
import { useTodoContext } from "@/hooks/useTodos";
import TaskCard from "./TaskCard";

interface QuadrantBoxProps {
  quadrant: Quadrant;
  date: string;
  onTaskTap?: (todoId: string) => void;
}

export default function QuadrantBox({
  quadrant,
  date,
  onTaskTap,
}: QuadrantBoxProps) {
  const { getTodosForQuadrant } = useTodoContext();
  const q = QUADRANTS[quadrant];
  const todos = getTodosForQuadrant(quadrant, date);
  const activeCount = todos.filter((t) => !t.completed).length;

  return (
    <div
      className="bg-surface-container-low rounded-lg flex flex-col overflow-hidden relative"
      style={{ borderLeft: `2px solid ${q.container}` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: q.primary }}
          />
          <span className="text-body-sm font-semibold text-on-surface">
            {q.label}
          </span>
          {activeCount > 0 && (
            <span className="text-label-sm text-outline">
              · {activeCount}개
            </span>
          )}
        </div>
        <span
          className="text-label-sm uppercase text-on-surface-variant/50"
          style={{ letterSpacing: "0.1em" }}
        >
          {q.sublabel}
        </span>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto quadrant-scroll px-2 pb-2 space-y-sm">
        {todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-body-sm text-outline">{q.emptyTitle}</p>
            <p className="text-label-sm text-outline/60 mt-1">
              {q.emptySub}
            </p>
          </div>
        ) : (
          todos.map((todo) => (
            <TaskCard
              key={todo.id}
              todo={todo}
              onTap={() => onTaskTap?.(todo.id)}
            />
          ))
        )}
      </div>

      {/* Scroll fade indicator */}
      <div
        className="absolute bottom-0 left-0 right-0 h-4 pointer-events-none"
        style={{
          background: `linear-gradient(transparent, #1b1b1f)`,
        }}
      />
    </div>
  );
}
```

- [ ] **Step 3: Create MatrixView component**

Create `src/components/matrix/MatrixView.tsx`:

```tsx
"use client";

import { Quadrant } from "@/lib/types";
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
```

- [ ] **Step 4: Integrate MatrixView into page**

Update the matrix tab section in `src/app/page.tsx`:

Replace the matrix placeholder:
```tsx
{activeTab === "matrix" && (
  <div className="px-lg py-md text-on-surface-variant text-body-md">
    매트릭스 뷰 (구현 예정)
  </div>
)}
```

With:
```tsx
{activeTab === "matrix" && (
  <MatrixView
    date={toDateString(selectedDate)}
    onTaskTap={(id) => setDetailTodoId(id)}
  />
)}
```

Add import at top:
```tsx
import MatrixView from "@/components/matrix/MatrixView";
```

Add state for detail modal:
```tsx
const [detailTodoId, setDetailTodoId] = useState<string | null>(null);
```

- [ ] **Step 5: Verify matrix renders with empty states**

```bash
npm run dev
```

Expected: 2x2 grid fills the screen. Each quadrant shows its color bar, label, empty state message. Quadrants have correct DESIGN.md colors.

- [ ] **Step 6: Commit**

```bash
git add src/components/matrix/ src/app/page.tsx
git commit -m "feat: add matrix view with quadrant boxes, task cards, and empty states"
```

---

## Task 6: Add Todo Modal (Bottom Sheet)

**Files:**
- Create: `src/components/modals/AddTodoModal.tsx`, `src/components/ui/QuadrantSelector.tsx`, `src/components/ui/RepeatSelector.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create QuadrantSelector**

Create `src/components/ui/QuadrantSelector.tsx`:

```tsx
"use client";

import { Quadrant } from "@/lib/types";
import { QUADRANTS, QUADRANT_ORDER } from "@/lib/constants";

interface QuadrantSelectorProps {
  selected: Quadrant;
  onChange: (q: Quadrant) => void;
}

export default function QuadrantSelector({
  selected,
  onChange,
}: QuadrantSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-sm">
      {QUADRANT_ORDER.map((qId) => {
        const q = QUADRANTS[qId];
        const isSelected = selected === qId;
        return (
          <button
            key={qId}
            onClick={() => onChange(qId)}
            className="flex items-center gap-2 px-3 py-3 rounded-md border transition-all duration-150"
            style={{
              borderColor: isSelected ? q.primary : "rgba(255,255,255,0.05)",
              backgroundColor: isSelected ? q.primary + "10" : "transparent",
              boxShadow: isSelected
                ? `0 0 12px ${q.primary}20`
                : "none",
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: q.primary }}
            />
            <div className="text-left">
              <p
                className="text-body-sm font-medium"
                style={{ color: isSelected ? q.primary : "#e4e1e7" }}
              >
                {q.label}
              </p>
              <p className="text-label-sm text-outline">{q.sublabel}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create RepeatSelector**

Create `src/components/ui/RepeatSelector.tsx`:

```tsx
"use client";

import { RepeatType } from "@/lib/types";

const REPEAT_OPTIONS: { value: RepeatType; label: string }[] = [
  { value: "none", label: "없음" },
  { value: "daily", label: "매일" },
  { value: "weekly", label: "매주" },
  { value: "monthly", label: "매월" },
  { value: "yearly", label: "매년" },
];

interface RepeatSelectorProps {
  selected: RepeatType;
  onChange: (r: RepeatType) => void;
}

export default function RepeatSelector({
  selected,
  onChange,
}: RepeatSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {REPEAT_OPTIONS.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-full text-body-sm whitespace-nowrap border transition-all duration-150 ${
              isSelected
                ? "bg-quadrant-plan-primary/10 border-quadrant-plan-primary/40 text-quadrant-plan-primary"
                : "bg-transparent border-white/5 text-outline hover:text-on-surface-variant"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Create AddTodoModal bottom sheet**

Create `src/components/modals/AddTodoModal.tsx`:

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quadrant, RepeatType } from "@/lib/types";
import { toDateString } from "@/lib/date-utils";
import { useTodoContext } from "@/hooks/useTodos";
import QuadrantSelector from "@/components/ui/QuadrantSelector";
import RepeatSelector from "@/components/ui/RepeatSelector";

interface AddTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: Date;
  defaultQuadrant?: Quadrant;
}

export default function AddTodoModal({
  isOpen,
  onClose,
  defaultDate,
  defaultQuadrant,
}: AddTodoModalProps) {
  const { addTodo } = useTodoContext();
  const [title, setTitle] = useState("");
  const [quadrant, setQuadrant] = useState<Quadrant>(
    defaultQuadrant ?? "plan"
  );
  const [date, setDate] = useState(toDateString(defaultDate ?? new Date()));
  const [repeat, setRepeat] = useState<RepeatType>("none");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setQuadrant(defaultQuadrant ?? "plan");
      setDate(toDateString(defaultDate ?? new Date()));
      setRepeat("none");
      setError(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, defaultDate, defaultQuadrant]);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError(true);
      return;
    }
    addTodo({
      title: trimmed,
      quadrant,
      date,
      repeat,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-[90]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[100] bg-surface-container rounded-t-xl px-lg pt-4 pb-6 safe-bottom max-w-2xl mx-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-outline/30" />
            </div>

            {/* Title input */}
            <div className="mb-5">
              <label className="text-label-lg text-on-surface-variant mb-2 block">
                할 일 입력
              </label>
              <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="무엇을 해야 하나요?"
                className={`w-full bg-surface-container-high text-on-surface text-body-lg px-4 py-3 rounded-sm outline-none placeholder:text-outline transition-all ${
                  error
                    ? "ring-2 ring-error animate-[shake_0.3s_ease-in-out]"
                    : "focus:ring-1 focus:ring-quadrant-plan-primary/30"
                }`}
              />
            </div>

            {/* Quadrant selector */}
            <div className="mb-5">
              <label className="text-label-lg text-on-surface-variant mb-2 block">
                사분면 선택
              </label>
              <QuadrantSelector selected={quadrant} onChange={setQuadrant} />
            </div>

            {/* Date */}
            <div className="mb-5">
              <label className="text-label-lg text-on-surface-variant mb-2 block">
                날짜
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-surface-container-high text-on-surface text-body-md px-4 py-2.5 rounded-sm outline-none w-full"
              />
            </div>

            {/* Repeat */}
            <div className="mb-6">
              <label className="text-label-lg text-on-surface-variant mb-2 block">
                반복 설정
              </label>
              <RepeatSelector selected={repeat} onChange={setRepeat} />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-quadrant-plan-container to-[#0450b0] text-white text-body-lg font-semibold transition-all active:scale-[0.98]"
            >
              추가하기
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Add shake animation to globals.css**

Append to `src/app/globals.css`:

```css
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20%,
  60% {
    transform: translateX(-6px);
  }
  40%,
  80% {
    transform: translateX(6px);
  }
}
```

- [ ] **Step 5: Wire AddTodoModal into page**

In `src/app/page.tsx`, add import:

```tsx
import AddTodoModal from "@/components/modals/AddTodoModal";
```

Add before closing `</div>`:

```tsx
<AddTodoModal
  isOpen={showAddModal}
  onClose={() => setShowAddModal(false)}
  defaultDate={selectedDate}
/>
```

- [ ] **Step 6: Verify adding todos**

```bash
npm run dev
```

Expected: Tap FAB → bottom sheet slides up. Enter text, select quadrant, tap "추가하기". Sheet closes, task appears in the correct quadrant.

- [ ] **Step 7: Commit**

```bash
git add src/components/modals/AddTodoModal.tsx src/components/ui/ src/app/globals.css src/app/page.tsx
git commit -m "feat: add todo modal with quadrant selector, repeat options, and validation"
```

---

## Task 7: Drag & Drop Between Quadrants

**Files:**
- Modify: `src/components/matrix/MatrixView.tsx`, `src/components/matrix/QuadrantBox.tsx`, `src/components/matrix/TaskCard.tsx`

- [ ] **Step 1: Make TaskCard draggable**

Update `src/components/matrix/TaskCard.tsx` — add drag support:

```tsx
"use client";

import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Todo } from "@/lib/types";
import { QUADRANTS } from "@/lib/constants";
import { useTodoContext } from "@/hooks/useTodos";

interface TaskCardProps {
  todo: Todo;
  onTap?: () => void;
}

export default function TaskCard({ todo, onTap }: TaskCardProps) {
  const { toggleComplete } = useTodoContext();
  const q = QUADRANTS[todo.quadrant];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id, data: { todo } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : todo.completed ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <motion.div
        layout
        className={`glass-card rounded-md px-3 py-[10px] flex items-center gap-2 cursor-grab select-none active:cursor-grabbing ${
          isDragging
            ? "shadow-[0_20px_40px_rgba(0,0,0,0.4)] scale-[1.04] -rotate-[1.5deg] z-50"
            : ""
        } ${todo.completed ? "line-through" : ""}`}
        onClick={onTap}
      >
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleComplete(todo.id);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex-shrink-0 w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-colors"
          style={{
            borderColor: todo.completed ? q.primary : q.primary + "60",
            backgroundColor: todo.completed ? q.primary : "transparent",
          }}
          aria-label={todo.completed ? "완료 취소" : "완료"}
        >
          {todo.completed && (
            <span className="material-symbols-outlined text-[14px] text-surface">
              check
            </span>
          )}
        </button>

        {/* Title */}
        <span
          className={`text-body-sm text-on-surface flex-1 truncate ${
            todo.completed ? "line-through opacity-60" : ""
          }`}
        >
          {todo.title}
        </span>

        {/* Repeat badge */}
        {todo.repeat !== "none" && (
          <span className="text-[10px] text-outline border border-white/10 px-1.5 py-0.5 rounded-sm">
            반복
          </span>
        )}
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Make QuadrantBox a droppable area**

Update `src/components/matrix/QuadrantBox.tsx`:

```tsx
"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Quadrant } from "@/lib/types";
import { QUADRANTS } from "@/lib/constants";
import { useTodoContext } from "@/hooks/useTodos";
import TaskCard from "./TaskCard";

interface QuadrantBoxProps {
  quadrant: Quadrant;
  date: string;
  onTaskTap?: (todoId: string) => void;
  isOver?: boolean;
}

export default function QuadrantBox({
  quadrant,
  date,
  onTaskTap,
  isOver = false,
}: QuadrantBoxProps) {
  const { getTodosForQuadrant } = useTodoContext();
  const q = QUADRANTS[quadrant];
  const todos = getTodosForQuadrant(quadrant, date);
  const activeCount = todos.filter((t) => !t.completed).length;

  const { setNodeRef } = useDroppable({
    id: `quadrant-${quadrant}`,
    data: { quadrant },
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-surface-container-low rounded-lg flex flex-col overflow-hidden relative transition-all duration-150 ${
        isOver ? "brightness-110" : ""
      }`}
      style={{
        borderLeft: `2px solid ${isOver ? q.primary : q.container}`,
        boxShadow: isOver ? `inset 0 0 20px ${q.primary}10` : "none",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: q.primary }}
          />
          <span className="text-body-sm font-semibold text-on-surface">
            {q.label}
          </span>
          {activeCount > 0 && (
            <span className="text-label-sm text-outline">
              · {activeCount}개
            </span>
          )}
        </div>
        <span
          className="text-label-sm uppercase text-on-surface-variant/50"
          style={{ letterSpacing: "0.1em" }}
        >
          {q.sublabel}
        </span>
      </div>

      {/* Task list */}
      <SortableContext
        items={todos.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 overflow-y-auto quadrant-scroll px-2 pb-2 space-y-sm">
          {todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-body-sm text-outline">{q.emptyTitle}</p>
              <p className="text-label-sm text-outline/60 mt-1">
                {q.emptySub}
              </p>
            </div>
          ) : (
            todos.map((todo) => (
              <TaskCard
                key={todo.id}
                todo={todo}
                onTap={() => onTaskTap?.(todo.id)}
              />
            ))
          )}
        </div>
      </SortableContext>

      {/* Scroll fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-4 pointer-events-none"
        style={{ background: `linear-gradient(transparent, #1b1b1f)` }}
      />
    </div>
  );
}
```

- [ ] **Step 3: Add DndContext to MatrixView**

Update `src/components/matrix/MatrixView.tsx`:

```tsx
"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { QUADRANT_ORDER } from "@/lib/constants";
import { Quadrant, Todo } from "@/lib/types";
import { useTodoContext } from "@/hooks/useTodos";
import QuadrantBox from "./QuadrantBox";

interface MatrixViewProps {
  date: string;
  onTaskTap?: (todoId: string) => void;
}

export default function MatrixView({ date, onTaskTap }: MatrixViewProps) {
  const { moveQuadrant, todos } = useTodoContext();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overQuadrant, setOverQuadrant] = useState<Quadrant | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  const activeTodo = activeId
    ? todos.find((t) => t.id === activeId)
    : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: any) {
    const over = event.over;
    if (!over) {
      setOverQuadrant(null);
      return;
    }
    // Over a quadrant droppable
    if (over.data?.current?.quadrant) {
      setOverQuadrant(over.data.current.quadrant);
    }
    // Over a task card — use the task's quadrant
    else if (over.data?.current?.todo) {
      setOverQuadrant(over.data.current.todo.quadrant);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setOverQuadrant(null);

    if (!over) return;

    const todoId = active.id as string;
    let targetQuadrant: Quadrant | null = null;

    if (over.data?.current?.quadrant) {
      targetQuadrant = over.data.current.quadrant;
    } else if (over.data?.current?.todo) {
      targetQuadrant = over.data.current.todo.quadrant;
    }

    if (targetQuadrant) {
      moveQuadrant(todoId, targetQuadrant);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        className="grid grid-cols-2 gap-sm px-sm"
        style={{ height: "calc(100dvh - 148px)" }}
      >
        {QUADRANT_ORDER.map((q) => (
          <QuadrantBox
            key={q}
            quadrant={q}
            date={date}
            onTaskTap={onTaskTap}
            isOver={overQuadrant === q}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTodo ? (
          <div className="glass-card rounded-md px-3 py-[10px] text-body-sm text-on-surface shadow-[0_20px_40px_rgba(0,0,0,0.4)] scale-[1.04] -rotate-[1.5deg] max-w-[180px]">
            {activeTodo.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
```

- [ ] **Step 4: Verify drag and drop**

```bash
npm run dev
```

Expected: Add 2+ todos to one quadrant. Drag a card — it lifts with scale+rotate. Hover over another quadrant — its border brightens. Drop — card moves to new quadrant. Data persists on refresh.

- [ ] **Step 5: Commit**

```bash
git add src/components/matrix/
git commit -m "feat: add drag-and-drop between quadrants using dnd-kit"
```

---

## Task 8: Task Detail Bottom Sheet

**Files:**
- Create: `src/components/modals/TaskDetailModal.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create TaskDetailModal**

Create `src/components/modals/TaskDetailModal.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Todo, Quadrant } from "@/lib/types";
import { QUADRANTS } from "@/lib/constants";
import { useTodoContext } from "@/hooks/useTodos";
import QuadrantSelector from "@/components/ui/QuadrantSelector";

interface TaskDetailModalProps {
  todoId: string | null;
  onClose: () => void;
}

export default function TaskDetailModal({
  todoId,
  onClose,
}: TaskDetailModalProps) {
  const { todos, updateTodo, deleteTodo, moveQuadrant } = useTodoContext();
  const todo = todoId ? todos.find((t) => t.id === todoId) : null;

  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [quadrant, setQuadrant] = useState<Quadrant>("plan");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setMemo(todo.memo);
      setQuadrant(todo.quadrant);
      setConfirmDelete(false);
    }
  }, [todo]);

  if (!todo) return null;

  const handleSave = () => {
    updateTodo(todo.id, { title: title.trim() || todo.title, memo });
    if (quadrant !== todo.quadrant) {
      moveQuadrant(todo.id, quadrant);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteTodo(todo.id);
    onClose();
  };

  const q = QUADRANTS[todo.quadrant];

  return (
    <AnimatePresence>
      {todoId && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-[90]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[100] bg-surface-container rounded-t-xl px-lg pt-4 pb-6 safe-bottom max-w-2xl mx-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-outline/30" />
            </div>

            {/* Title */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-on-surface text-headline font-display outline-none mb-4"
            />

            {/* Memo */}
            <div className="mb-5">
              <label className="text-label-lg text-on-surface-variant mb-2 block">
                메모
              </label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="메모를 추가하세요"
                rows={3}
                className="w-full bg-surface-container-high text-on-surface text-body-md px-4 py-3 rounded-sm outline-none placeholder:text-outline resize-none"
              />
            </div>

            {/* Quadrant change */}
            <div className="mb-5">
              <label className="text-label-lg text-on-surface-variant mb-2 block">
                사분면 변경
              </label>
              <QuadrantSelector selected={quadrant} onChange={setQuadrant} />
            </div>

            {/* Repeat info */}
            {todo.repeat !== "none" && (
              <div className="mb-5 px-3 py-2 bg-surface-container-high rounded-sm">
                <span className="text-body-sm text-on-surface-variant">
                  반복: {todo.repeat === "daily" && "매일"}
                  {todo.repeat === "weekly" && "매주"}
                  {todo.repeat === "monthly" && "매월"}
                  {todo.repeat === "yearly" && "매년"}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className={`px-5 py-3 rounded-full text-body-md font-medium transition-all ${
                  confirmDelete
                    ? "bg-error-container text-error"
                    : "bg-surface-container-high text-outline hover:text-error"
                }`}
              >
                {confirmDelete ? "정말 삭제" : "삭제"}
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-full bg-gradient-to-r from-quadrant-plan-container to-[#0450b0] text-white text-body-md font-semibold"
              >
                저장
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Wire TaskDetailModal into page**

In `src/app/page.tsx`, add import:

```tsx
import TaskDetailModal from "@/components/modals/TaskDetailModal";
```

Add before `<AddTodoModal>`:

```tsx
<TaskDetailModal
  todoId={detailTodoId}
  onClose={() => setDetailTodoId(null)}
/>
```

- [ ] **Step 3: Verify task detail flow**

```bash
npm run dev
```

Expected: Tap a task card → detail sheet slides up. Edit title, memo, change quadrant. Save persists changes. Delete with double-tap confirmation.

- [ ] **Step 4: Commit**

```bash
git add src/components/modals/TaskDetailModal.tsx src/app/page.tsx
git commit -m "feat: add task detail bottom sheet with edit, quadrant change, and delete"
```

---

## Task 9: Calendar View

**Files:**
- Create: `src/components/calendar/CalendarView.tsx`, `src/components/calendar/CalendarGrid.tsx`, `src/components/calendar/DayTaskList.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create CalendarGrid component**

Create `src/components/calendar/CalendarGrid.tsx`:

```tsx
"use client";

import { useMemo } from "react";
import {
  getCalendarGrid,
  formatMonthKR,
  toDateString,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "@/lib/date-utils";
import { QUADRANTS, QUADRANT_ORDER } from "@/lib/constants";
import { useTodoContext } from "@/hooks/useTodos";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface CalendarGridProps {
  currentMonth: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onMonthChange: (date: Date) => void;
}

export default function CalendarGrid({
  currentMonth,
  selectedDate,
  onSelectDate,
  onMonthChange,
}: CalendarGridProps) {
  const { todos } = useTodoContext();
  const grid = useMemo(() => getCalendarGrid(currentMonth), [currentMonth]);

  // Build a map of date -> quadrants that have todos
  const dateDots = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    todos.forEach((t) => {
      if (!map[t.date]) map[t.date] = new Set();
      map[t.date].add(t.quadrant);
    });
    return map;
  }, [todos]);

  return (
    <div className="px-lg">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface rounded-full"
          aria-label="이전 달"
        >
          <span className="material-symbols-outlined text-[20px]">
            chevron_left
          </span>
        </button>
        <h2 className="font-display text-headline text-on-surface">
          {formatMonthKR(currentMonth)}
        </h2>
        <button
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface rounded-full"
          aria-label="다음 달"
        >
          <span className="material-symbols-outlined text-[20px]">
            chevron_right
          </span>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-label-sm text-outline py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {grid.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} className="h-11" />;
          }

          const dateStr = toDateString(day);
          const isSelected = isSameDay(day, selectedDate);
          const today = isToday(day);
          const dots = dateDots[dateStr];

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(day)}
              className={`h-11 flex flex-col items-center justify-center rounded-full mx-auto w-11 transition-all ${
                isSelected
                  ? "bg-quadrant-plan-container text-white"
                  : today
                    ? "ring-1 ring-quadrant-plan-primary/40 text-quadrant-plan-primary"
                    : "text-on-surface hover:bg-surface-container-high"
              }`}
              aria-label={dateStr}
            >
              <span className="text-body-sm">{day.getDate()}</span>
              {/* Color dots */}
              {dots && dots.size > 0 && (
                <div className="flex gap-[1px] mt-[1px]">
                  {QUADRANT_ORDER.filter((q) => dots.has(q))
                    .slice(0, 4)
                    .map((q) => (
                      <span
                        key={q}
                        className="w-[3px] h-[3px] rounded-full"
                        style={{
                          backgroundColor: QUADRANTS[q].primary,
                        }}
                      />
                    ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create DayTaskList component**

Create `src/components/calendar/DayTaskList.tsx`:

```tsx
"use client";

import { formatDateKR, toDateString } from "@/lib/date-utils";
import { QUADRANTS } from "@/lib/constants";
import { useTodoContext } from "@/hooks/useTodos";

interface DayTaskListProps {
  selectedDate: Date;
  onTaskTap?: (todoId: string) => void;
}

export default function DayTaskList({
  selectedDate,
  onTaskTap,
}: DayTaskListProps) {
  const { getTodosForDate, toggleComplete } = useTodoContext();
  const dateStr = toDateString(selectedDate);
  const todos = getTodosForDate(dateStr);

  return (
    <div className="px-lg mt-6">
      <h3 className="font-display text-body-lg text-on-surface mb-3">
        {formatDateKR(selectedDate)}
      </h3>

      {todos.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-body-md text-outline">할 일이 없습니다</p>
          <p className="text-label-sm text-outline/60 mt-1">
            + 버튼으로 추가해보세요
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {todos.map((todo) => {
            const q = QUADRANTS[todo.quadrant];
            return (
              <div
                key={todo.id}
                className="glass-card rounded-md px-3 py-3 flex items-center gap-3 cursor-pointer"
                onClick={() => onTaskTap?.(todo.id)}
              >
                {/* Quadrant dot + checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleComplete(todo.id);
                  }}
                  className="flex-shrink-0 w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center"
                  style={{
                    borderColor: todo.completed
                      ? q.primary
                      : q.primary + "60",
                    backgroundColor: todo.completed
                      ? q.primary
                      : "transparent",
                  }}
                >
                  {todo.completed && (
                    <span className="material-symbols-outlined text-[14px] text-surface">
                      check
                    </span>
                  )}
                </button>

                <span
                  className={`text-body-sm flex-1 ${
                    todo.completed
                      ? "line-through text-outline"
                      : "text-on-surface"
                  }`}
                >
                  {todo.title}
                </span>

                {todo.repeat !== "none" && (
                  <span className="text-[10px] text-outline border border-white/10 px-1.5 py-0.5 rounded-sm">
                    반복
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create CalendarView container**

Create `src/components/calendar/CalendarView.tsx`:

```tsx
"use client";

import { useState } from "react";
import CalendarGrid from "./CalendarGrid";
import DayTaskList from "./DayTaskList";

interface CalendarViewProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onTaskTap?: (todoId: string) => void;
}

export default function CalendarView({
  selectedDate,
  onSelectDate,
  onTaskTap,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  return (
    <div className="py-4">
      <CalendarGrid
        currentMonth={currentMonth}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        onMonthChange={setCurrentMonth}
      />
      <DayTaskList selectedDate={selectedDate} onTaskTap={onTaskTap} />
    </div>
  );
}
```

- [ ] **Step 4: Integrate CalendarView into page**

In `src/app/page.tsx`, add import:

```tsx
import CalendarView from "@/components/calendar/CalendarView";
```

Replace calendar placeholder:

```tsx
{activeTab === "calendar" && (
  <CalendarView
    selectedDate={selectedDate}
    onSelectDate={setSelectedDate}
    onTaskTap={(id) => setDetailTodoId(id)}
  />
)}
```

- [ ] **Step 5: Verify calendar view**

```bash
npm run dev
```

Expected: Calendar tab shows monthly grid. Today is highlighted. Dates with todos show colored dots. Tapping a date shows its tasks below. Month nav arrows work.

- [ ] **Step 6: Commit**

```bash
git add src/components/calendar/ src/app/page.tsx
git commit -m "feat: add calendar view with monthly grid, color dots, and day task list"
```

---

## Task 10: Weekly Report — Donut Chart, Personality Type, Achievements

**Files:**
- Create: `src/lib/report-utils.ts`, `src/components/report/ReportView.tsx`, `src/components/report/DonutChart.tsx`, `src/components/report/PersonalityCard.tsx`, `src/components/report/AchievementBar.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create report utilities**

Create `src/lib/report-utils.ts`:

```ts
import { Todo, Quadrant } from "./types";
import { PERSONALITY_TYPES, QUADRANT_ORDER } from "./constants";
import {
  getWeekRange,
  toDateString,
  eachDayOfInterval,
} from "./date-utils";
import { eachDayOfInterval as eachDay } from "date-fns";

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
  const days = eachDay({ start, end });
  const dateStrings = days.map((d) => toDateString(d));

  // Filter todos for this week
  const weekTodos = todos.filter((t) => dateStrings.includes(t.date));
  const completed = weekTodos.filter((t) => t.completed);

  // Count by quadrant (completed only for ratios)
  const counts: Record<Quadrant, number> = { do: 0, plan: 0, delegate: 0, delete: 0 };
  const completedCounts: Record<Quadrant, number> = { do: 0, plan: 0, delegate: 0, delete: 0 };

  weekTodos.forEach((t) => {
    counts[t.quadrant]++;
    if (t.completed) completedCounts[t.quadrant]++;
  });

  const total = weekTodos.length;
  const ratios: Record<Quadrant, number> = {
    do: total > 0 ? counts.do / total : 0,
    plan: total > 0 ? counts.plan / total : 0,
    delegate: total > 0 ? counts.delegate / total : 0,
    delete: total > 0 ? counts.delete / total : 0,
  };

  // Determine personality type
  const types = Object.values(PERSONALITY_TYPES);
  const personalityType =
    types.find((t) => t.condition(ratios)) ?? PERSONALITY_TYPES.balancer;

  // Recurring task stats
  const recurringTemplates = todos.filter(
    (t) => t.repeat !== "none"
  );
  const seen = new Set<string>();
  const recurringTasks: RecurringTaskStat[] = [];

  recurringTemplates.forEach((template) => {
    // Dedupe by base title
    const key = template.title;
    if (seen.has(key)) return;
    seen.add(key);

    const instances = weekTodos.filter(
      (t) => t.title === template.title && t.repeat !== "none"
    );
    const achieved = instances.filter((t) => t.completed).length;
    const expectedDays =
      template.repeat === "daily"
        ? 7
        : template.repeat === "weekly"
          ? 1
          : template.repeat === "monthly"
            ? 1
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
```

- [ ] **Step 2: Create DonutChart component**

Create `src/components/report/DonutChart.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { Chart, DoughnutController, ArcElement, Tooltip } from "chart.js";
import { Quadrant } from "@/lib/types";
import { QUADRANTS, QUADRANT_ORDER } from "@/lib/constants";

Chart.register(DoughnutController, ArcElement, Tooltip);

interface DonutChartProps {
  counts: Record<Quadrant, number>;
}

export default function DonutChart({ counts }: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: QUADRANT_ORDER.map((q) => QUADRANTS[q].label),
        datasets: [
          {
            data: QUADRANT_ORDER.map((q) => counts[q]),
            backgroundColor: QUADRANT_ORDER.map(
              (q) => QUADRANTS[q].primary
            ),
            borderWidth: 0,
            borderRadius: 4,
            spacing: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: "65%",
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const pct =
                  total > 0
                    ? Math.round((ctx.parsed / total) * 100)
                    : 0;
                return ` ${ctx.label}: ${pct}%`;
              },
            },
          },
        },
        animation: {
          animateRotate: true,
          duration: 700,
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [counts]);

  return (
    <div className="relative w-48 h-48 mx-auto">
      <canvas ref={canvasRef} />
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-display-md font-display text-on-surface">
          {Object.values(counts).reduce((a, b) => a + b, 0)}
        </span>
        <span className="text-label-sm text-outline">전체 할 일</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create PersonalityCard component**

Create `src/components/report/PersonalityCard.tsx`:

```tsx
"use client";

import { QUADRANTS, QUADRANT_ORDER } from "@/lib/constants";
import { Quadrant } from "@/lib/types";

interface PersonalityCardProps {
  type: {
    name: string;
    icon: string;
    description: string;
    advice: string;
  };
  ratios: Record<Quadrant, number>;
}

export default function PersonalityCard({
  type,
  ratios,
}: PersonalityCardProps) {
  return (
    <div className="glass-card rounded-lg p-5 obsidian-gradient">
      {/* Type header */}
      <div className="flex items-center gap-3 mb-4">
        <span
          className="material-symbols-outlined text-[28px] text-quadrant-plan-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {type.icon}
        </span>
        <div>
          <h3 className="font-display text-headline text-on-surface">
            {type.name}
          </h3>
          <p className="text-body-sm text-on-surface-variant">
            {type.description}
          </p>
        </div>
      </div>

      {/* Quadrant bars */}
      <div className="space-y-2.5 mb-5">
        {QUADRANT_ORDER.map((qId) => {
          const q = QUADRANTS[qId];
          const pct = Math.round(ratios[qId] * 100);
          return (
            <div key={qId} className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: q.primary }}
              />
              <span className="text-label-sm text-on-surface-variant w-14">
                {q.label}
              </span>
              <div className="flex-1 h-2 bg-surface-container-high rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: q.primary,
                  }}
                />
              </div>
              <span className="text-label-sm text-outline w-8 text-right">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Advice */}
      <div className="border-t border-white/5 pt-4">
        <p className="text-body-sm text-on-surface-variant italic">
          <span className="text-quadrant-plan-primary">
            아이젠하워:
          </span>{" "}
          &ldquo;{type.advice}&rdquo;
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create AchievementBar component**

Create `src/components/report/AchievementBar.tsx`:

```tsx
"use client";

import { QUADRANTS } from "@/lib/constants";
import { RecurringTaskStat } from "@/lib/report-utils";

interface AchievementBarProps {
  task: RecurringTaskStat;
}

export default function AchievementBar({ task }: AchievementBarProps) {
  const q = QUADRANTS[task.quadrant];
  const pct = task.total > 0 ? Math.round((task.achieved / task.total) * 100) : 0;
  const isComplete = task.achieved >= task.total;

  return (
    <div className="flex items-center gap-3">
      <span className="text-body-sm text-on-surface w-24 truncate">
        {task.title}
      </span>
      <div className="flex-1 h-2 bg-surface-container-high rounded-sm overflow-hidden">
        <div
          className="h-full rounded-sm transition-all duration-700"
          style={{
            width: `${pct}%`,
            backgroundColor: q.primary,
          }}
        />
      </div>
      <span className="text-label-sm text-outline w-20 text-right">
        {isComplete ? (
          <span className="text-[#34d399]">완료</span>
        ) : (
          `${task.achieved}/${task.total} (${pct}%)`
        )}
      </span>
    </div>
  );
}
```

- [ ] **Step 5: Create ReportView container**

Create `src/components/report/ReportView.tsx`:

```tsx
"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useTodoContext } from "@/hooks/useTodos";
import {
  getWeekRange,
  addDays,
  subMonths,
} from "@/lib/date-utils";
import { calculateWeeklyStats } from "@/lib/report-utils";
import DonutChart from "./DonutChart";
import PersonalityCard from "./PersonalityCard";
import AchievementBar from "./AchievementBar";

export default function ReportView() {
  const { todos } = useTodoContext();
  const [weekOffset, setWeekOffset] = useState(0);

  const targetDate = useMemo(() => {
    const today = new Date();
    return addDays(today, weekOffset * 7);
  }, [weekOffset]);

  const { start, end } = getWeekRange(targetDate);
  const stats = useMemo(
    () => calculateWeeklyStats(todos, targetDate),
    [todos, targetDate]
  );

  const weekLabel = `${format(start, "M월 d일", { locale: ko })} ~ ${format(end, "M월 d일", { locale: ko })}`;

  return (
    <div className="px-lg py-4 max-w-md mx-auto space-y-8">
      {/* Week nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekOffset((w) => Math.max(w - 1, -4))}
          className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface rounded-full"
          aria-label="이전 주"
        >
          <span className="material-symbols-outlined text-[20px]">
            chevron_left
          </span>
        </button>
        <div className="text-center">
          <h2 className="font-display text-headline text-on-surface">
            이번 주 리포트
          </h2>
          <p className="text-label-sm text-outline mt-1">{weekLabel}</p>
        </div>
        <button
          onClick={() => setWeekOffset((w) => Math.min(w + 1, 0))}
          className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface rounded-full"
          disabled={weekOffset >= 0}
          aria-label="다음 주"
        >
          <span
            className={`material-symbols-outlined text-[20px] ${weekOffset >= 0 ? "opacity-20" : ""}`}
          >
            chevron_right
          </span>
        </button>
      </div>

      {stats.total === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-[48px] text-outline/40 mb-4 block">
            insert_chart
          </span>
          <p className="text-body-lg text-outline">
            아직 데이터가 부족해요
          </p>
          <p className="text-body-sm text-outline/60 mt-1">
            이번 주를 채워보세요!
          </p>
        </div>
      ) : (
        <>
          {/* Donut chart */}
          <section>
            <h3 className="font-display text-body-lg text-on-surface mb-4">
              사분면별 비율
            </h3>
            <DonutChart counts={stats.counts} />
          </section>

          {/* Personality */}
          <section>
            <h3 className="font-display text-body-lg text-on-surface mb-4">
              나의 시간 사용 유형
            </h3>
            <PersonalityCard
              type={stats.personalityType}
              ratios={stats.ratios}
            />
          </section>

          {/* Recurring achievement */}
          {stats.recurringTasks.length > 0 && (
            <section>
              <h3 className="font-display text-body-lg text-on-surface mb-4">
                반복 달성률
              </h3>
              <div className="space-y-3">
                {stats.recurringTasks.map((task) => (
                  <AchievementBar key={task.title} task={task} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Integrate ReportView into page**

In `src/app/page.tsx`, add import:

```tsx
import ReportView from "@/components/report/ReportView";
```

Replace report placeholder:

```tsx
{activeTab === "report" && <ReportView />}
```

- [ ] **Step 7: Verify report renders**

```bash
npm run dev
```

Expected: Report tab shows empty state when no data. Add several todos across quadrants and complete some. Report shows donut chart, personality type card with advice, and recurring task achievement bars.

- [ ] **Step 8: Commit**

```bash
git add src/lib/report-utils.ts src/components/report/ src/app/page.tsx
git commit -m "feat: add weekly report with donut chart, personality type, and achievement bars"
```

---

## Task 11: Share Card & Markdown Export

**Files:**
- Create: `src/components/share/ShareCard.tsx`
- Modify: `src/components/report/ReportView.tsx`

- [ ] **Step 1: Create ShareCard component (html2canvas-safe, no SVG filters)**

Create `src/components/share/ShareCard.tsx`:

```tsx
"use client";

import { forwardRef } from "react";
import { Quadrant } from "@/lib/types";
import { QUADRANTS, QUADRANT_ORDER } from "@/lib/constants";

interface ShareCardProps {
  personalityName: string;
  personalityIcon: string;
  ratios: Record<Quadrant, number>;
  recurringRate: number;
  quote: string;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ personalityName, personalityIcon, ratios, recurringRate, quote }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[1080px] h-[1350px] p-16 flex flex-col justify-between"
        style={{
          background: "linear-gradient(180deg, #131317 0%, #0e0e12 100%)",
          fontFamily: "'Manrope', 'Inter', sans-serif",
        }}
      >
        {/* Header */}
        <div>
          <p
            style={{
              fontSize: "28px",
              color: "#8c909f",
              marginBottom: "16px",
            }}
          >
            나의 시간 사용 유형
          </p>
          <h1
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: "#e4e1e7",
              marginBottom: "12px",
            }}
          >
            {personalityName}
          </h1>
        </div>

        {/* Bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {QUADRANT_ORDER.map((qId) => {
            const q = QUADRANTS[qId];
            const pct = Math.round(ratios[qId] * 100);
            return (
              <div key={qId}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    fontSize: "24px",
                  }}
                >
                  <span style={{ color: q.primary }}>{q.label}</span>
                  <span style={{ color: "#8c909f" }}>{pct}%</span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "16px",
                    backgroundColor: "#2a292e",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      backgroundColor: q.primary,
                      borderRadius: "4px",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recurring rate */}
        <div style={{ fontSize: "24px", color: "#c2c6d6" }}>
          반복 달성률: {recurringRate}%
        </div>

        {/* Quote */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: "40px",
          }}
        >
          <p
            style={{
              fontSize: "28px",
              color: "#c2c6d6",
              fontStyle: "italic",
              lineHeight: 1.6,
            }}
          >
            <span style={{ color: "#adc6ff" }}>아이젠하워:</span>
            <br />
            &ldquo;{quote}&rdquo;
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "24px",
              color: "#8c909f",
            }}
          >
            아이젠하워 투두
          </span>
          <span
            style={{
              fontSize: "20px",
              color: "#adc6ff",
            }}
          >
            나도 해보기 →
          </span>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = "ShareCard";
export default ShareCard;
```

- [ ] **Step 2: Add share and export functions to ReportView**

In `src/components/report/ReportView.tsx`, add the share/export logic. Add imports at top:

```tsx
import { useRef, useCallback } from "react";
import html2canvas from "html2canvas";
import ShareCard from "@/components/share/ShareCard";
```

Add inside the component, after the `stats` memo:

```tsx
const shareRef = useRef<HTMLDivElement>(null);
const [showShareCard, setShowShareCard] = useState(false);

const handleShare = useCallback(async () => {
  setShowShareCard(true);
  // Wait for render
  await new Promise((r) => setTimeout(r, 100));

  if (!shareRef.current) return;
  try {
    const canvas = await html2canvas(shareRef.current, {
      scale: 1,
      backgroundColor: "#131317",
      useCORS: true,
    });
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/png")
    );

    if (navigator.share && navigator.canShare) {
      const file = new File([blob], "eisenhower-report.png", {
        type: "image/png",
      });
      await navigator.share({
        title: "나의 시간 사용 유형",
        files: [file],
      });
    } else {
      // Fallback: download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "eisenhower-report.png";
      a.click();
      URL.revokeObjectURL(url);
    }
  } catch {
    // User cancelled or error
  }
  setShowShareCard(false);
}, []);

const handleExportMD = useCallback(() => {
  const lines: string[] = [];
  lines.push(`# ${weekLabel}\n`);

  const quadrantLabels = { do: "즉시 실행", plan: "계획 수립", delegate: "위임", delete: "제거" };
  const dateStrings: string[] = [];
  const d = new Date(start);
  while (d <= end) {
    dateStrings.push(toDateString(d));
    d.setDate(d.getDate() + 1);
  }

  const weekTodos = todos.filter((t) => dateStrings.includes(t.date));

  (["do", "plan", "delegate", "delete"] as const).forEach((qId) => {
    const qTodos = weekTodos.filter((t) => t.quadrant === qId);
    if (qTodos.length === 0) return;
    lines.push(`## ${quadrantLabels[qId]}\n`);
    qTodos.forEach((t) => {
      const check = t.completed ? "x" : " ";
      const repeat = t.repeat !== "none" ? " 🔁" : "";
      lines.push(`- [${check}] ${t.title}${repeat}`);
    });
    lines.push("");
  });

  lines.push(`---`);
  lines.push(`유형: ${stats.personalityType.name}`);

  const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `eisenhower-${format(start, "yyyy-MM-dd")}.md`;
  a.click();
  URL.revokeObjectURL(url);
}, [todos, start, end, weekLabel, stats]);
```

Add import for `toDateString`:
```tsx
import { getWeekRange, addDays, toDateString } from "@/lib/date-utils";
```

Add action buttons after the recurring tasks section (inside the `stats.total > 0` block):

```tsx
{/* Action buttons */}
<div className="flex gap-3">
  <button
    onClick={handleShare}
    className="flex-1 py-3 rounded-full glass-card text-body-md font-medium text-on-surface flex items-center justify-center gap-2"
  >
    <span className="material-symbols-outlined text-[18px]">share</span>
    공유하기
  </button>
  <button
    onClick={handleExportMD}
    className="flex-1 py-3 rounded-full glass-card text-body-md font-medium text-on-surface flex items-center justify-center gap-2"
  >
    <span className="material-symbols-outlined text-[18px]">
      download
    </span>
    마크다운
  </button>
</div>
```

Add the hidden share card render (at the very end of the component, before closing):

```tsx
{/* Hidden share card for capture */}
{showShareCard && (
  <div className="fixed -left-[9999px] top-0">
    <ShareCard
      ref={shareRef}
      personalityName={stats.personalityType.name}
      personalityIcon={stats.personalityType.icon}
      ratios={stats.ratios}
      recurringRate={
        stats.recurringTasks.length > 0
          ? Math.round(
              (stats.recurringTasks.reduce(
                (sum, t) => sum + t.achieved,
                0
              ) /
                stats.recurringTasks.reduce(
                  (sum, t) => sum + t.total,
                  0
                )) *
                100
            )
          : 0
      }
      quote={stats.personalityType.advice}
    />
  </div>
)}
```

- [ ] **Step 3: Verify share and export**

```bash
npm run dev
```

Expected: Report shows "공유하기" and "마크다운" buttons. Share downloads a PNG (or opens native share on mobile). Markdown downloads a `.md` file with proper checkbox format.

- [ ] **Step 4: Commit**

```bash
git add src/components/share/ src/components/report/ReportView.tsx
git commit -m "feat: add SNS share card (html2canvas) and markdown export"
```

---

## Task 12: Onboarding

**Files:**
- Create: `src/components/onboarding/Onboarding.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create 3-step onboarding**

Create `src/components/onboarding/Onboarding.tsx`:

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { markOnboardingDone } from "@/lib/storage";

const STEPS = [
  {
    title: "아이젠하워 매트릭스",
    description:
      "모든 할 일을 긴급/중요로 나눠 4사분면에 배치하세요.\n가장 중요한 건 2사분면 — 여기가 인생을 바꾸는 곳입니다.",
    icon: "grid_view",
  },
  {
    title: "드래그로 재배치",
    description:
      "할 일의 우선순위가 바뀌었나요?\n카드를 드래그해서 다른 사분면으로 옮기세요.",
    icon: "drag_indicator",
  },
  {
    title: "주간 리포트",
    description:
      "매주 당신의 시간 사용 패턴을 분석합니다.\n소방관형? 전략가형? 나는 어떤 유형일까요?",
    icon: "bar_chart",
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      markOnboardingDone();
      onComplete();
    }
  };

  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-[200] bg-surface flex flex-col items-center justify-center px-lg">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col items-center text-center max-w-sm"
        >
          <span
            className="material-symbols-outlined text-[64px] text-quadrant-plan-primary mb-8"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 300" }}
          >
            {current.icon}
          </span>
          <h2 className="font-display text-display-md text-on-surface mb-4">
            {current.title}
          </h2>
          <p className="text-body-md text-on-surface-variant whitespace-pre-line leading-relaxed">
            {current.description}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex gap-2 mt-12 mb-8">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === step
                ? "bg-quadrant-plan-primary w-6"
                : "bg-outline/30"
            }`}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-4 w-full max-w-sm">
        {step < STEPS.length - 1 ? (
          <>
            <button
              onClick={() => {
                markOnboardingDone();
                onComplete();
              }}
              className="px-6 py-3 text-body-md text-outline"
            >
              건너뛰기
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3 rounded-full bg-gradient-to-r from-quadrant-plan-container to-[#0450b0] text-white text-body-md font-semibold"
            >
              다음
            </button>
          </>
        ) : (
          <button
            onClick={handleNext}
            className="flex-1 py-3 rounded-full bg-gradient-to-r from-quadrant-plan-container to-[#0450b0] text-white text-body-md font-semibold"
          >
            시작하기
          </button>
        )}
      </div>

      {/* Quote */}
      <p className="text-label-sm text-outline/50 mt-12 italic">
        &ldquo;긴급한 것은 중요하지 않고, 중요한 것은 긴급하지 않다&rdquo;
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Wire onboarding into page**

In `src/app/page.tsx`, add imports:

```tsx
import { useState, useEffect } from "react";
import Onboarding from "@/components/onboarding/Onboarding";
import { isOnboardingDone } from "@/lib/storage";
```

Add state:

```tsx
const [showOnboarding, setShowOnboarding] = useState(false);

useEffect(() => {
  if (!isOnboardingDone()) {
    setShowOnboarding(true);
  }
}, []);
```

Add before the main layout:

```tsx
{showOnboarding && (
  <Onboarding onComplete={() => setShowOnboarding(false)} />
)}
```

- [ ] **Step 3: Verify onboarding**

Clear localStorage in browser, reload. Expected: 3-step onboarding appears. Can skip or navigate through. After completing, main app shows. Does not reappear on refresh.

- [ ] **Step 4: Commit**

```bash
git add src/components/onboarding/ src/app/page.tsx
git commit -m "feat: add 3-step interactive onboarding tutorial"
```

---

## Task 13: Final Polish & Build Verification

**Files:**
- Modify: various files for final fixes

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Fix any TypeScript or build errors.

- [ ] **Step 2: Test all flows end to end**

Checklist:
- Onboarding appears on first visit, can be skipped or completed
- Matrix tab: 2x2 grid, empty states, add todo via FAB, cards appear in correct quadrant
- Drag & drop: cards move between quadrants, data persists
- Task detail: tap card → bottom sheet, edit title/memo/quadrant, delete with confirmation
- Calendar tab: monthly grid, colored dots, day task list, month navigation
- Report tab: donut chart, personality type, achievement bars, week navigation
- Share: downloads PNG or opens share sheet
- Markdown export: downloads .md file with checkboxes
- All data persists across refresh (localStorage)

- [ ] **Step 3: Commit final state**

```bash
git add -A && git commit -m "chore: fix build errors and finalize v1.0"
```

---

## Spec Coverage Checklist

| Requirement (from eisenhower_todo_v1.md) | Task |
|---|---|
| 캘린더 뷰 (날짜별 할 일) | Task 9 |
| 할 일 추가/수정/삭제/완료 | Task 6, 8 |
| 사분면 선택 (추가 시 긴급/중요) | Task 6 |
| 매트릭스 뷰 (4사분면 + 드래그 앤 드롭) | Task 5, 7 |
| 반복 할 일 설정 | Task 6 (RepeatSelector) |
| 주간 시간 사용 유형 | Task 10 |
| 공유 카드 (SNS) | Task 11 |
| 마크다운 내보내기 | Task 11 |
| localStorage 저장 | Task 3 |
| 온보딩 | Task 12 |
| 다크 테마 전용 | Task 1 (globals.css) |
| Manrope + Inter 폰트 | Task 1 (layout.tsx) |
| Material Symbols 아이콘 | Task 1 (layout.tsx) |
| Glass card + blur(32px) | Task 1 (globals.css) |
| 사분면별 empty state 메시지 | Task 2 (constants), Task 5 |
| WCAG AA 접근성 (44px touch, aria labels) | Throughout |
