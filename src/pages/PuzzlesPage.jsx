import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import ChessBoard from '../components/ChessBoard';
import { Trophy, Target, ChevronRight, CheckCircle2, Lock, Zap, ArrowLeft, Lightbulb, RotateCcw, Star } from 'lucide-react';
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
    const [screen, setScreen] = useState('list'); // 'list' | 'puzzle'
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

    const startPuzzle = (puzzle) => {
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

            // Check if the move matches the expected solution
            const expectedSan = activePuzzle.moves[moveIndex];
            if (result.san === expectedSan) {
                setBoard(gameRef.current.fen());

                if (moveIndex + 1 >= activePuzzle.moves.length) {
                    // Puzzle solved!
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
                    // Correct move but puzzle continues — play opponent response
                    if (gameRef.current.isCheck()) {
                        playCheckSound();
                    } else {
                        playMoveSound();
                    }
                    setMoveIndex(prev => prev + 1);
                    // Auto-play opponent response if there is one
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
                // Wrong move
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
            setScreen('list');
        }
    };

    // Determine whose turn it is from FEN
    const getTurnColor = () => {
        if (!activePuzzle) return 'white';
        const fen = activePuzzle.fen;
        return fen.split(' ')[1] === 'w' ? 'white' : 'black';
    };

    // ── List Screen ────────────────────────────────────────────
    if (screen === 'list') {
        return (
            <div className="puzzles-page">
                <header className="pz-page-header">
                    <h2 className="font-orbitron">Puzzle <span className="text-neon">Trainer</span></h2>
                    <div className="pz-progress-badge">
                        <Trophy size={16} />
                        <span>{solvedPuzzles.length}/{puzzles.length} Solved</span>
                    </div>
                </header>

                <div className="pz-grid">
                    {puzzles.map((puzzle) => {
                        const isSolved = solvedPuzzles.includes(puzzle.id);
                        const diffColor = DIFFICULTY_COLORS[puzzle.difficulty] || '#00f3ff';
                        return (
                            <button
                                key={puzzle.id}
                                className={`pz-card glass-panel ${isSolved ? 'solved' : ''}`}
                                onClick={() => startPuzzle(puzzle)}
                            >
                                <div className="pz-card-top">
                                    <span className="pz-card-number" style={{ color: diffColor }}>#{puzzle.id}</span>
                                    {isSolved && <CheckCircle2 size={18} className="pz-solved-icon" />}
                                </div>
                                <h4 className="pz-card-title">{puzzle.title}</h4>
                                <div className="pz-card-meta">
                                    <span className="pz-card-rating">
                                        <Zap size={12} /> {puzzle.rating}
                                    </span>
                                    <span className="pz-card-theme" style={{ color: diffColor, borderColor: diffColor }}>
                                        {puzzle.theme}
                                    </span>
                                </div>
                                <p className="pz-card-desc">{puzzle.description}</p>
                                <div className="pz-card-diff" style={{ color: diffColor }}>
                                    {puzzle.difficulty}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // ── Puzzle Screen ──────────────────────────────────────────
    return (
        <div className="puzzles-page">
            <div className="pz-active">
                <button className="back-btn" onClick={() => setScreen('list')}>
                    <ArrowLeft size={18} /> Back to Puzzles
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

                        {/* Success Overlay */}
                        {puzzleState === 'success' && (
                            <div className="pz-result-overlay success">
                                <div className="pz-result-content">
                                    <CheckCircle2 size={48} />
                                    <h3>Correct!</h3>
                                    <p>Puzzle solved</p>
                                </div>
                            </div>
                        )}

                        {/* Fail Overlay */}
                        {puzzleState === 'fail' && (
                            <div className="pz-result-overlay fail">
                                <div className="pz-result-content">
                                    <Target size={48} />
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
