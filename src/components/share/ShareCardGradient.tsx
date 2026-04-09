"use client";

import { forwardRef } from "react";
import { Quadrant } from "@/lib/types";
import { QUADRANTS, QUADRANT_ORDER } from "@/lib/constants";

interface ShareCardGradientProps {
  personalityName: string;
  personalityIcon: string;
  ratios: Record<Quadrant, number>;
  quote: string;
}

const ShareCardGradient = forwardRef<HTMLDivElement, ShareCardGradientProps>(
  ({ personalityName, personalityIcon, ratios, quote }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1350,
          background: "linear-gradient(135deg, #ff5451 0%, #0566d9 50%, #ca8100 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "100px 80px",
          fontFamily: "Manrope, Inter, sans-serif",
          position: "relative",
        }}
      >
        {/* Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Icon */}
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 80, color: "white", marginBottom: 24 }}
          >
            {personalityIcon}
          </span>

          <h1
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: "white",
              marginBottom: 16,
            }}
          >
            {personalityName}
          </h1>

          <p
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.7)",
              textAlign: "center",
              lineHeight: 1.6,
              maxWidth: 700,
              marginBottom: 60,
            }}
          >
            &ldquo;{quote}&rdquo;
          </p>

          {/* Ratio bars */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
            {QUADRANT_ORDER.map((q) => (
              <div key={q} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 80, fontSize: 18, color: "rgba(255,255,255,0.6)", textAlign: "right" }}>
                  {QUADRANTS[q].sublabel}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 24,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.round(ratios[q] * 100)}%`,
                      height: "100%",
                      backgroundColor: "rgba(255,255,255,0.8)",
                      borderRadius: 12,
                    }}
                  />
                </div>
                <span style={{ width: 50, fontSize: 18, color: "white", fontWeight: 700 }}>
                  {Math.round(ratios[q] * 100)}%
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 80, fontSize: 20, color: "rgba(255,255,255,0.4)" }}>
            아이젠하워 투두
          </div>
        </div>
      </div>
    );
  }
);

ShareCardGradient.displayName = "ShareCardGradient";
export default ShareCardGradient;
