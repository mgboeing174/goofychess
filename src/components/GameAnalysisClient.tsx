"use client";

import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { analyzeGame, GameAnalysis, MoveAnalysis } from "@/lib/analyzer";
import { ChevronLeft, ChevronRight, BarChart3, Target, AlertTriangle, XCircle, CheckCircle2, Sparkles } from "lucide-react";

const CLASSIFICATION_COLORS: Record<string, string> = {
  best: "text-emerald-400 bg-emerald-500/10",
  good: "text-blue-400 bg-blue-500/10",
  book: "text-neutral-400 bg-neutral-500/10",
  inaccuracy: "text-amber-400 bg-amber-500/10",
  mistake: "text-orange-400 bg-orange-500/10",
  blunder: "text-red-400 bg-red-500/10",
};

const CLASSIFICATION_ICONS: Record<string, React.ReactNode> = {
  best: <CheckCircle2 className="w-4 h-4" />,
  good: <Sparkles className="w-4 h-4" />,
  inaccuracy: <AlertTriangle className="w-4 h-4" />,
  mistake: <XCircle className="w-4 h-4" />,
  blunder: <XCircle className="w-4 h-4" />,
};

interface GameAnalysisPageClientProps {
  pgn: string;
  whiteName: string;
  blackName: string;
  result: string;
}

export default function GameAnalysisClient({ pgn, whiteName, blackName, result }: GameAnalysisPageClientProps) {
  const [analysis, setAnalysis] = useState<GameAnalysis | null>(null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Run analysis in a timeout to avoid blocking UI
    const timer = setTimeout(() => {
      try {
        const result = analyzeGame(pgn);
        setAnalysis(result);
      } catch (e) {
        console.error("Analysis error:", e);
      }
      setLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [pgn]);

  // Get FEN for the current move
  function getFenAtMove(moveIndex: number): string {
    const game = new Chess();
    game.loadPgn(pgn);
    const moves = game.history();
    const replay = new Chess();
    for (let i = 0; i <= moveIndex; i++) {
      replay.move(moves[i]);
    }
    return replay.fen();
  }

  const currentFen = currentMoveIndex >= 0 ? getFenAtMove(currentMoveIndex) : new Chess().fen();
  const currentMove: MoveAnalysis | null = analysis && currentMoveIndex >= 0 ? analysis.moves[currentMoveIndex] : null;
  const totalMoves = analysis?.moves.length || 0;

  function goToMove(idx: number) {
    if (idx < -1 || idx >= totalMoves) return;
    setCurrentMoveIndex(idx);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-400">Analyzing game...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <p className="text-neutral-500">Could not analyze this game.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight mb-1">Game Analysis</h1>
          <p className="text-neutral-400 text-sm">
            {whiteName} vs {blackName} — {result}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Board */}
          <div className="lg:col-span-7 flex flex-col items-center gap-4">
            <div className="w-full max-w-[500px] aspect-square rounded-2xl shadow-2xl shadow-black/60 overflow-hidden border border-white/10">
              <Chessboard
                position={currentFen}
                animationDuration={200}
                customDarkSquareStyle={{ backgroundColor: "#3a5a40" }}
                customLightSquareStyle={{ backgroundColor: "#e9ecef" }}
                arePiecesDraggable={false}
              />
            </div>
            {/* Navigation */}
            <div className="flex items-center gap-3">
              <button onClick={() => goToMove(-1)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 disabled:opacity-30" disabled={currentMoveIndex <= -1}>
                <ChevronLeft className="w-4 h-4" /><ChevronLeft className="w-4 h-4 -ml-2" />
              </button>
              <button onClick={() => goToMove(currentMoveIndex - 1)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 disabled:opacity-30" disabled={currentMoveIndex <= -1}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-mono text-neutral-400 min-w-[60px] text-center">
                {currentMoveIndex + 1} / {totalMoves}
              </span>
              <button onClick={() => goToMove(currentMoveIndex + 1)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 disabled:opacity-30" disabled={currentMoveIndex >= totalMoves - 1}>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => goToMove(totalMoves - 1)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 disabled:opacity-30" disabled={currentMoveIndex >= totalMoves - 1}>
                <ChevronRight className="w-4 h-4" /><ChevronRight className="w-4 h-4 -ml-2" />
              </button>
            </div>
          </div>

          {/* Analysis Panel */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Accuracy Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-neutral-900 border border-white/5 text-center">
                <div className="text-xs text-neutral-500 uppercase tracking-widest mb-1">White Accuracy</div>
                <div className="text-3xl font-bold text-white">{analysis.whiteAccuracy}%</div>
                <div className="text-xs text-neutral-500 mt-1">{whiteName}</div>
              </div>
              <div className="p-4 rounded-xl bg-neutral-900 border border-white/5 text-center">
                <div className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Black Accuracy</div>
                <div className="text-3xl font-bold text-neutral-300">{analysis.blackAccuracy}%</div>
                <div className="text-xs text-neutral-500 mt-1">{blackName}</div>
              </div>
            </div>

            {/* Move Quality Summary */}
            <div className="p-4 rounded-xl bg-neutral-900 border border-white/5">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" /> Move Quality
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {["best", "good", "inaccuracies", "mistakes", "blunders"].map((type) => {
                  const key = type === "best" || type === "good" ? type : type;
                  return (
                    <div key={type} className="flex justify-between">
                      <span className="text-neutral-400 capitalize">{type}</span>
                      <span className="font-mono text-neutral-200">
                        {(analysis.summary.white as Record<string, number>)[key]} / {(analysis.summary.black as Record<string, number>)[key]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current Move Info */}
            {currentMove && (
              <div className="p-4 rounded-xl bg-neutral-900 border border-white/5">
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> Move {currentMove.moveNumber}{currentMove.color === "w" ? "." : "..."} {currentMove.move}
                </h3>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${CLASSIFICATION_COLORS[currentMove.classification]}`}>
                  {CLASSIFICATION_ICONS[currentMove.classification]}
                  {currentMove.classification.charAt(0).toUpperCase() + currentMove.classification.slice(1)}
                </div>
                {currentMove.classification !== "best" && (
                  <p className="text-sm text-neutral-400 mt-3">
                    Best move was <span className="font-mono text-white">{currentMove.bestMove}</span>
                  </p>
                )}
              </div>
            )}

            {/* Move List */}
            <div className="p-4 rounded-xl bg-neutral-900 border border-white/5 max-h-[250px] overflow-y-auto">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">All Moves</h3>
              <div className="space-y-0.5">
                {analysis.moves.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentMoveIndex(i)}
                    className={`w-full text-left px-2 py-1 rounded text-sm font-mono flex items-center gap-2 transition-colors ${
                      i === currentMoveIndex ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5"
                    }`}
                  >
                    {m.color === "w" && <span className="text-neutral-600 w-6">{m.moveNumber}.</span>}
                    {m.color === "b" && <span className="w-6" />}
                    <span className={`${CLASSIFICATION_COLORS[m.classification].split(" ")[0]}`}>{m.move}</span>
                    <span className={`text-xs ml-auto ${CLASSIFICATION_COLORS[m.classification].split(" ")[0]}`}>
                      {m.classification}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
