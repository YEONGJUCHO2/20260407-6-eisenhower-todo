"use client";

import { forwardRef } from "react";
import { Quadrant } from "@/lib/types";
import { QUADRANTS, QUADRANT_ORDER } from "@/lib/constants";

interface ShareCardProps {
  personalityName: string;
  personalityIcon: string;
  ratios: Record<Quadrant, number>;
  recurringRate: number;
  quote: string;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ personalityName, personalityIcon, ratios, recurringRate, quote }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: "1080px",
          height: "1350px",
          padding: "64px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(180deg, #131317 0%, #0e0e12 100%)",
          fontFamily: "'Manrope', 'Inter', sans-serif",
        }}
      >
        {/* Header */}
        <div>
          <p style={{ fontSize: "28px", color: "#8c909f", marginBottom: "16px" }}>
            나의 시간 사용 유형
          </p>
          <h1 style={{ fontSize: "72px", fontWeight: 800, color: "#e4e1e7", marginBottom: "12px" }}>
            {personalityName}
          </h1>
        </div>

        {/* Bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {QUADRANT_ORDER.map((qId) => {
            const q = QUADRANTS[qId];
            const pct = Math.round(ratios[qId] * 100);
            return (
              <div key={qId}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "24px" }}>
                  <span style={{ color: q.primary }}>{q.label}</span>
                  <span style={{ color: "#8c909f" }}>{pct}%</span>
                </div>
                <div style={{ width: "100%", height: "16px", backgroundColor: "#2a292e", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", backgroundColor: q.primary, borderRadius: "4px" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recurring rate */}
        <div style={{ fontSize: "24px", color: "#c2c6d6" }}>
          반복 달성률: {recurringRate}%
        </div>

        {/* Quote */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "40px" }}>
          <p style={{ fontSize: "28px", color: "#c2c6d6", fontStyle: "italic", lineHeight: 1.6 }}>
            <span style={{ color: "#adc6ff" }}>아이젠하워:</span>
            <br />
            &ldquo;{quote}&rdquo;
          </p>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "24px", color: "#8c909f" }}>아이젠하워 투두</span>
          <span style={{ fontSize: "20px", color: "#adc6ff" }}>나도 해보기 →</span>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = "ShareCard";
export default ShareCard;
