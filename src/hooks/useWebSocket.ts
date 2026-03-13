import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { notificationService } from '@/lib/services';

const WS_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api$/, '');

interface AppNotification {
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
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let isActive = true;

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

    const handleIncomingNotification = (notification: AppNotification) => {
      setNotifications(prev => [notification, ...prev].slice(0, 50));

      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        window.Notification.permission === 'granted'
      ) {
        new window.Notification(notification.title, {
          body: notification.message,
        });
      }
    };

    socket.on('notification', handleIncomingNotification);
    socket.on('notification:new', (payload: any) => {
      const normalized: AppNotification = {
        _id: payload.id || payload._id,
        type: payload.type || 'system',
        title: payload.title || 'Notification',
        message: payload.message || '',
        data: payload.data,
        read: false,
        createdAt: payload.createdAt || new Date().toISOString(),
        actionUrl: payload.link,
        priority: payload.priority,
      };
      handleIncomingNotification(normalized);
    });

    socket.on('notification:read', ({ notificationId }: { notificationId: string }) => {
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
    });

    socket.on('notification:allRead', () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    });

    notificationService.getNotifications()
      .then((initial) => {
        if (isActive && Array.isArray(initial)) {
          setNotifications(initial.slice(0, 50));
        }
      })
      .catch((error) => {
        console.warn('[WS] Could not load notifications:', error);
      });

    return () => {
      isActive = false;
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    socketRef.current?.emit('notification:markRead', { notificationId: id });
    notificationService.markAsRead(id).catch((error) => {
      console.warn('[WS] markAsRead API failed:', error);
    });
    setNotifications(prev =>
      prev.map(n => n._id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    socketRef.current?.emit('notification:markAllRead');
    notificationService.markAllAsRead().catch((error) => {
      console.warn('[WS] markAllAsRead API failed:', error);
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  return { isConnected, notifications, unreadCount, markAsRead, markAllAsRead };
};
