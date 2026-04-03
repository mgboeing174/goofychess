import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';
import { Play, Trophy, Users, TrendingUp, ChevronRight, Zap, Target, Swords } from 'lucide-react';
import './HomePage.css';

const HomePage = () => {
    const { state } = useStore();
    const { currentUser, games } = state;

    return (
        <div className="home-container">
            <header className="home-hero glass-panel">
                <div className="hero-content">
                    <h1 className="hero-title font-orbitron">
                        Master the <span className="text-neon">Board</span>
                    </h1>
                    <p className="hero-subtitle">
                        Experience the next generation of chess with AI-powered analysis and real-time multiplayer.
                    </p>
                    <div className="hero-actions">
                        <Link to="/play" className="btn-neon">
                            <Play size={20} fill="currentColor" /> Play Now
                        </Link>
                        <Link to="/puzzles" className="btn-neon-outline">
                            <Target size={20} /> Solve Puzzles
                        </Link>
                    </div>
                </div>
            </header>

            <section className="home-main-grid">
                {/* Action Cards */}
                <div className="action-cards">
                    <Link to="/play" className="action-card glass-panel" style={{"--card-accent": "var(--accent)"}}>
                        <div className="card-icon"><Swords size={32} /></div>
                        <div className="card-info">
                            <h3>Play vs Bot</h3>
                            <p>Challenge our AI across 4 difficulty levels.</p>
                        </div>
                        <ChevronRight className="card-arrow" />
                    </Link>

                    <Link to="/play" className="action-card glass-panel" style={{"--card-accent": "var(--neon-purple)"}}>
                        <div className="card-icon"><Users size={32} /></div>
                        <div className="card-info">
                            <h3>Play Online</h3>
                            <p>Compete with players from around the world.</p>
                        </div>
                        <ChevronRight className="card-arrow" />
                    </Link>
                </div>

                {/* Stats Sidebar */}
                <div className="stats-panel glass-panel">
                    <div className="panel-header">
                        <TrendingUp size={20} className="text-neon" />
                        <h3>Your Statistics</h3>
                    </div>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-value">{games.length}</div>
                            <div className="stat-label">Total Games</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{currentUser?.rating}</div>
                            <div className="stat-label">Elo Rating</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
