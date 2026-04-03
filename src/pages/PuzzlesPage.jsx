import React, { useState, useEffect } from 'react';
import ChessBoard from '../components/ChessBoard';
import { Trophy, Target, ChevronRight, CheckCircle2, Lock, Zap } from 'lucide-react';
import './PuzzlesPage.css';

const PUZZLE_NODES = [
    { id: 1, x: 50, y: 80, label: '1', rating: 600, status: 'unlocked' },
    { id: 2, x: 150, y: 150, label: '2', rating: 800, status: 'locked' },
    { id: 3, x: 300, y: 100, label: '3', rating: 1000, status: 'locked' },
    { id: 4, x: 450, y: 180, label: '4', rating: 1200, status: 'locked' },
    { id: 5, x: 600, y: 120, label: '5', rating: 1400, status: 'locked' },
];

const PuzzlesPage = () => {
    const [selectedLevel, setSelectedLevel] = useState(PUZZLE_NODES[0]);
    const [boardScale, setBoardScale] = useState(64);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 500) setBoardScale(Math.floor((width - 40) / 8));
            else if (width < 900) setBoardScale(45);
            else setBoardScale(64);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="puzzles-page">
            <div className="pz-body">
                <div className="pz-sidebar glass-panel">
                    <header className="pz-header font-orbitron">
                        Puzzle <span className="text-neon">Map</span>
                    </header>
                    <div className="pz-map-container">
                        <svg className="pz-map-svg" viewBox="0 0 700 300">
                            {/* Path */}
                            <polyline 
                                points={PUZZLE_NODES.map(n => `${n.x},${n.y}`).join(' ')}
                                className="map-path"
                            />
                            {/* Nodes */}
                            {PUZZLE_NODES.map((node) => (
                                <g 
                                    key={node.id} 
                                    className={`map-node ${node.status} ${selectedLevel?.id === node.id ? 'selected' : ''}`}
                                    onClick={() => node.status !== 'locked' && setSelectedLevel(node)}
                                >
                                    <circle cx={node.x} cy={node.y} r="20" />
                                    <text x={node.x} y={node.y + 5} textAnchor="middle" className="node-label">
                                        {node.label}
                                    </text>
                                </g>
                            ))}
                        </svg>
                    </div>
                </div>

                <div className="pz-main game-screen">
                    <ChessBoard 
                        position="start" 
                        squareSize={boardScale} 
                    />
                    
                    <div className="pz-info glass-panel">
                        <h3 className="font-orbitron">Level {selectedLevel.label}</h3>
                        <div className="stat-row">
                            <Zap size={16} className="text-neon" /> 
                            <span>Rating: {selectedLevel.rating}</span>
                        </div>
                        <p className="pz-task">Find the best move for White.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PuzzlesPage;
