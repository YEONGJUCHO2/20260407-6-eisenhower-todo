import { Quadrant, QuadrantInfo } from "./types";

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
    advice: "당신의 2사분면을 지키세요. 거기에 인생이 있습니다.",
    condition: (ratios: Record<Quadrant, number>) => ratios.do >= 0.5,
  },
  strategist: {
    id: "strategist",
    name: "전략가형",
    icon: "psychology",
    description: "중요한 일에 집중하는 이상적인 사람",
    advice: "당신은 이미 아이젠하워의 길을 걷고 있습니다.",
    condition: (ratios: Record<Quadrant, number>) => ratios.plan >= 0.3,
  },
  yesman: {
    id: "yesman",
    name: "예스맨형",
    icon: "handshake",
    description: "남의 일만 처리하는 사람",
    advice: "NO라고 말하는 법을 배우세요. 당신의 시간은 당신 것입니다.",
    condition: (ratios: Record<Quadrant, number>) => ratios.delegate >= 0.4,
  },
  wanderer: {
    id: "wanderer",
    name: "방랑자형",
    icon: "explore",
    description: "시간을 흘려보내는 사람",
    advice: "계획은 아무것도 아니다. 하지만 계획하기가 전부다.",
    condition: (ratios: Record<Quadrant, number>) => ratios.delete >= 0.3,
  },
  balancer: {
    id: "balancer",
    name: "균형자형",
    icon: "balance",
    description: "모든 영역을 적절히 관리하는 사람",
    advice: "균형을 잡은 당신, 이제 2사분면의 비율을 더 높여보세요.",
    condition: () => true, // fallback
  },
} as const;

export const TABS = [
  { id: "calendar" as const, label: "캘린더", icon: "calendar_month" },
  { id: "matrix" as const, label: "매트릭스", icon: "grid_view" },
  { id: "report" as const, label: "리포트", icon: "bar_chart" },
];

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
