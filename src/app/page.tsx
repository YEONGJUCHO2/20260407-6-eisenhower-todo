"use client";

import { useState, useEffect } from "react";
import { TabId } from "@/lib/types";
import { toDateString } from "@/lib/date-utils";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import FAB from "@/components/layout/FAB";
import MatrixView from "@/components/matrix/MatrixView";
import AddTodoModal from "@/components/modals/AddTodoModal";
import TaskDetailModal from "@/components/modals/TaskDetailModal";
import TemplateModal from "@/components/modals/TemplateModal";
import CalendarView from "@/components/calendar/CalendarView";
import ReportView from "@/components/report/ReportView";
import Onboarding from "@/components/onboarding/Onboarding";
import UndoToast from "@/components/common/UndoToast";
import SearchOverlay from "@/components/common/SearchOverlay";
import AchievementToast from "@/components/common/AchievementToast";
import FocusMode from "@/components/focus/FocusMode";
import { isOnboardingDone } from "@/lib/storage";
import { useTodoContext } from "@/hooks/useTodos";
import { calculateStreak } from "@/lib/streak-utils";
import { checkAchievements } from "@/lib/achievements";
import { AchievementType } from "@/lib/constants";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("matrix");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [detailTodoId, setDetailTodoId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [newAchievement, setNewAchievement] = useState<AchievementType | null>(null);

  const {
    todos,
    tags,
    achievements,
    streak,
    setStreak,
    addAchievement,
  } = useTodoContext();

  useEffect(() => {
    if (!isOnboardingDone()) {
      setShowOnboarding(true);
    }
  }, []);

  // Update streak on todo changes
  useEffect(() => {
    if (todos.length > 0) {
      const newStreak = calculateStreak(todos);
      setStreak(newStreak);
    }
  }, [todos, setStreak]);

  // Check achievements on todo changes
  useEffect(() => {
    if (todos.length === 0) return;
    const newlyUnlocked = checkAchievements(
      todos,
      streak,
      achievements,
      0, // focusCompletions — tracked in localStorage separately
      tags.length
    );
    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach((type) => {
        addAchievement({ type, unlockedAt: new Date().toISOString() });
      });
      setNewAchievement(newlyUnlocked[0]);
    }
  }, [todos, streak, achievements, tags, addAchievement]);

  return (
    <>
      {showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      )}
      {showFocusMode && (
        <FocusMode
          date={toDateString(selectedDate)}
          onClose={() => setShowFocusMode(false)}
        />
      )}
      <div className="min-h-dvh bg-surface flex flex-col">
        <Header
          selectedDate={selectedDate}
          onSearchOpen={() => setShowSearch(true)}
          onFocusOpen={() => setShowFocusMode(true)}
        />

        <main className="flex-1 pb-20">
          {activeTab === "calendar" && (
            <CalendarView
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onTaskTap={(id) => setDetailTodoId(id)}
            />
          )}
          {activeTab === "matrix" && (
            <MatrixView
              date={toDateString(selectedDate)}
              onTaskTap={(id) => setDetailTodoId(id)}
            />
          )}
          {activeTab === "report" && <ReportView />}
        </main>

        <TaskDetailModal
          todoId={detailTodoId}
          onClose={() => setDetailTodoId(null)}
        />

        <AddTodoModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          defaultDate={selectedDate}
          onOpenTemplate={() => setShowTemplate(true)}
        />

        <TemplateModal
          isOpen={showTemplate}
          onClose={() => setShowTemplate(false)}
          date={toDateString(selectedDate)}
        />

        <SearchOverlay
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
          onSelectTodo={(id) => {
            setShowSearch(false);
            setDetailTodoId(id);
          }}
        />

        <UndoToast />
        <AchievementToast
          achievementType={newAchievement}
          onDismiss={() => setNewAchievement(null)}
        />

        <FAB onClick={() => setShowAddModal(true)} />
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </>
  );
}
