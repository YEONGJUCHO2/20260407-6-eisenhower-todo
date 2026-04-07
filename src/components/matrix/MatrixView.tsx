"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { QUADRANT_ORDER } from "@/lib/constants";
import { Quadrant, Todo } from "@/lib/types";
import { useTodoContext } from "@/hooks/useTodos";
import QuadrantBox from "./QuadrantBox";

interface MatrixViewProps {
  date: string;
  onTaskTap?: (todoId: string) => void;
}

export default function MatrixView({ date, onTaskTap }: MatrixViewProps) {
  const { moveQuadrant, todos } = useTodoContext();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overQuadrant, setOverQuadrant] = useState<Quadrant | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  const activeTodo = activeId
    ? todos.find((t) => t.id === activeId)
    : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: any) {
    const over = event.over;
    if (!over) {
      setOverQuadrant(null);
      return;
    }
    if (over.data?.current?.quadrant) {
      setOverQuadrant(over.data.current.quadrant);
    } else if (over.data?.current?.todo) {
      setOverQuadrant(over.data.current.todo.quadrant);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setOverQuadrant(null);

    if (!over) return;

    const todoId = active.id as string;
    let targetQuadrant: Quadrant | null = null;

    if (over.data?.current?.quadrant) {
      targetQuadrant = over.data.current.quadrant;
    } else if (over.data?.current?.todo) {
      targetQuadrant = over.data.current.todo.quadrant;
    }

    if (targetQuadrant) {
      moveQuadrant(todoId, targetQuadrant);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        className="grid grid-cols-2 gap-sm px-sm"
        style={{ height: "calc(100dvh - 148px)" }}
      >
        {QUADRANT_ORDER.map((q) => (
          <QuadrantBox
            key={q}
            quadrant={q}
            date={date}
            onTaskTap={onTaskTap}
            isOver={overQuadrant === q}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTodo ? (
          <div className="glass-card rounded-md px-3 py-[10px] text-body-sm text-on-surface shadow-[0_20px_40px_rgba(0,0,0,0.4)] scale-[1.04] -rotate-[1.5deg] max-w-[180px]">
            {activeTodo.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
