"use client";

import { useMemo, useState } from "react";
import { Todo, Quadrant } from "@/lib/types";

interface SearchFilters {
  query: string;
  quadrant: Quadrant | "all";
  completed: "all" | "done" | "todo";
  tag: string | "all";
}

export function useSearch(todos: Todo[]) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    quadrant: "all",
    completed: "all",
    tag: "all",
  });

  const results = useMemo(() => {
    return todos.filter((t) => {
      if (
        filters.query &&
        !t.title.toLowerCase().includes(filters.query.toLowerCase())
      )
        return false;
      if (filters.quadrant !== "all" && t.quadrant !== filters.quadrant)
        return false;
      if (filters.completed === "done" && !t.completed) return false;
      if (filters.completed === "todo" && t.completed) return false;
      if (filters.tag !== "all" && !t.tags?.includes(filters.tag)) return false;
      return true;
    });
  }, [todos, filters]);

  return { filters, setFilters, results };
}
