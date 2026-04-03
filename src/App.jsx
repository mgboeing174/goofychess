import React from 'react';
import './index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import PlayPage from './pages/PlayPage';
import PuzzlesPage from './pages/PuzzlesPage';
import AuthPage from './pages/AuthPage';
import FriendsPage from './pages/FriendsPage';

function App() {
    const { state } = useStore();
    const { currentUser } = state;

    return (
        <BrowserRouter>
            <div className="app-layout">
                {currentUser && <Sidebar />}
                <main className={currentUser ? "main-content" : "auth-content"}>
                    <Routes>
                        <Route path="/" element={currentUser ? <HomePage /> : <Navigate to="/auth" />} />
                        <Route path="/auth" element={!currentUser ? <AuthPage /> : <Navigate to="/" />} />
                        <Route path="/play" element={currentUser ? <PlayPage /> : <Navigate to="/auth" />} />
                        <Route path="/puzzles" element={currentUser ? <PuzzlesPage /> : <Navigate to="/auth" />} />
                        <Route path="/friends" element={currentUser ? <FriendsPage /> : <Navigate to="/auth" />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
