"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CollapsibleSectionProps {
  icon: string;
  label: string;
  summary?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function CollapsibleSection({
  icon,
  label,
  summary,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-surface-container-low rounded-[10px] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-[14px] py-[10px]"
      >
        <div className="flex items-center gap-2">
          <span className="text-[14px]">{icon}</span>
          <span className="text-body-sm text-on-surface-variant">
            {open ? label : summary || label}
          </span>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[11px] text-outline"
        >
          ▼
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-[14px] pb-3 pt-1 border-t border-white/5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
