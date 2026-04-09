"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import {
  Todo,
  Quadrant,
  RepeatType,
  Tag,
  Template,
  StreakData,
  Achievement,
  UndoAction,
  Subtask,
} from "@/lib/types";
import { loadTodos, saveTodos, loadJSON, saveJSON } from "@/lib/storage";
import { generateRecurringForDate, parseISO } from "@/lib/date-utils";
import { useAuth } from "@/providers/AuthProvider";
import {
  fetchTodos,
  upsertTodo,
  deleteTodoDb,
  fetchTags,
  upsertTag,
  deleteTagDb,
  fetchTemplates,
  upsertTemplate,
  deleteTemplateDb,
  fetchAchievements,
  insertAchievement,
} from "@/lib/supabase-db";

// ─── State ───

interface TodoState {
  todos: Todo[];
  loaded: boolean;
  tags: Tag[];
  templates: Template[];
  streak: StreakData;
  achievements: Achievement[];
  lastAction: UndoAction | null;
}

const initialState: TodoState = {
  todos: [],
  loaded: false,
  tags: [],
  templates: [],
  streak: { currentStreak: 0, longestStreak: 0, lastActiveDate: null },
  achievements: [],
  lastAction: null,
};

// ─── Actions ───

type TodoAction =
  | { type: "LOAD"; todos: Todo[] }
  | { type: "ADD"; todo: Todo }
  | { type: "UPDATE"; id: string; updates: Partial<Todo> }
  | { type: "DELETE"; id: string }
  | { type: "TOGGLE_COMPLETE"; id: string }
  | { type: "MOVE_QUADRANT"; id: string; quadrant: Quadrant }
  | { type: "REORDER"; quadrant: Quadrant; date: string; orderedIds: string[] }
  | { type: "SET_TAGS"; tags: Tag[] }
  | { type: "ADD_TAG"; tag: Tag }
  | { type: "DELETE_TAG"; id: string }
  | { type: "SET_TEMPLATES"; templates: Template[] }
  | { type: "ADD_TEMPLATE"; template: Template }
  | { type: "DELETE_TEMPLATE"; id: string }
  | { type: "SET_STREAK"; streak: StreakData }
  | { type: "ADD_ACHIEVEMENT"; achievement: Achievement }
  | { type: "SET_ACHIEVEMENTS"; achievements: Achievement[] }
  | { type: "SET_UNDO"; action: UndoAction | null }
  | { type: "UNDO" };

// ─── Reducer ───

function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case "LOAD":
      return { ...state, todos: action.todos, loaded: true };

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

    case "TOGGLE_COMPLETE":
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.id
            ? {
                ...t,
                completed: !t.completed,
                completedAt: !t.completed ? new Date().toISOString() : null,
              }
            : t
        ),
      };

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

    case "SET_TAGS":
      return { ...state, tags: action.tags };
    case "ADD_TAG":
      return { ...state, tags: [...state.tags, action.tag] };
    case "DELETE_TAG":
      return { ...state, tags: state.tags.filter((t) => t.id !== action.id) };

    case "SET_TEMPLATES":
      return { ...state, templates: action.templates };
    case "ADD_TEMPLATE":
      return { ...state, templates: [...state.templates, action.template] };
    case "DELETE_TEMPLATE":
      return {
        ...state,
        templates: state.templates.filter((t) => t.id !== action.id),
      };

    case "SET_STREAK":
      return { ...state, streak: action.streak };

    case "SET_ACHIEVEMENTS":
      return { ...state, achievements: action.achievements };
    case "ADD_ACHIEVEMENT":
      return {
        ...state,
        achievements: [...state.achievements, action.achievement],
      };

    case "SET_UNDO":
      return { ...state, lastAction: action.action };
    case "UNDO": {
      if (!state.lastAction) return state;
      const la = state.lastAction;
      let todos = state.todos;
      if (la.type === "delete") {
        todos = [...todos, la.todo];
      } else if (la.type === "toggle") {
        todos = todos.map((t) =>
          t.id === la.id
            ? {
                ...t,
                completed: la.wasCompleted,
                completedAt: la.wasCompleted ? t.completedAt : null,
              }
            : t
        );
      } else if (la.type === "move") {
        todos = todos.map((t) =>
          t.id === la.id ? { ...t, quadrant: la.fromQuadrant } : t
        );
      }
      return { ...state, todos, lastAction: null };
    }

    default:
      return state;
  }
}

// ─── Context ───

