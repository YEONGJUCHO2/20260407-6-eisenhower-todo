"use client";

import { useEffect, useRef } from "react";
import { Chart, DoughnutController, ArcElement, Tooltip } from "chart.js";
import { Quadrant } from "@/lib/types";
import { QUADRANTS, QUADRANT_ORDER } from "@/lib/constants";

Chart.register(DoughnutController, ArcElement, Tooltip);

interface DonutChartProps {
  counts: Record<Quadrant, number>;
}

export default function DonutChart({ counts }: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    chartRef.current = new Chart(canvasRef.current, {
      type: "doughnut",
      data: {
        labels: QUADRANT_ORDER.map((q) => QUADRANTS[q].label),
        datasets: [
          {
            data: QUADRANT_ORDER.map((q) => counts[q]),
            backgroundColor: QUADRANT_ORDER.map((q) => QUADRANTS[q].primary),
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
  }, [counts]);

  return (
    <div className="relative w-48 h-48 mx-auto">
      <canvas ref={canvasRef} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-display-md font-display text-on-surface">
          {Object.values(counts).reduce((a, b) => a + b, 0)}
        </span>
        <span className="text-label-sm text-outline">전체 할 일</span>
      </div>
    </div>
  );
}
