"use client";

import { useState } from "react";
import ChessGame from "@/components/ChessGame";
import { BotDifficulty } from "@/lib/bot-engine";
import { Bot, Zap, Brain, Crown, Sparkles, ChevronLeft } from "lucide-react";
import Link from "next/link";

const DIFFICULTIES: { value: BotDifficulty; label: string; desc: string; icon: React.ReactNode; elo: string }[] = [
  { value: "easy", label: "Easy", desc: "Random moves", icon: <Sparkles className="w-5 h-5" />, elo: "~400" },
  { value: "medium", label: "Medium", desc: "Depth 2 search", icon: <Zap className="w-5 h-5" />, elo: "~800" },
  { value: "hard", label: "Hard", desc: "Depth 3 + positional", icon: <Brain className="w-5 h-5" />, elo: "~1200" },
  { value: "master", label: "Master", desc: "Depth 4 search", icon: <Crown className="w-5 h-5" />, elo: "~1600" },
];

export default function PlayBotPage() {
  const [difficulty, setDifficulty] = useState<BotDifficulty | null>(null);
  const [playerColor, setPlayerColor] = useState<"w" | "b">("w");
  const [gameKey, setGameKey] = useState(0);

  async function handleGameEnd(result: string, pgn: string) {
    try {
      await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result, pgn, mode: "bot", difficulty }),
      });
    } catch (e) { console.error("Failed to save game:", e); }
  }

  function startNewGame(diff: BotDifficulty) {
    setDifficulty(diff);
    setGameKey((k) => k + 1);
  }

  if (!difficulty) {
    return (
      <div className="bg-surface-0 min-h-[calc(100vh-56px)]">
        <div className="max-w-lg mx-auto px-4 py-10">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors mb-6">
            <ChevronLeft className="w-4 h-4" /> Back
          </Link>
          <div className="rounded-xl bg-surface-1 border border-border overflow-hidden">
            <div className="px-6 py-5 border-b border-border">
              <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <Bot className="w-5 h-5 text-accent" /> Play vs Computer
              </h1>
            </div>

            {/* Color Picker */}
            <div className="px-6 py-4 border-b border-border">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Choose side</div>
              <div className="flex gap-2">
                <button onClick={() => setPlayerColor("w")} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm font-semibold transition-all ${playerColor === "w" ? "bg-[#f0d9b5] text-[#4a3728] border-[#d4b896]" : "bg-surface-2 text-text-secondary border-border hover:bg-surface-3"}`}>
                  ♔ White
                </button>
                <button onClick={() => setPlayerColor("b")} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm font-semibold transition-all ${playerColor === "b" ? "bg-[#4a3728] text-[#f0d9b5] border-[#6b5242]" : "bg-surface-2 text-text-secondary border-border hover:bg-surface-3"}`}>
                  ♚ Black
                </button>
              </div>
            </div>

            {/* Difficulty List */}
            <div className="p-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  onClick={() => startNewGame(d.value)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-2 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    {d.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-text-primary">{d.label}</div>
                    <div className="text-xs text-text-muted">{d.desc}</div>
                  </div>
                  <span className="text-xs font-mono text-text-muted bg-surface-2 px-2 py-1 rounded">{d.elo}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-0 min-h-[calc(100vh-56px)]">
      <div className="max-w-[960px] mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setDifficulty(null)} className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <span className="text-sm text-text-muted">|</span>
            <span className="text-sm font-semibold text-text-primary">
              vs {DIFFICULTIES.find((d) => d.value === difficulty)?.label} Bot
            </span>
          </div>
        </div>
        <ChessGame key={gameKey} mode="bot" botDifficulty={difficulty} playerColor={playerColor} onGameEnd={handleGameEnd} />
      </div>
    </div>
  );
}
