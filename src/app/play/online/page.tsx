"use client";

import { Users } from "lucide-react";
import Link from "next/link";

export default function PlayOnlinePage() {
  return (
    <div className="bg-surface-0 min-h-[calc(100vh-56px)]">
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-5">
          <Users className="w-8 h-8 text-gold" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-3">Online Multiplayer</h1>
        <p className="text-text-muted text-sm mb-8 max-w-sm mx-auto leading-relaxed">
          Real-time multiplayer is coming soon. Challenge other players in rated matches with live game sync.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold/10 border border-gold/20 text-gold text-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          Coming Soon
        </div>
        <div className="mt-6">
          <Link href="/play/bot" className="text-sm text-accent hover:underline font-medium">
            Play vs Bot instead →
          </Link>
        </div>
      </div>
    </div>
  );
}
