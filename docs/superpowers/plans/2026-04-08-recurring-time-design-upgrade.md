# 반복 세부 옵션 + 시간 피커 + 디자인 시스템 업그레이드 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 반복 할 일 세부 옵션(매주 요일, 매월 날짜), 시작~종료 시간 피커, Notion 기반 라이트/다크 모드, 매트릭스 축 화살표, 앱 로고, 온보딩 개선을 구현한다.

**Architecture:** 데이터 모델에 startTime/endTime 추가 → 새 UI 컴포넌트(TimePicker, WeekDayPicker, MonthDatePicker) → AddTodoModal/TaskDetailModal에 접이식 섹션으로 통합 → CSS 변수 기반 라이트/다크 모드 토큰 → 매트릭스 뷰에 SVG 축 화살표 → 온보딩 1단계 리디자인.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion, date-fns

**Spec:** `docs/superpowers/specs/2026-04-08-recurring-time-design-upgrade-design.md`

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/lib/types.ts` | Todo에 startTime/endTime 추가 |
| Modify | `src/providers/TodoProvider.tsx` | addTodo에 startTime/endTime 전달 |
| Create | `src/components/ui/TimePicker.tsx` | 인라인 시간 범위 피커 |
| Create | `src/components/ui/WeekDayPicker.tsx` | 원형 칩 요일 선택 |
| Create | `src/components/ui/MonthDatePicker.tsx` | 인라인 숫자 날짜 피커 |
| Create | `src/components/ui/CollapsibleSection.tsx` | 접이식 섹션 래퍼 |
| Modify | `src/components/ui/RepeatSelector.tsx` | 세부 피커 통합 |
| Modify | `src/components/modals/AddTodoModal.tsx` | 시간+반복 접이식 섹션 |
| Modify | `src/components/modals/TaskDetailModal.tsx` | 시간+반복 편집 가능 |
| Modify | `src/components/matrix/TaskCard.tsx` | 시간 뱃지 표시 |
| Create | `src/components/matrix/AxisArrows.tsx` | 그라디언트 축 화살표 SVG |
| Modify | `src/components/matrix/MatrixView.tsx` | AxisArrows 통합 |
| Create | `src/components/common/AppLogo.tsx` | 미니 4색 그리드 로고 |
| Modify | `src/components/layout/Header.tsx` | 로고 추가 |
| Modify | `src/components/onboarding/Onboarding.tsx` | 1단계 매트릭스 다이어그램 리디자인 |
| Create | `src/providers/ThemeProvider.tsx` | 라이트/다크 모드 컨텍스트 |
| Modify | `src/app/globals.css` | CSS 변수 라이트/다크 토큰 |
| Modify | `tailwind.config.ts` | CSS 변수 참조로 변경 |
| Modify | `src/app/layout.tsx` | ThemeProvider 래핑 |
| Modify | `src/lib/storage.ts` | 테마 설정 저장/불러오기 |

---

### Task 1: 데이터 모델에 startTime/endTime 추가

**Files:**
- Modify: `src/lib/types.ts:9-26`
- Modify: `src/providers/TodoProvider.tsx:75-95`

- [ ] **Step 1: types.ts에 시간 필드 추가**

```typescript
// src/lib/types.ts — Todo 인터페이스에 추가
export interface Todo {
  id: string;
  title: string;
  quadrant: Quadrant;
  date: string;
  completed: boolean;
  completedAt: string | null;
  repeat: RepeatType;
  repeatDays?: number[];
  repeatDate?: number;
  repeatMonth?: number;
  startTime?: string; // "HH:mm" (예: "09:00")
  endTime?: string;   // "HH:mm" (예: "11:00")
  memo: string;
  createdAt: string;
  order: number;
}
```

- [ ] **Step 2: TodoProvider의 addTodo에 startTime/endTime 전달**

`src/providers/TodoProvider.tsx`의 `addTodo` 파라미터에 추가:

```typescript
// TodoContextValue의 addTodo 시그니처 변경 (약 line 57)
addTodo(params: {
  title: string;
  quadrant: Quadrant;
  date: string;
  repeat: RepeatType;
  repeatDays?: number[];
  repeatDate?: number;
  repeatMonth?: number;
  startTime?: string;
  endTime?: string;
  memo?: string;
}): void;
```

`ADD` 액션 디스패치에도 반영:

```typescript
// addTodo 함수 내부 (약 line 80)
addTodo: (params) => {
  dispatch({
    type: "ADD",
    payload: {
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
      startTime: params.startTime,
      endTime: params.endTime,
      memo: params.memo ?? "",
      createdAt: new Date().toISOString(),
      order: state.todos.length,
    },
  });
},
```

- [ ] **Step 3: 빌드 확인**

Run: `npm run build`
Expected: 성공 (기존 코드에서 startTime/endTime은 optional이므로 깨지지 않음)

- [ ] **Step 4: 커밋**

```bash
git add src/lib/types.ts src/providers/TodoProvider.tsx
git commit -m "feat: add startTime/endTime fields to Todo model"
```

---

### Task 2: CollapsibleSection 컴포넌트

**Files:**
- Create: `src/components/ui/CollapsibleSection.tsx`

- [ ] **Step 1: CollapsibleSection 구현**

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CollapsibleSectionProps {
  icon: string;
  label: string;
  summary?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function CollapsibleSection({
  icon,
  label,
  summary,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-surface-container-low rounded-[10px] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-[14px] py-[10px]"
      >
        <div className="flex items-center gap-2">
          <span className="text-[14px]">{icon}</span>
          <span className="text-body-sm text-on-surface-variant">
            {open ? label : summary || label}
          </span>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[11px] text-outline"
        >
          ▼
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-[14px] pb-3 pt-1 border-t border-white/5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: 빌드 확인**

Run: `npm run build`
Expected: 성공

- [ ] **Step 3: 커밋**

```bash
git add src/components/ui/CollapsibleSection.tsx
git commit -m "feat: add CollapsibleSection component"
```

---

### Task 3: TimePicker 컴포넌트

**Files:**
- Create: `src/components/ui/TimePicker.tsx`

- [ ] **Step 1: TimePicker 구현**

```tsx
"use client";

