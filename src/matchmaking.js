// src/matchmaking.js — Real-time matchmaking + live game sync via Firebase
import { db, ref, set, onValue, push, remove, update, onDisconnect, get, isConfigured } from './firebase';

const getQueuePath = (timeControl) => {
    const inc = timeControl.increment || 0;
    return `queue/${timeControl.type}_${timeControl.value}_${inc}`;
};

export const joinQueue = async (user, timeControl) => {
    if (!isConfigured || !db) throw new Error('Firebase not configured');
    const queuePath = getQueuePath(timeControl);
    const queueRef = ref(db, queuePath);
    const newEntry = push(queueRef);

    const entryData = {
        uid: user.id || user.uid,
        username: user.username,
        rating: user.rating,
        avatar: user.avatar,
        timeControl: {
            label: timeControl.label,
            value: timeControl.value,
            type: timeControl.type,
            increment: timeControl.increment || 0,
        },
        joinedAt: Date.now(),
    };

    onDisconnect(newEntry).remove();
    await set(newEntry, entryData);

    return { entryKey: newEntry.key, queuePath };
};

export const leaveQueue = async (queuePath, entryKey) => {
    if (!isConfigured || !db || !entryKey || !queuePath) return;
    await remove(ref(db, `${queuePath}/${entryKey}`));
};

export const watchQueue = (user, timeControl, entryKey, queuePath, onMatchFound) => {
    if (!isConfigured || !db) return () => {};

    const queueRef = ref(db, queuePath);
    let matched = false;

    const unsub = onValue(queueRef, async (snapshot) => {
        if (matched) return;
        const data = snapshot.val();
        if (!data) return;

        const entries = Object.entries(data);
        const opponentEntry = entries.find(([key, val]) => val.uid !== (user.id || user.uid));

        if (opponentEntry) {
            const [oppKey, oppData] = opponentEntry;

            if ((user.id || user.uid) > oppData.uid) return;

            matched = true;

            const iAmWhite = Math.random() > 0.5;
            const player1 = iAmWhite
                ? { uid: user.id || user.uid, username: user.username, rating: user.rating, avatar: user.avatar }
                : { uid: oppData.uid, username: oppData.username, rating: oppData.rating, avatar: oppData.avatar };
            const player2 = iAmWhite
                ? { uid: oppData.uid, username: oppData.username, rating: oppData.rating, avatar: oppData.avatar }
                : { uid: user.id || user.uid, username: user.username, rating: user.rating, avatar: user.avatar };

            const gameRef = push(ref(db, 'games'));
            const tc = timeControl;
            const gameData = {
                id: gameRef.key,
                player1,
                player2,
                status: 'playing',
                fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
                moves: [],
                timeControl: {
                    label: tc.label,
                    value: tc.value,
                    type: tc.type,
                    increment: tc.increment || 0,
                },
                player1Time: tc.value,
                player2Time: tc.value,
                drawOffer: null,
                chat: [],
                createdAt: Date.now(),
                lastMoveAt: Date.now(),
                result: null,
                type: 'random',
            };

            await set(gameRef, gameData);
            await remove(ref(db, `${queuePath}/${entryKey}`));
            await remove(ref(db, `${queuePath}/${oppKey}`));

            const myColor = player1.uid === (user.id || user.uid) ? 'w' : 'b';
            onMatchFound({
                gameId: gameRef.key,
                color: myColor,
                opponent: myColor === 'w' ? player2 : player1,
                game: gameData,
            });
        }
    });

    return unsub;
};

export const listenForMyGame = (uid, onGameFound) => {
    if (!isConfigured || !db || !uid) return () => {};
    const gamesRef = ref(db, 'games');
    let found = false;

    const unsub = onValue(gamesRef, (snapshot) => {
        if (found) return;
        const games = snapshot.val();
        if (!games) return;

        const now = Date.now();
        for (const [gameId, game] of Object.entries(games)) {
            const isRecent = game.createdAt && (now - game.createdAt) < 60000;
            const isPlaying = game.status === 'playing';
            const involvesMe = game.player1?.uid === uid || game.player2?.uid === uid;

            if (isRecent && isPlaying && involvesMe) {
                found = true;
                const myColor = game.player1?.uid === uid ? 'w' : 'b';
                const opponent = myColor === 'w' ? game.player2 : game.player1;
                onGameFound({
                    gameId,
                    color: myColor,
                    opponent,
                    game,
                });
                break;
            }
        }
    });

    return unsub;
};

export const submitMove = async (gameId, moveData, newFen, movesArray, timerUpdate) => {
    if (!isConfigured || !db || !gameId) return;
    const updates = {
        fen: newFen,
        moves: movesArray,
        lastMoveAt: Date.now(),
    };
    if (timerUpdate) {
        if (timerUpdate.player1Time !== undefined) updates.player1Time = timerUpdate.player1Time;
        if (timerUpdate.player2Time !== undefined) updates.player2Time = timerUpdate.player2Time;
    }
    await update(ref(db, `games/${gameId}`), updates);
};

export const endOnlineGame = async (gameId, winnerUid, reason) => {
    if (!isConfigured || !db || !gameId) return;
    await update(ref(db, `games/${gameId}`), {
        status: 'ended',
        result: { winner: winnerUid, reason },
    });
};
