"use client";

import { useEffect, useRef } from "react";
import { Chart, DoughnutController, ArcElement, Tooltip } from "chart.js";
import { Quadrant } from "@/lib/types";
import { QUADRANTS, QUADRANT_ORDER } from "@/lib/constants";

Chart.register(DoughnutController, ArcElement, Tooltip);

const SEGMENT_COLORS: Record<Quadrant, string> = {
  do: "#ff5451",
  plan: "#0566d9",
  delegate: "#ca8100",
  delete: "#424754",
};

interface DonutChartProps {
  counts: Record<Quadrant, number>;
}

export default function DonutChart({ counts }: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: QUADRANT_ORDER.map((q) => QUADRANTS[q].label),
        datasets: [
          {
            data: QUADRANT_ORDER.map((q) => counts[q]),
            backgroundColor: QUADRANT_ORDER.map((q) => SEGMENT_COLORS[q]),
            borderWidth: 0,
            borderRadius: 4,
            spacing: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: "65%",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const pct = total > 0 ? Math.round((ctx.parsed / total) * 100) : 0;
                return ` ${ctx.label}: ${pct}%`;
              },
            },
          },
        },
        animation: {
          animateRotate: true,
          duration: 700,
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [counts, total]);

  return (
    <div>
      {/* Custom legend — horizontal */}
      <div className="flex items-center justify-center gap-4 mb-4">
        {QUADRANT_ORDER.map((q) => (
          <div key={q} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-[2px]"
              style={{ backgroundColor: SEGMENT_COLORS[q] }}
            />
            <span className="text-label-sm text-on-surface-variant">
              {QUADRANTS[q].label}
            </span>
          </div>
        ))}
      </div>

      {/* Donut with center number */}
      <div className="relative w-48 h-48 mx-auto">
        <canvas ref={canvasRef} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            className="text-display-md font-display"
            style={{ color: "var(--color-on-surface)" }}
          >
            {total}
          </span>
          <span
            className="text-label-sm"
            style={{ color: "var(--color-outline)" }}
          >
            전체 할 일
          </span>
        </div>
      </div>
    </div>
  );
}
