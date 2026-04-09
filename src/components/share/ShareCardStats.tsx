"use client";

import { forwardRef } from "react";
import { Quadrant } from "@/lib/types";

interface ShareCardStatsProps {
  personalityName: string;
  totalCompleted: number;
  streakDays: number;
  achievementCount: number;
  ratios: Record<Quadrant, number>;
}

const ShareCardStats = forwardRef<HTMLDivElement, ShareCardStatsProps>(
  ({ personalityName, totalCompleted, streakDays, achievementCount, ratios }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1350,
          background: "#0e0e12",
          display: "flex",
          flexDirection: "column",
          padding: "100px 80px",
          fontFamily: "Manrope, Inter, sans-serif",
          color: "#e4e1e7",
        }}
      >
        <p
          style={{
            fontSize: 20,
            color: "#8c909f",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          나의 생산성 리포트
        </p>
        <h1
          style={{
            fontSize: 56,
            fontWeight: 800,
            marginBottom: 60,
          }}
        >
          {personalityName}
        </h1>

        {/* Big numbers */}
        <div style={{ display: "flex", gap: 40, marginBottom: 60 }}>
          <div>
            <p style={{ fontSize: 72, fontWeight: 800, color: "#adc6ff" }}>
              {totalCompleted}
            </p>
            <p style={{ fontSize: 18, color: "#8c909f" }}>완료한 할 일</p>
          </div>
          <div>
            <p style={{ fontSize: 72, fontWeight: 800, color: "#ffb3ad" }}>
              {streakDays}
            </p>
            <p style={{ fontSize: 18, color: "#8c909f" }}>연속 달성일</p>
          </div>
          <div>
            <p style={{ fontSize: 72, fontWeight: 800, color: "#ffb95f" }}>
              {achievementCount}
            </p>
            <p style={{ fontSize: 18, color: "#8c909f" }}>업적 해금</p>
          </div>
        </div>

        {/* Ratios */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
          {(
            [
              { key: "do" as Quadrant, label: "즉시 실행", color: "#ffb3ad" },
              { key: "plan" as Quadrant, label: "계획 수립", color: "#adc6ff" },
              { key: "delegate" as Quadrant, label: "위임", color: "#ffb95f" },
              { key: "delete" as Quadrant, label: "제거", color: "#8c909f" },
            ] as const
          ).map(({ key, label, color }) => (
            <div key={key}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 18, color: "#c2c6d6" }}>{label}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color }}>
                  {Math.round(ratios[key] * 100)}%
                </span>
              </div>
              <div
                style={{
                  height: 12,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.round(ratios[key] * 100)}%`,
                    height: "100%",
                    backgroundColor: color,
                    borderRadius: 6,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 18, color: "#424754", textAlign: "center" }}>
          아이젠하워 투두
        </p>
      </div>
    );
  }
);

ShareCardStats.displayName = "ShareCardStats";
export default ShareCardStats;
