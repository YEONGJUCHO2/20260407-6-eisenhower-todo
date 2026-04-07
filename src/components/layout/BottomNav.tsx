"use client";

import { TabId } from "@/lib/types";
import { TABS } from "@/lib/constants";

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0e0e12]/90 backdrop-blur-[48px] safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 px-5 py-2 rounded-xl transition-all duration-150 ${
                isActive
                  ? "bg-quadrant-plan-container/10 text-quadrant-plan-primary"
                  : "text-outline hover:text-on-surface-variant"
              }`}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{
                  fontVariationSettings: isActive
                    ? "'FILL' 1, 'wght' 500"
                    : "'FILL' 0, 'wght' 400",
                }}
              >
                {tab.icon}
              </span>
              <span className="text-label-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