interface TimePickerProps {
  startTime: string; // "HH:mm"
  endTime: string;
  onChange: (start: string, end: string) => void;
}

function parseTime(t: string): [number, number] {
  const [h, m] = t.split(":").map(Number);
  return [h, m];
}

function formatTime(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function adjustTime(time: string, delta: number): string {
  const [h, m] = parseTime(time);
  let total = h * 60 + m + delta * 30;
  if (total < 0) total = 23 * 60 + 30;
  if (total >= 24 * 60) total = 0;
  return formatTime(Math.floor(total / 60), total % 60);
}

function TimeBox({
  value,
  color,
  onIncrement,
  onDecrement,
}: {
  value: string;
  color: string;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  const [h, m] = value.split(":");
  return (
    <div className="flex items-center gap-1">
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={onIncrement}
          className="w-7 h-5 flex items-center justify-center text-[10px] text-outline active:text-on-surface"
        >
          ▲
        </button>
        <div className="flex items-center gap-[3px]">
          <div className="bg-surface-container-high rounded-lg px-[10px] py-[6px]">
            <span className="text-[18px] font-bold" style={{ color }}>
              {h}
            </span>
          </div>
          <span className="text-outline text-[16px]">:</span>
          <div className="bg-surface-container-high rounded-lg px-[10px] py-[6px]">
            <span className="text-[18px] font-bold" style={{ color }}>
              {m}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onDecrement}
          className="w-7 h-5 flex items-center justify-center text-[10px] text-outline active:text-on-surface"
        >
          ▼
        </button>
      </div>
    </div>
  );
}

export default function TimePicker({
  startTime,
  endTime,
  onChange,
}: TimePickerProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <TimeBox
        value={startTime}
        color="#adc6ff"
        onIncrement={() => onChange(adjustTime(startTime, 1), endTime)}
        onDecrement={() => onChange(adjustTime(startTime, -1), endTime)}
      />
      <span className="text-outline text-[14px]">→</span>
      <TimeBox
        value={endTime}
        color="#ffb3ad"
        onIncrement={() => onChange(startTime, adjustTime(endTime, 1))}
        onDecrement={() => onChange(startTime, adjustTime(endTime, -1))}
      />
    </div>
  );
}
```

- [ ] **Step 2: 빌드 확인 및 커밋**

```bash
npm run build
git add src/components/ui/TimePicker.tsx
git commit -m "feat: add TimePicker component with inline number input"
```

---

### Task 4: WeekDayPicker 컴포넌트

**Files:**
- Create: `src/components/ui/WeekDayPicker.tsx`

- [ ] **Step 1: WeekDayPicker 구현**

```tsx
"use client";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface WeekDayPickerProps {
  selectedDays: number[]; // 0=일, 1=월 ... 6=토
  onChange: (days: number[]) => void;
}

