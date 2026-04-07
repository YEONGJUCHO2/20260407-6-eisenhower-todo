"use client";

import { formatDateKR } from "@/lib/date-utils";

interface HeaderProps {
  selectedDate: Date;
}

export default function Header({ selectedDate }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0e]/80 backdrop-blur-[48px]">
      <div className="flex items-center justify-between px-lg py-3">
        <h1 className="font-display text-headline text-on-surface">
          아이젠하워 투두
        </h1>
        <span className="text-body-sm text-on-surface-variant">
          {formatDateKR(selectedDate)}
        </span>
      </div>
    </header>
  );
}
