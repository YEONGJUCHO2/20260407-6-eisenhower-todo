"use client";

import { QUADRANTS, QUADRANT_ORDER } from "@/lib/constants";
import { Quadrant } from "@/lib/types";

interface PersonalityCardProps {
  type: {
    name: string;
    icon: string;
    description: string;
    advice: string;
  };
  ratios: Record<Quadrant, number>;
}

export default function PersonalityCard({ type, ratios }: PersonalityCardProps) {
  return (
    <div className="glass-card rounded-lg p-5 obsidian-gradient">
      <div className="flex items-center gap-3 mb-4">
        <span
          className="material-symbols-outlined text-[28px] text-quadrant-plan-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {type.icon}
        </span>
        <div>
          <h3 className="font-display text-headline text-on-surface">
            {type.name}
          </h3>
          <p className="text-body-sm text-on-surface-variant">
            {type.description}
          </p>
        </div>
      </div>

      <div className="space-y-2.5 mb-5">
        {QUADRANT_ORDER.map((qId) => {
          const q = QUADRANTS[qId];
          const pct = Math.round(ratios[qId] * 100);
          return (
            <div key={qId} className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: q.primary }}
              />
              <span className="text-label-sm text-on-surface-variant w-14">
                {q.label}
              </span>
              <div className="flex-1 h-2 bg-surface-container-high rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: q.primary }}
                />
              </div>
              <span className="text-label-sm text-outline w-8 text-right">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/5 pt-4">
        <p className="text-body-sm text-on-surface-variant italic">
          <span className="text-quadrant-plan-primary">아이젠하워:</span>{" "}
          &ldquo;{type.advice}&rdquo;
        </p>
      </div>
    </div>
  );
}
