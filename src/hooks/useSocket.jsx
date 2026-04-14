// import { useEffect, useRef, useState, useCallback } from 'react';
// import { io } from 'socket.io-client';
// import { auth } from '../firebase';

// // Per-tab socket isolation via sessionStorage
// const TAB_ID = (() => {
//   let id = sessionStorage.getItem('_fk_tab_id');
//   if (!id) { id = Math.random().toString(36).slice(2); sessionStorage.setItem('_fk_tab_id', id); }
//   return id;
// })();

// let _socket = null;
// let _connecting = false;
// const _connListeners = new Set();

// function notifyConnListeners(v) { _connListeners.forEach(fn => fn(v)); }

// async function getSocket() {
//   if (_socket?.connected) return _socket;
//   if (_connecting) {
//     // Wait for existing connection attempt
//     return new Promise(resolve => {
//       const check = setInterval(() => {
//         if (_socket?.connected || !_connecting) { clearInterval(check); resolve(_socket); }
//       }, 100);
//     });
//   }

//   const user = auth.currentUser;
//   if (!user) return null;

//   _connecting = true;
//   try {
//     const token = await user.getIdToken();

//     _socket = io(window.location.origin, {
//       auth:    { token },
//       transports: ['websocket', 'polling'],
//       reconnection: true,
//       reconnectionDelay: 1000,
//       reconnectionDelayMax: 5000,
//       reconnectionAttempts: Infinity,
//       query: { tabId: TAB_ID },
//     });

//     await new Promise((resolve) => {
//       _socket.once('connect',       () => { notifyConnListeners(true);  resolve(); });
//       _socket.once('connect_error', () => resolve()); // resolve anyway — don't block
//     });

//     _socket.on('connect',    () => notifyConnListeners(true));
//     _socket.on('disconnect', (reason) => {
//       notifyConnListeners(false);
//       // Server-kicked — refresh token and reconnect
//       if (reason === 'io server disconnect') {
//         setTimeout(async () => {
//           try {
//             const fresh = await auth.currentUser?.getIdToken(true);
//             if (fresh && _socket) { _socket.auth.token = fresh; _socket.connect(); }
//           } catch (_) {}
//         }, 500);
//       }
//     });

//   } catch (err) {
//     console.error('Socket init failed:', err);
//   } finally {
//     _connecting = false;
//   }

//   return _socket;
// }

// // Connect when user logs in, disconnect when they log out
// auth.onAuthStateChanged(user => {
//   if (user) {
//     // Small delay so Firebase token is ready
//     setTimeout(() => getSocket(), 300);
//   } else if (_socket) {
//     _socket.disconnect();
//     _socket = null;
//     _connecting = false;
//     notifyConnListeners(false);
//   }
// });

// // ── useSocket ──────────────────────────────────────────────────────────────────
// export function useSocket() {
//   const [connected, setConnected] = useState(_socket?.connected || false);

//   useEffect(() => {
//     const cb = (v) => setConnected(v);
//     _connListeners.add(cb);

//     // Check current state immediately
//     if (_socket?.connected) setConnected(true);
//     else getSocket();

//     return () => { _connListeners.delete(cb); };
//   }, []);

//   return { connected };
// }

// // ── useBotEvents ───────────────────────────────────────────────────────────────
// export function useBotEvents(profileName, onEvent) {
//   const handlerRef = useRef(onEvent);
//   handlerRef.current = onEvent;

//   useEffect(() => {
//     if (!profileName) return;
//     let sock = null;
//     let subscribed = false;

//     const EVENTS = [
//       'bot:terminal', 'bot:status', 'bot:progress', 'bot:completed',
//       'bot:cycleStart', 'bot:cycleUpdate', 'bot:wheelStats', 'bot:betUpdate',
//     ];

//     const subscribe = async () => {
//       sock = await getSocket();
//       if (!sock) return;

//       sock.emit('subscribe:profile', profileName);
//       subscribed = true;

//       for (const ev of EVENTS) {
//         sock.on(ev, (data) => {
//           // Guard: only process events for this profile
//           if (data._profile && data._profile !== profileName) return;
//           handlerRef.current(ev, data);
//         });
//       }
//     };

//     subscribe();

