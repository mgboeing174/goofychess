// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set, onValue, push, remove, update, onDisconnect, get } from "firebase/database";

// ==============================================================================
// 🔴 ACTION REQUIRED: Add Your Firebase Config Here!
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project and register a Web App
// 3. Enable 'Authentication' -> 'Google' under Build
// 4. Enable 'Realtime Database' under Build and set rules to 'public' for testing
// 5. Paste your config below:
// ==============================================================================
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

let app, auth, provider, db;

if (isConfigured) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    provider = new GoogleAuthProvider();
    db = getDatabase(app);
}

export {
    auth,
    provider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    db,
    ref,
    set,
    onValue,
    push,
    remove,
    update,
    onDisconnect,
    get,
    isConfigured
};
