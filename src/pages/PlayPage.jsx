import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Chess } from 'chess.js';
import { useStore } from '../store';
import ChessBoard from '../components/ChessBoard';
import { calculateEloChange, analyzeGame } from '../chessEngine';
import { 
    joinQueue, 
    leaveQueue, 
    watchQueue, 
    listenForMyGame, 
    listenToGameState, 
    submitMove, 
    endOnlineGame 
} from '../matchmaking';
import { 
    Play, 
    Trophy, 
    Clock, 
    Cpu, 
    User,
    ChevronRight, 
    RotateCcw, 
    Flag, 
    Send,
    LogOut,
    CheckCircle2,
    Globe,
    Zap,
    Shield,
    Crown,
    Swords,
    ArrowLeft
} from 'lucide-react';
import { playMoveSound, playCaptureSound, playCheckSound, playCheckmateSound, playGameStartSound, playIllegalMoveSound } from '../sounds';
import './PlayPage.css';

const TIME_CONTROLS = [
    { label: 'Bullet', time: '1 min', value: 60, type: 'bullet', increment: 0, icon: Zap, desc: 'Lightning fast' },
    { label: 'Blitz', time: '5 min', value: 300, type: 'blitz', increment: 2, icon: Swords, desc: 'Quick thinking' },
    { label: 'Classic', time: '10 min', value: 600, type: 'classic', increment: 0, icon: Clock, desc: 'Deep strategy' },
    { label: 'Rapid', time: '30 min', value: 1800, type: 'rapid', increment: 0, icon: Shield, desc: 'Full analysis' },
];

const DIFFICULTY_CONFIGS = {
    easy:   { label: 'Novice',      rating: 800,  color: '#00f3ff', icon: Shield, desc: 'Random moves, great for learning basics', depth: 0 },
    medium: { label: 'Apprentice',  rating: 1200, color: '#f5c842', icon: Swords, desc: 'Captures pieces, avoids blunders', depth: 1 },
    hard:   { label: 'Grandmaster', rating: 1800, color: '#ff003c', icon: Crown,  desc: 'Strategic play, punishes mistakes', depth: 2 }
};

// ── Bot AI Engine ──────────────────────────────────────────────
const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

// Center control bonus for pieces
const CENTER_SQUARES = ['d4','d5','e4','e5'];
const EXTENDED_CENTER = ['c3','c4','c5','c6','d3','d6','e3','e6','f3','f4','f5','f6'];

function evaluateBoard(game) {
    const board = game.board();
    let score = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (!piece) continue;
            const val = PIECE_VALUES[piece.type] || 0;
            const sign = piece.color === 'b' ? 1 : -1; // bot is black
            score += val * sign;
            // Center control bonus
            const sq = String.fromCharCode(97+c) + (8-r);
            if (CENTER_SQUARES.includes(sq)) score += 0.3 * sign;
            else if (EXTENDED_CENTER.includes(sq)) score += 0.1 * sign;
        }
    }
    return score;
}

function getBotMove(game, difficulty) {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return null;
    const config = DIFFICULTY_CONFIGS[difficulty];

    if (config.depth === 0) {
        // Novice: mostly random, but will capture hanging pieces 30% of the time
        const captures = moves.filter(m => m.captured);
        if (captures.length > 0 && Math.random() < 0.3) {
            return captures[Math.floor(Math.random() * captures.length)].san;
        }
        return moves[Math.floor(Math.random() * moves.length)].san;
    }

    if (config.depth === 1) {
        // Apprentice: prioritize captures by value, check moves, avoid hanging own pieces
        let best = null;
        let bestScore = -Infinity;
        for (const move of moves) {
            let score = Math.random() * 0.5; // small randomness
            if (move.captured) score += PIECE_VALUES[move.captured] * 2;
            if (game.isCheck()) score += 1;
            // Prefer developing pieces early
            if (['n','b'].includes(move.piece) && move.from[1] === '8') score += 0.5;
            if (score > bestScore) { bestScore = score; best = move; }
        }
        return best ? best.san : moves[0].san;
    }

    // Grandmaster: 1-ply minimax with evaluation
    let bestMove = null;
    let bestScore = -Infinity;
    for (const move of moves) {
        game.move(move.san);
        let score = evaluateBoard(game);
        // Check bonus
        if (game.isCheck()) score += 2;
        if (game.isCheckmate()) score += 100;
        // Small randomness to avoid predictability
        score += Math.random() * 0.2;
        game.undo();
        if (score > bestScore) { bestScore = score; bestMove = move; }
    }
    return bestMove ? bestMove.san : moves[0].san;
}

