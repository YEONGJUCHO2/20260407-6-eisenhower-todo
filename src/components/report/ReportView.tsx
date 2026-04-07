"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useTodoContext } from "@/hooks/useTodos";
import { getWeekRange, addDays } from "@/lib/date-utils";
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
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>
        <div className="text-center">
          <h2 className="font-display text-headline text-on-surface">이번 주 리포트</h2>
          <p className="text-label-sm text-outline mt-1">{weekLabel}</p>
        </div>
        <button
          onClick={() => setWeekOffset((w) => Math.min(w + 1, 0))}
          className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface rounded-full"
          disabled={weekOffset >= 0}
          aria-label="다음 주"
        >
          <span className={`material-symbols-outlined text-[20px] ${weekOffset >= 0 ? "opacity-20" : ""}`}>
            chevron_right
          </span>
        </button>
      </div>

      {stats.total === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-[48px] text-outline/40 mb-4 block">
            insert_chart
          </span>
          <p className="text-body-lg text-outline">아직 데이터가 부족해요</p>
          <p className="text-body-sm text-outline/60 mt-1">이번 주를 채워보세요!</p>
        </div>
      ) : (
        <>
          <section>
            <h3 className="font-display text-body-lg text-on-surface mb-4">사분면별 비율</h3>
            <DonutChart counts={stats.counts} />
          </section>

          <section>
            <h3 className="font-display text-body-lg text-on-surface mb-4">나의 시간 사용 유형</h3>
            <PersonalityCard type={stats.personalityType} ratios={stats.ratios} />
          </section>

          {stats.recurringTasks.length > 0 && (
            <section>
              <h3 className="font-display text-body-lg text-on-surface mb-4">반복 달성률</h3>
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
