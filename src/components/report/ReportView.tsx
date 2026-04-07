"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import html2canvas from "html2canvas";
import { useTodoContext } from "@/hooks/useTodos";
import { getWeekRange, addDays, toDateString } from "@/lib/date-utils";
import { calculateWeeklyStats } from "@/lib/report-utils";
import DonutChart from "./DonutChart";
import PersonalityCard from "./PersonalityCard";
import AchievementBar from "./AchievementBar";
import ShareCard from "@/components/share/ShareCard";

export default function ReportView() {
  const { todos } = useTodoContext();
  const [weekOffset, setWeekOffset] = useState(0);
  const [showShareCard, setShowShareCard] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

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

  const handleShare = useCallback(async () => {
    setShowShareCard(true);
    await new Promise((r) => setTimeout(r, 100));

    if (!shareRef.current) return;
    try {
      const canvas = await html2canvas(shareRef.current, {
        scale: 1,
        backgroundColor: "#131317",
        useCORS: true,
      });
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/png")
      );

      const file = new File([blob], "eisenhower-report.png", { type: "image/png" });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: "나의 시간 사용 유형", files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "eisenhower-report.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // User cancelled or error
    }
    setShowShareCard(false);
  }, []);

  const handleExportMD = useCallback(() => {
    const lines: string[] = [];
    lines.push(`# ${weekLabel}\n`);

    const quadrantLabels = { do: "즉시 실행", plan: "계획 수립", delegate: "위임", delete: "제거" };
    const dateStrings: string[] = [];
    const d = new Date(start);
    while (d <= end) {
      dateStrings.push(toDateString(d));
      d.setDate(d.getDate() + 1);
    }

    const weekTodos = todos.filter((t) => dateStrings.includes(t.date));

    (["do", "plan", "delegate", "delete"] as const).forEach((qId) => {
      const qTodos = weekTodos.filter((t) => t.quadrant === qId);
      if (qTodos.length === 0) return;
      lines.push(`## ${quadrantLabels[qId]}\n`);
      qTodos.forEach((t) => {
        const check = t.completed ? "x" : " ";
        const repeat = t.repeat !== "none" ? " (반복)" : "";
        lines.push(`- [${check}] ${t.title}${repeat}`);
      });
      lines.push("");
    });

    lines.push(`---`);
    lines.push(`유형: ${stats.personalityType.name}`);

    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eisenhower-${format(start, "yyyy-MM-dd")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [todos, start, end, weekLabel, stats]);

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

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 py-3 rounded-full glass-card text-body-md font-medium text-on-surface flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
              공유하기
            </button>
            <button
              onClick={handleExportMD}
              className="flex-1 py-3 rounded-full glass-card text-body-md font-medium text-on-surface flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              마크다운
            </button>
          </div>
        </>
      )}

      {/* Hidden share card for capture */}
      {showShareCard && (
        <div className="fixed -left-[9999px] top-0">
          <ShareCard
            ref={shareRef}
            personalityName={stats.personalityType.name}
            personalityIcon={stats.personalityType.icon}
            ratios={stats.ratios}
            recurringRate={
              stats.recurringTasks.length > 0
                ? Math.round(
                    (stats.recurringTasks.reduce((sum, t) => sum + t.achieved, 0) /
                      stats.recurringTasks.reduce((sum, t) => sum + t.total, 0)) * 100
                  )
                : 0
            }
            quote={stats.personalityType.advice}
          />
        </div>
      )}
    </div>
  );
}
