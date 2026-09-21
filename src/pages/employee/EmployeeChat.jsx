import { useEffect, useRef, useState } from "react";
import { Send, MessageCircle, RefreshCw } from "lucide-react";
import { api } from "../../api";
import { toast } from "../../components/Effects";

export default function EmployeeChat() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef();
  const intervalRef = useRef(null);

  const loadConvs = async (silent = true) => {
    try {
      const data = await api.chat.conversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (e) {
      if (!silent) console.error("Load convs error:", e);
    }
  };

  const loadMessages = async (userId, silent = true) => {
    if (!userId) return;
    try {
      const data = await api.chat.messagesWith(userId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      if (!silent) console.error("Load msgs error:", e);
    }
  };

  // Load lần đầu
  useEffect(() => {
    loadConvs(false);
  }, []);

  // Polling khi có selected
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      loadConvs(true);
      if (selected) loadMessages(selected.user_id, true);
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selected]);

  // Khi click vào conversation → load tin nhắn
  const openConv = (c) => {
    setSelected(c);
    loadMessages(c.user_id, false);
  };

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    const val = text.trim();
    if (!val || !selected || sending) return;

    setSending(true);
    try {
      const msg = await api.chat.send({
        content: val,
        toUserId: selected.user_id
      });
      setText("");
      setMessages((m) => [...m, msg]);
      setTimeout(() => loadMessages(selected.user_id, true), 500);
    } catch (e) {
      toast(e.message || "Không gửi được", "error");
    } finally {
      setSending(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        gap: 16,
        height: "calc(100vh - 180px)",
        minHeight: 500
      }}
    >
      {/* Danh sách conversations */}
      <div
        style={{
          background: "var(--card-bg, #fff)",
          border: "1px solid var(--border-color, #e7ebf0)",
          borderRadius: 12,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            padding: 16,
            borderBottom: "1px solid var(--border-color, #eef2f7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <b style={{ color: "var(--text-primary, #172033)", fontSize: 14 }}>
            Tin nhắn khách hàng
          </b>
          <button
            onClick={() => loadConvs(false)}
            title="Làm mới"
            style={{
              background: "transparent",
              border: 0,
              cursor: "pointer",
              color: "var(--text-light, #8993a3)",
              display: "grid",
              placeItems: "center"
            }}
          >
            <RefreshCw size={14} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {conversations.length === 0 && (
            <div
              style={{
                padding: 30,
                textAlign: "center",
                color: "var(--text-light, #8993a3)",
                fontSize: 13
              }}
            >
              Chưa có tin nhắn nào
            </div>
          )}
          {conversations.map((c) => (
            <div
              key={c.user_id}
              onClick={() => openConv(c)}
              style={{
                padding: 14,
                cursor: "pointer",
                borderBottom: "1px solid var(--border-color, #f5f7fb)",
                background:
                  selected?.user_id === c.user_id
                    ? "var(--bg-tertiary, #eef2ff)"
                    : "transparent",
                transition: "background 0.2s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#f59e0b,#ef4444)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                    fontSize: 12,
                    flexShrink: 0
                  }}
                >
                  {(c.user_name || "?").slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <b
                      style={{
                        fontSize: 13,
                        color: "var(--text-primary, #172033)"
                      }}
                    >
                      {c.user_name}
                    </b>
                    {c.unread > 0 && (
                      <span
                        style={{
                          background: "#ef4444",
                          color: "#fff",
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: 10
                        }}
                      >
                        {c.unread}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-light, #8993a3)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      marginTop: 2
                    }}
                  >
                    {c.last_message}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Khung chat */}
      <div
        style={{
          background: "var(--card-bg, #fff)",
          border: "1px solid var(--border-color, #e7ebf0)",
          borderRadius: 12,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        {!selected ? (
          <div
            style={{
              flex: 1,
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              color: "var(--text-light, #8993a3)"
            }}
          >
            <div>
              <MessageCircle size={60} style={{ opacity: 0.3 }} />
              <p>Chọn 1 cuộc trò chuyện để bắt đầu</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div
              style={{
                padding: 16,
                borderBottom: "1px solid var(--border-color, #eef2f7)",
                display: "flex",
                alignItems: "center",
                gap: 10
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#f59e0b,#ef4444)",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 700,
                  fontSize: 12
                }}
              >
                {(selected.user_name || "?").slice(0, 2).toUpperCase()}
              </div>
              <b style={{ color: "var(--text-primary, #172033)" }}>
                {selected.user_name}
              </b>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 16,
                background: "var(--bg-tertiary, #f5f7fb)"
              }}
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    justifyContent:
                      m.from === "staff" ? "flex-end" : "flex-start",
                    marginBottom: 10
                  }}
                >
                  <div
                    style={{
                      maxWidth: "70%",
                      padding: "10px 14px",
                      borderRadius:
                        m.from === "staff"
                          ? "16px 16px 4px 16px"
                          : "16px 16px 16px 4px",
                      background:
                        m.from === "staff"
                          ? "#2634d5"
                          : "var(--card-bg, #fff)",
                      color:
                        m.from === "staff"
                          ? "#fff"
                          : "var(--text-primary, #172033)",
                      fontSize: 13,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                    }}
                  >
                    <div
                      style={{
                        wordBreak: "break-word",
                        whiteSpace: "pre-wrap"
                      }}
                    >
                      {m.content}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        opacity: 0.7,
                        marginTop: 4,
                        textAlign: "right"
                      }}
                    >
                      {new Date(m.created_at).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              style={{
                padding: 12,
                borderTop: "1px solid var(--border-color, #eef2f7)",
                display: "flex",
                gap: 8
              }}
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={onKey}
                placeholder="Trả lời khách hàng..."
                disabled={sending}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  border: "1px solid var(--border-color, #e5e9ef)",
                  borderRadius: 24,
                  outline: "none",
                  background: "var(--bg-secondary, #f5f7fb)",
                  color: "var(--text-primary, #172033)",
                  fontSize: 13
                }}
              />
              <button
                onClick={send}
                disabled={sending || !text.trim()}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: text.trim() ? "#2634d5" : "#94a3b8",
                  color: "#fff",
                  border: 0,
                  cursor: text.trim() && !sending ? "pointer" : "not-allowed",
                  display: "grid",
                  placeItems: "center"
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}