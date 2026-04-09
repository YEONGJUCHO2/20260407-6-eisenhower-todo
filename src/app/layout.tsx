import type { Metadata, Viewport } from "next";
import { TodoProvider } from "@/providers/TodoProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import ThemeProvider from "@/providers/ThemeProvider";
import { NotificationProvider } from "@/providers/NotificationProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "아이젠하워 투두",
  description:
    "긴급한 것은 중요하지 않고, 중요한 것은 긴급하지 않다 — 아이젠하워 매트릭스 기반 할 일 관리",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#131317",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body">
        <ThemeProvider>
          <AuthProvider>
            <TodoProvider>
              <NotificationProvider>{children}</NotificationProvider>
            </TodoProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