interface TodoContextValue {
  todos: Todo[];
  loaded: boolean;
  tags: Tag[];
  templates: Template[];
  streak: StreakData;
  achievements: Achievement[];
  lastAction: UndoAction | null;
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
    subtasks?: Subtask[];
    tags?: string[];
  }) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  toggleComplete: (id: string) => void;
  moveQuadrant: (id: string, quadrant: Quadrant) => void;
  reorder: (quadrant: Quadrant, date: string, orderedIds: string[]) => void;
  getTodosForDate: (date: string) => Todo[];
  getTodosForQuadrant: (quadrant: Quadrant, date: string) => Todo[];
  addTag: (tag: Tag) => void;
  deleteTag: (id: string) => void;
  addTemplate: (template: Template) => void;
  deleteTemplate: (id: string) => void;
  setLastAction: (action: UndoAction | null) => void;
  undo: () => void;
  setStreak: (streak: StreakData) => void;
  addAchievement: (achievement: Achievement) => void;
}

const TodoContext = createContext<TodoContextValue | null>(null);

// ─── Provider ───

export function TodoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(todoReducer, initialState);
  const { user } = useAuth();
  const syncingRef = useRef(false);
  const prevUserRef = useRef<string | null>(null);

  // ─── Load data: Supabase if logged in, localStorage if not ───
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        // User just logged in — check if we need to migrate localStorage data
        const localTodos = loadTodos();
        const remoteTodos = await fetchTodos(user.id);
        const remoteTags = await fetchTags(user.id);
        const remoteTemplates = await fetchTemplates(user.id);
        const remoteAchievements = await fetchAchievements(user.id);

        // Migrate localStorage todos if remote is empty and local has data
        if (remoteTodos.length === 0 && localTodos.length > 0 && prevUserRef.current !== user.id) {
          // Upload local todos to Supabase
          for (const todo of localTodos) {
            await upsertTodo(user.id, todo);
          }
          // Upload local tags
          const localTags = loadJSON<Tag[]>("eisenhower-tags") ?? [];
          for (const tag of localTags) {
            await upsertTag(user.id, tag);
          }
          // Upload local templates
          const localTemplates = loadJSON<Template[]>("eisenhower-templates") ?? [];
          for (const tpl of localTemplates) {
            await upsertTemplate(user.id, tpl);
          }

          dispatch({ type: "LOAD", todos: localTodos });
          dispatch({ type: "SET_TAGS", tags: localTags });
          dispatch({ type: "SET_TEMPLATES", templates: localTemplates });
          dispatch({ type: "SET_ACHIEVEMENTS", achievements: remoteAchievements });
        } else {
          // Use remote data
          dispatch({ type: "LOAD", todos: remoteTodos });
          dispatch({ type: "SET_TAGS", tags: remoteTags });
          dispatch({ type: "SET_TEMPLATES", templates: remoteTemplates });
          dispatch({ type: "SET_ACHIEVEMENTS", achievements: remoteAchievements });
        }
        prevUserRef.current = user.id;
      } else {
        // Not logged in — use localStorage
        dispatch({ type: "LOAD", todos: loadTodos() });
        dispatch({
          type: "SET_TAGS",
          tags: loadJSON<Tag[]>("eisenhower-tags") ?? [],
        });
        dispatch({
          type: "SET_TEMPLATES",
          templates: loadJSON<Template[]>("eisenhower-templates") ?? [],
        });
        dispatch({
          type: "SET_ACHIEVEMENTS",
          achievements: loadJSON<Achievement[]>("eisenhower-achievements") ?? [],
        });
        prevUserRef.current = null;
      }

      dispatch({
        type: "SET_STREAK",
        streak:
          loadJSON<StreakData>("eisenhower-streak") ?? initialState.streak,
      });
    };

    loadData();
  }, [user]);

  // ─── Persist: always save to localStorage, also sync to Supabase if logged in ───
  useEffect(() => {
    if (!state.loaded || syncingRef.current) return;
    saveTodos(state.todos);
  }, [state.todos, state.loaded]);

  useEffect(() => {
    if (state.loaded) saveJSON("eisenhower-tags", state.tags);
  }, [state.tags, state.loaded]);

  useEffect(() => {
    if (state.loaded) saveJSON("eisenhower-templates", state.templates);
  }, [state.templates, state.loaded]);

  useEffect(() => {
    if (state.loaded) saveJSON("eisenhower-streak", state.streak);
  }, [state.streak, state.loaded]);

  useEffect(() => {
    if (state.loaded) saveJSON("eisenhower-achievements", state.achievements);
  }, [state.achievements, state.loaded]);

  // ─── Callbacks ───

  const syncTodo = useCallback(
    (todo: Todo) => {
      if (user) upsertTodo(user.id, todo);
    },
    [user]
  );

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
      subtasks?: Subtask[];
      tags?: string[];
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
        subtasks: params.subtasks ?? [],
        tags: params.tags ?? [],
      };
      dispatch({ type: "ADD", todo });
      syncTodo(todo);
    },
    [state.todos, syncTodo]
  );

  const updateTodo = useCallback(
    (id: string, updates: Partial<Todo>) => {
      dispatch({ type: "UPDATE", id, updates });
      // Sync after update
      const todo = state.todos.find((t) => t.id === id);
      if (todo && user) {
        upsertTodo(user.id, { ...todo, ...updates });
      }
    },
    [state.todos, user]
  );

  const deleteTodo = useCallback(
    (id: string) => {
      const todo = state.todos.find((t) => t.id === id);
      if (todo)
        dispatch({ type: "SET_UNDO", action: { type: "delete", todo } });
      dispatch({ type: "DELETE", id });
      if (user) deleteTodoDb(id);
    },
    [state.todos, user]
  );

  const toggleComplete = useCallback(
    (id: string) => {
      const todo = state.todos.find((t) => t.id === id);
      if (todo)
        dispatch({
          type: "SET_UNDO",
          action: { type: "toggle", id, wasCompleted: todo.completed },
        });
      dispatch({ type: "TOGGLE_COMPLETE", id });
      if (todo && user) {
        upsertTodo(user.id, {
          ...todo,
          completed: !todo.completed,
          completedAt: !todo.completed ? new Date().toISOString() : null,
        });
      }
    },
    [state.todos, user]
  );

  const moveQuadrant = useCallback(
    (id: string, quadrant: Quadrant) => {
      const todo = state.todos.find((t) => t.id === id);
      if (todo)
        dispatch({
          type: "SET_UNDO",
          action: { type: "move", id, fromQuadrant: todo.quadrant },
        });
      dispatch({ type: "MOVE_QUADRANT", id, quadrant });
      if (todo && user) {
        upsertTodo(user.id, { ...todo, quadrant });
      }
    },
    [state.todos, user]
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
      const generated = generateRecurringForDate(
        templates,
        parseISO(date)
      ).filter((g) => g.quadrant === quadrant);
      const storedIds = new Set(stored.map((t) => t.id));
      const newInstances = generated.filter((g) => !storedIds.has(g.id));
      return [...stored, ...newInstances].sort((a, b) => a.order - b.order);
    },
    [state.todos]
  );

  const addTag = useCallback(
    (tag: Tag) => {
      dispatch({ type: "ADD_TAG", tag });
      if (user) upsertTag(user.id, tag);
    },
    [user]
  );

  const deleteTag = useCallback(
    (id: string) => {
      dispatch({ type: "DELETE_TAG", id });
      if (user) deleteTagDb(id);
    },
    [user]
  );

  const addTemplate = useCallback(
    (template: Template) => {
      dispatch({ type: "ADD_TEMPLATE", template });
      if (user) upsertTemplate(user.id, template);
    },
    [user]
  );

  const deleteTemplate = useCallback(
    (id: string) => {
      dispatch({ type: "DELETE_TEMPLATE", id });
      if (user) deleteTemplateDb(id);
    },
    [user]
  );

  const setLastAction = useCallback(
    (action: UndoAction | null) => dispatch({ type: "SET_UNDO", action }),
    []
  );
  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const setStreak = useCallback(
    (streak: StreakData) => dispatch({ type: "SET_STREAK", streak }),
    []
  );
  const addAchievement = useCallback(
    (achievement: Achievement) => {
      dispatch({ type: "ADD_ACHIEVEMENT", achievement });
      if (user) insertAchievement(user.id, achievement);
    },
    [user]
  );

  return (
    <TodoContext.Provider
      value={{
        todos: state.todos,
        loaded: state.loaded,
        tags: state.tags,
        templates: state.templates,
        streak: state.streak,
        achievements: state.achievements,
        lastAction: state.lastAction,
        addTodo,
        updateTodo,
        deleteTodo,
        toggleComplete,
        moveQuadrant,
        reorder,
        getTodosForDate,
        getTodosForQuadrant,
        addTag,
        deleteTag,
        addTemplate,
        deleteTemplate,
        setLastAction,
        undo,
        setStreak,
        addAchievement,
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
