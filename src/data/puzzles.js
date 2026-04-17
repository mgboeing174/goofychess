// Curated chess puzzles — each has a FEN, solution moves, rating, and theme
// `moves` is the solution sequence: [playerMove, opponentResponse, playerMove, ...]
// The player must find the correct first move. If the puzzle has multiple moves,
// the opponent auto-plays after the player's correct move.

const puzzles = [
  {
    id: 1,
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    moves: ['Qxf7'],
    rating: 400,
    theme: 'Checkmate',
    title: "Scholar's Mate",
    description: 'Find the checkmate in one move.',
    difficulty: 'beginner'
  },
  {
    id: 2,
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2',
    moves: ['Qh4'],
    rating: 500,
    theme: 'Checkmate',
    title: "Fool's Mate",
    description: 'Deliver checkmate immediately.',
    difficulty: 'beginner'
  },
  {
    id: 3,
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    moves: ['d3'],
    rating: 600,
    theme: 'Development',
    title: 'Italian Opening',
    description: 'Find the best developing move for White.',
    difficulty: 'beginner'
  },
  {
    id: 4,
    fen: '6k1/5ppp/8/8/8/8/r4PPP/1R4K1 w - - 0 1',
    moves: ['Rb8'],
    rating: 700,
    theme: 'Back Rank',
    title: 'Back Rank Threat',
    description: 'Exploit the weak back rank.',
    difficulty: 'beginner'
  },
  {
    id: 5,
    fen: 'r2qk2r/ppp2ppp/2n1bn2/2b1p3/4P3/2NP1N2/PPP2PPP/R1BQKB1R w KQkq - 0 6',
    moves: ['Be2'],
    rating: 750,
    theme: 'Development',
    title: 'Develop the Bishop',
    description: 'Complete your development safely.',
    difficulty: 'beginner'
  },
  {
    id: 6,
    fen: 'r1bqkbnr/pppppppp/2n5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 1 2',
    moves: ['d4'],
    rating: 800,
    theme: 'Center Control',
    title: 'Claim the Center',
    description: 'Take control of the center squares.',
    difficulty: 'beginner'
  },
  {
    id: 7,
    fen: 'r1bqkb1r/pppppppp/2n2n2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 2 3',
    moves: ['e5'],
    rating: 850,
    theme: 'Pawn Push',
    title: 'Advance the Pawn',
    description: 'Push the e-pawn to gain space.',
    difficulty: 'intermediate'
  },
  {
    id: 8,
    fen: 'r1b1kbnr/pppp1ppp/2n5/4p3/2B1P1q1/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    moves: ['O-O'],
    rating: 900,
    theme: 'Castling',
    title: 'Castle to Safety',
    description: 'Get your king to safety.',
    difficulty: 'intermediate'
  },
  {
    id: 9,
    fen: 'r2qkb1r/ppp1pppp/2n2n2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq d6 0 4',
    moves: ['cxd5'],
    rating: 950,
    theme: 'Capture',
    title: 'Central Exchange',
    description: 'Capture to win material in the center.',
    difficulty: 'intermediate'
  },
  {
    id: 10,
    fen: 'r1bqkbnr/ppp2ppp/2np4/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4',
    moves: ['Ng5'],
    rating: 1000,
    theme: 'Attack',
    title: 'Fried Liver Setup',
    description: 'Target the weak f7 square.',
    difficulty: 'intermediate'
  },
  {
    id: 11,
    fen: 'r1b1kb1r/pppp1ppp/5n2/4p1q1/2B1n3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 5',
    moves: ['Nxe4'],
    rating: 1050,
    theme: 'Material',
    title: 'Win a Piece',
    description: 'Capture the undefended knight.',
    difficulty: 'intermediate'
  },
  {
    id: 12,
    fen: 'r1bqk2r/pppp1ppp/2n2n2/4p3/1bB1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 4',
    moves: ['d3'],
    rating: 1100,
    theme: 'Defense',
    title: 'Defend the Center',
    description: 'Support your center and prepare development.',
    difficulty: 'intermediate'
  },
  {
    id: 13,
    fen: '2r3k1/5ppp/p7/1p6/8/1P3N2/P4PPP/4R1K1 w - - 0 1',
    moves: ['Re8+'],
    rating: 1200,
    theme: 'Back Rank',
    title: 'Back Rank Mate',
    description: 'Exploit the weak back rank for checkmate.',
    difficulty: 'advanced'
  },
  {
    id: 14,
    fen: 'r1bqr1k1/ppp2ppp/2n5/3Np3/2B5/8/PPP2PPP/R1BQK2R w KQ - 0 9',
    moves: ['Nf6+'],
    rating: 1300,
    theme: 'Fork',
    title: 'Royal Fork',
    description: 'Fork the king and queen with the knight.',
    difficulty: 'advanced'
  },
  {
    id: 15,
    fen: 'r1b1k2r/ppppqppp/2n2n2/4p3/2B1P1b1/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5',
    moves: ['Bg5'],
    rating: 1350,
    theme: 'Pin',
    title: 'Pin the Knight',
    description: 'Pin the knight to the queen.',
    difficulty: 'advanced'
  },
  {
    id: 16,
    fen: 'r4rk1/ppp2ppp/2n5/3qp1B1/8/2N5/PPP2PPP/R2QR1K1 w - - 0 12',
    moves: ['Nxd5'],
    rating: 1400,
    theme: 'Discovered Attack',
    title: 'Discover an Attack',
    description: 'Win material with a discovered attack.',
    difficulty: 'advanced'
  },
  {
    id: 17,
    fen: '6k1/pp3ppp/8/3r4/8/2N5/PPP2PPP/R5K1 w - - 0 1',
    moves: ['Nb5'],
    rating: 1450,
    theme: 'Fork',
    title: 'Knight Fork Threat',
    description: 'Position the knight to threaten a fork.',
    difficulty: 'advanced'
  },
  {
    id: 18,
    fen: 'r1b2rk1/2q1bppp/p2p1n2/np2p3/3PP3/2N1BN1P/PPB2PP1/R2QR1K1 w - - 0 12',
    moves: ['d5'],
    rating: 1500,
    theme: 'Space',
    title: 'Space Advantage',
    description: 'Push the pawn to gain a decisive space advantage.',
    difficulty: 'advanced'
  },
  {
    id: 19,
    fen: '5rk1/1p3ppp/p7/8/8/1b3B2/PP3PPP/R4RK1 w - - 0 1',
    moves: ['Bxb7'],
    rating: 1550,
    theme: 'Material',
    title: 'Win a Pawn',
    description: 'Capture the vulnerable b7 pawn.',
    difficulty: 'advanced'
  },
  {
    id: 20,
    fen: 'r1bq1rk1/ppp2ppp/2n2n2/3pp1B1/1b1PP3/2N2N2/PPP2PPP/R2QKB1R w KQ - 0 6',
    moves: ['e5'],
    rating: 1600,
    theme: 'Pawn Break',
    title: 'Central Break',
    description: 'Break through the center with the e-pawn.',
    difficulty: 'master'
  },
];

export default puzzles;
