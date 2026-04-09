"use client";

import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

interface TrendChartProps {
  weeklyTrend: {
    week: string;
    do: number;
    plan: number;
    delegate: number;
    delete: number;
  }[];
}

export default function TrendChart({ weeklyTrend }: TrendChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const labels = weeklyTrend.map((_, i) => `${i + 1}주차`);

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "즉시 실행",
            data: weeklyTrend.map((w) => w.do),
            borderColor: "#ffb3ad",
            backgroundColor: "rgba(255,179,173,0.1)",
            tension: 0.3,
            pointRadius: 3,
          },
          {
            label: "계획 수립",
            data: weeklyTrend.map((w) => w.plan),
            borderColor: "#adc6ff",
            backgroundColor: "rgba(173,198,255,0.1)",
            tension: 0.3,
            pointRadius: 3,
          },
          {
            label: "위임",
            data: weeklyTrend.map((w) => w.delegate),
            borderColor: "#ffb95f",
            backgroundColor: "rgba(255,185,95,0.1)",
            tension: 0.3,
            pointRadius: 3,
          },
          {
            label: "제거",
            data: weeklyTrend.map((w) => w.delete),
            borderColor: "#8c909f",
            backgroundColor: "rgba(140,144,159,0.1)",
            tension: 0.3,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#c2c6d6",
              font: { size: 10 },
              boxWidth: 12,
              padding: 8,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: "#8c909f", font: { size: 10 } },
            grid: { color: "rgba(255,255,255,0.05)" },
          },
          y: {
            beginAtZero: true,
            ticks: { color: "#8c909f", font: { size: 10 }, stepSize: 1 },
            grid: { color: "rgba(255,255,255,0.05)" },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [weeklyTrend]);

  return (
    <div style={{ height: 200 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
