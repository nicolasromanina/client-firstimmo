import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Clock, MessageCircle } from 'lucide-react';
import { Message } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  messages: Message[];
  onSend: (text: string) => void;
  conversationId: string | null;
}

const ChatWindow: React.FC<Props> = ({ messages, onSend, conversationId }) => {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || !conversationId) return;
    setIsSending(true);
    onSend(text.trim());
    setText('');
    setTimeout(() => setIsSending(false), 500);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOwnMessage = (message: Message) => {
    return message.sender._id === user?.id || message.sender._id === 'current-user';
  };

  // Group messages by day
  const groupedMessages = messages.reduce((groups: any[], msg) => {
    const date = formatDate(msg.createdAt);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup?.date === date) {
      lastGroup.messages.push(msg);
    } else {
      groups.push({ date, messages: [msg] });
    }
    return groups;
  }, []);

  const getSenderName = (msg: Message) => {
    if (isOwnMessage(msg)) return 'Vous';
    return msg.sender?.firstName || msg.sender?.email?.split('@')[0] || 'Promoteur';
  };

  const getSenderInitials = (msg: Message) => {
    if (isOwnMessage(msg)) return 'VD';
    const name = msg.sender?.firstName || msg.sender?.email?.split('@')[0] || '?';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-6 space-y-3 sm:space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
            </div>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium">Aucun message pour le moment</p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Commencez la conversation !</p>
          </div>
        ) : (
          <>
            {groupedMessages.map((group: any, groupIdx: number) => (
              <div key={groupIdx}>
                {/* Date Separator */}
                <div className="flex items-center gap-2 sm:gap-3 my-4 sm:my-6">
                  <div className="flex-1 h-px bg-slate-300 dark:bg-slate-600"></div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2 sm:px-3 whitespace-nowrap">
                    {group.date}
                  </span>
                  <div className="flex-1 h-px bg-slate-300 dark:bg-slate-600"></div>
                </div>

                {/* Messages */}
                {group.messages.map((m: Message, idx: number) => {
                  const own = isOwnMessage(m);
                  const isNextSameSender = 
                    idx < group.messages.length - 1 && 
                    isOwnMessage(group.messages[idx + 1]) === own;
                  const isPrevSameSender = 
                    idx > 0 && 
                    isOwnMessage(group.messages[idx - 1]) === own;

                  return (
                    <div
                      key={m._id}
                      className={`flex ${own ? 'justify-end' : 'justify-start'} mb-1.5 sm:mb-2`}
                    >
                      <div className={`flex ${own ? 'flex-row-reverse' : 'flex-row'} gap-1.5 sm:gap-2 max-w-xs sm:max-w-md lg:max-w-lg`}>
                        {/* Avatar */}
                        {!isPrevSameSender && (
                          <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white ${
                            own 
                              ? 'bg-blue-600' 
                              : 'bg-orange-500'
                          }`}>
                            {getSenderInitials(m)}
                          </div>
                        )}
                        {isPrevSameSender && <div className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0"></div>}

                        {/* Message Bubble */}
                        <div className={`rounded-lg sm:rounded-2xl px-3 sm:px-4 py-2 ${
                          own
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                        } ${isNextSameSender ? 'rounded-b-lg' : ''}`}>
                          {!own && !isPrevSameSender && (
                            <div className="text-xs font-semibold mb-1 opacity-75">
                              {getSenderName(m)}
                            </div>
                          )}
                          <p className="text-xs sm:text-sm break-words leading-relaxed whitespace-pre-wrap">{m.content}</p>
                          <div className={`flex items-center gap-0.5 sm:gap-1 mt-1 text-xs ${
                            own 
                              ? 'text-blue-100' 
                              : 'text-slate-500 dark:text-slate-400'
                          }`}>
                            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span>{formatTime(m.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <form
        onSubmit={submit}
        className="p-3 sm:p-4 sm:p-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg"
      >
        <div className="flex gap-2 sm:gap-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition-all"
            placeholder="Tapez votre message..."
            disabled={!conversationId || isSending}
            autoFocus
          />
          <button
            type="submit"
            disabled={!text.trim() || !conversationId || isSending}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg sm:rounded-xl flex items-center justify-center gap-1 sm:gap-2 transition-all font-medium hover:shadow-lg disabled:hover:shadow-none flex-shrink-0"
            title={isSending ? 'Envoi en cours...' : 'Envoyer (Entrée)'}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
