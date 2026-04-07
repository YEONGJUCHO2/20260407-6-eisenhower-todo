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
