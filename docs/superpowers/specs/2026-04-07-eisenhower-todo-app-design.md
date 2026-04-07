# 아이젠하워 투두 매트릭스 앱 설계

## 개요
아이젠하워 4사분면(DO/PLAN/DELEGATE/DELETE) 기반 할 일 관리 모바일 웹앱.
다크 테마 전용, 한국어 UI, Supabase 백엔드.

## 기술 스택
- **프론트엔드:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **백엔드:** Supabase (Auth + PostgreSQL + RLS)
- **상태관리:** Zustand (로컬 상태) + Supabase Realtime (옵션)
- **드래그:** @dnd-kit/core + @dnd-kit/sortable
- **애니메이션:** framer-motion
- **폰트:** Manrope + Inter (Google Fonts)
- **차트:** CSS conic-gradient (도넛), 프로그레스 바는 순수 CSS

## 데이터 모델

### tasks 테이블
```sql
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  quadrant text not null check (quadrant in ('do', 'plan', 'delegate', 'delete')),
  completed boolean default false,
  due_date date,
  repeat text default 'none' check (repeat in ('none', 'daily', 'weekly', 'monthly')),
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table tasks enable row level security;
create policy "Users can CRUD own tasks" on tasks
  for all using (auth.uid() = user_id);

-- Index
create index idx_tasks_user_quadrant on tasks(user_id, quadrant);
create index idx_tasks_user_due on tasks(user_id, due_date);
```

## 화면 구조

### 라우팅
```
app/
  layout.tsx          -- 전역 레이아웃 (폰트, Supabase Provider)
  page.tsx            -- 메인 (3탭 뷰 + 모달)
  login/page.tsx      -- 로그인/회원가입
```

탭 전환은 URL 라우팅 아닌 클라이언트 상태로 처리 (SPA 느낌).

### 컴포넌트 구조
```
components/
  layout/
    AppHeader.tsx        -- 상단 헤더 (앱 타이틀 + 메뉴 + 캘린더 아이콘)
    BottomNav.tsx         -- 하단 3탭 네비게이션
    FloatingActionButton.tsx -- + 버튼
  matrix/
    QuadrantGrid.tsx     -- 2x2 매트릭스 레이아웃
    QuadrantSection.tsx  -- 개별 사분면
    TaskCard.tsx         -- 할 일 카드
    EmptyState.tsx       -- 사분면별 빈 상태 메시지
  calendar/
    MonthCalendar.tsx    -- 월간 캘린더 그리드
    DailyTaskList.tsx    -- 일일 할 일 리스트
  report/
    DonutChart.tsx       -- 사분면 비율 도넛 차트
    PersonalityCard.tsx  -- 유형 분석 카드 (소방관형 등)
    HabitTracker.tsx     -- 루틴 달성도
  modals/
    AddTaskModal.tsx     -- 할 일 추가 바텀시트
    TaskDetailSheet.tsx  -- 태스크 상세 바텀시트
  ui/
    GlassCard.tsx        -- 글래스모피즘 카드
    QuadrantBadge.tsx    -- 사분면 컬러 뱃지
    BottomSheet.tsx      -- 바텀시트 베이스 컴포넌트
```

### 핵심 훅
```
hooks/
  useTasks.ts           -- Supabase CRUD + 로컬 캐시
  useDragAndDrop.ts     -- dnd-kit 래퍼
  useAuth.ts            -- Supabase Auth 상태
```

### 유틸리티
```
lib/
  supabase/
    client.ts           -- 싱글톤 createClient (learning: supabase-client-singleton)
    server.ts           -- 서버 컴포넌트용 클라이언트
  types.ts              -- Task, Quadrant 타입 정의
  constants.ts          -- 사분면 색상, 빈 상태 메시지
  personality.ts        -- 주간 유형 계산 로직
```

## 핵심 기능 상세

### 1. 매트릭스 뷰 (메인)
- 2x2 CSS Grid, `h-[calc(100vh-180px)]`
- 각 사분면: 헤더(라벨 + 카운터) + 스크롤 가능한 태스크 리스트
- 드래그 앤 드롭: @dnd-kit으로 사분면 간 이동
- 완료 처리: 체크 탭 → 체크마크 애니메이션 → 0.3s 후 fadeOut
- 빈 상태: DESIGN.md에 정의된 사분면별 가이드 메시지

### 2. 할 일 추가 모달
- 바텀시트 (framer-motion slide-up, 300ms ease-out)
- 텍스트 입력 + 사분면 선택 (4개 칩) + 반복 설정 + 마감일
- "추가하기" 탭 → Supabase insert → 모달 닫힘 → 매트릭스에 즉시 반영

### 3. 태스크 상세 바텀시트
- 태스크 카드 탭 시 열림
- 제목 편집, 메모 추가, 마감일 변경, 사분면 변경 (드래그 대안), 삭제
- Supabase update/delete

### 4. 캘린더 뷰
- 월간 그리드: 날짜별 사분면 컬러 도트 표시
- 날짜 선택 시 해당 일자의 태스크 리스트 표시
- 오늘 강조 (secondary 색상 원)

### 5. 주간 리포트
- 도넛 차트: CSS conic-gradient로 사분면별 비율
- 성격 유형: 가장 많은 사분면 기준 (DO 60%+ → 소방관형, PLAN 40%+ → 전략가형 등)
- 루틴 달성도: 반복 태스크의 주간 완료율

### 6. 인증
- Supabase Auth: 이메일 로그인 (v1)
- 미인증 시 로그인 페이지로 리다이렉트
- 로그아웃 전 반드시 데이터 저장 await 완료 (learning: signout-save-timing)

## Tailwind 설정
DESIGN.md의 모든 색상 토큰을 tailwind.config.ts에 등록.
글래스 카드, obsidian gradient 등 커스텀 유틸리티 클래스 추가.

## v1 범위
**포함:** 매트릭스 뷰, 캘린더 뷰, 주간 리포트, 할 일 추가/상세 모달, Supabase Auth + DB, 드래그 앤 드롭, 빈 상태
**제외:** 온보딩 튜토리얼, 설정 화면, SNS 공유 카드, AI 소견, 라이트 모드, PWA
