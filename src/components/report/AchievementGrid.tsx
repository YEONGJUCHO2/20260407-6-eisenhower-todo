"use client";

import { ACHIEVEMENTS, AchievementType } from "@/lib/constants";
import { Achievement } from "@/lib/types";

interface AchievementGridProps {
  achievements: Achievement[];
}

export default function AchievementGrid({ achievements }: AchievementGridProps) {
  const unlockedTypes = new Set(achievements.map((a) => a.type));
  const allTypes = Object.keys(ACHIEVEMENTS) as AchievementType[];

  return (
    <div className="grid grid-cols-2 gap-2">
      {allTypes.map((type) => {
        const info = ACHIEVEMENTS[type];
        const unlocked = unlockedTypes.has(type);
        const achievement = achievements.find((a) => a.type === type);

        return (
          <div
            key={type}
            className={`rounded-lg p-3 border transition-all ${
              unlocked
                ? "bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_12px_rgba(234,179,8,0.1)]"
                : "bg-surface-container-low border-white/5 opacity-50"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`material-symbols-outlined text-[20px] ${
                  unlocked ? "text-yellow-400" : "text-outline/40"
                }`}
                style={unlocked ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {unlocked ? info.icon : "lock"}
              </span>
              <span
                className={`text-body-sm font-semibold ${
                  unlocked ? "text-on-surface" : "text-outline/60"
                }`}
              >
                {info.name}
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant">{info.desc}</p>
            {unlocked && achievement && (
              <p className="text-[9px] text-outline mt-1">
                {new Date(achievement.unlockedAt).toLocaleDateString("ko-KR")}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
