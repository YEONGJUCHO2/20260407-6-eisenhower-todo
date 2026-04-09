"use client";

import { formatDateKR } from "@/lib/date-utils";
import AppLogo from "../common/AppLogo";
import { useTheme } from "@/providers/ThemeProvider";
import { useTodoContext } from "@/hooks/useTodos";
import { useAuth } from "@/providers/AuthProvider";

interface HeaderProps {
  selectedDate: Date;
  onSearchOpen?: () => void;
  onFocusOpen?: () => void;
  onAuthOpen?: () => void;
}

const THEME_CYCLE = { dark: "light", light: "system", system: "dark" } as const;
const THEME_ICON = {
  dark: "dark_mode",
  light: "light_mode",
  system: "brightness_auto",
};

export default function Header({
  selectedDate,
  onSearchOpen,
  onFocusOpen,
  onAuthOpen,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { streak } = useTodoContext();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-surface-container-lowest/80 backdrop-blur-[48px]">
      <div className="flex items-center justify-between px-lg py-3">
        <div className="flex items-center gap-2">
          <AppLogo size="sm" />
          <h1 className="font-display text-headline text-on-surface">
            아이젠하워 투두
          </h1>
          {streak.currentStreak > 0 && (
            <span className="text-[11px] font-semibold text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded-full">
              🔥 {streak.currentStreak}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSearchOpen}
            className="w-8 h-8 flex items-center justify-center rounded-full text-outline hover:text-on-surface transition-colors"
            aria-label="검색"
          >
            <span className="material-symbols-outlined text-[18px]">
              search
            </span>
          </button>
          <button
            onClick={onFocusOpen}
            className="w-8 h-8 flex items-center justify-center rounded-full text-outline hover:text-on-surface transition-colors"
            aria-label="포커스 모드"
          >
            <span className="material-symbols-outlined text-[18px]">
              center_focus_strong
            </span>
          </button>
          <button
            onClick={() => setTheme(THEME_CYCLE[theme])}
            className="w-8 h-8 flex items-center justify-center rounded-full text-outline hover:text-on-surface transition-colors"
            aria-label="테마 변경"
          >
            <span className="material-symbols-outlined text-[18px]">
              {THEME_ICON[theme]}
            </span>
          </button>
          {user ? (
            <button
              onClick={signOut}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-quadrant-plan-primary/20 text-quadrant-plan-primary transition-colors"
              aria-label="로그아웃"
              title={user.email ?? ""}
            >
              <span className="material-symbols-outlined text-[18px]">
                logout
              </span>
            </button>
          ) : (
            <button
              onClick={onAuthOpen}
              className="w-8 h-8 flex items-center justify-center rounded-full text-outline hover:text-on-surface transition-colors"
              aria-label="로그인"
            >
              <span className="material-symbols-outlined text-[18px]">
                person
              </span>
            </button>
          )}
          <span className="text-body-sm text-on-surface-variant">
            {formatDateKR(selectedDate)}
          </span>
        </div>
      </div>
    </header>
  );
}
