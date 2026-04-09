"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { useTodoContext } from "@/hooks/useTodos";
import { getWeekRange, addDays, toDateString } from "@/lib/date-utils";
import { calculateWeeklyStats } from "@/lib/report-utils";
import DonutChart from "./DonutChart";
import PersonalityCard from "./PersonalityCard";
import AchievementBar from "./AchievementBar";
import AchievementGrid from "./AchievementGrid";
import Heatmap from "./Heatmap";
import MonthlyReport from "./MonthlyReport";
import ShareThemeModal from "@/components/modals/ShareThemeModal";

export default function ReportView() {
  const { todos, achievements, streak } = useTodoContext();
  const [weekOffset, setWeekOffset] = useState(0);
  const [reportMode, setReportMode] = useState<"weekly" | "monthly">("weekly");
  const [monthDate, setMonthDate] = useState(new Date());
  const [showShareModal, setShowShareModal] = useState(false);

  const targetDate = useMemo(() => {
    const today = new Date();
    return addDays(today, weekOffset * 7);
  }, [weekOffset]);

  const { start, end } = getWeekRange(targetDate);
  const stats = useMemo(
    () => calculateWeeklyStats(todos, targetDate),
    [todos, targetDate]
  );

  const weekLabel = `${format(start, "M월 d일", { locale: ko })} ~ ${format(
    end,
    "M월 d일",
    { locale: ko }
  )}`;

  const handleExportMD = useCallback(() => {
    const lines: string[] = [];

    const quadrantLabels = {
      do: "즉시 실행",
      plan: "계획 수립",
      delegate: "위임",
      delete: "제거",
    };
    const dateStrings: string[] = [];
    const d = new Date(start);
    while (d <= end) {
      dateStrings.push(toDateString(d));
      d.setDate(d.getDate() + 1);
    }

    const weekTodos = todos.filter((t) => dateStrings.includes(t.date));

    // Group by date, then by quadrant within each date
    dateStrings.forEach((dateStr) => {
      const dayTodos = weekTodos.filter((t) => t.date === dateStr);
      if (dayTodos.length === 0) return;

      const dayLabel = format(new Date(dateStr), "M월 d일 EEEE", { locale: ko });
      lines.push(`# ${dayLabel}\n`);

      (["do", "plan", "delegate", "delete"] as const).forEach((qId) => {
        const qTodos = dayTodos.filter((t) => t.quadrant === qId);
        if (qTodos.length === 0) return;
        lines.push(`## ${quadrantLabels[qId]}\n`);
        qTodos.forEach((t) => {
          const check = t.completed ? "x" : " ";
          const timeStr =
            t.startTime && t.endTime
              ? ` ${t.startTime}-${t.endTime}`
              : "";
          const completionStr = t.completed ? " ✓ 완료" : "";
          const repeat = t.repeat !== "none" ? " 🔁" : "";
          lines.push(`- [${check}] ${t.title}${timeStr}${completionStr}${repeat}`);
        });
        lines.push("");
      });
    });

    lines.push(`---`);
    lines.push(`유형: ${stats.personalityType.name}`);
    lines.push(
      `완료율: ${weekTodos.length > 0 ? Math.round((weekTodos.filter((t) => t.completed).length / weekTodos.length) * 100) : 0}%`
    );

    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eisenhower-${format(start, "yyyy-MM-dd")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [todos, start, end, weekLabel, stats]);

  const totalCompleted = todos.filter((t) => t.completed).length;

  return (
    <div className="px-lg py-4 max-w-md mx-auto space-y-8">
      {/* Mode toggle */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setReportMode("weekly")}
          className={`px-4 py-1.5 rounded-full text-body-sm font-medium transition-all ${
            reportMode === "weekly"
              ? "bg-quadrant-plan-container/20 text-quadrant-plan-primary"
              : "bg-surface-container-high text-outline"
          }`}
        >
          주간
        </button>
        <button
          onClick={() => setReportMode("monthly")}
          className={`px-4 py-1.5 rounded-full text-body-sm font-medium transition-all ${
            reportMode === "monthly"
              ? "bg-quadrant-plan-container/20 text-quadrant-plan-primary"
              : "bg-surface-container-high text-outline"
          }`}
        >
          월간
        </button>
      </div>

      {reportMode === "weekly" ? (
        <>
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
                className={`material-symbols-outlined text-[20px] ${
                  weekOffset >= 0 ? "opacity-20" : ""
                }`}
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
              <p className="text-body-lg text-outline">아직 데이터가 부족해요</p>
              <p className="text-body-sm text-outline/60 mt-1">
                이번 주를 채워보세요!
              </p>
            </div>
          ) : (
            <>
              <section>
                <h3 className="font-display text-body-lg text-on-surface mb-4">
                  사분면별 비율
                </h3>
                <DonutChart counts={stats.counts} />
              </section>

              {/* Heatmap */}
              <section>
                <h3 className="font-display text-body-lg text-on-surface mb-4">
                  생산성 히트맵
                </h3>
                <Heatmap todos={todos} />
              </section>

              <section>
                <h3 className="font-display text-body-lg text-on-surface mb-4">
                  나의 시간 사용 유형
                </h3>
                <PersonalityCard
                  type={stats.personalityType}
                  ratios={stats.ratios}
                />
              </section>

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

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex-1 py-3 rounded-full glass-card text-body-md font-medium text-on-surface flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    share
                  </span>
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
            </>
          )}
        </>
      ) : (
        <>
          {/* Month nav */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMonthDate((d) => subMonths(d, 1))}
              className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface rounded-full"
            >
              <span className="material-symbols-outlined text-[20px]">
                chevron_left
              </span>
            </button>
            <h2 className="font-display text-headline text-on-surface">
              {format(monthDate, "yyyy년 M월", { locale: ko })}
            </h2>
            <button
              onClick={() => setMonthDate((d) => addMonths(d, 1))}
              className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface rounded-full"
            >
              <span className="material-symbols-outlined text-[20px]">
                chevron_right
              </span>
            </button>
          </div>
          <MonthlyReport todos={todos} monthDate={monthDate} />
        </>
      )}

      {/* Achievements */}
      <section>
        <h3 className="font-display text-body-lg text-on-surface mb-4">
          업적
        </h3>
        <AchievementGrid achievements={achievements} />
      </section>

      {/* Share Theme Modal */}
      <ShareThemeModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        personalityName={stats.personalityType.name}
        personalityIcon={stats.personalityType.icon}
        ratios={stats.ratios}
        recurringRate={
          stats.recurringTasks.length > 0
            ? Math.round(
                (stats.recurringTasks.reduce((sum, t) => sum + t.achieved, 0) /
                  stats.recurringTasks.reduce(
                    (sum, t) => sum + t.total,
                    0
                  )) *
                  100
              )
            : 0
        }
        quote={stats.personalityType.advice}
        totalCompleted={totalCompleted}
        streakDays={streak.currentStreak}
        achievementCount={achievements.length}
      />
    </div>
  );
}
