import React, { useState, useRef, useEffect } from "react";
import { Send, Check, CheckCheck, X, FileText, Reply, CornerDownRight, MessageCircle, Circle } from "lucide-react";
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

interface ChatModalProps {
  conversationId: string;
  leadName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  conversationId,
  leadName,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { messages, openConversation, sendMessage } = useChat();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<ReplyMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [presenceStatus, setPresenceStatus] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && conversationId) {
      setIsLoading(true);
      openConversation(conversationId).finally(() => setIsLoading(false));
    }
  }, [isOpen, conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const getPresenceStatus = () => {
    if (!messages || messages.length === 0) return "En ligne";

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.createdAt) return "En ligne";

    const lastMessageTime = new Date(lastMessage.createdAt);
    const now = new Date();
    const minutesAgo = Math.floor((now.getTime() - lastMessageTime.getTime()) / 60000);

    if (minutesAgo < 1) return "En ligne";
    if (minutesAgo < 60) return `En ligne il y a ${minutesAgo} min`;

    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo < 24) return `En ligne il y a ${hoursAgo}h`;

    const daysAgo = Math.floor(hoursAgo / 24);
    return `En ligne il y a ${daysAgo}j`;
  };

  useEffect(() => {
    const updateStatus = () => {
      setPresenceStatus(getPresenceStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    if (conversationId) {
      sendMessage(conversationId, input.trim());
    }
    setInput("");
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

  const formatTime = (d: Date) => d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });


  const renderReplyQuote = (reply: ReplyMessage | null, isMe: boolean) => {
    if (!reply) return null;
    return (
      <div style={{ padding: "6px 10px", marginBottom: 6, borderRadius: 8, borderLeft: `3px solid ${isMe ? "rgba(255,255,255,0.5)" : "#2563eb"}`, background: isMe ? "rgba(255,255,255,0.12)" : "#f0f9ff", cursor: "pointer" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: isMe ? "rgba(255,255,255,0.8)" : "#2563eb", marginBottom: 2 }}>
          {reply.sender === "me" ? "Vous" : leadName}
        </div>
        <div style={{ fontSize: 12, color: isMe ? "rgba(255,255,255,0.65)" : "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 250 }}>
          {reply.text}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {previewImage && (
        <div onClick={() => setPreviewImage(null)} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}>
          <button onClick={() => setPreviewImage(null)} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
            <X size={20} />
          </button>
          <img src={previewImage} alt="Preview" style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 8, objectFit: "contain" }} />
        </div>
      )}

      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0, 0, 0, 0.5)" }} />

      <div style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 50,
        width: "min(95vw, 800px)",
        maxWidth: "100%",
        height: "min(95vh, 90vh)",
        maxHeight: "95vh",
        background: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        display: "flex",
        flexDirection: "column",
        animation: "slideUp 0.3s ease-out"
      }}>
        <style>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translate(-50%, -45%);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%);
            }
          }
          @keyframes typingDot {
            0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
            30% { opacity: 1; transform: scale(1.1); }
          }
        `}</style>

        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "clamp(12px, 3vw, 16px) clamp(16px, 4vw, 24px)",
          borderBottom: "2px solid #f3f4f6",
          flexShrink: 0
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "clamp(14px, 4vw, 16px)", color: "#111827", fontFamily: "'Inter', sans-serif" }}>
              {leadName}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: "2px" }}>
              <Circle size={8} style={{ color: presenceStatus.includes("il y a") ? "#9ca3af" : "#10b981", fill: presenceStatus.includes("il y a") ? "#9ca3af" : "#10b981" }} />
              <span style={{ fontSize: "clamp(11px, 2.5vw, 12px)", color: presenceStatus.includes("il y a") ? "#6b7280" : "#10b981", fontFamily: "'Inter', sans-serif" }}>
                {presenceStatus}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
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
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "clamp(12px, 3vw, 20px) clamp(12px, 4vw, 24px)", background: "#f9fafb", scrollBehavior: "smooth" }}>
          {isLoading ? (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #e5e7eb", borderTopColor: "#2563eb", animation: "spin 0.8s linear infinite" }} />
            </div>
          ) : (messages || []).length === 0 ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "clamp(16px, 5vw, 32px)" }}>
              <div style={{ width: "clamp(48px, 12vw, 60px)", height: "clamp(48px, 12vw, 60px)", background: "linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(124, 58, 237, 0.1))", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "clamp(12px, 3vw, 16px)" }}>
                <MessageCircle size="clamp(24px, 8vw, 32px)" style={{ color: "#2563eb" }} />
              </div>
              <p style={{ color: "#6b7280", fontSize: "clamp(13px, 3.5vw, 15px)", margin: 0, fontWeight: 500 }}>Aucun message</p>
              <p style={{ color: "#9ca3af", fontSize: "clamp(12px, 3vw, 13px)", margin: "4px 0 0 0" }}>Commencez la conversation</p>
            </div>
          ) : (
            <>
              {(messages || []).map((msg, idx) => {
                const isMe = msg.sender?._id === user?.id;
                return (
                  <div key={msg._id} id={`msg-${msg._id}`} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: "clamp(8px, 2vw, 12px)" }} className="chat-message">
                    <div style={{ maxWidth: "clamp(70%, 85%, 70%)", position: "relative" }} className="group">
                      <button
                        onClick={() => handleReply(msg)}
                        title="Répondre"
                        style={{
                          position: "absolute",
                          top: 6,
                          ...(isMe ? { left: "-clamp(28px, 8vw, 36px)" } : { right: "-clamp(28px, 8vw, 36px)" }),
                          width: "clamp(24px, 6vw, 28px)",
                          height: "clamp(24px, 6vw, 28px)",
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
                        padding: "clamp(10px, 2vw, 12px) clamp(12px, 3vw, 16px)",
                        borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        background: isMe ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "#ffffff",
                        color: isMe ? "#fff" : "#1f2937",
                        fontSize: "clamp(13px, 3.5vw, 14px)",
                        lineHeight: 1.5,
                        fontFamily: "'Inter', system-ui, sans-serif",
                        boxShadow: isMe ? "0 4px 12px rgba(37, 99, 235, 0.2)" : "0 1px 3px rgba(0, 0, 0, 0.1)",
                        transition: "all 0.2s ease"
                      }}>
                        {renderReplyQuote(replyTo, isMe)}
                        {msg.content}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: "clamp(4px, 1vw, 6px)", fontSize: "clamp(10px, 2.5vw, 11px)", color: isMe ? "rgba(255, 255, 255, 0.7)" : "#6b7280" }}>
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

          {isTyping && <TypingIndicator name={leadName} />}
        </div>

{/* Reply banner */}
        {replyTo && (
          <div style={{ padding: "clamp(8px, 2vw, 12px) clamp(12px, 4vw, 24px)", background: "#ffffff", borderTop: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "clamp(6px, 2vw, 10px)" }}>
            <CornerDownRight size="clamp(14px, 3.5vw, 16px)" style={{ color: "#2563eb", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0, padding: "clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px)", borderLeft: "3px solid #2563eb", borderRadius: 6, background: "#dbeafe" }}>
              <div style={{ fontSize: "clamp(10px, 2.5vw, 11px)", fontWeight: 600, color: "#1e40af" }}>
                {replyTo.sender === "me" ? "Vous" : leadName}
              </div>
              <div style={{ fontSize: "clamp(11px, 3vw, 13px)", color: "#0c4a6e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {replyTo.text}
              </div>
            </div>
            <button onClick={() => setReplyTo(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 4, display: "flex", borderRadius: 6 }}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Input area */}
        <div style={{ padding: "clamp(12px, 3vw, 16px) clamp(12px, 4vw, 24px) clamp(14px, 4vw, 20px)", background: "#ffffff", borderTop: replyTo ? "none" : "1px solid #e5e7eb", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(6px, 1.5vw, 8px)", background: "#f9fafb", borderRadius: 12, padding: "clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 10px)", border: "1px solid #e5e7eb", transition: "all 0.2s ease" }}>
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Écrire un message..."
              style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: "clamp(13px, 3.5vw, 14px)", color: "#1f2937", fontFamily: "'Inter', system-ui, sans-serif", padding: "clamp(6px, 1.5vw, 8px) 0" }} />
            <button onClick={send} disabled={!input.trim()}
              style={{
                background: input.trim() ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "#e5e7eb",
                border: "none", borderRadius: 10, width: "clamp(36px, 9vw, 40px)", height: "clamp(36px, 9vw, 40px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: input.trim() ? "pointer" : "default",
                transition: "all 0.2s ease", flexShrink: 0,
              }}
            >
              <Send size="clamp(16px, 4vw, 18px)" style={{ color: input.trim() ? "#fff" : "#9ca3af" }} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