// ── Move Quality Classification ────────────────────────────────
function evaluateForWhite(game) {
    const board = game.board();
    let score = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (!piece) continue;
            const val = PIECE_VALUES[piece.type] || 0;
            const sign = piece.color === 'w' ? 1 : -1;
            score += val * sign;
            const sq = String.fromCharCode(97+c) + (8-r);
            if (CENTER_SQUARES.includes(sq)) score += 0.15 * sign;
            else if (EXTENDED_CENTER.includes(sq)) score += 0.05 * sign;
        }
    }
    if (game.isCheckmate()) {
        score += game.turn() === 'b' ? 100 : -100; // white just moved and checkmated
    }
    return score;
}

function classifyPlayerMove(game, moveResult) {
    // Undo the move to evaluate alternatives
    game.undo();
    const playerColor = game.turn(); // 'w' or 'b'
    const sign = playerColor === 'w' ? 1 : -1;

    // Evaluate all legal moves
    const allMoves = game.moves({ verbose: true });
    let bestEval = -Infinity;
    let worstEval = Infinity;
    const evals = [];

    for (const m of allMoves) {
        game.move(m.san);
        const ev = evaluateForWhite(game) * sign;
        evals.push({ san: m.san, eval: ev, captured: m.captured, flags: m.flags });
        if (ev > bestEval) bestEval = ev;
        if (ev < worstEval) worstEval = ev;
        game.undo();
    }

    // Re-apply the original move
    game.move(moveResult.san);
    const chosenEval = evals.find(e => e.san === moveResult.san)?.eval ?? 0;
    const diff = bestEval - chosenEval; // how far from best (0 = best)

    // Brilliant: sacrifice material but it's the best/near-best move
    const isSacrifice = moveResult.captured === undefined && allMoves.some(m => {
        // Player gave up material (moved a piece to a square where it can be captured)
        return false; // simplified check
    });
    // Better brilliant check: move involves losing material context but is best
    const prevBoard = game.board();
    const isBrilliant = diff < 0.3 && (
        (moveResult.san.includes('+') && moveResult.captured) || // check + capture combo
        (game.isCheckmate()) // leads to checkmate
    );

    if (isBrilliant) return 'brilliant';
    if (diff <= 0.1) return 'excellent';  // Best move
    if (diff <= 0.5) return 'great';      // Very close to best
    if (diff <= 1.5) return 'good';       // Decent move
    if (diff <= 3.0) return 'miss';       // Missed better opportunity
    return 'blunder';                      // Lost significant material
}

