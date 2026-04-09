# V2 Features Design Spec — 아이젠하워 투두

**Date:** 2026-04-09
**Branch:** feat/v2-features
**Deadline:** 오늘 (2026-04-09)

---

## 1. Supabase 백엔드 (☁️ 클라우드 동기화)

### 목표
localStorage → Supabase 마이그레이션. 기기 간 동기화 + 인증.

### DB 스키마

```sql
-- profiles (auth.users 확장)
create table profiles (
  id uuid references auth.users primary key,
  display_name text,
  created_at timestamptz default now()
);

-- tags
create table tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  color text not null default '#adc6ff',
  created_at timestamptz default now()
);

-- todos
create table todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  quadrant text not null check (quadrant in ('do','plan','delegate','delete')),
  date date not null,
  completed boolean default false,
  completed_at timestamptz,
  repeat text default 'none' check (repeat in ('none','daily','weekly','monthly','yearly')),
  repeat_days int[],
  repeat_date int,
  repeat_month int,
  start_time time,
  end_time time,
  memo text default '',
  "order" int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- todo_tags (다대다)
create table todo_tags (
  todo_id uuid references todos(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (todo_id, tag_id)
);

-- subtasks
create table subtasks (
  id uuid primary key default gen_random_uuid(),
  todo_id uuid references todos(id) on delete cascade,
  title text not null,
  completed boolean default false,
  "order" int default 0,
  created_at timestamptz default now()
);

-- templates
create table templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  items jsonb not null default '[]',
  created_at timestamptz default now()
);

-- streaks (캐시 테이블)
create table streaks (
  user_id uuid references profiles(id) on delete cascade primary key,
  current_streak int default 0,
  longest_streak int default 0,
  last_active_date date,
  updated_at timestamptz default now()
);

-- achievements
create table achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  type text not null,
  unlocked_at timestamptz default now(),
  unique(user_id, type)
);
```

### RLS 정책
모든 테이블에 `user_id = auth.uid()` 기반 Row Level Security 적용.

### Auth
- Supabase Auth (이메일/비밀번호 + 카카오 OAuth)
- 미인증 시 localStorage 폴백 (기존 로직 유지)
- 로그인 시 localStorage → Supabase 마이그레이션 프롬프트

### 클라이언트
- `@supabase/supabase-js` + `@supabase/ssr`
- `src/lib/supabase.ts` — 클라이언트 생성
- `src/providers/AuthProvider.tsx` — 인증 상태 관리
- `src/providers/TodoProvider.tsx` — Supabase 우선, 미인증 시 localStorage 폴백

---

## 2. 서브태스크 (✅ 체크리스트)

### 목표
할 일 안에 세부 체크리스트. 진행률 바 표시.

### 데이터
```typescript
interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}
```
Todo 인터페이스에 `subtasks: Subtask[]` 추가.

### UI
- **TaskDetailModal**: 서브태스크 섹션 추가. 인라인 추가/삭제/토글.
- **TaskCard**: 서브태스크가 있으면 `2/5` 같은 미니 진행률 표시.
- 드래그로 순서 변경 (선택사항, 시간 되면).

---

## 3. 태그/라벨 (🏷️)

### 목표
커스텀 태그로 할 일 분류. 검색/필터와 연동.

### 데이터
```typescript
interface Tag {
  id: string;
  name: string;
  color: string;
}
```
Todo 인터페이스에 `tags: string[]` (tag id 배열) 추가.

### UI
- **AddTodoModal / TaskDetailModal**: 태그 선택 칩 UI. 새 태그 인라인 생성.
- **TaskCard**: 태그 칩 표시 (최대 2개 + "+N").
- **태그 관리**: 설정 화면 또는 모달에서 태그 CRUD.
- 색상: 8가지 프리셋 컬러 중 선택.

---

## 4. 검색 & 필터 (🔍)

### 목표
전체 할 일 텍스트 검색 + 필터링.

### UI
- **Header**: 검색 아이콘 클릭 → 검색바 슬라이드 다운.
- **SearchOverlay**: 풀스크린 오버레이. 실시간 검색 결과.
- **필터 칩**: 사분면별, 완료/미완료, 태그별 필터. 복합 필터 가능.
- 결과 탭하면 해당 날짜 + TaskDetailModal 오픈.

---

## 5. 실행 취소 (↩️ Undo)

### 목표
삭제/완료 등 실수 방지.

