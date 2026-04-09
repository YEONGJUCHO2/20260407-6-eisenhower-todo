"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useTodoContext } from "@/hooks/useTodos";
import { toDateString } from "@/lib/date-utils";

interface NotificationContextValue {
  permission: NotificationPermission | "unsupported";
  requestPermission: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue>({
  permission: "unsupported",
  requestPermission: async () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("unsupported");
  const { todos } = useTodoContext();

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }, []);

  // Check for upcoming tasks every minute
  useEffect(() => {
    if (permission !== "granted") return;

    const notifiedSet = new Set<string>();

    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;
      const today = toDateString(now);

      todos
        .filter(
          (t) =>
            t.date === today &&
            t.startTime === currentTime &&
            !t.completed &&
            !notifiedSet.has(t.id)
        )
        .forEach((t) => {
          notifiedSet.add(t.id);
          new Notification("아이젠하워 투두", {
            body: `⏰ "${t.title}" 시작 시간입니다!`,
            icon: "/favicon.ico",
          });
        });
    }, 60000);

    return () => clearInterval(interval);
  }, [permission, todos]);

  return (
    <NotificationContext.Provider value={{ permission, requestPermission }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
