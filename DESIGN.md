# Design System — 아이젠하워 투두 매트릭스

## Product Context
- **What this is:** 아이젠하워 4사분면(DO/PLAN/DELEGATE/DELETE) 기반 할 일 관리 앱
- **Who it's for:** 생산성에 관심 있는 한국어 사용자. 업무 + 개인 할 일 관리
- **Space/industry:** 생산성/투두 앱. 경쟁: Todoist, TickTick, Things 3, Superlist
- **Project type:** 모바일 앱 (다크 테마 전용 v1)

## Aesthetic Direction
- **Direction:** Obsidian Minimal — 프리미엄 다크 테마 + 절제된 글래스 모피즘
- **Decoration level:** intentional — glass card + obsidian gradient 사용. blur 값은 32px 통일. 장식적 blur blob은 SNS 공유 카드에만 허용
- **Mood:** "어두운 서재에서 정리된 책상을 바라보는 느낌." 차분하지만 날카로운 질서. Things 3의 프리미엄 느낌을 다크 테마로
- **Reference:** Things 3 (프리미엄 느낌), Superlist (인터랙션), Todoist (미니멀 레이아웃)

## Quadrant Color System
4사분면은 앱의 핵심 시각 언어. 모든 화면에서 일관되게 사용.

| Quadrant | Role | Primary | Container | Meaning |
|----------|------|---------|-----------|---------|
| Q1 DO | 긴급+중요 | #ffb3ad | #ff5451 | 즉시 실행 |
| Q2 PLAN | 비긴급+중요 | #adc6ff | #0566d9 | 계획 수립 |
| Q3 DELEGATE | 긴급+비중요 | #ffb95f | #ca8100 | 위임 |
| Q4 DELETE | 비긴급+비중요 | #8c909f | #424754 | 제거 |

## Color
- **Approach:** balanced — 4사분면 색상이 핵심 의미를 전달, 나머지는 중립
- **Surface scale (depth 4단계):**
  - surface-container-lowest: #0e0e12 (가장 깊은 배경)
  - surface: #131317 (앱 배경)
  - surface-container-low: #1b1b1f (카드/사분면 배경)
  - surface-container: #1f1f23 (모달/시트 배경)
  - surface-container-high: #2a292e (입력 필드 배경)
  - surface-container-highest: #353439 (활성 요소 배경)
- **Text:**
  - on-surface: #e4e1e7 (본문 텍스트)
  - on-surface-variant: #c2c6d6 (보조 텍스트)
  - outline: #8c909f (비활성 텍스트, Q4 색상 겸용)
- **Semantic:**
  - error: #ffb4ab / error-container: #93000a
  - success: 미정의 (구현 시 추가)
  - warning: tertiary #ffb95f 겸용
- **Glass effect:**
  - glass-card: rgba(255, 255, 255, 0.05) + backdrop-filter: blur(32px)
  - obsidian-gradient: radial-gradient(circle at 50% 0%, rgba(173, 198, 255, 0.05) 0%, rgba(19, 19, 23, 0) 70%)
- **Dark mode:** v1은 다크 전용. 라이트 모드는 v2에서 고려

