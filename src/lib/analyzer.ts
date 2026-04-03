import { Chess } from "chess.js";

export interface MoveAnalysis {
  moveNumber: number;
  color: "w" | "b";
  move: string;
  classification: "book" | "best" | "good" | "inaccuracy" | "mistake" | "blunder";
  evaluation: number;
  bestMove: string;
  evalDiff: number;
}

export interface GameAnalysis {
  moves: MoveAnalysis[];
  whiteAccuracy: number;
  blackAccuracy: number;
  summary: {
    white: { best: number; good: number; inaccuracies: number; mistakes: number; blunders: number };
    black: { best: number; good: number; inaccuracies: number; mistakes: number; blunders: number };
  };
}

// Simple static evaluation for analysis (same as bot engine)
const PIECE_VALUES: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
};

function evaluatePosition(game: Chess): number {
  if (game.isCheckmate()) return game.turn() === "w" ? -10000 : 10000;
  if (game.isDraw() || game.isStalemate()) return 0;

  let score = 0;
  const board = game.board();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece) continue;
      const val = PIECE_VALUES[piece.type] || 0;
      score += piece.color === "w" ? val : -val;
    }
  }
  return score;
}

function minimax(game: Chess, depth: number, alpha: number, beta: number, isMax: boolean): number {
  if (depth === 0 || game.isGameOver()) return evaluatePosition(game);
  const moves = game.moves();

  if (isMax) {
    let best = -Infinity;
    for (const move of moves) {
      game.move(move);
      best = Math.max(best, minimax(game, depth - 1, alpha, beta, false));
      game.undo();
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of moves) {
      game.move(move);
      best = Math.min(best, minimax(game, depth - 1, alpha, beta, true));
      game.undo();
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

function findBestMove(game: Chess, depth: number = 3): { move: string; eval: number } {
  const moves = game.moves();
  if (moves.length === 0) return { move: "", eval: 0 };

  const isMax = game.turn() === "w";
  let bestMove = moves[0];
  let bestEval = isMax ? -Infinity : Infinity;

  for (const move of moves) {
    game.move(move);
    const eval_ = minimax(game, depth - 1, -Infinity, Infinity, !isMax);
    game.undo();

    if (isMax ? eval_ > bestEval : eval_ < bestEval) {
      bestEval = eval_;
      bestMove = move;
    }
  }
  return { move: bestMove, eval: bestEval };
}

function classifyMove(evalDiff: number): MoveAnalysis["classification"] {
  const absDiff = Math.abs(evalDiff);
  if (absDiff <= 10) return "best";
  if (absDiff <= 50) return "good";
  if (absDiff <= 100) return "inaccuracy";
  if (absDiff <= 250) return "mistake";
  return "blunder";
}

export function analyzeGame(pgn: string): GameAnalysis {
  const game = new Chess();
  game.loadPgn(pgn);
  const moves = game.history();

  const analysis: MoveAnalysis[] = [];
  const replayGame = new Chess();
  const summary = {
    white: { best: 0, good: 0, inaccuracies: 0, mistakes: 0, blunders: 0 },
    black: { best: 0, good: 0, inaccuracies: 0, mistakes: 0, blunders: 0 },
  };

  let totalWhiteLoss = 0;
  let totalBlackLoss = 0;

  for (let i = 0; i < moves.length; i++) {
    const color = replayGame.turn();
    const moveStr = moves[i];

    // Find what the engine considers the best move BEFORE the player moves
    const best = findBestMove(replayGame, 3);
    const evalBefore = best.eval;

    // Make the player's actual move
    replayGame.move(moveStr);
    const evalAfter = evaluatePosition(replayGame);

    // Calculate how much the position changed
    const evalDiff = color === "w"
      ? evalBefore - evalAfter  // White wants higher eval
      : evalAfter - evalBefore; // Black wants lower eval

    const classification = classifyMove(evalDiff);
    const side = color === "w" ? "white" : "black";

    if (classification === "best") summary[side].best++;
    else if (classification === "good") summary[side].good++;
    else if (classification === "inaccuracy") summary[side].inaccuracies++;
    else if (classification === "mistake") summary[side].mistakes++;
    else if (classification === "blunder") summary[side].blunders++;

    if (color === "w") totalWhiteLoss += Math.max(0, evalDiff);
    else totalBlackLoss += Math.max(0, evalDiff);

    analysis.push({
      moveNumber: Math.floor(i / 2) + 1,
      color: color as "w" | "b",
      move: moveStr,
      classification,
      evaluation: evalAfter,
      bestMove: best.move,
      evalDiff,
    });
  }

  const whiteMoves = analysis.filter(m => m.color === "w").length || 1;
  const blackMoves = analysis.filter(m => m.color === "b").length || 1;
  const whiteAccuracy = Math.max(0, Math.round(100 - (totalWhiteLoss / whiteMoves / 3)));
  const blackAccuracy = Math.max(0, Math.round(100 - (totalBlackLoss / blackMoves / 3)));

  return { moves: analysis, whiteAccuracy, blackAccuracy, summary };
}
