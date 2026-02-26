import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { useWebSocket } from './useWebSocket';
import { chatService } from '@/lib/services';

export interface Conversation {
  _id: string;
  participants: Array<{
    user: {
      _id: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      name?: string;
    };
    role?: string;
  }>;
  lastMessage?: string;
  updatedAt?: string;
  createdAt?: string;
  metadata?: { type?: string; leadName?: string };
  unreadCount?: number;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: {
    _id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
  };
  content: string;
  type: string;
  createdAt: string;
  readBy?: string[];
}

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const { isConnected } = useWebSocket();
  const socketRef = useRef<any>(null);

  // Fetch conversations helper
  const fetchConvs = async () => {
    try {
      console.log('[useChat] fetchConvs - starting fetch');
      const convs = await chatService.getConversations();
      console.log('[useChat] fetchConvs - received conversations:', convs);
      setConversations(convs);
    } catch (err) {
      console.error('useChat fetchConvs error:', err);
    }
  };

  useEffect(() => {
    fetchConvs();
  }, []);

  useEffect(() => {
    const sock: any = (window as any).__socket__;
    socketRef.current = sock;
    if (!sock) return;

    const handler = (msg: Message) => {
      console.log('[useChat] chat:message received:', msg._id);
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c._id === msg.conversation);
        if (idx === -1) return prev;
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          lastMessage: msg.content,
          updatedAt: msg.createdAt,
          // Increment unreadCount if message is not from current user
          unreadCount: (copy[idx].unreadCount || 0) + 1,
        };
        return copy.sort(
          (a, b) =>
            new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
        );
      });
      // Show notification
      if (('Notification' in window) && Notification.permission === 'granted') {
        const sender = msg.sender?.firstName || msg.sender?.email?.split('@')[0] || 'Promoteur';
        new Notification('Nouveau message', {
          body: `${sender}: ${msg.content.substring(0, 50)}...`,
          icon: '/notification-icon.png',
        });
      }
    };

    sock?.on('chat:message', handler);
    return () => {
      sock?.off('chat:message', handler);
    };
  }, [isConnected]);

  const openConversation = async (conversationId: string) => {
    try {
      const msgs = await chatService.getMessages(conversationId);
      setMessages(msgs);

      const sock: any = (window as any).__socket__;
      sock?.emit('chat:join', conversationId);

      // Mark conversation as read and clear unread count
      try {
        await chatService.markAsRead(conversationId);
        setConversations((prev) => {
          const copy = [...prev];
          const idx = copy.findIndex((c) => c._id === conversationId);
          if (idx !== -1) {
            copy[idx] = { ...copy[idx], unreadCount: 0 };
          }
          return copy;
        });
      } catch (err) {
        console.warn('useChat markRead failed', err);
      }
    } catch (err) {
      console.error('useChat openConversation', err);
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    try {
      const sock: any = (window as any).__socket__;
      if (sock && sock.connected) {
        sock.emit('chat:message', { conversationId, content, type: 'text' });
        // Optimistically add message
        const tempMsg: Message = {
          _id: `temp-${Date.now()}`,
          conversation: conversationId,
          sender: {
            _id: 'current-user',
            email: 'Vous',
          },
          content,
          type: 'text',
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempMsg]);
        return;
      }
      const msg = await chatService.sendMessage(conversationId, content);
      setMessages((prev) => [...prev, msg]);
    } catch (err) {
      console.error('useChat sendMessage', err);
    }
  };

  return { conversations, messages, openConversation, sendMessage, fetchConvs };
}
