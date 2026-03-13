import { useState } from "react";
import { Search, MessageCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { ChatModal } from "@/components/chat/ChatModal";

export default function Messages() {
  const { user } = useAuth();
  const { conversations } = useChat();

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedLeadName, setSelectedLeadName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const handleSelectConversation = (conversationId: string, leadName: string) => {
    setSelectedConversationId(conversationId);
    setSelectedLeadName(leadName);
    setIsChatModalOpen(true);
  };

  const filteredContacts = conversations.filter((c) =>
    (c.metadata?.leadName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getOtherParticipantName = (conversation: any): string => {
    // Si le nom stocké est différent du notre, c'est le bon
    if (conversation.metadata?.leadName && conversation.metadata.leadName !== user?.name) {
      return conversation.metadata.leadName;
    }

    // Essayer de récupérer le nom du promoteur depuis les participants
    if (conversation.participants && Array.isArray(conversation.participants)) {
      const otherParticipant = conversation.participants.find((p: any) => p._id !== user?.id);
      if (otherParticipant?.name) {
        return otherParticipant.name;
      }
    }

    // Fallback
    return conversation.metadata?.promoterName || conversation.metadata?.leadName || "Conversation";
  };

  const getContactInitials = (name: string) => {
    return name
      ?.split(" ")
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join("") || "?";
  };

  // Sidebar
  const sidebar = (
    <div style={{ width: "100%", maxWidth: 380, borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", background: "#ffffff", height: "100%" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
        <h2 style={{ fontSize: "clamp(16px, 5vw, 18px)", fontWeight: 700, color: "#111827", margin: "0 0 10px 0", fontFamily: "'Inter', system-ui, sans-serif" }}>Messages</h2>
        <div style={{ position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            style={{
              width: "100%",
              padding: "10px 12px 10px 38px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: "#f9fafb",
              fontSize: "clamp(12px, 3vw, 14px)",
              outline: "none",
              color: "#374151",
              fontFamily: "'Inter', system-ui, sans-serif",
              boxSizing: "border-box",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              (e.target as HTMLInputElement).style.background = "#ffffff";
              (e.target as HTMLInputElement).style.borderColor = "#2563eb";
              (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
            }}
            onBlur={(e) => {
              (e.target as HTMLInputElement).style.background = "#f9fafb";
              (e.target as HTMLInputElement).style.borderColor = "#e5e7eb";
              (e.target as HTMLInputElement).style.boxShadow = "none";
            }}
          />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {filteredContacts.length > 0 && (
          <>
            <div style={{ padding: "10px 16px", background: "#f9fafb", borderBottom: "1px solid #f3f4f6", position: "sticky", top: 0, zIndex: 10 }}>
              <p style={{ fontSize: "clamp(10px, 2.5vw, 11px)", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", margin: 0, letterSpacing: "0.5px" }}>
                Conversations ({filteredContacts.length})
              </p>
            </div>
            {filteredContacts.map((contact) => {
              const otherParticipantName = getOtherParticipantName(contact);
              return (
                <div
                  key={contact._id}
                  onClick={() => { handleSelectConversation(contact._id, otherParticipantName); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "clamp(8px, 2vw, 12px)", padding: "10px 12px", cursor: "pointer",
                    background: "transparent",
                    borderLeft: "3px solid transparent",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f5f7fa"; (e.currentTarget as HTMLElement).style.transform = "translateX(2px)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.transform = "translateX(0)"; }}
                  className="chat-hover"
                >
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{ width: "clamp(40px, 10vw, 48px)", height: "clamp(40px, 10vw, 48px)", borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: "clamp(12px, 3vw, 15px)", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", transition: "all 0.2s ease" }}>
                      {getContactInitials(otherParticipantName)}
                    </div>
                    <div style={{ position: "absolute", bottom: 0, right: 0, width: 14, height: 14, borderRadius: "50%", background: "#10b981", border: "3px solid #fff", boxShadow: "0 0 0 1px #e5e7eb" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "clamp(13px, 3.5vw, 14px)", color: "#111827", marginBottom: "3px" }}>{otherParticipantName}</div>
                    <div style={{ fontSize: "clamp(11px, 2.5vw, 12px)", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {contact.lastMessage || "Aucun message"}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {filteredContacts.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 12px", textAlign: "center", height: "100%", color: "#6b7280" }}>
            <Search size="clamp(24px, 8vw, 32px)" style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontSize: "clamp(12px, 3vw, 14px)", margin: 0 }}>Aucune conversation trouvée</p>
          </div>
        )}
      </div>
    </div>
  );

  // Right panel - placeholder message
  const chatArea = (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#ffffff", height: "100%", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(124, 58, 237, 0.1))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", animation: "pulse 3s ease-in-out infinite" }}>
          <MessageCircle size={40} style={{ color: "#2563eb" }} />
        </div>
        <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#1f2937", margin: "0 0 12px 0", fontFamily: "'Inter', sans-serif" }}>Sélectionnez une conversation</h3>
        <p style={{ fontSize: "14px", color: "#6b7280", margin: 0, lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>Choisissez un contact dans la liste pour démarrer la discussion</p>
      </div>
    </div>
  );

  return (
    <DashboardLayout title="Messages">
      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .chat-sidebar {
          animation: slideInLeft 0.3s ease-out;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
        .chat-sidebar::-webkit-scrollbar {
          width: 6px;
        }
        .chat-sidebar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .chat-sidebar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .chat-sidebar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .chat-hover {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .chat-hover:hover {
          transform: translateX(4px);
        }
        * {
          scroll-behavior: smooth;
        }
        @media (max-width: 768px) {
          .chat-area {
            display: none !important;
          }
        }
      `}</style>
      <div style={{ display: "flex", height: "100%", maxWidth: 750, width: "100%", margin: "0 auto", fontFamily: "'Inter', system-ui, sans-serif", overflow: "hidden", background: "#f3f4f6", borderRadius: "12px", boxShadow: "0 4px 24px rgba(0, 0, 0, 0.12)" }}>
        <div style={{
          width: "100%",
          maxWidth: 380,
          height: "100%",
          display: "flex",
          borderRight: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)"
        }} className="chat-sidebar">
          {sidebar}
        </div>
        <div className="chat-area" style={{
          flex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "white"
        }}>
          {chatArea}
        </div>
      </div>

      {/* ChatModal for messaging */}
      {selectedConversationId && (
        <ChatModal
          isOpen={isChatModalOpen}
          conversationId={selectedConversationId}
          leadName={selectedLeadName}
          onClose={() => setIsChatModalOpen(false)}
        />
      )}
    </DashboardLayout>
  );
}
