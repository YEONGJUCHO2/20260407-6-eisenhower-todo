"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface PomodoroTimerProps {
  onComplete: () => void;
}

export default function PomodoroTimer({ onComplete }: PomodoroTimerProps) {
  const [phase, setPhase] = useState<"work" | "break">("work");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const completedRef = useRef(false);

  const totalSeconds = phase === "work" ? 25 * 60 : 5 * 60;
  const progress = 1 - secondsLeft / totalSeconds;

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          setRunning(false);
          if (phase === "work" && !completedRef.current) {
            completedRef.current = true;
            onComplete();
            setPhase("break");
            return 5 * 60;
          } else {
            setPhase("work");
            completedRef.current = false;
            return 25 * 60;
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, phase, onComplete]);

  const reset = useCallback(() => {
    setRunning(false);
    setPhase("work");
    setSecondsLeft(25 * 60);
    completedRef.current = false;
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  // SVG circle
  const size = 200;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Phase label */}
      <span
        className={`text-label-lg uppercase tracking-widest ${
          phase === "work" ? "text-quadrant-do-primary" : "text-green-400"
        }`}
      >
        {phase === "work" ? "집중" : "휴식"}
      </span>

      {/* Circle timer */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={phase === "work" ? "var(--color-q-do-primary)" : "#4ade80"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        {/* Time display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-display-lg text-on-surface tabular-nums">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={() => setRunning(!running)}
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-quadrant-plan-container to-[#0450b0] text-white text-body-md font-semibold"
        >
          {running ? "일시정지" : "시작"}
        </button>
        <button
          onClick={reset}
          className="px-4 py-2.5 rounded-full bg-surface-container-high text-outline text-body-md"
        >
          리셋
        </button>
      </div>
    </div>
  );
}
