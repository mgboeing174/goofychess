import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { listenToOnlineUsers, updatePresence } from '../onlinePresence';
import { Users, Search, MessageSquare, Sword, Zap, Heart } from 'lucide-react';

const FriendsPage = () => {
    const { state, addToast } = useStore();
    const { currentUser } = state;
    const [onlineUsers, setOnlineUsers] = useState({});

    useEffect(() => {
        if (!currentUser) return;
        updatePresence(currentUser.id, currentUser.username, 'online');
        const unsub = listenToOnlineUsers(setOnlineUsers);
        return unsub;
    }, [currentUser]);

    const activeUsers = Object.entries(onlineUsers).filter(([uid, data]) => 
        uid !== (currentUser?.id || currentUser?.uid) && data.status === 'online'
    );

    return (
        <div className="friends-page">
            <header className="page-header">
                <h1 className="font-orbitron">Friend <span className="text-neon">Center</span></h1>
                <div className="search-bar glass-panel">
                    <Search size={18} />
                    <input type="text" placeholder="Search players..." />
                </div>
            </header>

            <div className="friends-grid">
                <section className="friends-list glass-panel">
                    <div className="section-header">
                        <Users size={20} className="text-neon" />
                        <h3>Online Players</h3>
                    </div>
                    
                    <div className="user-list">
                        {activeUsers.length > 0 ? (
                            activeUsers.map(([uid, data]) => (
                                <div key={uid} className="user-item glass-panel">
                                    <div className="user-avatar-small">
                                        <div className="status-dot online"></div>
                                        <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${uid}`} alt="Avatar" />
                                    </div>
                                    <div className="user-meta">
                                        <div className="username">{data.username}</div>
                                        <div className="user-status">In Lobby</div>
                                    </div>
                                    <button className="challenge-btn" onClick={() => addToast('Challenge sent!', 'success')}>
                                        <Sword size={18} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">No other users online right now.</div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default FriendsPage;
