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
import CalendarView from "@/components/calendar/CalendarView";
import ReportView from "@/components/report/ReportView";
import Onboarding from "@/components/onboarding/Onboarding";
import { isOnboardingDone } from "@/lib/storage";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("matrix");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [detailTodoId, setDetailTodoId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!isOnboardingDone()) {
      setShowOnboarding(true);
    }
  }, []);

  return (
    <>
    {showOnboarding && (
      <Onboarding onComplete={() => setShowOnboarding(false)} />
    )}
    <div className="min-h-dvh bg-surface flex flex-col">
      <Header selectedDate={selectedDate} />

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
      />

      <FAB onClick={() => setShowAddModal(true)} />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
    </>
  );
}
