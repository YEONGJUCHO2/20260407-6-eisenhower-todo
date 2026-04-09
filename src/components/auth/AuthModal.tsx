"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const supabase = createClient();

  const handleSubmit = async () => {
    if (!supabase) {
      setError("Supabase가 설정되지 않았습니다");
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError("이메일과 비밀번호를 입력하세요");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        onClose();
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setSuccess("확인 이메일을 보냈습니다. 이메일을 확인해주세요!");
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    if (!supabase) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-[90]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[100] bg-surface-container rounded-t-xl px-lg pt-4 pb-6 safe-bottom max-w-2xl mx-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-outline/30" />
            </div>

            <h2 className="font-display text-headline text-on-surface mb-1">
              {mode === "login" ? "로그인" : "회원가입"}
            </h2>
            <p className="text-body-sm text-on-surface-variant mb-5">
              로그인하면 기기 간 데이터가 동기화됩니다
            </p>

            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-white text-gray-800 text-body-md font-medium flex items-center justify-center gap-3 mb-4 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path
                  fill="#4285F4"
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                />
                <path
                  fill="#34A853"
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                />
                <path
                  fill="#EA4335"
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                />
              </svg>
              Google로 계속하기
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-outline/20" />
              <span className="text-label-sm text-outline">또는</span>
              <div className="flex-1 h-px bg-outline/20" />
            </div>

            {/* Email/Password */}
            <div className="space-y-3 mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일"
                className="w-full bg-surface-container-high text-on-surface text-body-md px-4 py-3 rounded-sm outline-none placeholder:text-outline"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
                className="w-full bg-surface-container-high text-on-surface text-body-md px-4 py-3 rounded-sm outline-none placeholder:text-outline"
              />
            </div>

            {error && (
              <p className="text-body-sm text-error mb-3">{error}</p>
            )}
            {success && (
              <p className="text-body-sm text-green-400 mb-3">{success}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-quadrant-plan-container to-[#0450b0] text-white text-body-lg font-semibold disabled:opacity-50"
            >
              {loading
                ? "처리 중..."
                : mode === "login"
                ? "로그인"
                : "회원가입"}
            </button>

            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
                setSuccess("");
              }}
              className="w-full mt-3 py-2 text-body-sm text-quadrant-plan-primary"
            >
              {mode === "login"
                ? "계정이 없으신가요? 회원가입"
                : "이미 계정이 있으신가요? 로그인"}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
