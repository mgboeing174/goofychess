import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { onAuthStateChanged, auth, isConfigured } from './firebase';

const StoreContext = createContext();

export const TEST_USER = {
    id: 'player',
    username: 'Guest Player',
    rating: 1200,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=guest',
    stats: { wins: 0, losses: 0, draws: 0 }
};

const initialState = {
    currentUser: null,
    onlineStatus: 'idle',
    games: [],
    notifications: [],
    isConfigured: isConfigured
};

function reducer(state, action) {
    switch (action.type) {
        case 'LOGIN':
            return { ...state, currentUser: action.payload };
        case 'LOGOUT':
            return { ...state, currentUser: null };
        case 'SET_STATUS':
            return { ...state, onlineStatus: action.payload };
        case 'ADD_GAME':
            return { ...state, games: [action.payload, ...state.games] };
        case 'ADD_TOAST':
            return { ...state, notifications: [...state.notifications, action.payload] };
        case 'REMOVE_TOAST':
            return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
        default:
            return state;
    }
}

export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        if (!isConfigured) return;
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) {
                dispatch({
                    type: 'LOGIN',
                    payload: {
                        id: user.uid,
                        username: user.displayName || user.email.split('@')[0],
                        email: user.email,
                        avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
                        rating: 1200
                    }
                });
            } else {
                dispatch({ type: 'LOGOUT' });
            }
        });
        return unsub;
    }, []);

    const addToast = (message, type = 'info') => {
        const id = Date.now();
        dispatch({ type: 'ADD_TOAST', payload: { id, message, type } });
        setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 5000);
    };

    return (
        <StoreContext.Provider value={{ state, dispatch, addToast }}>
            {children}
        </StoreContext.Provider>
    );
}

export const useStore = () => useContext(StoreContext);