### 구현
- **UndoToast 컴포넌트**: 하단에 5초간 표시. "되돌리기" 버튼.
- **undo 스택**: TodoProvider에 `lastAction` 상태 저장.
  - 삭제: 삭제된 todo 저장 → undo 시 복원.
  - 완료 토글: 이전 상태 저장 → undo 시 롤백.
  - 사분면 이동: 이전 quadrant 저장.
- 5초 후 또는 다른 액션 시 스택 클리어.

---

## 6. 오늘의 할 일 위젯 (📱)

### 목표
오늘 DO 사분면 미완료 상태를 한 눈에.

### UI
- **TodayWidget 컴포넌트**: 매트릭스 뷰 상단에 컴팩트 배너.
- 내용: "오늘 해야 할 일 N개" + 첫 번째 미완료 태스크 제목.
- 전부 완료 시: "오늘 할 일 완료! 🎉" 축하 메시지.
- 탭하면 DO 사분면으로 스크롤/포커스.

---

## 7. 스트릭 트래커 (🔥)

### 목표
연속 할 일 완료 일수 추적. 동기부여.

### 로직
- 하루에 최소 1개 할 일 완료 = 활성일.
- 연속 활성일 = 스트릭.
- `streaks` 테이블에 current_streak, longest_streak 캐싱.

### UI
- **캘린더**: 활성일에 🔥 아이콘 표시.
- **Header 또는 위젯**: "🔥 7일 연속" 뱃지.
- **리포트**: 스트릭 히스토리 표시.

---

## 8. 업적/뱃지 시스템 (🏆)

### 목표
게이미피케이션으로 참여 유도.

### 업적 목록
```typescript
const ACHIEVEMENTS = {
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
```

### UI
- **리포트 탭**: 업적 그리드. 잠금/해금 상태. 해금 시 골드 테두리 + 아이콘.
- **해금 토스트**: 업적 달성 시 축하 토스트 알림.
- 미해금 업적은 어둡게 + 잠금 아이콘.

---

## 9. 포커스 모드 (🎯)

### 목표
DO 사분면 풀스크린 + 뽀모도로 타이머.

### UI
- **진입**: DO 사분면 헤더의 "집중" 버튼 또는 오늘 위젯에서.
- **풀스크린**: 네비게이션 숨김. 현재 태스크 1개만 크게 표시.
- **뽀모도로 타이머**: 25분 작업 / 5분 휴식. 원형 프로그레스.
- **컨트롤**: 시작/일시정지/스킵/완료 버튼.
- **완료**: 태스크 완료 처리 + 다음 DO 태스크로 자동 이동.
- **나가기**: 우상단 X 버튼.

---

## 10. 스와이프 제스처 (👆)

### 목표
태스크 카드 빠른 조작.

### 구현
- framer-motion `drag="x"` 활용.
- **우측 스와이프 (>80px)**: 완료 토글. 초록 배경 + 체크 아이콘 reveal.
- **좌측 스와이프 (<-80px)**: 삭제. 빨간 배경 + 삭제 아이콘 reveal.
- 스와이프 중 배경색 + 아이콘 점진적 reveal.
- 캘린더 DayTaskList의 태스크 아이템에 적용.
- 매트릭스 뷰는 드래그앤드롭과 충돌하므로 제외.

---

## 11. 할 일 템플릿 (📋)

### 목표
자주 쓰는 할 일 묶음 저장 + 한 번에 추가.

### 데이터
```typescript
interface Template {
  id: string;
  name: string;
  items: { title: string; quadrant: Quadrant; startTime?: string; endTime?: string; }[];
}
```

### UI
- **AddTodoModal**: "템플릿에서 추가" 버튼.
- **TemplateModal**: 템플릿 목록 → 선택 시 해당 날짜에 모든 아이템 일괄 추가.
- **템플릿 저장**: TaskDetailModal에서 "템플릿으로 저장" 또는 설정에서 관리.

---

## 12. 생산성 히트맵 (📊)

### 목표
GitHub 잔디밭 스타일로 일별 완료율 시각화.

### UI
- **리포트 탭**: 주간 리포트 아래에 히트맵 섹션 추가.
- 최근 12주(84일) 표시. 7행(요일) × 12열(주).
- 색상: 완료율에 따라 surface → Q2 PLAN 파란색 4단계.
  - 0개: surface-container-low
  - 1-2개: rgba(173,198,255,0.2)
  - 3-4개: rgba(173,198,255,0.4)
  - 5+개: rgba(173,198,255,0.7)
