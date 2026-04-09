"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { Quadrant } from "@/lib/types";
import ShareCard from "@/components/share/ShareCard";
import ShareCardMinimal from "@/components/share/ShareCardMinimal";
import ShareCardGradient from "@/components/share/ShareCardGradient";
import ShareCardStats from "@/components/share/ShareCardStats";

interface ShareThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  personalityName: string;
  personalityIcon: string;
  ratios: Record<Quadrant, number>;
  recurringRate: number;
  quote: string;
  totalCompleted: number;
  streakDays: number;
  achievementCount: number;
}

type ThemeId = "classic" | "minimal" | "gradient" | "stats";

const THEMES: { id: ThemeId; name: string; desc: string }[] = [
  { id: "classic", name: "클래식", desc: "다크 테마 + 성격 유형" },
  { id: "minimal", name: "미니멀", desc: "화이트 + 타이포 중심" },
  { id: "gradient", name: "그래디언트", desc: "사분면 컬러 배경" },
  { id: "stats", name: "통계", desc: "숫자 중심 리포트" },
];

export default function ShareThemeModal({
  isOpen,
  onClose,
  personalityName,
  personalityIcon,
  ratios,
  recurringRate,
  quote,
  totalCompleted,
  streakDays,
  achievementCount,
}: ShareThemeModalProps) {
  const [selected, setSelected] = useState<ThemeId>("classic");
  const [generating, setGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = useCallback(async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 200));

    if (!cardRef.current) {
      setGenerating(false);
      return;
    }

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 1,
        backgroundColor: selected === "minimal" ? "#fafafa" : "#131317",
        useCORS: true,
      });
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/png")
      );
      const file = new File([blob], "eisenhower-report.png", {
        type: "image/png",
      });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: "나의 시간 사용 유형", files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "eisenhower-report.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // cancelled
    }
    setGenerating(false);
    onClose();
  }, [selected, onClose]);

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

            <h3 className="font-display text-headline text-on-surface mb-4">
              공유 카드 테마
            </h3>

            {/* Theme grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelected(theme.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selected === theme.id
                      ? "border-quadrant-plan-primary/50 bg-quadrant-plan-container/10"
                      : "border-white/5 bg-surface-container-low"
                  }`}
                >
                  <p className="text-body-sm font-medium text-on-surface">
                    {theme.name}
                  </p>
                  <p className="text-[10px] text-outline">{theme.desc}</p>
                </button>
              ))}
            </div>

            <button
              onClick={handleShare}
              disabled={generating}
              className="w-full py-3 rounded-full bg-gradient-to-r from-quadrant-plan-container to-[#0450b0] text-white text-body-md font-semibold disabled:opacity-50"
            >
              {generating ? "생성 중..." : "공유하기"}
            </button>

            {/* Hidden cards for capture */}
            <div className="fixed -left-[9999px] top-0">
              {selected === "classic" && (
                <ShareCard
                  ref={cardRef}
                  personalityName={personalityName}
                  ratios={ratios}
                  recurringRate={recurringRate}
                  quote={quote}
                />
              )}
              {selected === "minimal" && (
                <ShareCardMinimal
                  ref={cardRef}
                  personalityName={personalityName}
                  quote={quote}
                  ratios={ratios}
                />
              )}
              {selected === "gradient" && (
                <ShareCardGradient
                  ref={cardRef}
                  personalityName={personalityName}
                  personalityIcon={personalityIcon}
                  ratios={ratios}
                  quote={quote}
                />
              )}
              {selected === "stats" && (
                <ShareCardStats
                  ref={cardRef}
                  personalityName={personalityName}
                  totalCompleted={totalCompleted}
                  streakDays={streakDays}
                  achievementCount={achievementCount}
                  ratios={ratios}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