//     return () => {
//       if (sock && subscribed) {
//         sock.emit('unsubscribe:profile', profileName);
//         for (const ev of EVENTS) sock.off(ev);
//       }
//     };
//   }, [profileName]);
// }



import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { auth } from '../firebase';

// Per-tab socket isolation via sessionStorage
const TAB_ID = (() => {
  let id = sessionStorage.getItem('_fk_tab_id');
  if (!id) { id = Math.random().toString(36).slice(2); sessionStorage.setItem('_fk_tab_id', id); }
  return id;
})();

// ── Backend URL ────────────────────────────────────────────────────────────────
// When deployed (Vercel frontend + Render backend), we must connect to the
// Render backend URL explicitly — NOT window.location.origin (that would try
// to open a WebSocket to Vercel, which is serverless and cannot handle it).
const BACKEND_URL = import.meta.env.VITE_API_URL || window.location.origin;

let _socket = null;
let _connectionPromise = null;
const _listeners = new Set();

function notifyListeners(connected) { _listeners.forEach(fn => fn(connected)); }

async function getSocket() {
  if (_socket?.connected) return _socket;
  if (_connectionPromise) return _connectionPromise;

  _connectionPromise = new Promise(async (resolve) => {
    try {
      const user = auth.currentUser;
      if (!user) { _connectionPromise = null; resolve(null); return; }
      const token = await user.getIdToken();

      // Connect to backend URL (Render), not window.location.origin (Vercel)
      _socket = io(BACKEND_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
        query: { tabId: TAB_ID },
      });

      _socket.on('connect', () => {
        console.log('✅ Socket connected');
        notifyListeners(true);
        _connectionPromise = null;
        resolve(_socket);
      });

      _socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
        notifyListeners(false);
        if (reason === 'io server disconnect') {
          setTimeout(async () => {
            try {
              const freshToken = await auth.currentUser?.getIdToken(true);
              if (freshToken && _socket) { 
                _socket.auth.token = freshToken; 
                _socket.connect(); 
              }
            } catch (_) {}
          }, 500);
        }
      });

      _socket.on('connect_error', (err) => {
        console.error('Socket connect error:', err.message);
        _connectionPromise = null;
        resolve(_socket);
      });

    } catch (err) {
      console.error('Socket init error:', err);
      _connectionPromise = null;
      resolve(null);
    }
  });

  return _connectionPromise;
}

// Connect when user logs in, disconnect when they log out
auth.onAuthStateChanged((user) => {
  if (user) {
    // Small delay so Firebase token is ready
    setTimeout(() => getSocket(), 300);
  } else if (_socket) {
    _socket.disconnect();
    _socket = null;
    _connectionPromise = null;
    notifyListeners(false);
  }
});

// ── useSocket ──────────────────────────────────────────────────────────────────
export function useSocket() {
  const [connected, setConnected] = useState(_socket?.connected || false);

  useEffect(() => {
    const cb = (v) => setConnected(v);
    _listeners.add(cb);
    
    // Check current state immediately
    if (_socket?.connected) setConnected(true);
    else getSocket();
    
    return () => { _listeners.delete(cb); };
  }, []);

  return { connected };
}

// ── useBotEvents — subscribe to a profile's live events ───────────────────────
export function useBotEvents(profileName, onEvent) {
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    if (!profileName) return;
    let sock = null;
    let subscribed = false;

    const EVENTS = [
      'bot:terminal', 'bot:status', 'bot:progress', 'bot:completed',
      'bot:cycleStart', 'bot:cycleUpdate', 'bot:wheelStats', 'bot:betUpdate',
    ];

    const subscribe = async () => {
      sock = await getSocket();
      if (!sock) return;

      sock.emit('subscribe:profile', profileName);
      subscribed = true;
      console.log(`📡 Subscribed to profile: ${profileName}`);

      for (const ev of EVENTS) {
        sock.on(ev, (data) => {
          // Guard: only process events for this profile
          if (data._profile && data._profile !== profileName) return;
          handlerRef.current(ev, data);
        });
      }
    };

    subscribe();

    return () => {
      if (sock && subscribed) {
        sock.emit('unsubscribe:profile', profileName);
        console.log(`📡 Unsubscribed from profile: ${profileName}`);
        for (const ev of EVENTS) sock.off(ev);
      }
    };
  }, [profileName]);
}