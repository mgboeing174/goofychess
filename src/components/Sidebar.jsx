import React from 'react';
import { NavLink } from 'react-router-dom';
import { useStore } from '../store';
import { signOut, auth } from '../firebase';
import { 
  Home, 
  Play, 
  Trophy, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight,
  User
} from 'lucide-react';

const Sidebar = () => {
    const { state, dispatch } = useStore();
    const { currentUser } = state;

    const handleLogout = async () => {
        if (currentUser.id === 'player') {
            dispatch({ type: 'LOGOUT' });
        } else {
            await signOut(auth);
        }
    };

    const navItems = [
        { path: '/', label: 'Home', icon: <Home size={20} /> },
        { path: '/play', label: 'Play', icon: <Play size={20} /> },
        { path: '/puzzles', label: 'Puzzles', icon: <Trophy size={20} /> },
        { path: '/friends', label: 'Friends', icon: <Users size={20} /> },
    ];

    return (
        <aside className="sidebar glass-panel">
            <div className="sidebar-header">
                <div className="logo font-orbitron text-neon">
                    <span className="logo-icon">♟</span> ChessMaster
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink 
                        key={item.path} 
                        to={item.path} 
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-card">
                    <div className="user-avatar">
                        <img src={currentUser?.avatar} alt="Avatar" />
                    </div>
                    <div className="user-info">
                        <div className="username">{currentUser?.username}</div>
                        <div className="user-rating font-orbitron">{currentUser?.rating} Elo</div>
                    </div>
                </div>

                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={18} /> <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
