import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Conversation } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  conversations: Conversation[];
  onOpen: (id: string) => void;
  selectedId?: string | null;
}

const ChatList: React.FC<Props> = ({ conversations, onOpen, selectedId }) => {
  const { user } = useAuth();

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}j`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  const truncateMessage = (msg: string | undefined, length: number = 50) => {
    if (!msg) return '';
    return msg.length > length ? msg.substring(0, length) + '...' : msg;
  };

  const getOtherParticipant = (conversation: Conversation) => {
    const other = conversation.participants.find(
      (p) => p.user._id !== user?.id
    );
    return other?.user;
  };

  const getParticipantName = (conversation: Conversation) => {
    const other = getOtherParticipant(conversation);
    if (!other) return 'Conversation';
    return (
      other.firstName ||
      other.name ||
      other.email?.split('@')[0] ||
      'Utilisateur'
    );
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .slice(0, 2)
      .map(n => n[0].toUpperCase())
      .join('') || '?';
  };

  return (
    <div className="space-y-1">
      {conversations.length === 0 ? (
        <div className="p-4 sm:p-6 text-center">
          <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs sm:text-sm text-slate-500">Aucune conversation</p>
        </div>
      ) : (
        conversations.map((c) => {
          const isSelected = c._id === selectedId;
          const participantName = getParticipantName(c);
          const hasUnread = c.unreadCount && c.unreadCount > 0;

          return (
            <button
              key={c._id}
              onClick={() => onOpen(c._id)}
              className={`
                w-full text-left p-2.5 sm:p-3 rounded-lg transition-all duration-200
                ${isSelected
                  ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-700 shadow-sm'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent'
                }
              `}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md">
                    {getInitials(participantName)}
                  </div>
                  {/* Online indicator */}
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 sm:gap-2 mb-1">
                    <h4 className={`text-xs sm:text-sm truncate font-${hasUnread ? 'bold' : 'medium'} ${
                      isSelected
                        ? 'text-blue-900 dark:text-blue-100'
                        : 'text-slate-900 dark:text-white'
                    }`}>
                      {participantName}
                    </h4>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex-shrink-0 whitespace-nowrap">
                      {formatTime(c.updatedAt)}
                    </span>
                  </div>

                  {/* Last Message Preview */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <p className={`text-xs truncate ${
                      hasUnread
                        ? 'text-slate-700 dark:text-slate-200 font-medium'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {truncateMessage(c.lastMessage, 35) || 'Aucun message'}
                    </p>
                    {hasUnread && (
                      <span className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {c.unreadCount > 9 ? '9+' : c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })
      )}
    </div>
  );
};

export default ChatList;
