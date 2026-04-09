"use client";

import { forwardRef } from "react";
import { Quadrant } from "@/lib/types";

interface ShareCardMinimalProps {
  personalityName: string;
  quote: string;
  ratios: Record<Quadrant, number>;
}

const ShareCardMinimal = forwardRef<HTMLDivElement, ShareCardMinimalProps>(
  ({ personalityName, quote, ratios }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1350,
          background: "#fafafa",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 80px",
          fontFamily: "Manrope, Inter, sans-serif",
        }}
      >
        <p
          style={{
            fontSize: 24,
            color: "#999",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: 32,
          }}
        >
          나의 시간 사용 유형
        </p>
        <h1
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#111",
            marginBottom: 40,
          }}
        >
          {personalityName}
        </h1>
        <p
          style={{
            fontSize: 28,
            color: "#555",
            textAlign: "center",
            lineHeight: 1.6,
            maxWidth: 700,
            marginBottom: 80,
          }}
        >
          &ldquo;{quote}&rdquo;
        </p>

        {/* Ratio bar */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: 12,
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <div style={{ flex: ratios.do, backgroundColor: "#ff5451" }} />
          <div style={{ flex: ratios.plan, backgroundColor: "#0566d9" }} />
          <div style={{ flex: ratios.delegate, backgroundColor: "#ca8100" }} />
          <div style={{ flex: ratios.delete, backgroundColor: "#424754" }} />
        </div>

        <div style={{ marginTop: "auto", fontSize: 20, color: "#bbb" }}>
          아이젠하워 투두
        </div>
      </div>
    );
  }
);

ShareCardMinimal.displayName = "ShareCardMinimal";
export default ShareCardMinimal;
