"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Chess, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { RefreshCw, RotateCcw, Flag, Clock } from "lucide-react";
import { getBotMove, BotDifficulty } from "@/lib/bot-engine";

type GameMode = "offline" | "bot";

interface ChessGameProps {
  mode: GameMode;
  botDifficulty?: BotDifficulty;
  playerColor?: "w" | "b";
  onGameEnd?: (result: string, pgn: string) => void;
}

// Material values for captured piece tracking
const PIECE_ORDER = ["q", "r", "b", "n", "p"] as const;
const PIECE_UNICODE: Record<string, Record<string, string>> = {
  w: { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" },
  b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" },
};
const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };

function getCapturedPieces(game: Chess) {
  const initial: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 };
  const remaining = { w: { ...initial }, b: { ...initial } };

  const board = game.board();
  for (const row of board) {
    for (const sq of row) {
      if (sq) {
        remaining[sq.color as "w" | "b"][sq.type]--;
      }
    }
  }

  // Captured pieces by the opponent
  const capturedByWhite: string[] = []; // Black pieces white captured
  const capturedByBlack: string[] = []; // White pieces black captured

  for (const piece of PIECE_ORDER) {
    for (let i = 0; i < remaining.b[piece]; i++) capturedByWhite.push(piece);
    for (let i = 0; i < remaining.w[piece]; i++) capturedByBlack.push(piece);
  }

  const whiteValue = capturedByWhite.reduce((s, p) => s + (PIECE_VALUES[p] || 0), 0);
  const blackValue = capturedByBlack.reduce((s, p) => s + (PIECE_VALUES[p] || 0), 0);
  const advantage = whiteValue - blackValue;

  return { capturedByWhite, capturedByBlack, advantage };
}