## Typography
- **Display/Hero:** Manrope 700-800 — 기하학적이면서 따뜻한 느낌. 사분면 라벨, 리포트 제목, 앱 타이틀에 사용
- **Body:** Inter 400-600 — 가독성 최고. 할 일 본문, 설명, UI 라벨에 사용. tabular-nums 지원
- **UI/Labels:** Inter 500-600 — 탭 라벨, 뱃지 텍스트, 메타데이터
- **Data/Tables:** Inter tabular-nums — 숫자, 퍼센티지, 날짜 표시
- **Loading:** Google Fonts CDN
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@700;800&display=swap" rel="stylesheet">
  ```
- **Scale:**
  - display-lg: 32px / Manrope 800 (리포트 헤더)
  - display-md: 24px / Manrope 700 (섹션 제목)
  - headline: 18px / Manrope 700 (앱 타이틀, 카드 제목)
  - body-lg: 16px / Inter 500 (강조 본문)
  - body-md: 14px / Inter 400 (기본 본문)
  - body-sm: 13px / Inter 400 (할 일 카드 텍스트)
  - label-lg: 12px / Inter 600 (탭 라벨)
  - label-sm: 10px / Inter 600 uppercase tracking-widest (사분면 라벨, 메타 뱃지)

## Spacing
- **Base unit:** 4px
- **Density:** comfortable
- **Scale:** 2xs(2px) xs(4px) sm(8px) md(16px) lg(24px) xl(32px) 2xl(48px) 3xl(64px)
- **Component spacing:**
  - 화면 패딩: 24px (px-6)
  - 카드 내부 패딩: 12-16px (p-3 ~ p-4)
  - 카드 간 간격: 8px (gap-2)
  - 사분면 간 간격: 8px mobile / 16px desktop (gap-2 md:gap-4)
  - 섹션 간 간격: 32-40px (space-y-8 ~ space-y-10)

## Layout
- **Approach:** grid-disciplined
- **Matrix view:** 2x2 CSS Grid, 각 사분면은 동일 크기. height: calc(100vh - 180px)
- **Calendar/Report:** max-w-md mx-auto, 단일 칼럼
- **Modal:** 바텀시트 패턴, rounded-t-[24px], max-w-2xl mx-auto
- **Max content width:** 448px (max-w-md) for single column, 전체 화면 for matrix
- **Border radius:**
  - sm: 4px — 작은 뱃지, 인풋
  - md: 10px — 카드, 태스크 아이템
  - lg: 16px — 사분면, 패널
  - xl: 24px — 모달 상단
  - full: 9999px — 칩, 버튼, FAB

## Components (통일 기준)

### Navigation
- **Bottom Navigation:** 3탭 (Calendar / Matrix / Report). bg-slate-950/90 backdrop-blur-2xl. 활성 탭은 bg-blue-500/10 text-blue-400 rounded-xl. 아이콘은 Material Symbols Outlined, 활성 시 FILL 1. 라벨 텍스트는 모든 화면에서 통일 (표시 또는 비표시 중 택1)
- **Header:** sticky top-0, bg-slate-950/80 backdrop-blur-3xl. 좌: 햄버거 메뉴 + 앱 타이틀. 우: 기능 아이콘
- **FAB:** 고정 위치 (bottom-24 right-6), 52x52px, secondary gradient, shadow-xl

### Cards
- **Task card:** glass-card (rgba(255,255,255,0.05) + blur(32px)), rounded-[10px], border border-white/5
- **Quadrant section:** bg-surface-container-low, rounded-[16px], 좌측 1px 컬러 바 (각 사분면 primary 색상)
- **Interactive states:** hover:bg-white/[0.08], active:cursor-grabbing, drag시 scale-[1.04] -rotate-[1.5deg] shadow-[0_20px_40px_rgba(0,0,0,0.4)]

### Interaction States (구현 필수)
| Feature | Loading | Empty | Error | Success |
|---------|---------|-------|-------|---------|
| Matrix quadrant | skeleton pulse | 사분면별 가이드 메시지 + 추가 유도 | 재시도 버튼 | 체크마크 + fadeOut |
| Task add | 버튼 loading spinner | N/A | 빨간 테두리 + 에러 메시지 | 햅틱 + 모달 닫힘 |
| Calendar | skeleton grid | "이 날은 자유로운 날!" | 재시도 | 도트 애니메이션 |
| Weekly report | 도넛 차트 애니메이션 | "아직 데이터가 부족해요. 이번 주를 채워보세요!" | 재시도 | 유형 결과 reveal |
| Share card | 생성 중 로딩 | N/A | 공유 실패 토스트 | 공유 완료 토스트 |

### Empty State Messages
| Quadrant | Message | Sub-message |
|----------|---------|-------------|
| DO | "오늘 긴급한 일이 없어요" | "좋은 날이네요! 계획에 집중하세요" |
| PLAN | "장기 목표를 추가해보세요" | "여기가 진짜 인생을 바꾸는 곳이에요" |
| DELEGATE | "혼자 다 하지 마세요" | "넘길 수 있는 일을 찾아보세요" |
| DELETE | "정리할 게 없네요" | "깔끔합니다!" |

## Motion
- **Approach:** intentional
- **Easing:**
  - enter: ease-out (요소 등장)
  - exit: ease-in (요소 퇴장)
  - move: ease-in-out (위치 변경)
  - spring: spring(1, 80, 10) (드래그 앤 드롭)
- **Duration:**
  - micro: 50-100ms (호버, 포커스)
  - short: 150-250ms (버튼 클릭, 토글)
  - medium: 300ms (모달 진입, 페이지 전환)
  - long: 400-700ms (도넛 차트 애니메이션, 온보딩)
- **Key animations:**
  - 태스크 완료: 체크마크 draw → 0.3s hold → opacity fadeOut 200ms
  - 사분면 간 드래그: spring physics, 카드 회전 + 스케일업
  - 모달 진입: slide-up from bottom, ease-out 300ms
  - FAB 탭: scale-95 → scale-100 spring

## Accessibility (WCAG AA)
- **Color contrast:** 최소 4.5:1 (본문), 3:1 (대형 텍스트)
  - on-surface (#e4e1e7) on surface (#131317) = ~12:1 ✓
  - outline (#8c909f) on surface (#131317) = ~4.2:1 — 경계선. 보조 텍스트 최소 크기 14px 이상 유지
- **Touch targets:** 최소 44x44px. 캘린더 날짜 셀, 체크박스, 네비게이션 버튼 모두 적용
- **Drag alternative:** 태스크 상세 바텀시트에서 사분면 변경 셀렉터 제공 (드래그 불가 사용자 대안)
- **Screen reader:** ARIA 라벨 필수 — 사분면 헤더, 캘린더 날짜, 네비게이션 탭, 모달 제목
- **Keyboard:** Tab 순서 정의. Focus visible 스타일: ring-2 ring-secondary/50

## Screens (정의된 화면 목록)
1. **매트릭스 뷰 (메인)** — 2x2 사분면 그리드 + 태스크 카드 + 드래그 앤 드롭
2. **할 일 추가 모달** — 바텀시트. 텍스트 입력 + 음성 + 사분면 선택 + 반복 설정
3. **태스크 상세 바텀시트** — (신규) 탭 시 표시. 제목 편집, 메모, 마감일, 사분면 변경, 삭제
4. **캘린더 뷰** — 월간 그리드 + 일일 태스크 리스트
5. **공유 카드 (SNS)** — 4:5 비율. 성격 유형 결과 + 사분면 비율 + 아이젠하워 명언
6. **주간 리포트** — 도넛 차트 + 유형 분석 카드 + 루틴 달성도
7. **온보딩** — (신규) 3단계 인터랙티브 튜토리얼
8. **설정/프로필** — (신규) 햄버거 메뉴에서 접근. 알림, 데이터 백업, 로그아웃

## Stitch Design Token Unification
Stitch에서 화면별 독립 생성 시 발생한 불일치 통일 기준:

| 속성 | 통일 값 | 비고 |
|-----|---------|------|
| Glass blur | 32px | 화면 1은 24px, 2/3은 40px이었음 → 32px로 통일 |
| FAB color | from-secondary-container to-secondary gradient | 캘린더 뷰의 surface-tint 사용 금지 |
| Bottom nav labels | 항상 표시 | 화면 1만 라벨 있고 나머지 없었음 → 전부 표시 |
| Header pattern | sticky, bg-slate-950/80, backdrop-blur-3xl | 모든 화면 동일 |

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-07 | 다크모드 전용 (v1) | Stitch 디자인이 다크 테마로 완성도 높음. 라이트 모드는 v2 |
| 2026-04-07 | Manrope + Inter 유지 | Stitch에서 이미 검증. 구글 폰트 CDN 사용 가능. Satoshi/Plus Jakarta Sans는 자체 호스팅 필요하므로 보류 |
| 2026-04-07 | 태스크 탭 → 바텀시트 상세 | 할 일 추가 모달과 같은 UX 패턴으로 일관성 |
| 2026-04-07 | 빈 상태 → 사분면별 가이드 메시지 | 따뜻하고 개성 있는 빈 상태로 첫 사용 경험 개선 |
| 2026-04-07 | 온보딩 → 인터랙티브 3단계 튜토리얼 | 아이젠하워 매트릭스를 모르는 사용자 대응 |
| 2026-04-07 | WCAG AA 기본 접근성 | 색상 대비, 터치 타겟 44px, 드래그 대안 제공 |
| 2026-04-07 | 햄버거 메뉴 → 설정 + 프로필 | 알림 설정, 데이터 백업, 로그아웃 |
| 2026-04-07 | Glass blur 32px 통일 | Stitch 화면 간 불일치 해결 (24px/40px → 32px) |
