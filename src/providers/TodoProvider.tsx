"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { Todo, Quadrant, RepeatType } from "@/lib/types";
import { loadTodos, saveTodos } from "@/lib/storage";
import { generateRecurringForDate, parseISO } from "@/lib/date-utils";

interface TodoState {
  todos: Todo[];
  loaded: boolean;
}

type TodoAction =
  | { type: "LOAD"; todos: Todo[] }
  | { type: "ADD"; todo: Todo }
  | { type: "UPDATE"; id: string; updates: Partial<Todo> }
  | { type: "DELETE"; id: string }
  | { type: "TOGGLE_COMPLETE"; id: string }
  | { type: "MOVE_QUADRANT"; id: string; quadrant: Quadrant }
  | { type: "REORDER"; quadrant: Quadrant; date: string; orderedIds: string[] };

function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case "LOAD":
      return { todos: action.todos, loaded: true };

    case "ADD":
      return { ...state, todos: [...state.todos, action.todo] };

    case "UPDATE":
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.id ? { ...t, ...action.updates } : t
        ),
      };

    case "DELETE":
      return {
        ...state,
        todos: state.todos.filter((t) => t.id !== action.id),
      };

    case "TOGGLE_COMPLETE": {
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.id
            ? {
                ...t,
                completed: !t.completed,
                completedAt: !t.completed
                  ? new Date().toISOString()
                  : null,
              }
            : t
        ),
      };
    }

    case "MOVE_QUADRANT":
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.id ? { ...t, quadrant: action.quadrant } : t
        ),
      };

    case "REORDER": {
      const todos = state.todos.map((t) => {
        if (t.quadrant === action.quadrant && t.date === action.date) {
          const idx = action.orderedIds.indexOf(t.id);
          if (idx !== -1) return { ...t, order: idx };
        }
        return t;
      });
      return { ...state, todos };
    }

    default:
      return state;
  }
}

interface TodoContextValue {
  todos: Todo[];
  loaded: boolean;
  addTodo: (params: {
    title: string;
    quadrant: Quadrant;
    date: string;
    repeat: RepeatType;
    repeatDays?: number[];
    repeatDate?: number;
    repeatMonth?: number;
    startTime?: string;
    endTime?: string;
    memo?: string;
  }) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  toggleComplete: (id: string) => void;
  moveQuadrant: (id: string, quadrant: Quadrant) => void;
  reorder: (quadrant: Quadrant, date: string, orderedIds: string[]) => void;
  getTodosForDate: (date: string) => Todo[];
  getTodosForQuadrant: (quadrant: Quadrant, date: string) => Todo[];
}

const TodoContext = createContext<TodoContextValue | null>(null);

export function TodoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(todoReducer, {
    todos: [],
    loaded: false,
  });

  useEffect(() => {
    dispatch({ type: "LOAD", todos: loadTodos() });
  }, []);

  useEffect(() => {
    if (state.loaded) {
      saveTodos(state.todos);
    }
  }, [state.todos, state.loaded]);

  const addTodo = useCallback(
    (params: {
      title: string;
      quadrant: Quadrant;
      date: string;
      repeat: RepeatType;
      repeatDays?: number[];
      repeatDate?: number;
      repeatMonth?: number;
      startTime?: string;
      endTime?: string;
      memo?: string;
    }) => {
      const todosInQuadrant = state.todos.filter(
        (t) => t.quadrant === params.quadrant && t.date === params.date
      );
      const todo: Todo = {
        id: crypto.randomUUID(),
        title: params.title,
        quadrant: params.quadrant,
        date: params.date,
        completed: false,
        completedAt: null,
        repeat: params.repeat,
        repeatDays: params.repeatDays,
        repeatDate: params.repeatDate,
        repeatMonth: params.repeatMonth,
        startTime: params.startTime,
        endTime: params.endTime,
        memo: params.memo ?? "",
        createdAt: new Date().toISOString(),
        order: todosInQuadrant.length,
      };
      dispatch({ type: "ADD", todo });
    },
    [state.todos]
  );

  const updateTodo = useCallback(
    (id: string, updates: Partial<Todo>) =>
      dispatch({ type: "UPDATE", id, updates }),
    []
  );

  const deleteTodo = useCallback(
    (id: string) => dispatch({ type: "DELETE", id }),
    []
  );

  const toggleComplete = useCallback(
    (id: string) => dispatch({ type: "TOGGLE_COMPLETE", id }),
    []
  );

  const moveQuadrant = useCallback(
    (id: string, quadrant: Quadrant) =>
      dispatch({ type: "MOVE_QUADRANT", id, quadrant }),
    []
  );

  const reorder = useCallback(
    (quadrant: Quadrant, date: string, orderedIds: string[]) =>
      dispatch({ type: "REORDER", quadrant, date, orderedIds }),
    []
  );

  const getTodosForDate = useCallback(
    (date: string) => {
      const stored = state.todos.filter((t) => t.date === date);
      const templates = state.todos.filter((t) => t.repeat !== "none");
      const generated = generateRecurringForDate(templates, parseISO(date));
      const storedIds = new Set(stored.map((t) => t.id));
      const newInstances = generated.filter((g) => !storedIds.has(g.id));
      return [...stored, ...newInstances].sort((a, b) => a.order - b.order);
    },
    [state.todos]
  );

  const getTodosForQuadrant = useCallback(
    (quadrant: Quadrant, date: string) => {
      const stored = state.todos.filter(
        (t) => t.quadrant === quadrant && t.date === date
      );
      const templates = state.todos.filter((t) => t.repeat !== "none");
      const generated = generateRecurringForDate(templates, parseISO(date)).filter(
        (g) => g.quadrant === quadrant
      );
      const storedIds = new Set(stored.map((t) => t.id));
      const newInstances = generated.filter((g) => !storedIds.has(g.id));
      return [...stored, ...newInstances].sort((a, b) => a.order - b.order);
    },
    [state.todos]
  );

  return (
    <TodoContext.Provider
      value={{
        todos: state.todos,
        loaded: state.loaded,
        addTodo,
        updateTodo,
        deleteTodo,
        toggleComplete,
        moveQuadrant,
        reorder,
        getTodosForDate,
        getTodosForQuadrant,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export function useTodoContext() {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error("useTodoContext must be used within TodoProvider");
  return ctx;
}
