"use client";

import { formatDateKR } from "@/lib/date-utils";
import AppLogo from "../common/AppLogo";
import { useTheme } from "@/providers/ThemeProvider";

interface HeaderProps {
  selectedDate: Date;
}

const THEME_CYCLE = { dark: "light", light: "system", system: "dark" } as const;
const THEME_ICON = { dark: "dark_mode", light: "light_mode", system: "brightness_auto" };

export default function Header({ selectedDate }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-surface-container-lowest/80 backdrop-blur-[48px]">
      <div className="flex items-center justify-between px-lg py-3">
        <div className="flex items-center gap-2">
          <AppLogo size="sm" />
          <h1 className="font-display text-headline text-on-surface">
            아이젠하워 투두
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(THEME_CYCLE[theme])}
            className="w-8 h-8 flex items-center justify-center rounded-full text-outline hover:text-on-surface transition-colors"
            aria-label="테마 변경"
          >
            <span className="material-symbols-outlined text-[18px]">
              {THEME_ICON[theme]}
            </span>
          </button>
          <span className="text-body-sm text-on-surface-variant">
            {formatDateKR(selectedDate)}
          </span>
        </div>
      </div>
    </header>
  );
}