export default function WeekDayPicker({
  selectedDays,
  onChange,
}: WeekDayPickerProps) {
  const toggle = (day: number) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((d) => d !== day));
    } else {
      onChange([...selectedDays, day].sort());
    }
  };

  return (
    <div className="flex gap-[6px] justify-center">
      {DAYS.map((label, i) => {
        const selected = selectedDays.includes(i);
        return (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-[11px] transition-colors ${
              selected
                ? "bg-quadrant-plan-container text-white font-semibold"
                : "bg-surface-container-high text-outline"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: 빌드 확인 및 커밋**

```bash
npm run build
git add src/components/ui/WeekDayPicker.tsx
git commit -m "feat: add WeekDayPicker circular chip component"
```

---

### Task 5: MonthDatePicker 컴포넌트

**Files:**
- Create: `src/components/ui/MonthDatePicker.tsx`

- [ ] **Step 1: MonthDatePicker 구현**

```tsx
"use client";

interface MonthDatePickerProps {
  selectedDate: number; // 1~31
  onChange: (date: number) => void;
}

export default function MonthDatePicker({
  selectedDate,
  onChange,
}: MonthDatePickerProps) {
  const increment = () => onChange(selectedDate >= 31 ? 1 : selectedDate + 1);
  const decrement = () => onChange(selectedDate <= 1 ? 31 : selectedDate - 1);

  return (
    <div className="flex items-center justify-center gap-3">
      <span className="text-body-sm text-outline">매월</span>
      <div className="flex items-center gap-2">
        <div className="bg-surface-container-high rounded-[10px] px-4 py-[10px]">
          <span className="text-[24px] font-bold text-quadrant-plan-primary">
            {selectedDate}
          </span>
        </div>
        <span className="text-body-sm text-outline">일</span>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={increment}
            className="w-7 h-7 rounded-md bg-surface-container-highest flex items-center justify-center text-[12px] text-on-surface active:bg-white/10"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={decrement}
            className="w-7 h-7 rounded-md bg-surface-container-highest flex items-center justify-center text-[12px] text-on-surface active:bg-white/10"
          >
            ▼
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 빌드 확인 및 커밋**

```bash
npm run build
git add src/components/ui/MonthDatePicker.tsx
git commit -m "feat: add MonthDatePicker inline number component"
```

---

### Task 6: RepeatSelector 개선 — 세부 피커 통합

**Files:**
- Modify: `src/components/ui/RepeatSelector.tsx`

- [ ] **Step 1: RepeatSelector에 세부 피커 통합**

`src/components/ui/RepeatSelector.tsx` 전체를 다음으로 교체:

```tsx
"use client";

import { RepeatType } from "@/lib/types";
import WeekDayPicker from "./WeekDayPicker";
import MonthDatePicker from "./MonthDatePicker";

const OPTIONS: { value: RepeatType; label: string }[] = [
  { value: "none", label: "없음" },
  { value: "daily", label: "매일" },
  { value: "weekly", label: "매주" },
  { value: "monthly", label: "매월" },
  { value: "yearly", label: "매년" },
];

interface RepeatSelectorProps {
  value: RepeatType;
  onChange: (value: RepeatType) => void;
  repeatDays: number[];
  onRepeatDaysChange: (days: number[]) => void;
  repeatDate: number;
  onRepeatDateChange: (date: number) => void;
}

export default function RepeatSelector({
  value,
  onChange,
  repeatDays,
  onRepeatDaysChange,
  repeatDate,
  onRepeatDateChange,
}: RepeatSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex gap-[6px]">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-[10px] py-1 rounded-full text-[11px] transition-colors ${
              value === opt.value
                ? "bg-quadrant-plan-container text-white font-semibold"
                : "bg-surface-container-low text-outline"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {value === "weekly" && (
        <WeekDayPicker selectedDays={repeatDays} onChange={onRepeatDaysChange} />
      )}

      {value === "monthly" && (
        <MonthDatePicker selectedDate={repeatDate} onChange={onRepeatDateChange} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: 빌드 확인 및 커밋**

```bash
npm run build
git add src/components/ui/RepeatSelector.tsx
git commit -m "feat: integrate WeekDayPicker and MonthDatePicker into RepeatSelector"
```

---

### Task 7: AddTodoModal — 접이식 시간 + 반복 섹션

**Files:**
- Modify: `src/components/modals/AddTodoModal.tsx`

- [ ] **Step 1: AddTodoModal에 시간/반복 접이식 섹션 추가**

`src/components/modals/AddTodoModal.tsx` 전체를 다음으로 교체:

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quadrant, RepeatType } from "@/lib/types";
import { useTodoContext } from "@/hooks/useTodos";
import { toDateString } from "@/lib/date-utils";
import QuadrantSelector from "../ui/QuadrantSelector";
import RepeatSelector from "../ui/RepeatSelector";
import TimePicker from "../ui/TimePicker";
import CollapsibleSection from "../ui/CollapsibleSection";

interface AddTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: Date;
  defaultQuadrant?: Quadrant;
}

const DAYS_SHORT = ["일", "월", "화", "수", "목", "금", "토"];

function formatRepeatSummary(
  repeat: RepeatType,
  repeatDays: number[],
  repeatDate: number
): string {
  if (repeat === "none") return "반복";
  if (repeat === "daily") return "매일";
  if (repeat === "weekly") {
    const days = repeatDays.map((d) => DAYS_SHORT[d]).join(",");
    return `매주 · ${days || "요일 선택"}`;
  }
  if (repeat === "monthly") return `매월 ${repeatDate}일`;
  return "매년";
}

function formatTimeSummary(startTime?: string, endTime?: string): string {
  if (!startTime || !endTime) return "시간 설정";
  return `${startTime} → ${endTime}`;
}

export default function AddTodoModal({
  isOpen,
  onClose,
  defaultDate,
  defaultQuadrant,
}: AddTodoModalProps) {
  const { addTodo } = useTodoContext();
  const [title, setTitle] = useState("");
  const [quadrant, setQuadrant] = useState<Quadrant>(defaultQuadrant ?? "do");
  const [date, setDate] = useState(toDateString(defaultDate ?? new Date()));
  const [repeat, setRepeat] = useState<RepeatType>("none");
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [repeatDate, setRepeatDate] = useState(1);
  const [startTime, setStartTime] = useState<string | undefined>();
  const [endTime, setEndTime] = useState<string | undefined>();
  const [hasTime, setHasTime] = useState(false);
  const [error, setError] = useState(false);

  const resetForm = () => {
    setTitle("");
    setQuadrant(defaultQuadrant ?? "do");
    setDate(toDateString(defaultDate ?? new Date()));
    setRepeat("none");
    setRepeatDays([]);
    setRepeatDate(1);
    setStartTime(undefined);
    setEndTime(undefined);
    setHasTime(false);
    setError(false);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setError(true);
      return;
    }
    addTodo({
      title: title.trim(),
      quadrant,
      date,
      repeat,
      repeatDays: repeat === "weekly" ? repeatDays : undefined,
      repeatDate: repeat === "monthly" ? repeatDate : undefined,
      startTime: hasTime ? startTime : undefined,
      endTime: hasTime ? endTime : undefined,
    });
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50"
            onClick={() => {
              resetForm();
              onClose();
            }}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-surface-container rounded-t-[24px] max-w-2xl mx-auto"
          >
            <div className="p-6">
              {/* Drag handle */}
              <div className="w-9 h-1 bg-outline/30 rounded-full mx-auto mb-5" />

              {/* Title input */}
              <motion.input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="할 일을 입력하세요"
                className={`w-full bg-surface-container-high rounded-[10px] px-4 py-3 text-body-md text-on-surface placeholder:text-outline outline-none ${
                  error ? "ring-2 ring-red-500" : ""
                }`}
                animate={error ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                transition={{ duration: 0.3 }}
                autoFocus
              />

              {/* Quadrant selector */}
              <div className="mt-3">
                <QuadrantSelector value={quadrant} onChange={setQuadrant} />
              </div>

              {/* Date */}
              <div className="mt-2">
                <div className="flex items-center gap-2 bg-surface-container-low rounded-[10px] px-[14px] py-[10px]">
                  <span className="text-[14px]">📅</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-transparent text-body-sm text-on-surface outline-none flex-1"
                  />
                </div>
              </div>

              {/* Time — collapsible */}
              <div className="mt-2">
                <CollapsibleSection
                  icon="⏰"
                  label="시간 설정"
                  summary={hasTime ? `⏰ ${formatTimeSummary(startTime, endTime)}` : undefined}
                >
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hasTime}
                        onChange={(e) => {
                          setHasTime(e.target.checked);
                          if (e.target.checked && !startTime) {
                            setStartTime("09:00");
                            setEndTime("10:00");
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-body-sm text-on-surface-variant">
                        시간 지정
                      </span>
                    </label>
                    {hasTime && startTime && endTime && (
                      <TimePicker
                        startTime={startTime}
                        endTime={endTime}
                        onChange={(s, e) => {
                          setStartTime(s);
                          setEndTime(e);
                        }}
                      />
                    )}
                  </div>
                </CollapsibleSection>
              </div>

              {/* Repeat — collapsible */}
              <div className="mt-2">
                <CollapsibleSection
                  icon="🔁"
                  label="반복"
                  summary={
                    repeat !== "none"
                      ? `🔁 ${formatRepeatSummary(repeat, repeatDays, repeatDate)}`
                      : undefined
                  }
                >
                  <RepeatSelector
                    value={repeat}
                    onChange={setRepeat}
                    repeatDays={repeatDays}
                    onRepeatDaysChange={setRepeatDays}
                    repeatDate={repeatDate}
                    onRepeatDateChange={setRepeatDate}
                  />
                </CollapsibleSection>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                className="w-full mt-4 py-3 rounded-full bg-gradient-to-r from-quadrant-plan-container to-[#0450b0] text-white text-body-md font-semibold"
              >
                추가하기
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: 브라우저에서 동작 확인**

Run: 로컬 서버 (localhost:3000) → FAB 탭 → 모달에서 시간/반복 접이식 테스트

- [ ] **Step 3: 빌드 확인 및 커밋**

```bash
npm run build
git add src/components/modals/AddTodoModal.tsx
git commit -m "feat: add collapsible time/repeat sections to AddTodoModal"
```

---

### Task 8: TaskDetailModal — 시간/반복 편집 가능

**Files:**
- Modify: `src/components/modals/TaskDetailModal.tsx`

- [ ] **Step 1: TaskDetailModal에 시간/반복 편집 추가**

기존 `TaskDetailModal.tsx`에서 읽기 전용 반복 라벨을 편집 가능한 접이식 섹션으로 교체. 아래 변경을 적용:

1. import 추가:
```tsx
import CollapsibleSection from "../ui/CollapsibleSection";
import TimePicker from "../ui/TimePicker";
import RepeatSelector from "../ui/RepeatSelector";
```

2. 상태 추가 (기존 title, memo, quadrant 상태 아래):
```tsx
const [repeat, setRepeat] = useState(todo?.repeat ?? "none");
const [repeatDays, setRepeatDays] = useState<number[]>(todo?.repeatDays ?? []);
const [repeatDate, setRepeatDate] = useState(todo?.repeatDate ?? 1);
const [hasTime, setHasTime] = useState(!!todo?.startTime);
const [startTime, setStartTime] = useState(todo?.startTime ?? "09:00");
const [endTime, setEndTime] = useState(todo?.endTime ?? "10:00");
```

3. todo가 바뀔 때 상태 동기화 (기존 useEffect에 추가):
```tsx
useEffect(() => {
  if (todo) {
    setTitle(todo.title);
    setMemo(todo.memo);
    setQuadrant(todo.quadrant);
    setRepeat(todo.repeat);
    setRepeatDays(todo.repeatDays ?? []);
    setRepeatDate(todo.repeatDate ?? 1);
    setHasTime(!!todo.startTime);
    setStartTime(todo.startTime ?? "09:00");
    setEndTime(todo.endTime ?? "10:00");
  }
}, [todo]);
```

4. handleSave에 새 필드 포함:
```tsx
const handleSave = () => {
  if (!todo) return;
  updateTodo(todo.id, {
    title,
    memo,
    quadrant,
    repeat,
    repeatDays: repeat === "weekly" ? repeatDays : undefined,
    repeatDate: repeat === "monthly" ? repeatDate : undefined,
    startTime: hasTime ? startTime : undefined,
    endTime: hasTime ? endTime : undefined,
  });
  onClose();
};
```

5. JSX에서 기존 반복 읽기 전용 라벨을 접이식 섹션으로 교체:

기존:
```tsx
{todo.repeat !== "none" && (
  <div className="...">
    <span>🔁</span>
    <span>{...}</span>
  </div>
)}
```

교체:
```tsx
{/* Time — collapsible */}
<CollapsibleSection
  icon="⏰"
  label="시간 설정"
  summary={hasTime ? `⏰ ${startTime} → ${endTime}` : undefined}
>
  <div className="space-y-2">
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={hasTime}
        onChange={(e) => setHasTime(e.target.checked)}
        className="rounded"
      />
      <span className="text-body-sm text-on-surface-variant">시간 지정</span>
    </label>
    {hasTime && (
      <TimePicker
        startTime={startTime}
        endTime={endTime}
        onChange={(s, e) => { setStartTime(s); setEndTime(e); }}
      />
    )}
  </div>
</CollapsibleSection>

{/* Repeat — collapsible */}
<CollapsibleSection
  icon="🔁"
  label="반복"
  summary={repeat !== "none" ? `🔁 ${repeat === "daily" ? "매일" : repeat === "weekly" ? "매주" : repeat === "monthly" ? "매월" : "매년"}` : undefined}
>
  <RepeatSelector
    value={repeat}
    onChange={setRepeat}
    repeatDays={repeatDays}
    onRepeatDaysChange={setRepeatDays}
    repeatDate={repeatDate}
    onRepeatDateChange={setRepeatDate}
  />
</CollapsibleSection>
```

- [ ] **Step 2: 빌드 확인 및 커밋**

```bash
npm run build
git add src/components/modals/TaskDetailModal.tsx
git commit -m "feat: add editable time/repeat to TaskDetailModal"
```

---

### Task 9: TaskCard 시간 뱃지

**Files:**
- Modify: `src/components/matrix/TaskCard.tsx:75-80`

- [ ] **Step 1: 시간 뱃지 추가**

TaskCard.tsx에서 기존 반복 뱃지 바로 앞에 시간 뱃지 추가:

```tsx
{/* Time badge */}
{todo.startTime && todo.endTime && (
  <span className="text-[10px] text-outline">
    {todo.startTime}-{todo.endTime}
  </span>
)}

{/* Repeat badge (기존) */}
{todo.repeat !== "none" && (
  <span className="text-[10px] text-outline border border-white/10 px-1.5 py-0.5 rounded-sm">
    반복
  </span>
)}
```

- [ ] **Step 2: 빌드 확인 및 커밋**

```bash
npm run build
git add src/components/matrix/TaskCard.tsx
git commit -m "feat: show time badge on TaskCard"
```

---

### Task 10: AppLogo 컴포넌트

**Files:**
- Create: `src/components/common/AppLogo.tsx`
- Modify: `src/components/layout/Header.tsx`

- [ ] **Step 1: AppLogo 구현**

```tsx
interface AppLogoProps {
  size?: "sm" | "lg";
}

const SIZES = {
  sm: { box: 8, gap: 1.5, radius: 2.5 },
  lg: { box: 24, gap: 3, radius: 5 },
};

const COLORS = [
  "rgba(255,84,81,0.25)",  // DO
  "rgba(5,102,217,0.25)",  // PLAN
  "rgba(202,129,0,0.25)",  // DELEGATE
  "rgba(66,71,84,0.25)",   // DELETE
];

export default function AppLogo({ size = "sm" }: AppLogoProps) {
  const s = SIZES[size];
  return (
    <div
      style={{
        display: "inline-grid",
        gridTemplateColumns: "1fr 1fr",
        gap: `${s.gap}px`,
      }}
    >
      {COLORS.map((color, i) => (
        <div
          key={i}
          style={{
            width: `${s.box}px`,
            height: `${s.box}px`,
            borderRadius: `${s.radius}px`,
            backgroundColor: color,
          }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Header에 로고 추가**

`src/components/layout/Header.tsx`를 수정:

```tsx
"use client";

import { formatDateKR } from "@/lib/date-utils";
import AppLogo from "../common/AppLogo";

interface HeaderProps {
  selectedDate: Date;
}

export default function Header({ selectedDate }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#0e0e12]/80 backdrop-blur-[48px]">
      <div className="flex items-center justify-between px-lg py-3">
        <div className="flex items-center gap-2">
          <AppLogo size="sm" />
          <h1 className="font-display text-headline text-on-surface">
            아이젠하워 투두
          </h1>
        </div>
        <span className="text-body-sm text-on-surface-variant">
          {formatDateKR(selectedDate)}
        </span>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: 빌드 확인 및 커밋**

```bash
npm run build
git add src/components/common/AppLogo.tsx src/components/layout/Header.tsx
git commit -m "feat: add AppLogo mini color grid to header"
```

---

### Task 11: AxisArrows — 매트릭스 그라디언트 축 화살표

**Files:**
- Create: `src/components/matrix/AxisArrows.tsx`
- Modify: `src/components/matrix/MatrixView.tsx`

- [ ] **Step 1: AxisArrows SVG 컴포넌트**

```tsx
export default function AxisArrows() {
  return (
    <>
      {/* "긴급" label above horizontal arrow */}
      <div className="text-center mb-[2px]">
        <span className="text-[9px] font-semibold text-quadrant-do-primary tracking-[2px]">
          긴급
        </span>
      </div>

      {/* Horizontal arrow ← : right(thin/transparent) → left(thick/opaque) */}
      <div className="h-[14px] mb-1">
        <svg className="w-full h-full" viewBox="0 0 270 14" preserveAspectRatio="none">
          <defs>
            <linearGradient id="hArrow" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="var(--arrow-h-color, #ffb3ad)" stopOpacity="0.05" />
              <stop offset="50%" stopColor="var(--arrow-h-color, #ffb3ad)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--arrow-h-color, #ffb3ad)" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <polygon points="270,6.5 18,4.5 18,9.5 270,7.5" fill="url(#hArrow)" />
          <polygon points="20,1 4,7 20,13" fill="var(--arrow-h-color, #ffb3ad)" fillOpacity="0.6" />
        </svg>
      </div>
    </>
  );
}

export function VerticalArrow() {
  return (
    <div className="flex items-stretch mr-1">
      {/* "중요" vertical text, LEFT of arrow */}
      <div className="flex items-center mr-[3px]">
        <span
          className="text-[9px] font-semibold text-quadrant-plan-primary tracking-[2px]"
          style={{ writingMode: "vertical-lr" }}
        >
          중요
        </span>
      </div>

      {/* Vertical arrow ↑ : bottom(thin/transparent) → top(thick/opaque) */}
      <div className="w-[14px]">
        <svg className="w-full h-full" viewBox="0 0 14 200" preserveAspectRatio="none">
          <defs>
            <linearGradient id="vArrow" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="var(--arrow-v-color, #adc6ff)" stopOpacity="0.05" />
              <stop offset="50%" stopColor="var(--arrow-v-color, #adc6ff)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--arrow-v-color, #adc6ff)" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <polygon points="6.5,200 4.5,18 9.5,18 7.5,200" fill="url(#vArrow)" />
          <polygon points="1,20 7,4 13,20" fill="var(--arrow-v-color, #adc6ff)" fillOpacity="0.6" />
        </svg>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: MatrixView에 AxisArrows 통합**

`src/components/matrix/MatrixView.tsx`에서 2x2 그리드 주변에 화살표를 배치. 기존 그리드 레이아웃 래핑:

기존 그리드 JSX를 찾아서 (`<div className="grid grid-cols-2 ...">`) 다음과 같이 감싸기:

```tsx
import AxisArrows, { VerticalArrow } from "./AxisArrows";

// ... 기존 코드 ...

// render 부분에서 그리드를 감싸기:
<div className="px-lg" style={{ height: "calc(100dvh - 148px)" }}>
  <AxisArrows />
  <div className="flex" style={{ height: "calc(100% - 36px)" }}>
    <VerticalArrow />
    <div className="grid grid-cols-2 gap-2 flex-1">
      {/* 기존 4개 QuadrantBox */}
    </div>
  </div>
</div>
```

- [ ] **Step 3: 브라우저에서 확인**

Run: localhost:3000 → 매트릭스 탭 → 화살표가 L자 형태로 표시되는지 확인

- [ ] **Step 4: 빌드 확인 및 커밋**

```bash
npm run build
git add src/components/matrix/AxisArrows.tsx src/components/matrix/MatrixView.tsx
git commit -m "feat: add gradient axis arrows to matrix view"
```

---

### Task 12: 온보딩 1단계 리디자인

**Files:**
- Modify: `src/components/onboarding/Onboarding.tsx`

- [ ] **Step 1: 1단계 STEPS 데이터 변경**

`src/components/onboarding/Onboarding.tsx`의 STEPS 배열 1번째 항목을 수정하고, 커스텀 렌더링 추가:

```tsx
const STEPS = [
  {
    title: "아이젠하워 매트릭스",
    description: "할 일을 긴급/중요로 나눠 4가지로 분류하세요",
    icon: "grid_view",
    custom: true, // 커스텀 렌더링 플래그
  },
  // ... 기존 2, 3단계 유지
];
```

- [ ] **Step 2: 매트릭스 다이어그램 렌더링 추가**

온보딩 컴포넌트의 렌더 함수에서, `step === 0`일 때 커스텀 매트릭스 UI를 표시:

```tsx
import AppLogo from "../common/AppLogo";
import AxisArrows, { VerticalArrow } from "../matrix/AxisArrows";
```

기존 아이콘 렌더링 (`<span className="material-symbols-outlined...">`) 부분을:

```tsx
{step === 0 ? (
  <>
    <AppLogo size="lg" />
    <h2 className="font-display text-display-md text-on-surface mt-6 mb-2">
      {current.title}
    </h2>
    <p className="text-body-sm text-on-surface-variant mb-5">
      {current.description}
    </p>

    {/* Mini matrix diagram */}
    <div className="w-full max-w-[260px]">
      <AxisArrows />
      <div className="flex">
        <VerticalArrow />
        <div className="grid grid-cols-2 gap-1 flex-1">
          {([
            { label: "DO", desc: "지금 바로\n실행하세요", color: "#ff5451", text: "#ffb3ad", bg: "rgba(255,84,81,0.1)" },
            { label: "PLAN", desc: "일정을 잡아\n계획하세요", color: "#0566d9", text: "#adc6ff", bg: "rgba(5,102,217,0.1)" },
            { label: "DELEGATE", desc: "다른 사람에게\n맡기세요", color: "#ca8100", text: "#ffb95f", bg: "rgba(202,129,0,0.1)" },
            { label: "DELETE", desc: "과감하게\n버리세요", color: "#424754", text: "#8c909f", bg: "rgba(66,71,84,0.1)" },
          ]).map((q) => (
            <div
              key={q.label}
              className="rounded-lg p-2"
              style={{
                background: q.bg,
                borderLeft: `2px solid ${q.color}`,
              }}
            >
              <div
                className="text-[9px] font-bold uppercase tracking-wider"
                style={{ color: q.text }}
              >
                {q.label}
              </div>
              <div className="text-[9px] text-on-surface-variant mt-1 whitespace-pre-line leading-tight">
                {q.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* PLAN highlight */}
    <div className="text-center px-3 py-2.5 bg-quadrant-plan-container/10 rounded-lg mt-5 max-w-[260px]">
      <div className="text-[12px] text-quadrant-plan-primary font-medium">
        💡 가장 중요한 건 <strong>PLAN</strong>
      </div>
      <div className="text-[11px] text-quadrant-plan-primary/70 mt-1.5">
        — 여기가 인생을 바꾸는 곳입니다
      </div>
    </div>
  </>
) : (
  <>
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
  </>
)}
```

- [ ] **Step 3: 브라우저에서 온보딩 확인**

localStorage에서 `onboarding-done` 키 삭제 후 새로고침하여 온보딩 확인.

- [ ] **Step 4: 빌드 확인 및 커밋**

```bash
npm run build
git add src/components/onboarding/Onboarding.tsx
git commit -m "feat: redesign onboarding step 1 with matrix diagram and AppLogo"
```

---

### Task 13: 라이트/다크 모드 — ThemeProvider + CSS 변수

**Files:**
- Create: `src/providers/ThemeProvider.tsx`
- Modify: `src/lib/storage.ts`
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: storage.ts에 테마 저장/불러오기 추가**

`src/lib/storage.ts` 끝에 추가:

```typescript
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
```

- [ ] **Step 2: ThemeProvider 구현**

```tsx
// src/providers/ThemeProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ThemeMode, loadTheme, saveTheme } from "@/lib/storage";

interface ThemeContextValue {
  theme: ThemeMode;
  resolved: "light" | "dark";
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  resolved: "dark",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const saved = loadTheme();
    setThemeState(saved);
    setResolved(saved === "system" ? getSystemTheme() : saved);
  }, []);

  useEffect(() => {
    const r = theme === "system" ? getSystemTheme() : theme;
    setResolved(r);
    document.documentElement.setAttribute("data-theme", r);

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? "dark" : "light";
        setResolved(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
    saveTheme(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

- [ ] **Step 3: globals.css에 라이트/다크 CSS 변수 추가**

`src/app/globals.css`에 `:root` 와 `[data-theme="dark"]`를 추가하고, 기존 하드코딩된 색상을 CSS 변수로 교체:

```css
/* Light mode (default) */
:root,
[data-theme="light"] {
  --color-surface: #ffffff;
  --color-surface-container-lowest: #f9f9f7;
  --color-surface-container-low: #f6f5f4;
  --color-surface-container: #eeedeb;
  --color-surface-container-high: #e8e7e5;
  --color-surface-container-highest: #dddbd8;
  --color-on-surface: rgba(0, 0, 0, 0.95);
  --color-on-surface-variant: #615d59;
  --color-outline: #a39e98;
  --color-border: rgba(0, 0, 0, 0.1);
  --color-q-do-primary: #c0342f;
  --color-q-do-container: #e03e3b;
  --color-q-plan-primary: #0054b3;
  --color-q-plan-container: #0566d9;
  --color-q-delegate-primary: #9a6400;
  --color-q-delegate-container: #b37300;
  --color-q-delete-primary: #555a6b;
  --color-q-delete-container: #6b7085;
  --arrow-h-color: #c0342f;
  --arrow-v-color: #0054b3;
}

/* Dark mode */
[data-theme="dark"] {
  --color-surface: #131317;
  --color-surface-container-lowest: #0e0e12;
  --color-surface-container-low: #1b1b1f;
  --color-surface-container: #1f1f23;
  --color-surface-container-high: #2a292e;
  --color-surface-container-highest: #353439;
  --color-on-surface: #e4e1e7;
  --color-on-surface-variant: #c2c6d6;
  --color-outline: #8c909f;
  --color-border: rgba(255, 255, 255, 0.06);
  --color-q-do-primary: #ffb3ad;
  --color-q-do-container: #ff5451;
  --color-q-plan-primary: #adc6ff;
  --color-q-plan-container: #0566d9;
  --color-q-delegate-primary: #ffb95f;
  --color-q-delegate-container: #ca8100;
  --color-q-delete-primary: #8c909f;
  --color-q-delete-container: #424754;
  --arrow-h-color: #ffb3ad;
  --arrow-v-color: #adc6ff;
}
```

- [ ] **Step 4: tailwind.config.ts에서 CSS 변수 참조로 변경**

`tailwind.config.ts`의 colors 섹션을 CSS 변수 참조로 변경:

```typescript
colors: {
  surface: {
    DEFAULT: "var(--color-surface)",
    "container-lowest": "var(--color-surface-container-lowest)",
    "container-low": "var(--color-surface-container-low)",
    "container": "var(--color-surface-container)",
    "container-high": "var(--color-surface-container-high)",
    "container-highest": "var(--color-surface-container-highest)",
  },
  "on-surface": {
    DEFAULT: "var(--color-on-surface)",
    variant: "var(--color-on-surface-variant)",
  },
  outline: "var(--color-outline)",
  quadrant: {
    do: {
      primary: "var(--color-q-do-primary)",
      container: "var(--color-q-do-container)",
    },
    plan: {
      primary: "var(--color-q-plan-primary)",
      container: "var(--color-q-plan-container)",
    },
    delegate: {
      primary: "var(--color-q-delegate-primary)",
      container: "var(--color-q-delegate-container)",
    },
    delete: {
      primary: "var(--color-q-delete-primary)",
      container: "var(--color-q-delete-container)",
    },
  },
},
```

- [ ] **Step 5: layout.tsx에 ThemeProvider 래핑**

`src/app/layout.tsx`에서 body 안 TodoProvider를 ThemeProvider로 한번 더 감싸기:

```tsx
import ThemeProvider from "@/providers/ThemeProvider";

// body 내부:
<ThemeProvider>
  <TodoProvider>
    {children}
  </TodoProvider>
</ThemeProvider>
```

- [ ] **Step 6: globals.css의 body 배경을 CSS 변수로 변경**

기존:
```css
body {
  background-color: #131317;
  color: #e4e1e7;
}
```

변경:
```css
body {
  background-color: var(--color-surface);
  color: var(--color-on-surface);
}
```

- [ ] **Step 7: 하드코딩된 색상 수정**

Header.tsx, QuadrantBox.tsx 등에서 하드코딩된 다크 모드 색상(`#0e0e12`, `#1b1b1f` 등)을 CSS 변수나 Tailwind 토큰으로 변경:

- `Header.tsx` line 11: `bg-[#0e0e12]/80` → `bg-surface-container-lowest/80`
- `QuadrantBox.tsx` line 96: `linear-gradient(transparent, #1b1b1f)` → `linear-gradient(transparent, var(--color-surface-container-low))`
- `globals.css`의 `.glass-card` 배경도 CSS 변수 기반으로 변경

- [ ] **Step 8: 브라우저에서 라이트/다크 모드 확인**

Run: DevTools에서 `document.documentElement.setAttribute('data-theme', 'light')` 실행하여 라이트 모드 확인

- [ ] **Step 9: 빌드 확인 및 커밋**

```bash
npm run build
git add src/providers/ThemeProvider.tsx src/lib/storage.ts src/app/globals.css tailwind.config.ts src/app/layout.tsx src/components/layout/Header.tsx src/components/matrix/QuadrantBox.tsx
git commit -m "feat: add light/dark mode with CSS variable theming"
```

---

### Task 14: constants.ts 사분면 색상을 CSS 변수로 대응

**Files:**
- Modify: `src/lib/constants.ts`

- [ ] **Step 1: 하드코딩된 색상을 CSS 변수 참조로 변경**

`constants.ts`의 `QUADRANTS` 에서 primary/container를 CSS 변수로:

```typescript
export const QUADRANTS: Record<Quadrant, QuadrantInfo> = {
  do: {
    id: "do",
    label: "즉시 실행",
    sublabel: "DO",
    primary: "var(--color-q-do-primary)",
    container: "var(--color-q-do-container)",
    emptyTitle: "오늘 긴급한 일이 없어요",
    emptySub: "좋은 날이네요! 계획에 집중하세요",
  },
  plan: {
    id: "plan",
    label: "계획 수립",
    sublabel: "PLAN",
    primary: "var(--color-q-plan-primary)",
    container: "var(--color-q-plan-container)",
    emptyTitle: "장기 목표를 추가해보세요",
    emptySub: "여기가 진짜 인생을 바꾸는 곳이에요",
  },
  delegate: {
    id: "delegate",
    label: "위임",
    sublabel: "DELEGATE",
    primary: "var(--color-q-delegate-primary)",
    container: "var(--color-q-delegate-container)",
    emptyTitle: "혼자 다 하지 마세요",
    emptySub: "넘길 수 있는 일을 찾아보세요",
  },
  delete: {
    id: "delete",
    label: "제거",
    sublabel: "DELETE",
    primary: "var(--color-q-delete-primary)",
    container: "var(--color-q-delete-container)",
    emptyTitle: "정리할 게 없네요",
    emptySub: "깔끔합니다!",
  },
};
```

주의: `QuadrantBox.tsx`와 `TaskCard.tsx`에서 `q.primary`를 inline style로 사용하는데, CSS 변수 문자열은 inline style의 `style={{ borderColor: q.primary }}`에서 작동함 (브라우저가 CSS 변수를 해석).

- [ ] **Step 2: 빌드 및 브라우저 확인**

```bash
npm run build
```

localhost:3000에서 사분면 색상이 정상 표시되는지 확인. DevTools에서 data-theme="light" 전환해서 라이트 모드 색상도 확인.

- [ ] **Step 3: 커밋**

```bash
git add src/lib/constants.ts
git commit -m "refactor: use CSS variables for quadrant colors in constants"
```

---

## 실행 순서 요약

| Task | 내용 | 의존성 |
|------|------|--------|
| 1 | 데이터 모델 변경 | 없음 |
| 2 | CollapsibleSection | 없음 |
| 3 | TimePicker | 없음 |
| 4 | WeekDayPicker | 없음 |
| 5 | MonthDatePicker | 없음 |
| 6 | RepeatSelector 개선 | 4, 5 |
| 7 | AddTodoModal 업데이트 | 1, 2, 3, 6 |
| 8 | TaskDetailModal 업데이트 | 1, 2, 3, 6 |
| 9 | TaskCard 시간 뱃지 | 1 |
| 10 | AppLogo + Header | 없음 |
| 11 | AxisArrows + MatrixView | 없음 |
| 12 | 온보딩 리디자인 | 10, 11 |
| 13 | 라이트/다크 모드 | 없음 |
| 14 | constants.ts CSS 변수 | 13 |

**병렬 가능:** Tasks 1-5, 10, 11, 13은 독립적으로 병렬 실행 가능.
