"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { markOnboardingDone } from "@/lib/storage";
import AppLogo from "../common/AppLogo";
import AxisArrows, { VerticalArrow } from "../matrix/AxisArrows";

const STEPS = [
  {
    title: "아이젠하워 매트릭스",
    description: "할 일을 긴급/중요로 나눠 4가지로 분류하세요",
    icon: "grid_view",
    custom: true,
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
              <div className="text-center px-3 py-2.5 bg-quadrant-plan-container/10 rounded-lg mt-5 max-w-[260px] w-full">
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