- 호버/탭 시 해당 날짜 완료 수 표시.

---

## 13. 월간 리포트 & 트렌드 (📈)

### 목표
주간 → 월간 확장. 장기 트렌드 분석.

### UI
- **리포트 탭**: 주간/월간 토글 추가.
- **월간 리포트**:
  - 주간과 동일한 도넛차트 (월간 합산).
  - 주별 완료 수 라인차트 (Chart.js Line).
  - 사분면 비율 변화 추이 (4색 라인).
  - "지난달 대비 PLAN +15%" 같은 비교 텍스트.
- 성격 유형도 월간 기준 재계산.

---

## 14. 주간 타임라인 뷰 (📅)

### 목표
7일을 한 눈에 보는 스케줄 조감도.

### UI
- **캘린더 뷰**: 일간/주간 토글 추가.
- **WeeklyTimeline**: 7열(요일) × 시간 행.
  - 각 열에 해당 날짜의 시간 블록 표시.
  - 기존 DayTaskList 타임라인과 같은 색상 체계.
  - 가로 스크롤 가능.
- 블록 탭 → TaskDetailModal 오픈.

---

## 15. 공유 카드 테마 다양화 (🎨)

### 목표
1종 → 4종 공유 카드.

### 테마
1. **Classic** (현재): 다크 배경 + 성격 유형 + 사분면 바.
2. **Minimal**: 화이트 배경 + 타이포 중심. 인스타 스토리용.
3. **Gradient**: 사분면 컬러 그래디언트 배경. 비비드.
4. **Stats**: 숫자 중심. 완료율, 스트릭, 업적 수 강조.

### UI
- 공유 버튼 탭 → 테마 선택 바텀시트 → 프리뷰 → 공유.

---

## 16. 알림/리마인더 (🔔)

### 목표
브라우저 Notification API로 리마인더.

### 구현
- **권한 요청**: 앱 첫 실행 시 또는 설정에서.
- **알림 트리거**:
  - 태스크 시작 시간 도래 시.
  - 매일 아침 (설정 가능) DO 미완료 요약.
- **NotificationProvider**: 권한 상태 관리 + 스케줄링.
- Service Worker 등록하여 백그라운드 알림 지원.

---

## 파일 구조 (신규/수정)

```
src/
  lib/
    supabase.ts          (신규) Supabase 클라이언트
    types.ts             (수정) Subtask, Tag, Template, Achievement 타입
    constants.ts         (수정) ACHIEVEMENTS 상수
    achievements.ts      (신규) 업적 해금 로직
    streak-utils.ts      (신규) 스트릭 계산
  providers/
    AuthProvider.tsx      (신규) 인증 상태
    TodoProvider.tsx      (수정) Supabase 연동 + undo 스택
    NotificationProvider.tsx (신규) 알림 관리
  components/
    common/
      UndoToast.tsx       (신규)
      SearchOverlay.tsx   (신규)
    matrix/
      TaskCard.tsx        (수정) 서브태스크 진행률, 태그 칩
      TodayWidget.tsx     (신규)
    calendar/
      WeeklyTimeline.tsx  (신규)
      SwipeableTask.tsx   (신규)
    report/
      Heatmap.tsx         (신규)
      MonthlyReport.tsx   (신규)
      AchievementGrid.tsx (신규)
    modals/
      AddTodoModal.tsx    (수정) 태그, 템플릿
      TaskDetailModal.tsx (수정) 서브태스크, 태그
      TemplateModal.tsx   (신규)
      ShareThemeModal.tsx (신규)
    focus/
      FocusMode.tsx       (신규)
      PomodoroTimer.tsx   (신규)
    share/
      ShareCard.tsx       (수정) 4종 테마
  hooks/
    useStreak.ts          (신규)
    useAchievements.ts    (신규)
    useNotification.ts    (신규)
    useSearch.ts          (신규)
  app/
    layout.tsx            (수정) AuthProvider, NotificationProvider 래핑
```

## 배치 전략

- **Batch 1**: Supabase + 실행취소 + 검색 + 위젯 + 서브태스크 + 태그
- **Batch 2**: 스트릭 + 업적 + 포커스모드 + 스와이프 + 템플릿
- **Batch 3**: 히트맵 + 월간리포트 + 주간뷰 + 공유카드 + 알림
