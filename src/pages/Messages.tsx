import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, MoreVertical, Phone, Video, Search, Smile, Check, CheckCheck, ArrowLeft, X, Image, FileText, Reply, CornerDownRight, MessageCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { useToast } from "@/hooks/use-toast";
import type { Message as ChatMessage } from "@/hooks/useChat";

interface Attachment {
  name: string;
  url: string;
  type: "image" | "file";
}

interface ReplyMessage {
  id: string;
  text: string;
  sender: "me" | "them";
}

const EMOJIS = [
  "😀", "😂", "😍", "🥰", "😎", "🤝", "👍", "👏", "🔥", "✅",
  "❤️", "💪", "🎉", "🏠", "🏗️", "📄", "📊", "💰", "🤔", "😊",
  "👋", "🙏", "💼", "📞", "📧", "🗓️", "⭐", "🚀", "💡", "✨",
];

const StatusIcon = ({ status }: { status?: string }) => {
  if (!status || status === "sent") return <Check size={14} style={{ color: "#94a3b8" }} />;
  if (status === "delivered") return <CheckCheck size={14} style={{ color: "#94a3b8" }} />;
  return <CheckCheck size={14} style={{ color: "#3b82f6" }} />;
};

const TypingIndicator = ({ name }: { name: string }) => (
  <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
    <div
      style={{
        padding: "10px 16px",
        borderRadius: "16px 16px 16px 4px",
        background: "#ffffff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 12, color: "#64748b", fontFamily: "'Inter', system-ui, sans-serif" }}>
        {name} écrit
      </span>
      <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#94a3b8",
              display: "inline-block",
              animation: `typingDot 1.4s infinite ease-in-out`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </span>
      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  </div>
);

export default function Messages() {
  const { user } = useAuth();
  const { conversations, messages, openConversation, sendMessage } = useChat();
  const { toast } = useToast();

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<Attachment[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<ReplyMessage | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowMobileChat(true);
    setIsLoading(true);
    openConversation(conversationId).finally(() => setIsLoading(false));
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newAttachments: Attachment[] = Array.from(files).map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
      type: f.type.startsWith("image/") ? "image" : "file",
    }));
    setPendingFiles((prev) => [...prev, ...newAttachments]);
  };

  const removePending = (idx: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const send = () => {
    if (!input.trim() && pendingFiles.length === 0) return;
    if (selectedConversationId) {
      sendMessage(selectedConversationId, input.trim());
    }
    setInput("");
    setPendingFiles([]);
    setShowEmoji(false);
    setReplyTo(null);
  };

  const handleReply = (msg: ChatMessage) => {
    setReplyTo({
      id: msg._id,
      text: msg.content,
      sender: msg.sender?._id === user?.id ? "me" : "them",
    });
    inputRef.current?.focus();
  };

  const scrollToMessage = (msgId: string) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.style.transition = "background 0.3s";
      el.style.background = "rgba(37,99,235,0.08)";
      setTimeout(() => { el.style.background = "transparent"; }, 1500);
    }
  };

  const filteredContacts = conversations.filter((c) =>
    (c.metadata?.leadName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (d: Date) => d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const getContactInitials = (name: string) => {
    return name
      ?.split(" ")
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join("") || "?";
  };

  const renderAttachments = (attachments: Attachment[], isMe: boolean) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
      {attachments.map((att, i) =>
        att.type === "image" ? (
          <img
            key={i}
            src={att.url}
            alt={att.name}
            onClick={(e) => { e.stopPropagation(); setPreviewImage(att.url); }}
            style={{ width: 180, height: 120, objectFit: "cover", borderRadius: 8, cursor: "pointer", border: isMe ? "2px solid rgba(255,255,255,0.2)" : "2px solid #e2e8f0" }}
          />
        ) : (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: isMe ? "rgba(255,255,255,0.15)" : "#f1f5f9", fontSize: 13, maxWidth: 220 }}>
            <FileText size={16} style={{ flexShrink: 0, color: isMe ? "#bfdbfe" : "#2563eb" }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: isMe ? "#e0e7ff" : "#334155" }}>{att.name}</span>
          </div>
        )
      )}
    </div>
  );

  const renderReplyQuote = (reply: ReplyMessage | null, isMe: boolean) => {
    if (!reply) return null;
    return (
      <div style={{ padding: "6px 10px", marginBottom: 6, borderRadius: 8, borderLeft: `3px solid ${isMe ? "rgba(255,255,255,0.5)" : "#2563eb"}`, background: isMe ? "rgba(255,255,255,0.12)" : "#f0f9ff", cursor: "pointer" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: isMe ? "rgba(255,255,255,0.8)" : "#2563eb", marginBottom: 2 }}>
          {reply.sender === "me" ? "Vous" : "Contact"}
        </div>
        <div style={{ fontSize: 12, color: isMe ? "rgba(255,255,255,0.65)" : "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 250 }}>
          {reply.text}
        </div>
      </div>
    );
  };

  const selectedConversation = conversations.find(c => c._id === selectedConversationId);

  // Hidden file inputs
  const hiddenInputs = (
    <>
      <input ref={fileInputRef} type="file" multiple style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
      <input ref={imageInputRef} type="file" multiple accept="image/*" style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
    </>
  );

  // Image preview lightbox
  const lightbox = previewImage && (
    <div onClick={() => setPreviewImage(null)} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}>
      <button onClick={() => setPreviewImage(null)} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
        <X size={20} />
      </button>
      <img src={previewImage} alt="Preview" style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 8, objectFit: "contain" }} />
    </div>
  );

  // Sidebar
  const sidebar = (
    <div style={{ width: "100%", maxWidth: 380, borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", background: "#ffffff", height: "100%" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: "0 0 12px 0", fontFamily: "'Inter', system-ui, sans-serif" }}>Messages</h2>
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
              fontSize: 14, 
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
            <div style={{ padding: "12px 20px", background: "#f9fafb", borderBottom: "1px solid #f3f4f6", position: "sticky", top: 0, zIndex: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", margin: 0, letterSpacing: "0.5px" }}>
                Conversations ({filteredContacts.length})
              </p>
            </div>
            {filteredContacts.map((contact) => (
              <div
                key={contact._id}
                onClick={() => { handleSelectConversation(contact._id); }}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer",
                  background: selectedConversationId === contact._id ? "#f0f9ff" : "transparent",
                  borderLeft: selectedConversationId === contact._id ? "3px solid #2563eb" : "3px solid transparent",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => { if (selectedConversationId !== contact._id) { (e.currentTarget as HTMLElement).style.background = "#f5f7fa"; (e.currentTarget as HTMLElement).style.transform = "translateX(2px)"; } }}
                onMouseLeave={(e) => { if (selectedConversationId !== contact._id) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.transform = "translateX(0)"; } }}
                className="chat-hover"
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: 15, boxShadow: selectedConversationId === contact._id ? "0 4px 12px rgba(37, 99, 235, 0.3)" : "0 2px 4px rgba(0, 0, 0, 0.1)", transition: "all 0.2s ease" }}>
                    {getContactInitials(contact.metadata?.leadName || "C")}
                  </div>
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 14, height: 14, borderRadius: "50%", background: "#10b981", border: "3px solid #fff", boxShadow: "0 0 0 1px #e5e7eb" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#111827", marginBottom: "4px" }}>{contact.metadata?.leadName || "Conversation"}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {contact.lastMessage || "Aucun message"}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {filteredContacts.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", height: "100%", color: "#6b7280" }}>
            <Search size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontSize: 14, margin: 0 }}>Aucune conversation trouvée</p>
          </div>
        )}
      </div>
    </div>
  );

  // Chat area
  const chatArea = (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#ffffff", height: "100%" }}>
      {/* Header */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        padding: "12px 24px", 
        background: "#ffffff", 
        borderBottom: "1px solid #e5e7eb",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button 
            onClick={() => setShowMobileChat(false)} 
            style={{ 
              background: "none", 
              border: "none", 
              cursor: "pointer", 
              padding: 8, 
              display: showMobileChat ? "flex" : "none", 
              color: "#6b7280",
              borderRadius: 8,
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f3f4f6"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; }}
          >
            <ArrowLeft size={20} />
          </button>
          <div style={{ position: "relative" }}>
            <div style={{ 
              width: 40, 
              height: 40, 
              borderRadius: "50%", 
              background: "linear-gradient(135deg, #2563eb, #7c3aed)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              color: "#fff", 
              fontWeight: 600, 
              fontSize: 14,
              boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)"
            }}>
              {getContactInitials(selectedConversation?.metadata?.leadName || "C")}
            </div>
            <div style={{ 
              position: "absolute", 
              bottom: 0, 
              right: 0, 
              width: 10, 
              height: 10, 
              borderRadius: "50%", 
              background: "#10b981", 
              border: "2px solid #fff" 
            }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#111827", fontFamily: "'Inter', sans-serif" }}>
              {selectedConversation?.metadata?.leadName || "Conversation"}
            </div>
            <div style={{ fontSize: 12, color: isTyping ? "#2563eb" : "#10b981", transition: "color 0.2s", fontFamily: "'Inter', sans-serif" }}>
              {isTyping ? "écrit..." : "En ligne"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[Phone, Video, MoreVertical].map((Icon, i) => (
            <button
              key={i}
              style={{
                background: "none", 
                border: "none", 
                cursor: "pointer", 
                padding: 8, 
                borderRadius: 8,
                color: "#6b7280", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f3f4f6"; (e.currentTarget as HTMLElement).style.color = "#2563eb"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.color = "#6b7280"; }}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", background: "#f9fafb" }}>
        {isLoading ? (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #e5e7eb", borderTopColor: "#2563eb", animation: "spin 0.8s linear infinite" }} />
            <div style={{ color: "#6b7280", fontSize: 14, fontFamily: "'Inter', sans-serif" }}>Chargement...</div>
          </div>
        ) : (messages || []).length === 0 ? (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <div style={{ width: 60, height: 60, background: "linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(124, 58, 237, 0.1))", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <MessageCircle size={32} style={{ color: "#2563eb" }} />
            </div>
            <p style={{ color: "#6b7280", fontSize: 15, margin: 0, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>Aucun message</p>
            <p style={{ color: "#9ca3af", fontSize: 13, margin: "4px 0 0 0", fontFamily: "'Inter', sans-serif" }}>Commencez la conversation</p>
          </div>
        ) : (
          <>
            {(messages || []).map((msg, idx) => {
              const isMe = msg.sender?._id === user?.id;
              return (
                <div key={msg._id} id={`msg-${msg._id}`} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: 12, animation: "fadeInUp 0.3s ease-out" }} className="chat-message">
                  <div style={{ maxWidth: "70%", position: "relative" }} className="group">
                    <button
                      onClick={() => handleReply(msg)}
                      title="Répondre"
                      style={{
                        position: "absolute",
                        top: 6,
                        ...(isMe ? { left: -36 } : { right: -36 }),
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "#f3f4f6",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0,
                        transition: "opacity 0.15s, background 0.15s",
                        color: "#6b7280",
                      }}
                      className="group-hover:!opacity-100"
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#dbeafe"; (e.currentTarget as HTMLElement).style.color = "#2563eb"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#f3f4f6"; (e.currentTarget as HTMLElement).style.color = "#6b7280"; }}
                    >
                      <Reply size={14} />
                    </button>

                    <div style={{
                      padding: "12px 16px",
                      borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: isMe ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "#ffffff",
                      color: isMe ? "#fff" : "#1f2937",
                      fontSize: 14,
                      lineHeight: 1.5,
                      fontFamily: "'Inter', system-ui, sans-serif",
                      boxShadow: isMe ? "0 4px 12px rgba(37, 99, 235, 0.2)" : "0 1px 3px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = isMe ? "0 6px 16px rgba(37, 99, 235, 0.28)" : "0 2px 6px rgba(0, 0, 0, 0.15)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = isMe ? "0 4px 12px rgba(37, 99, 235, 0.2)" : "0 1px 3px rgba(0, 0, 0, 0.1)"; }}
                    >
                      {renderReplyQuote(replyTo, isMe)}
                      {msg.content}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 6, fontSize: 11, color: isMe ? "rgba(255, 255, 255, 0.7)" : "#6b7280" }}>
                        {formatTime(new Date(msg.createdAt))}
                        {isMe && <StatusIcon status={msg.status} />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </>
        )}

        {isTyping && <TypingIndicator name={selectedConversation?.metadata?.leadName || "Contact"} />}
      </div>

      {/* Pending files preview */}
      {pendingFiles.length > 0 && (
        <div style={{ padding: "12px 24px 0", background: "#ffffff", display: "flex", gap: 8, flexWrap: "wrap", borderTop: "1px solid #e5e7eb" }}>
          {pendingFiles.map((f, i) => (
            <div key={i} style={{ position: "relative", display: "inline-flex", animation: "fadeInUp 0.2s ease-out" }}>
              {f.type === "image" ? (
                <img src={f.url} alt={f.name} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: "2px solid #e5e7eb", transition: "all 0.2s ease" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#2563eb"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(37, 99, 235, 0.2)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                />
              ) : (
                <div style={{ width: 64, height: 64, borderRadius: 8, border: "2px solid #e5e7eb", background: "#f9fafb", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, transition: "all 0.2s ease" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#2563eb"; (e.currentTarget as HTMLElement).style.background = "#eff6ff"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb"; (e.currentTarget as HTMLElement).style.background = "#f9fafb"; }}
                >
                  <FileText size={20} style={{ color: "#2563eb" }} />
                  <span style={{ fontSize: 9, color: "#6b7280", maxWidth: 56, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>{f.name}</span>
                </div>
              )}
              <button onClick={() => removePending(i)} style={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: "50%", background: "#ef4444", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0, boxShadow: "0 2px 4px rgba(239, 68, 68, 0.3)", transition: "all 0.2s ease" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#dc2626"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 8px rgba(220, 38, 38, 0.4)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#ef4444"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 4px rgba(239, 68, 68, 0.3)"; }}
              >
                <X size={12} style={{ color: "#fff" }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Reply banner */}
      {replyTo && (
        <div style={{ padding: "12px 24px", background: "#ffffff", borderTop: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 10, animation: "fadeInUp 0.2s ease-out" }}>
          <CornerDownRight size={16} style={{ color: "#2563eb", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0, padding: "8px 12px", borderLeft: "3px solid #2563eb", borderRadius: 6, background: "#dbeafe", transition: "all 0.2s ease" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#1e40af", fontFamily: "'Inter', sans-serif" }}>
              {replyTo.sender === "me" ? "Vous" : "Contact"}
            </div>
            <div style={{ fontSize: 13, color: "#0c4a6e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'Inter', sans-serif" }}>
              {replyTo.text || "📎 Pièce jointe"}
            </div>
          </div>
          <button onClick={() => setReplyTo(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 4, display: "flex", borderRadius: 6, transition: "all 0.2s ease" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ef4444"; (e.currentTarget as HTMLElement).style.background = "#fee2e2"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#6b7280"; (e.currentTarget as HTMLElement).style.background = "none"; }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input area */}
      <div style={{ padding: "16px 24px 20px", background: "#ffffff", borderTop: replyTo ? "none" : "1px solid #e5e7eb", position: "relative" }}>
        {/* Emoji picker */}
        {showEmoji && (
          <div ref={emojiRef} style={{ position: "absolute", bottom: 90, left: 24, background: "#fff", borderRadius: 12, boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)", padding: 12, width: 280, zIndex: 100, border: "1px solid #e5e7eb", animation: "fadeInUp 0.2s ease-out" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 10, fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: "0.5px" }}>Emojis populaires</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 4 }}>
              {EMOJIS.slice(0, 20).map((emoji) => (
                <button key={emoji} onClick={() => setInput((prev) => prev + emoji)}
                  style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", borderRadius: 6, padding: 6, transition: "all 0.15s", lineHeight: 1 }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f3f4f6"; (e.currentTarget as HTMLElement).style.transform = "scale(1.2)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                >{emoji}</button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f9fafb", borderRadius: 12, padding: "8px 10px", border: "1px solid #e5e7eb", transition: "all 0.2s ease" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#2563eb"; (e.currentTarget as HTMLElement).style.background = "#f3f8ff"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb"; (e.currentTarget as HTMLElement).style.background = "#f9fafb"; }}
        >
          <button onClick={() => setShowEmoji((v) => !v)} style={{ background: showEmoji ? "#dbeafe" : "none", border: "none", cursor: "pointer", color: showEmoji ? "#2563eb" : "#6b7280", display: "flex", padding: 6, borderRadius: 8, transition: "all 0.15s" }}>
            <Smile size={20} />
          </button>
          <button onClick={() => imageInputRef.current?.click()} title="Envoyer une image" style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", display: "flex", padding: 6, borderRadius: 8, transition: "all 0.15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#2563eb"; (e.currentTarget as HTMLElement).style.background = "#dbeafe"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#6b7280"; (e.currentTarget as HTMLElement).style.background = "none"; }}>
            <Image size={20} />
          </button>
          <button onClick={() => fileInputRef.current?.click()} title="Joindre un fichier" style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", display: "flex", padding: 6, borderRadius: 8, transition: "all 0.15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#2563eb"; (e.currentTarget as HTMLElement).style.background = "#dbeafe"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#6b7280"; (e.currentTarget as HTMLElement).style.background = "none"; }}>
            <Paperclip size={20} />
          </button>
          <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Écrire un message..."
            style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 14, color: "#1f2937", fontFamily: "'Inter', system-ui, sans-serif", padding: "8px 0" }} />
          <button onClick={send} disabled={!input.trim() && pendingFiles.length === 0}
            style={{
              background: (input.trim() || pendingFiles.length > 0) ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "#e5e7eb",
              border: "none", borderRadius: 10, width: 40, height: 40,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: (input.trim() || pendingFiles.length > 0) ? "pointer" : "default",
              transition: "all 0.2s ease", flexShrink: 0,
              boxShadow: (input.trim() || pendingFiles.length > 0) ? "0 2px 8px rgba(37, 99, 235, 0.2)" : "none"
            }}
            onMouseEnter={(e) => { if((input.trim() || pendingFiles.length > 0)) (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.3)"; }}
            onMouseLeave={(e) => { if((input.trim() || pendingFiles.length > 0)) (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(37, 99, 235, 0.2)"; }}
          >
            <Send size={18} style={{ color: (input.trim() || pendingFiles.length > 0) ? "#fff" : "#9ca3af" }} />
          </button>
        </div>
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
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .chat-sidebar {
          animation: slideInLeft 0.3s ease-out;
        }
        .chat-area {
          animation: slideInRight 0.3s ease-out;
        }
        .chat-message {
          animation: fadeInUp 0.25s ease-out;
        }
        .chat-message-skeleton {
          animation: pulse 2s ease-in-out infinite;
        }
        .chat-hover {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .chat-hover:hover {
          transform: translateX(4px);
        }
      `}</style>
      <div style={{ display: "flex", height: "100%", maxWidth: 750, width: "100%", margin: "0 auto", fontFamily: "'Inter', system-ui, sans-serif", overflow: "hidden", background: "#f3f4f6", borderRadius: "12px", boxShadow: "0 4px 24px rgba(0, 0, 0, 0.12)" }}>
        {hiddenInputs}
        {lightbox}
        <div style={{ 
          width: "100%", 
          maxWidth: 380, 
          height: "100%", 
          display: showMobileChat ? "none" : "flex", 
          "@media (min-width: 768px)": { display: "flex" },
          borderRight: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)"
        }} className="chat-sidebar">
          {sidebar}
        </div>
        <div style={{ 
          flex: 1, 
          height: "100%", 
          display: showMobileChat ? "flex" : "none",
          "@media (min-width: 768px)": { display: "flex" },
          flexDirection: "column",
          background: "white"
        }} className="chat-area">
          {!selectedConversationId ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f5f7fa 0%, #f9fafb 100%)", padding: "40px 20px" }}>
              <div style={{ textAlign: "center", maxWidth: 400 }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(124, 58, 237, 0.1))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", animation: "pulse 3s ease-in-out infinite" }}>
                  <MessageCircle size={40} style={{ color: "#2563eb" }} />
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#1f2937", margin: "0 0 12px 0", fontFamily: "'Inter', sans-serif" }}>Bienvenue dans Messages</h3>
                <p style={{ fontSize: "14px", color: "#6b7280", margin: 0, lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>Sélectionnez une conversation ou un lead pour commencer à discuter</p>
                <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ padding: "12px 16px", background: "#dbeafe", borderRadius: "8px", display: "flex", alignItems: "center", gap: 12, fontSize: "13px", color: "#1e40af", fontFamily: "'Inter', sans-serif" }}>
                    <span style={{ fontSize: "20px" }}>💡</span>
                    <span>Les discussions sont sauvegardées automatiquement</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            chatArea
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
