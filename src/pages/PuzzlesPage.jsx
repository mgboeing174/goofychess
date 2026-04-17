import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import ChessBoard from '../components/ChessBoard';
import { Trophy, CheckCircle2, Zap, ArrowLeft, Lightbulb, RotateCcw, ChevronRight, Star, Lock } from 'lucide-react';
import puzzles from '../data/puzzles';
import { playMoveSound, playCheckSound, playCheckmateSound, playIllegalMoveSound, playGameStartSound } from '../sounds';
import './PuzzlesPage.css';

const DIFFICULTY_COLORS = {
    beginner: '#00c853',
    intermediate: '#f5c842',
    advanced: '#ff9800',
    master: '#ff003c',
};

const PuzzlesPage = () => {
    const [screen, setScreen] = useState('roadmap'); // 'roadmap' | 'puzzle'
    const [activePuzzle, setActivePuzzle] = useState(null);
    const [solvedPuzzles, setSolvedPuzzles] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('solvedPuzzles') || '[]');
        } catch { return []; }
    });
    const [puzzleState, setPuzzleState] = useState('playing'); // 'playing' | 'success' | 'fail'
    const [hintShown, setHintShown] = useState(false);
    const [moveIndex, setMoveIndex] = useState(0);

    const gameRef = useRef(new Chess());
    const [board, setBoard] = useState('start');
    const [boardWidth, setBoardWidth] = useState(Math.min(window.innerWidth - 80, 480));

    useEffect(() => {
        const handleResize = () => setBoardWidth(Math.min(window.innerWidth - 80, 480));
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        localStorage.setItem('solvedPuzzles', JSON.stringify(solvedPuzzles));
    }, [solvedPuzzles]);

    const isUnlocked = (puzzleId) => {
        if (puzzleId === 1) return true;
        return solvedPuzzles.includes(puzzleId - 1);
    };

    const startPuzzle = (puzzle) => {
        if (!isUnlocked(puzzle.id)) return;
        setActivePuzzle(puzzle);
        gameRef.current = new Chess(puzzle.fen);
        setBoard(gameRef.current.fen());
        setPuzzleState('playing');
        setHintShown(false);
        setMoveIndex(0);
        setScreen('puzzle');
        playGameStartSound();
    };

    const retryPuzzle = () => {
        if (!activePuzzle) return;
        gameRef.current = new Chess(activePuzzle.fen);
        setBoard(gameRef.current.fen());
        setPuzzleState('playing');
        setHintShown(false);
        setMoveIndex(0);
    };

    const handlePuzzleMove = (sourceSquare, targetSquare) => {
        if (puzzleState !== 'playing' || !activePuzzle) return false;

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

            const expectedSan = activePuzzle.moves[moveIndex];
            if (result.san === expectedSan) {
                setBoard(gameRef.current.fen());

                if (moveIndex + 1 >= activePuzzle.moves.length) {
                    if (gameRef.current.isCheckmate()) {
                        playCheckmateSound();
                    } else if (gameRef.current.isCheck()) {
                        playCheckSound();
                    } else {
                        playMoveSound();
                    }
                    setPuzzleState('success');
                    if (!solvedPuzzles.includes(activePuzzle.id)) {
                        setSolvedPuzzles(prev => [...prev, activePuzzle.id]);
                    }
                } else {
                    if (gameRef.current.isCheck()) {
                        playCheckSound();
                    } else {
                        playMoveSound();
                    }
                    setMoveIndex(prev => prev + 1);
                    if (moveIndex + 1 < activePuzzle.moves.length) {
                        setTimeout(() => {
                            const oppMove = activePuzzle.moves[moveIndex + 1];
                            gameRef.current.move(oppMove);
                            setBoard(gameRef.current.fen());
                            setMoveIndex(prev => prev + 1);
                            playMoveSound();
                        }, 500);
                    }
                }
                return true;
            } else {
                gameRef.current.undo();
                setBoard(gameRef.current.fen());
                playIllegalMoveSound();
                setPuzzleState('fail');
                return false;
            }
        } catch (e) {
            return false;
        }
    };

    const getHintText = () => {
        if (!activePuzzle || moveIndex >= activePuzzle.moves.length) return '';
        const move = activePuzzle.moves[moveIndex];
        return `Try: ${move.charAt(0)}...`;
    };

    const nextPuzzle = () => {
        if (!activePuzzle) return;
        const idx = puzzles.findIndex(p => p.id === activePuzzle.id);
        if (idx < puzzles.length - 1) {
            startPuzzle(puzzles[idx + 1]);
        } else {
            setScreen('roadmap');
        }
    };

    const getTurnColor = () => {
        if (!activePuzzle) return 'white';
        return activePuzzle.fen.split(' ')[1] === 'w' ? 'white' : 'black';
    };

    // Find the "current" puzzle (first unsolved unlocked)
    const currentPuzzleId = puzzles.find(p => isUnlocked(p.id) && !solvedPuzzles.includes(p.id))?.id || puzzles[puzzles.length - 1].id;

    // ── Roadmap Screen ──────────────────────────────────────────
    if (screen === 'roadmap') {
        return (
            <div className="puzzles-page">
                <header className="pz-page-header">
                    <h2 className="font-orbitron">Puzzle <span className="text-neon">Path</span></h2>
                    <div className="pz-progress-badge">
                        <Trophy size={16} />
                        <span>{solvedPuzzles.length}/{puzzles.length} Solved</span>
                    </div>
                </header>

                <div className="roadmap-container">
                    <div className="roadmap-track">
                        {puzzles.map((puzzle, idx) => {
                            const solved = solvedPuzzles.includes(puzzle.id);
                            const unlocked = isUnlocked(puzzle.id);
                            const isCurrent = puzzle.id === currentPuzzleId;
                            const isLeft = idx % 2 === 0;
                            const diffColor = DIFFICULTY_COLORS[puzzle.difficulty] || '#00f3ff';

                            return (
                                <div key={puzzle.id} className="roadmap-row">
                                    {/* Connector line (not on first) */}
                                    {idx > 0 && (
                                        <div className={`roadmap-connector ${solved ? 'solved' : ''}`}>
                                            <svg width="40" height="60" viewBox="0 0 40 60">
                                                <path
                                                    d={isLeft ? "M20 0 Q 20 30, 20 60" : "M20 0 Q 20 30, 20 60"}
                                                    stroke={solved ? '#00c853' : 'rgba(0,243,255,0.15)'}
                                                    strokeWidth="3"
                                                    fill="none"
                                                    strokeDasharray={solved ? 'none' : '6 4'}
                                                />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Node */}
                                    <button
                                        className={`roadmap-node ${solved ? 'solved' : ''} ${isCurrent ? 'current' : ''} ${!unlocked ? 'locked' : ''}`}
                                        onClick={() => startPuzzle(puzzle)}
                                        disabled={!unlocked}
                                        style={{ '--node-color': diffColor }}
                                    >
                                        <div className="roadmap-node-circle">
                                            {solved ? (
                                                <CheckCircle2 size={24} />
                                            ) : !unlocked ? (
                                                <Lock size={18} />
                                            ) : (
                                                <span className="roadmap-node-number">{puzzle.id}</span>
                                            )}
                                        </div>
                                        <div className="roadmap-node-info">
                                            <span className="roadmap-node-title">{puzzle.title}</span>
                                            <div className="roadmap-node-meta">
                                                <span className="roadmap-node-rating">
                                                    <Zap size={11} /> {puzzle.rating}
                                                </span>
                                                <span className="roadmap-node-theme" style={{ color: diffColor, borderColor: diffColor }}>
                                                    {puzzle.theme}
                                                </span>
                                            </div>
                                        </div>
                                        {unlocked && !solved && (
                                            <ChevronRight size={18} className="roadmap-node-arrow" />
                                        )}
                                    </button>
                                </div>
                            );
                        })}

                        {/* End trophy */}
                        <div className="roadmap-row">
                            <div className={`roadmap-connector ${solvedPuzzles.length === puzzles.length ? 'solved' : ''}`}>
                                <svg width="40" height="60" viewBox="0 0 40 60">
                                    <path d="M20 0 Q 20 30, 20 60" stroke={solvedPuzzles.length === puzzles.length ? '#f5c842' : 'rgba(0,243,255,0.1)'} strokeWidth="3" fill="none" strokeDasharray={solvedPuzzles.length === puzzles.length ? 'none' : '6 4'} />
                                </svg>
                            </div>
                            <div className={`roadmap-trophy ${solvedPuzzles.length === puzzles.length ? 'complete' : ''}`}>
                                <Trophy size={32} />
                                <span className="font-orbitron">Master</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Active Puzzle Screen ────────────────────────────────────
    return (
        <div className="puzzles-page">
            <div className="pz-active">
                <button className="back-btn" onClick={() => setScreen('roadmap')}>
                    <ArrowLeft size={18} /> Back to Path
                </button>

                <div className="pz-game-layout">
                    <div className="pz-board-area">
                        <ChessBoard
                            game={gameRef.current}
                            position={board}
                            onMove={handlePuzzleMove}
                            squareSize={boardWidth / 8}
                            orientation={getTurnColor()}
                        />

                        {puzzleState === 'success' && (
                            <div className="pz-result-overlay success">
                                <div className="pz-result-content">
                                    <CheckCircle2 size={48} />
                                    <h3>Correct!</h3>
                                    <p>Puzzle solved</p>
                                </div>
                            </div>
                        )}

                        {puzzleState === 'fail' && (
                            <div className="pz-result-overlay fail">
                                <div className="pz-result-content">
                                    <div className="pz-fail-x">✕</div>
                                    <h3>Not Quite</h3>
                                    <p>That wasn't the best move</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pz-info-panel glass-panel">
                        <div className="pz-info-header">
                            <h3 className="font-orbitron">{activePuzzle?.title}</h3>
                            <span className="pz-rating-badge">
                                <Star size={14} /> {activePuzzle?.rating}
                            </span>
                        </div>

                        <div className="pz-info-theme" style={{ color: DIFFICULTY_COLORS[activePuzzle?.difficulty] }}>
                            {activePuzzle?.theme} — {activePuzzle?.difficulty}
                        </div>

                        <p className="pz-info-desc">{activePuzzle?.description}</p>

                        <div className="pz-turn-indicator">
                            <span className={`pz-turn-dot ${getTurnColor()}`} />
                            <span>{getTurnColor() === 'white' ? 'White' : 'Black'} to move</span>
                        </div>

                        {hintShown && puzzleState === 'playing' && (
                            <div className="pz-hint-box">
                                <Lightbulb size={16} />
                                <span>{getHintText()}</span>
                            </div>
                        )}

                        <div className="pz-actions">
                            {puzzleState === 'playing' && (
                                <button className="btn-neon-outline" onClick={() => setHintShown(true)} disabled={hintShown}>
                                    <Lightbulb size={16} /> {hintShown ? 'Hint Shown' : 'Show Hint'}
                                </button>
                            )}

                            {puzzleState === 'fail' && (
                                <button className="btn-neon-outline" onClick={retryPuzzle}>
                                    <RotateCcw size={16} /> Retry
                                </button>
                            )}

                            {puzzleState === 'success' && (
                                <button className="btn-neon" onClick={nextPuzzle}>
                                    Next Puzzle <ChevronRight size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PuzzlesPage;