export default function ChessGame({
  mode,
  botDifficulty = "medium",
  playerColor = "w",
  onGameEnd,
}: ChessGameProps) {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<string>("");
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const moveListRef = useRef<HTMLDivElement>(null);

  const updateStatus = useCallback((g: Chess) => {
    setFen(g.fen());
    setMoveHistory(g.history());

    if (g.isCheckmate()) {
      const winner = g.turn() === "w" ? "Black" : "White";
      setGameStatus(`${winner} wins by checkmate`);
    } else if (g.isDraw()) {
      setGameStatus("Game drawn");
    } else if (g.isStalemate()) {
      setGameStatus("Stalemate — draw");
    } else if (g.isCheck()) {
      setGameStatus("Check!");
    } else {
      setGameStatus("");
    }

    if (g.isGameOver() && onGameEnd) {
      let result = "1/2-1/2";
      if (g.isCheckmate()) result = g.turn() === "w" ? "0-1" : "1-0";
      onGameEnd(result, g.pgn());
    }
  }, [onGameEnd]);

  useEffect(() => {
    if (mode !== "bot" || game.isGameOver() || game.turn() === playerColor) return;
    setIsThinking(true);
    const timer = setTimeout(() => {
      const botMoveStr = getBotMove(game.fen(), botDifficulty);
      if (botMoveStr) {
        const newGame = new Chess(game.fen());
        const result = newGame.move(botMoveStr);
        if (result) setLastMove({ from: result.from, to: result.to });
        setGame(newGame);
        updateStatus(newGame);
      }
      setIsThinking(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [game, mode, botDifficulty, playerColor, updateStatus]);

  useEffect(() => { updateStatus(game); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll move list
  useEffect(() => {
    if (moveListRef.current) moveListRef.current.scrollTop = moveListRef.current.scrollHeight;
  }, [moveHistory]);

  function makeMove(move: { from: string; to: string; promotion?: string }) {
    try {
      const newGame = new Chess(game.fen());
      const result = newGame.move(move);
      if (result) {
        setLastMove({ from: result.from, to: result.to });
        setGame(newGame);
        updateStatus(newGame);
        return true;
      }
    } catch { return false; }
    return false;
  }

  function onDrop(sourceSquare: Square, targetSquare: Square, piece: string) {
    if (mode === "bot" && game.turn() !== playerColor) return false;
    const promotion = piece[1]?.toLowerCase() ?? "q";
    const moved = makeMove({ from: sourceSquare, to: targetSquare, promotion });
    if (!moved) return false;
    setMoveFrom(null);
    setPossibleMoves([]);
    return true;
  }

  function onSquareClick(square: Square) {
    if (mode === "bot" && game.turn() !== playerColor) return;
    if (moveFrom) {
      const moved = makeMove({ from: moveFrom, to: square, promotion: "q" });
      if (moved) { setMoveFrom(null); setPossibleMoves([]); }
      else highlightPieceMoves(square);
    } else {
      highlightPieceMoves(square);
    }
  }

  function highlightPieceMoves(square: Square) {
    const moves = game.moves({ square, verbose: true });
    if (moveFrom === square || moves.length === 0) {
      setMoveFrom(null); setPossibleMoves([]); return;
    }
    setMoveFrom(square);
    setPossibleMoves(moves.map((m) => m.to));
  }

  function resetGame() {
    const newGame = new Chess();
    setGame(newGame); updateStatus(newGame);
    setMoveFrom(null); setPossibleMoves([]); setIsThinking(false); setLastMove(null);
  }

  function undoMove() {
    const newGame = new Chess(game.fen());
    if (mode === "bot") { newGame.undo(); newGame.undo(); } else { newGame.undo(); }
    setGame(newGame); updateStatus(newGame);
    setMoveFrom(null); setPossibleMoves([]); setLastMove(null);
  }

  const { capturedByWhite, capturedByBlack, advantage } = getCapturedPieces(game);

  const customSquareStyles = (): { [square: string]: React.CSSProperties } => {
    const styles: { [s: string]: React.CSSProperties } = {};
    // Last move highlight
    if (lastMove) {
      styles[lastMove.from] = { backgroundColor: "rgba(255, 255, 0, 0.32)" };
      styles[lastMove.to] = { backgroundColor: "rgba(255, 255, 0, 0.38)" };
    }
    // Selected piece
    if (moveFrom) {
      styles[moveFrom] = { backgroundColor: "rgba(255, 255, 0, 0.5)" };
    }
    // Legal move dots
    possibleMoves.forEach((sq) => {
      const hasPiece = game.get(sq as Square);
      styles[sq] = hasPiece
        ? { background: "radial-gradient(transparent 51%, rgba(0,0,0,0.25) 51%)", borderRadius: "50%" }
        : { background: "radial-gradient(circle, rgba(0,0,0,0.2) 24%, transparent 24%)" };
    });
    return styles;
  };

  // Player bar component
  const PlayerBar = ({ color, name, captured, advantageVal, isActive }: {
    color: "w" | "b"; name: string; captured: string[]; advantageVal: number; isActive: boolean;
  }) => {
    const displayedColor = color === "w" ? "White" : "Black";
    const showAdvantage = color === "w" ? advantageVal > 0 : advantageVal < 0;
    const advDisplay = Math.abs(advantageVal);
    return (
      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive ? "bg-surface-2" : "bg-surface-1"}`}>
        <div className={`w-8 h-8 rounded flex items-center justify-center text-lg font-bold ${color === "w" ? "bg-[#f0d9b5] text-[#4a3728]" : "bg-[#4a3728] text-[#f0d9b5]"}`}>
          {color === "w" ? "♔" : "♚"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${isActive ? "text-text-primary" : "text-text-secondary"}`}>{name}</span>
            {isActive && (
              <span className="flex items-center gap-1 text-xs text-accent font-medium">
                <Clock className="w-3 h-3" /> thinking
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5 text-sm leading-none opacity-70 min-h-[18px]">
            {captured.map((p, i) => (
              <span key={i} className="text-xs">{PIECE_UNICODE[color === "w" ? "b" : "w"][p]}</span>
            ))}
            {showAdvantage && <span className="text-xs text-text-muted ml-1">+{advDisplay}</span>}
          </div>
        </div>
      </div>
    );
  };

  const topColor = playerColor === "w" ? "b" : "w";
  const bottomColor = playerColor;

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start w-full">
      {/* Board Column */}
      <div className="flex flex-col gap-1 w-full lg:w-auto">
        {/* Top player bar */}
        <PlayerBar
          color={topColor}
          name={topColor === "w" ? "White" : mode === "bot" ? `Bot (${botDifficulty})` : "Black"}
          captured={topColor === "w" ? capturedByWhite : capturedByBlack}
          advantageVal={advantage}
          isActive={game.turn() === topColor && !game.isGameOver()}
        />

        {/* Board */}
        <div className="w-full max-w-[580px] aspect-square board-shadow rounded-sm overflow-hidden relative">
          {isThinking && (
            <div className="absolute inset-x-0 top-0 h-1 z-20 bg-surface-1 overflow-hidden">
              <div className="h-full w-1/3 bg-accent animate-[shimmer_1s_ease-in-out_infinite] rounded-full" />
            </div>
          )}
          <Chessboard
            id="main-board"
            position={fen}
            onPieceDrop={onDrop}
            onSquareClick={onSquareClick}
            customSquareStyles={customSquareStyles()}
            boardOrientation={playerColor === "b" ? "black" : "white"}
            animationDuration={150}
            customDarkSquareStyle={{ backgroundColor: "#739552" }}
            customLightSquareStyle={{ backgroundColor: "#ebecd0" }}
            customBoardStyle={{ borderRadius: "2px" }}
            customDropSquareStyle={{ boxShadow: "inset 0 0 1px 5px rgba(255,255,255,0.3)" }}
          />
        </div>

        {/* Bottom player bar */}
        <PlayerBar
          color={bottomColor}
          name={bottomColor === "w" ? "White" : "Black"}
          captured={bottomColor === "w" ? capturedByWhite : capturedByBlack}
          advantageVal={advantage}
          isActive={game.turn() === bottomColor && !game.isGameOver()}
        />
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-[280px] flex flex-col gap-2 lg:self-stretch">
        {/* Game Status Banner */}
        {(gameStatus || game.isGameOver()) && (
          <div className={`px-3 py-2.5 rounded-lg text-sm font-semibold text-center ${
            game.isGameOver() 
              ? "bg-gold/10 text-gold border border-gold/20" 
              : "bg-danger/10 text-danger border border-danger/20"
          }`}>
            {gameStatus}
          </div>
        )}

        {/* Move List */}
        <div className="flex-1 bg-surface-1 rounded-lg border border-border overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-border text-xs font-semibold text-text-muted uppercase tracking-wider">
            Moves
          </div>
          <div ref={moveListRef} className="flex-1 overflow-y-auto max-h-[350px] p-1">
            {moveHistory.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-text-muted text-sm">
                Game has not started
              </div>
            ) : (
              <div className="space-y-0">
                {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => (
                  <div key={i} className="flex items-center text-sm hover:bg-surface-2 rounded-sm transition-colors">
                    <span className="w-8 text-center text-text-muted text-xs font-mono py-1.5">{i + 1}.</span>
                    <span className="flex-1 px-2 py-1.5 font-medium text-text-primary cursor-default hover:bg-surface-3 rounded-sm transition-colors">
                      {moveHistory[i * 2]}
                    </span>
                    <span className="flex-1 px-2 py-1.5 font-medium text-text-secondary cursor-default hover:bg-surface-3 rounded-sm transition-colors">
                      {moveHistory[i * 2 + 1] || ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 bg-surface-1 rounded-lg border border-border p-1.5">
          <button
            onClick={undoMove}
            disabled={moveHistory.length === 0}
            title="Undo"
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-surface-2 hover:bg-surface-3 transition-colors text-sm font-medium text-text-secondary hover:text-text-primary disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-surface-2"
          >
            <RotateCcw className="w-4 h-4" /> Undo
          </button>
          <button
            onClick={resetGame}
            title="New Game"
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-surface-2 hover:bg-surface-3 transition-colors text-sm font-medium text-text-secondary hover:text-text-primary"
          >
            <RefreshCw className="w-4 h-4" /> New
          </button>
          <button
            onClick={() => { if (onGameEnd) onGameEnd("resign", game.pgn()); resetGame(); }}
            title="Resign"
            disabled={moveHistory.length === 0 || game.isGameOver()}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-surface-2 hover:bg-danger/20 hover:text-danger transition-colors text-sm font-medium text-text-secondary disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-surface-2 disabled:hover:text-text-secondary"
          >
            <Flag className="w-4 h-4" /> Resign
          </button>
        </div>
      </div>
    </div>
  );
}
