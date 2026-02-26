import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Loader2, MessageCircle } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import ChatWindow from "@/components/chat/ChatWindow";
import ChatList from "@/components/chat/ChatList";
import { useAuth } from "@/hooks/useAuth";

/**
 * Page Messages - Client Dashboard
 * Affiche les conversations avec les promoteurs
 */
const Messages = () => {
  const { user } = useAuth();
  const { conversations, messages, openConversation, sendMessage } = useChat();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  console.log('[Messages] Component mounted - user:', { id: user?.id, email: user?.email });
  console.log('[Messages] Conversations loaded:', conversations.length, conversations);

  // Request notification permission on mount
  React.useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    // Auto-select first conversation if available
    if (conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0]._id);
      openConversation(conversations[0]._id);
    }
  }, [conversations]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setIsLoading(true);
    openConversation(conversationId).finally(() => setIsLoading(false));
  };

  const handleSendMessage = (text: string) => {
    if (selectedConversationId) {
      sendMessage(selectedConversationId, text);
    }
  };

  const selectedConversation = conversations.find((c) => c._id === selectedConversationId);

  const getOtherParticipant = (conversation: typeof selectedConversation) => {
    if (!conversation) return null;
    const other = conversation.participants.find((p) => p.user._id !== user?.id);
    return other?.user;
  };

  const getParticipantName = (conversation: typeof selectedConversation) => {
    if (!conversation) return 'Conversation';
    const other = getOtherParticipant(conversation);
    if (!other) return 'Conversation';
    return (
      other.firstName ||
      other.name ||
      other.email?.split('@')[0] ||
      'Promoteur'
    );
  };

  return (
    <DashboardLayout title="Messages">
      <div className="h-[calc(100vh-200px)] flex gap-4 px-4 sm:px-8 py-4 flex-col sm:flex-row">
        {/* Conversations List - Left Sidebar */}
        <div className={`flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all ${
          selectedConversationId ? 'hidden sm:flex sm:w-80' : 'w-full sm:w-80'
        }`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Conversations ({conversations.length})
            </h3>
          </div>

          {conversations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                Aucune conversation pour le moment
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Les conversations apparaîtront ici lorsque vous contacterez un promoteur
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-2">
              <ChatList
                conversations={conversations}
                onOpen={handleSelectConversation}
                selectedId={selectedConversationId}
              />
            </div>
          )}
        </div>

        {/* Chat Window - Main Area */}
        <div className={`flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1 ${
          selectedConversationId ? 'flex' : 'hidden sm:flex'
        }`}>
          {/* Back button for mobile */}
          <div className="sm:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <button
              onClick={() => setSelectedConversationId(null)}
              className="text-blue-600 hover:text-blue-700 dark:hover:text-blue-400 font-medium text-sm"
            >
              ← Retour
            </button>
          </div>
          {isLoading && !selectedConversation ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  {getParticipantName(selectedConversation)}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Conversation avec le promoteur
                </p>
              </div>

              {/* Chat Messages */}
              <ChatWindow
                messages={messages}
                onSend={handleSendMessage}
                conversationId={selectedConversationId}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  {conversations.length === 0
                    ? "Aucune conversation disponible"
                    : "Sélectionnez une conversation pour commencer"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
