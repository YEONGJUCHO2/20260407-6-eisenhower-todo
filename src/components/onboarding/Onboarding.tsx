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
