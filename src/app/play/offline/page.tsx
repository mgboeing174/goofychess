"use client";

import ChessGame from "@/components/ChessGame";
import Link from "next/link";
import { ChevronLeft, Monitor } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="bg-surface-0 min-h-[calc(100vh-56px)]">
      <div className="max-w-[960px] mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/" className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back
          </Link>
          <span className="text-sm text-text-muted">|</span>
          <span className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
            <Monitor className="w-4 h-4" /> Pass & Play
          </span>
        </div>
        <ChessGame mode="offline" />
      </div>
    </div>
  );
}
