import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api$/, '');

interface UseWebSocketReturn {
  isConnected: boolean;
  socket: Socket | null;
}

/**
 * Hook WebSocket pour le chat en temps réel (client)
 * Se connecte au serveur socket.io avec authentification JWT
 */
export const useWebSocket = (): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    // Expose socket globally for simple integrations
    (window as any).__socket__ = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('[WS] Connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('[WS] Disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('[WS] Connection error:', error);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return { isConnected, socket: socketRef.current };
};
