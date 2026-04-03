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
    Globe
} from 'lucide-react';
import './PlayPage.css';

const TIME_CONTROLS = [
    { label: 'Bullet (1m)', value: 60, type: 'bullet', increment: 0 },
    { label: 'Blitz (5m)', value: 300, type: 'blitz', increment: 2 },
    { label: 'Classic (10m)', value: 600, type: 'classic', increment: 0 },
    { label: 'Rapid (30m)', value: 1800, type: 'rapid', increment: 0 },
];

const DIFFICULTY_CONFIGS = {
    easy: { label: 'Novice (800)', rating: 800, color: '#00f3ff' },
    medium: { label: 'Apprentice (1200)', rating: 1200, color: '#f5c842' },
    hard: { label: 'Grandmaster (1800)', rating: 1800, color: '#ff003c' }
};

const PlayPage = () => {
    const { state, dispatch, addToast } = useStore();
    const { currentUser } = state;

    // Game state
    const [screen, setScreen] = useState('lobby'); // 'lobby', 'setup', 'game'
    const [gameMode, setGameMode] = useState(null); // 'bot', 'online'
    const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
    const [selectedTime, setSelectedTime] = useState(TIME_CONTROLS[1]);
    
    // Chess logic
    const gameRef = useRef(new Chess());
    const [board, setBoard] = useState(gameRef.current.fen());
    const [gameState, setGameState] = useState('idle'); // 'idle', 'searching', 'playing', 'ended'
    const [playerColor, setPlayerColor] = useState('w');
    
    // Timer
    const [playerTime, setPlayerTime] = useState(600);
    const [opponentTime, setOpponentTime] = useState(600);
    const timerRef = useRef(null);

    // Responsive board width
    const [boardWidth, setBoardWidth] = useState(Math.min(window.innerWidth - 60, 560));

    useEffect(() => {
        const handleResize = () => setBoardWidth(Math.min(window.innerWidth - 60, 560));
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const playSound = (type) => {
        const audio = new Audio(`/sounds/${type}.mp3`);
        audio.play().catch(() => {}); // ignore if sound is missing
    };

    const handleMove = (sourceSquare, targetSquare) => {
        if (gameState !== 'playing') return false;

        const move = {
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q',
        };
        
        try {
            const result = gameRef.current.move(move);
            if (!result) {
                addToast('Illegal move!', 'error');
                return false;
            }
            
            setBoard(gameRef.current.fen());
            playSound(result.captured ? 'capture' : 'move');
            
            if (gameRef.current.isGameOver()) {
                setGameState('ended');
                addToast('Game Over!', 'info');
            }
            
            if (gameMode === 'bot' && !gameRef.current.isGameOver()) {
                setTimeout(makeBotMove, 500);
            }
            
            return true;
        } catch (e) { return false; }
    };

    const makeBotMove = () => {
        const moves = gameRef.current.moves();
        const move = moves[Math.floor(Math.random() * moves.length)];
        const result = gameRef.current.move(move);
        setBoard(gameRef.current.fen());
        playSound(result.captured ? 'capture' : 'move');
        if (gameRef.current.isGameOver()) {
            setGameState('ended');
            addToast('Bot wins!', 'error');
        }
    };

    const startBotGame = () => {
        gameRef.current.reset();
        setBoard(gameRef.current.fen());
        setGameState('playing');
        setGameMode('bot');
        setScreen('game');
    };

    return (
        <div className="play-page">
            <div className="glass-panel play-container">
                {screen === 'lobby' && (
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
                )}

                {screen === 'setup' && (
                    <div className="game-setup">
                        <h3>Match <span className="text-neon">Settings</span></h3>
                        <div className="setup-options">
                            {gameMode === 'bot' ? (
                                <div className="setup-section">
                                    <label>Difficulty</label>
                                    <div className="difficulty-grid">
                                        {Object.entries(DIFFICULTY_CONFIGS).map(([key, config]) => (
                                            <button 
                                                key={key} 
                                                className={`diff-btn ${selectedDifficulty === key ? 'active' : ''}`}
                                                onClick={() => setSelectedDifficulty(key)}
                                                style={{"--btn-accent": config.color}}
                                            >
                                                {config.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="setup-section">
                                    <label>Time Control</label>
                                    <div className="time-grid">
                                        {TIME_CONTROLS.map((tc) => (
                                            <button 
                                                key={tc.type} 
                                                className={`time-btn ${selectedTime.type === tc.type ? 'active' : ''}`}
                                                onClick={() => setSelectedTime(tc)}
                                            >
                                                {tc.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="setup-actions">
                            <button className="btn-neon" onClick={gameMode === 'bot' ? startBotGame : () => {}}>
                                Start Match
                            </button>
                            <button className="btn-neon-outline" onClick={() => setScreen('lobby')}>Back</button>
                        </div>
                    </div>
                )}

                {screen === 'game' && (
                    <div className="game-screen">
                        <ChessBoard 
                            position={board} 
                            onMove={handleMove} 
                            squareSize={boardWidth / 8} 
                            orientation={playerColor === 'w' ? 'white' : 'black'}
                        />
                        
                        <div className="game-info glass-panel">
                            <div className="hud-header font-orbitron">Match Tracking</div>
                            <div className="player-stats">
                                <div className="stat-row">
                                    <Clock size={16} /> <span>{Math.floor(playerTime/60)}:{(playerTime%60).toString().padStart(2, '0')}</span>
                                </div>
                            </div>
                            <div className="game-actions">
                                <button className="btn-neon-outline" onClick={() => setScreen('lobby')}>
                                    <Flag size={18} /> Resign
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlayPage;
