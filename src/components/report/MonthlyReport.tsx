"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Todo } from "@/lib/types";
import { QUADRANTS, QUADRANT_ORDER } from "@/lib/constants";
import { calculateMonthlyStats } from "@/lib/monthly-report-utils";
import DonutChart from "./DonutChart";
import TrendChart from "./TrendChart";

interface MonthlyReportProps {
  todos: Todo[];
  monthDate: Date;
}

export default function MonthlyReport({ todos, monthDate }: MonthlyReportProps) {
  const stats = useMemo(
    () => calculateMonthlyStats(todos, monthDate),
    [todos, monthDate]
  );

  if (stats.total === 0) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-[48px] text-outline/40 mb-4 block">
          insert_chart
        </span>
        <p className="text-body-lg text-outline">이번 달 데이터가 없어요</p>
        <p className="text-body-sm text-outline/60 mt-1">할 일을 추가해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Donut */}
      <section>
        <h3 className="font-display text-body-lg text-on-surface mb-4">
          사분면별 비율
        </h3>
        <DonutChart counts={stats.counts} />
      </section>

      {/* Trend chart */}
      <section>
        <h3 className="font-display text-body-lg text-on-surface mb-4">
          주간 추이
        </h3>
        <TrendChart weeklyTrend={stats.weeklyTrend} />
      </section>

      {/* Month comparison */}
      <section>
        <h3 className="font-display text-body-lg text-on-surface mb-4">
          지난달 대비
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {QUADRANT_ORDER.map((q) => {
            const delta = stats.prevMonthComparison[q];
            const info = QUADRANTS[q];
            return (
              <div
                key={q}
                className="glass-card rounded-md p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: info.primary }}
                  />
                  <span className="text-body-sm text-on-surface">
                    {info.label}
                  </span>
                </div>
                <span
                  className={`text-body-sm font-semibold ${
                    delta > 0
                      ? "text-green-400"
                      : delta < 0
                      ? "text-red-400"
                      : "text-outline"
                  }`}
                >
                  {delta > 0 ? "+" : ""}
                  {delta}%
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Summary */}
      <div className="text-center text-body-sm text-on-surface-variant">
        총 {stats.total}개 중 {stats.completed}개 완료 (
        {stats.total > 0
          ? Math.round((stats.completed / stats.total) * 100)
          : 0}
        %)
      </div>
    </div>
  );
}
