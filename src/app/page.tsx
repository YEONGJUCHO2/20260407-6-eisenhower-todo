"use client";

import { useState } from "react";
import { TabId } from "@/lib/types";
import { toDateString } from "@/lib/date-utils";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import FAB from "@/components/layout/FAB";
import MatrixView from "@/components/matrix/MatrixView";
import AddTodoModal from "@/components/modals/AddTodoModal";
import TaskDetailModal from "@/components/modals/TaskDetailModal";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("matrix");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [detailTodoId, setDetailTodoId] = useState<string | null>(null);

  return (
    <div className="min-h-dvh bg-surface flex flex-col">
      <Header selectedDate={selectedDate} />

      <main className="flex-1 pb-20">
        {activeTab === "calendar" && (
          <div className="px-lg py-md text-on-surface-variant text-body-md">
            캘린더 뷰 (구현 예정)
          </div>
        )}
        {activeTab === "matrix" && (
          <MatrixView
            date={toDateString(selectedDate)}
            onTaskTap={(id) => setDetailTodoId(id)}
          />
        )}
        {activeTab === "report" && (
          <div className="px-lg py-md text-on-surface-variant text-body-md">
            리포트 뷰 (구현 예정)
          </div>
        )}
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
  );
}
