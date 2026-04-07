"use client";

import { Quadrant } from "@/lib/types";
import { QUADRANTS, QUADRANT_ORDER } from "@/lib/constants";

interface QuadrantSelectorProps {
  selected: Quadrant;
  onChange: (q: Quadrant) => void;
}

export default function QuadrantSelector({
  selected,
  onChange,
}: QuadrantSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-sm">
      {QUADRANT_ORDER.map((qId) => {
        const q = QUADRANTS[qId];
        const isSelected = selected === qId;
        return (
          <button
            key={qId}
            onClick={() => onChange(qId)}
            className="flex items-center gap-2 px-3 py-3 rounded-md border transition-all duration-150"
            style={{
              borderColor: isSelected ? q.primary : "rgba(255,255,255,0.05)",
              backgroundColor: isSelected ? q.primary + "10" : "transparent",
              boxShadow: isSelected ? `0 0 12px ${q.primary}20` : "none",
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: q.primary }}
            />
            <div className="text-left">
              <p
                className="text-body-sm font-medium"
                style={{ color: isSelected ? q.primary : "#e4e1e7" }}
              >
                {q.label}
              </p>
              <p className="text-label-sm text-outline">{q.sublabel}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
