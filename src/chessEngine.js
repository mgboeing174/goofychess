import { Chess } from 'chess.js';

export const calculateEloChange = (myRating, opponentRating, result) => {
    const K = 32;
    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - myRating) / 400));
    const actualScore = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
    const change = Math.round(K * (actualScore - expectedScore));
    return change;
};

export const analyzeGame = (moves, chess) => {
    const analysis = {
        accuracy: 0,
        bestMoves: 0,
        blunders: 0,
        mistakes: 0,
    };

    if (!moves.length) return analysis;

    analysis.accuracy = Math.round(70 + Math.random() * 25);
    analysis.bestMoves = Math.floor(moves.length * 0.4);
    analysis.mistakes = Math.floor(moves.length * 0.1);
    analysis.blunders = Math.floor(moves.length * 0.05);

    return analysis;
};
