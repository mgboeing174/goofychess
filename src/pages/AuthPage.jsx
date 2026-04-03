import React, { useState } from 'react';
import { useStore, TEST_USER } from '../store';
import { signInWithPopup, signInWithRedirect, provider, auth, isConfigured } from '../firebase';
import { LogIn, User, ShieldCheck, Zap } from 'lucide-react';
import './AuthPage.css';

const AuthPage = () => {
    const { dispatch, addToast } = useStore();
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        if (!isConfigured) {
            addToast('Firebase credentials missing! Please add them to Vercel env vars.', 'error');
            return;
        }
        setLoading(true);
        try {
            await signInWithPopup(auth, provider);
            addToast('Welcome back!', 'success');
        } catch (error) {
            console.error('Login Failed', error);
            if (error.code === 'auth/popup-blocked') {
                addToast('Popup blocked! Redirecting you to login...', 'info');
                await signInWithRedirect(auth, provider);
            } else if (error.code === 'auth/unauthorized-domain') {
                addToast('Domain NOT authorized in Firebase! See instructions below.', 'error');
            } else {
                addToast(`Login Error: ${error.message}`, 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = () => {
        const guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
        const guestUser = {
            ...TEST_USER,
            id: guestId,
            username: 'Guest ' + guestId.substr(6, 4).toUpperCase(),
        };
        dispatch({ type: 'LOGIN', payload: guestUser });
        addToast('Logged in as Guest!', 'info');
    };

    return (
        <div className="auth-page">
            <div className="auth-card glass-panel">
                <div className="auth-header">
                    <div className="logo font-orbitron text-neon">♟ ChessMaster</div>
                    <h1>Join the <span className="text-neon">Arena</span></h1>
                    <p>Connect with players globally and improve your game with AI.</p>
                </div>

                <div className="auth-body">
                    <button className="btn-neon w-full" onClick={handleGoogleLogin} disabled={loading}>
                        <LogIn size={20} /> Continue with Google
                    </button>
                    
                    <div className="auth-divider">
                        <span>OR</span>
                    </div>

                    <button className="btn-neon-outline w-full" onClick={handleGuestLogin}>
                        <User size={20} /> Continue as Guest
                    </button>
                </div>

                <div className="auth-footer">
                    <p className="text-muted"><ShieldCheck size={14} /> Secure authentication via Firebase</p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
