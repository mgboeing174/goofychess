import { db, ref, set, onValue, onDisconnect, get } from './firebase';

export const updatePresence = (uid, username, status = 'online') => {
    if (!db || !uid) return;
    const presenceRef = ref(db, `status/${uid}`);
    set(presenceRef, {
        username,
        status,
        lastSeen: Date.now()
    });
    onDisconnect(presenceRef).update({
        status: 'offline',
        lastSeen: Date.now()
    });
};

export const listenToOnlineUsers = (callback) => {
    if (!db) return () => {};
    const statusRef = ref(db, 'status');
    return onValue(statusRef, (snapshot) => {
        const data = snapshot.val();
        if (data) callback(data);
    });
};