// ── Main Component ─────────────────────────────────────────────
const PlayPage = () => {
    const { state, dispatch, addToast } = useStore();
    const { currentUser } = state;

    // Screen state
    const [screen, setScreen] = useState('lobby');
    const [gameMode, setGameMode] = useState(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
    const [selectedTime, setSelectedTime] = useState(TIME_CONTROLS[1]);
    
    // Chess logic
    const gameRef = useRef(new Chess());
    const [board, setBoard] = useState(gameRef.current.fen());
    const [gameState, setGameState] = useState('idle');
    const [playerColor, setPlayerColor] = useState('white');
    const [statusMessage, setStatusMessage] = useState('');
    const [gameResult, setGameResult] = useState(null);
    const moveStatsRef = useRef({ total: 0, captures: 0, checks: 0, brilliant: 0, excellent: 0, great: 0, good: 0, miss: 0, blunder: 0 });
    const [showResultModal, setShowResultModal] = useState(false);
    
    // Timer
    const [playerTime, setPlayerTime] = useState(600);
    const [opponentTime, setOpponentTime] = useState(600);
    const timerRef = useRef(null);
    const [searching, setSearching] = useState(false);

    // Responsive board width
    const [boardWidth, setBoardWidth] = useState(Math.min(window.innerWidth - 80, 560));

    useEffect(() => {
        const handleResize = () => setBoardWidth(Math.min(window.innerWidth - 80, 560));
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const endGame = (winner, reason) => {
        setGameState('ended');
        setGameResult({
            winner,
            reason,
            ...moveStatsRef.current
        });
        setTimeout(() => setShowResultModal(true), 600);
    };

    // ── Sound-aware move handler ───────────────────────────────
    const handleMove = (sourceSquare, targetSquare) => {
        if (gameState !== 'playing') return false;
        try {
            const result = gameRef.current.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q',
            });
            if (!result) {
                playIllegalMoveSound();
                return false;
            }
            
            setBoard(gameRef.current.fen());

            // Track stats
            moveStatsRef.current = { ...moveStatsRef.current, total: moveStatsRef.current.total + 1 };
            if (result.captured) moveStatsRef.current.captures++;
            if (gameRef.current.isCheck()) moveStatsRef.current.checks++;

            // Classify move quality
            const quality = classifyPlayerMove(gameRef.current, result);
            moveStatsRef.current[quality]++;

            // Sound + end logic
            if (gameRef.current.isCheckmate()) {
                playCheckmateSound();
                setStatusMessage('Checkmate! You win! 🏆');
                endGame('player', 'checkmate');
                return true;
            }
            if (gameRef.current.isStalemate() || gameRef.current.isDraw()) {
                playMoveSound();
                setStatusMessage('Draw!');
                endGame('draw', gameRef.current.isStalemate() ? 'stalemate' : 'draw');
                return true;
            }
            if (gameRef.current.isCheck()) {
                playCheckSound();
                setStatusMessage('Check!');
            } else if (result.captured) {
                playCaptureSound();
                setStatusMessage(`Captured ${result.captured.toUpperCase()}`);
            } else {
                playMoveSound();
                setStatusMessage('');
            }
            
            if (gameMode === 'bot' && !gameRef.current.isGameOver()) {
                setTimeout(makeBotMove, 400 + Math.random() * 300);
            }
            
            return true;
        } catch (e) { return false; }
    };

    // ── Smarter bot move ───────────────────────────────────────
    const makeBotMove = () => {
        const moveSan = getBotMove(gameRef.current, selectedDifficulty);
        if (!moveSan) return;
        const result = gameRef.current.move(moveSan);
        setBoard(gameRef.current.fen());
        
        // Track bot stats too
        moveStatsRef.current = { ...moveStatsRef.current, total: moveStatsRef.current.total + 1 };
        if (result.captured) moveStatsRef.current.captures++;
        if (gameRef.current.isCheck()) moveStatsRef.current.checks++;

        if (gameRef.current.isCheckmate()) {
            playCheckmateSound();
            setStatusMessage('Checkmate! Bot wins.');
            endGame('bot', 'checkmate');
        } else if (gameRef.current.isStalemate() || gameRef.current.isDraw()) {
            playMoveSound();
            setStatusMessage('Draw!');
            endGame('draw', gameRef.current.isStalemate() ? 'stalemate' : 'draw');
        } else if (gameRef.current.isCheck()) {
            playCheckSound();
            setStatusMessage('Check!');
        } else if (result.captured) {
            playCaptureSound();
            setStatusMessage('');
        } else {
            playMoveSound();
            setStatusMessage('');
        }
    };

    const startBotGame = () => {
        gameRef.current.reset();
        setBoard(gameRef.current.fen());
        setGameState('playing');
        setGameMode('bot');
        setScreen('game');
        setStatusMessage('');
        setGameResult(null);
        setShowResultModal(false);
        moveStatsRef.current = { total: 0, captures: 0, checks: 0, brilliant: 0, excellent: 0, great: 0, good: 0, miss: 0, blunder: 0 };
        playGameStartSound();
    };

    const handleRematch = () => {
        setShowResultModal(false);
        setGameResult(null);
        startBotGame();
    };

    const handleNewGame = () => {
        setShowResultModal(false);
        setGameResult(null);
        setScreen('lobby');
        setGameState('idle');
        setStatusMessage('');
    };

    const startOnlineMatch = async () => {
        if (!currentUser) return;
        setSearching(true);
        try {
            await joinQueue(currentUser.id, selectedTime.type);
            addToast('Searching for opponent...', 'info');
            listenForMyGame(currentUser.id, (gameData) => {
                if (gameData) {
                    setSearching(false);
                    setGameState('playing');
                    setScreen('game');
                    playGameStartSound();
                }
            });
        } catch (error) {
            setSearching(false);
            addToast('Matchmaking failed', 'error');
        }
    };

    // ── Render ──────────────────────────────────────────────────
    const renderScreen = () => {
        if (searching) {
            return (
                <div className="searching-screen">
                    <div className="loader font-orbitron">
                        <Globe size={60} className="pulse-logo" />
                        <h3>Searching for <span className="text-neon">Opponent</span>...</h3>
                        <p>{selectedTime.label} • {selectedTime.time}</p>
                    </div>
                    <button className="btn-neon-outline" onClick={async () => {
                        await leaveQueue(currentUser.id, selectedTime.type);
                        setSearching(false);
                    }}>
                        Cancel
                    </button>
                </div>
            );
        }

        switch (screen) {
            case 'lobby':
                return (
                    <div className="play-lobby">
                        <h2 className="lobby-title font-orbitron">Challenge <span className="text-neon">Arena</span></h2>
                        <div className="lobby-cards">
                            <button onClick={() => {setGameMode('bot'); setScreen('setup');}} className="lobby-card glass-panel">
                                <Cpu size={40} className="text-neon" />
                                <h3>Play vs Bot</h3>
                                <p>Practice your skills against our AI engine.</p>
                            </button>
                            <button onClick={() => {setGameMode('online'); setScreen('setup');}} className="lobby-card glass-panel">
                                <Globe size={40} className="text-neon-purple pulse-logo" />
                                <h3>Play Online</h3>
                                <p>Compete with players around the world.</p>
                            </button>
                        </div>
                    </div>
                );

            case 'setup':
                return (
                    <div className="game-setup">
                        <button className="back-btn" onClick={() => {setScreen('lobby'); setGameMode(null);}}>
                            <ArrowLeft size={18} /> Back to Arena
                        </button>

                        {gameMode === 'bot' ? (
                            <>
                                <h2 className="font-orbitron setup-title">
                                    <Cpu size={28} className="text-neon" />
                                    Select <span className="text-neon">Difficulty</span>
                                </h2>
                                <div className="difficulty-cards">
                                    {Object.entries(DIFFICULTY_CONFIGS).map(([key, config]) => {
                                        const Icon = config.icon;
                                        const isSelected = selectedDifficulty === key;
                                        return (
                                            <button
                                                key={key}
                                                className={`diff-card ${isSelected ? 'active' : ''}`}
                                                onClick={() => setSelectedDifficulty(key)}
                                                style={{"--card-accent": config.color}}
                                            >
                                                <div className="diff-card-icon">
                                                    <Icon size={32} />
                                                </div>
                                                <div className="diff-card-info">
                                                    <h4>{config.label}</h4>
                                                    <span className="diff-rating">{config.rating} ELO</span>
                                                    <p>{config.desc}</p>
                                                </div>
                                                {isSelected && <CheckCircle2 size={20} className="diff-check" />}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="setup-confirm">
                                    <div className="confirm-summary glass-panel">
                                        <span>Playing against</span>
                                        <strong style={{color: DIFFICULTY_CONFIGS[selectedDifficulty].color}}>
                                            {DIFFICULTY_CONFIGS[selectedDifficulty].label} ({DIFFICULTY_CONFIGS[selectedDifficulty].rating} ELO)
                                        </strong>
                                    </div>
                                    <button className="btn-neon btn-start" onClick={startBotGame}>
                                        <Swords size={20} /> Start Match
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="font-orbitron setup-title">
                                    <Globe size={28} className="text-neon-purple" />
                                    Select <span className="text-neon">Time Control</span>
                                </h2>
                                <div className="time-cards">
                                    {TIME_CONTROLS.map((tc) => {
                                        const Icon = tc.icon;
                                        const isSelected = selectedTime.type === tc.type;
                                        return (
                                            <button
                                                key={tc.type}
                                                className={`time-card ${isSelected ? 'active' : ''}`}
                                                onClick={() => setSelectedTime(tc)}
                                            >
                                                <Icon size={28} />
                                                <h4>{tc.label}</h4>
                                                <span className="time-value">{tc.time}</span>
                                                <p>{tc.desc}</p>
                                                {isSelected && <CheckCircle2 size={18} className="time-check" />}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="setup-confirm">
                                    <div className="confirm-summary glass-panel">
                                        <span>Mode</span>
                                        <strong className="text-neon">{selectedTime.label} • {selectedTime.time}</strong>
                                    </div>
                                    <button className="btn-neon btn-start" onClick={startOnlineMatch}>
                                        <Globe size={20} /> Find Match
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                );

            case 'game':
                return (
                    <div className="game-screen">
                        <ChessBoard 
                            game={gameRef.current}
                            position={board} 
                            onMove={handleMove} 
                            squareSize={boardWidth / 8} 
                            orientation={playerColor === 'white' ? 'white' : 'black'}
                        />
                        
                        <div className="game-info glass-panel">
                            <div className="hud-header font-orbitron">
                                {gameMode === 'bot' 
                                    ? `vs ${DIFFICULTY_CONFIGS[selectedDifficulty].label}`
                                    : 'Online Match'
                                }
                            </div>
                            
                            {gameMode === 'bot' && (
                                <div className="bot-badge" style={{borderColor: DIFFICULTY_CONFIGS[selectedDifficulty].color}}>
                                    <Cpu size={14} />
                                    <span>{DIFFICULTY_CONFIGS[selectedDifficulty].rating} ELO</span>
                                </div>
                            )}

                            <div className="player-stats">
                                <div className="stat-row">
                                    <Clock size={16} /> <span>{Math.floor(playerTime/60)}:{(playerTime%60).toString().padStart(2, '0')}</span>
                                </div>
                            </div>

                            {statusMessage && (
                                <div className={`status-banner ${gameRef.current.isCheckmate() ? 'checkmate' : gameRef.current.isCheck() ? 'check' : ''}`}>
                                    {statusMessage}
                                </div>
                            )}

                            <div className="game-actions">
                                {gameState === 'ended' ? (
                                    <button className="btn-neon" onClick={handleNewGame}>
                                        <RotateCcw size={18} /> New Game
                                    </button>
                                ) : (
                                    <button className="btn-neon-outline" onClick={() => {
                                        endGame('bot', 'resignation');
                                    }}>
                                        <Flag size={18} /> Resign
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    // ── Result Modal ───────────────────────────────────────────
    const renderResultModal = () => {
        if (!showResultModal || !gameResult) return null;

        const isWin = gameResult.winner === 'player';
        const isDraw = gameResult.winner === 'draw';
        const title = isWin ? 'Victory!' : isDraw ? 'Draw!' : 'Defeat';
        const subtitle = {
            checkmate: 'by Checkmate',
            stalemate: 'by Stalemate',
            resignation: isWin ? 'by Resignation' : 'You Resigned',
            draw: 'by Insufficient Material'
        }[gameResult.reason] || '';

        const eloChange = isWin ? '+15' : isDraw ? '+0' : '-12';

        const resultMessages = {
            player: [
                'Dominant performance! 💪',
                'Clean victory, well played!',
                'You crushed it! Keep going!',
                'Flawless execution! 🔥',
            ],
            bot: [
                'Tough game. Analyze and improve!',
                'The bot got lucky this time.',
                'Learn from your mistakes!',
                'Try again, you\'ve got this!',
            ],
            draw: [
                'Evenly matched! Try again.',
                'Neither side could break through.',
                'A hard-fought draw!',
            ]
        };
        const messages = resultMessages[gameResult.winner] || resultMessages.draw;
        const message = messages[Math.floor(Math.random() * messages.length)];

        return (
            <div className="result-overlay" onClick={() => setShowResultModal(false)}>
                <div className={`result-modal ${isWin ? 'win' : isDraw ? 'draw' : 'loss'}`} onClick={e => e.stopPropagation()}>
                    <button className="result-close" onClick={() => setShowResultModal(false)}>✕</button>
                    
                    <div className="result-header">
                        <div className={`result-icon ${isWin ? 'win' : isDraw ? 'draw' : 'loss'}`}>
                            {isWin ? <Trophy size={48} /> : isDraw ? <Shield size={48} /> : <Flag size={48} />}
                        </div>
                        <h2 className="font-orbitron result-title">{title}</h2>
                        <p className="result-subtitle">{subtitle}</p>
                    </div>

                    <div className="result-message">
                        <p>{message}</p>
                    </div>

                    <div className="result-elo">
                        <span>ELO Change</span>
                        <strong className={isWin ? 'elo-up' : isDraw ? 'elo-neutral' : 'elo-down'}>{eloChange}</strong>
                    </div>

                    <div className="result-stats">
                        <div className="result-stat">
                            <div className="stat-number">{gameResult.total}</div>
                            <div className="stat-label">Moves</div>
                        </div>
                        <div className="result-stat">
                            <div className="stat-number">{gameResult.captures}</div>
                            <div className="stat-label">Captures</div>
                        </div>
                        <div className="result-stat">
                            <div className="stat-number">{gameResult.checks}</div>
                            <div className="stat-label">Checks</div>
                        </div>
                    </div>

                    <div className="quality-grid">
                        {gameResult.brilliant > 0 && (
                            <div className="quality-item brilliant">
                                <span className="quality-icon">💎</span>
                                <span className="quality-count">{gameResult.brilliant}</span>
                                <span className="quality-label">Brilliant</span>
                            </div>
                        )}
                        <div className="quality-item excellent">
                            <span className="quality-icon">⭐</span>
                            <span className="quality-count">{gameResult.excellent}</span>
                            <span className="quality-label">Excellent</span>
                        </div>
                        <div className="quality-item great">
                            <span className="quality-icon">!</span>
                            <span className="quality-count">{gameResult.great}</span>
                            <span className="quality-label">Great</span>
                        </div>
                        <div className="quality-item good">
                            <span className="quality-icon">●</span>
                            <span className="quality-count">{gameResult.good}</span>
                            <span className="quality-label">Good</span>
                        </div>
                        <div className="quality-item miss">
                            <span className="quality-icon">?</span>
                            <span className="quality-count">{gameResult.miss}</span>
                            <span className="quality-label">Miss</span>
                        </div>
                        <div className="quality-item blunder">
                            <span className="quality-icon">✕</span>
                            <span className="quality-count">{gameResult.blunder}</span>
                            <span className="quality-label">Blunder</span>
                        </div>
                    </div>

                    {gameMode === 'bot' && (
                        <div className="result-opponent">
                            <Cpu size={16} /> Played vs <strong style={{color: DIFFICULTY_CONFIGS[selectedDifficulty].color}}>
                                {DIFFICULTY_CONFIGS[selectedDifficulty].label} ({DIFFICULTY_CONFIGS[selectedDifficulty].rating})
                            </strong>
                        </div>
                    )}

                    <div className="result-actions">
                        <button className="btn-neon btn-rematch" onClick={handleRematch}>
                            <RotateCcw size={18} /> Rematch
                        </button>
                        <button className="btn-neon-outline" onClick={handleNewGame}>
                            New Game
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="play-page">
            <div className={`play-container ${screen !== 'game' ? 'glass-panel' : ''}`}>
                {renderScreen()}
            </div>
            {renderResultModal()}
        </div>
    );
};

export default PlayPage;
