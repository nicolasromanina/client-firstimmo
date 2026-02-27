import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api$/, '');

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  priority?: string;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
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

    socket.on('notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev].slice(0, 50));
    });

    socket.on('notification:read', ({ notificationId }: { notificationId: string }) => {
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    socketRef.current?.emit('notification:markRead', { notificationId: id });
    setNotifications(prev =>
      prev.map(n => n._id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    socketRef.current?.emit('notification:markAllRead');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  return { isConnected, notifications, unreadCount, markAsRead, markAllAsRead };
};
