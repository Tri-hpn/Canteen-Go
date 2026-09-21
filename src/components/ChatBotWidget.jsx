import { useEffect, useRef, useState } from "react";
import { Bot, X, Send, ShoppingCart, Sparkles, Store, MessageCircleHeart } from "lucide-react";
import { api } from "../api";
import { money } from "./UI";
import { toast } from "./Effects";
import { getBotReply } from "./ChatBot";
import FoodDetailModal from "./FoodDetailModal";

const QUICK_REPLIES = ["Dưới 30k", "Chay", "Nước", "Cay", "Bán chạy", "Gợi ý"];

export default function ChatBotWidget({ cart, setCart, user }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("ai"); // "ai" | "staff"

  // ===== AI =====
  const [aiMessages, setAiMessages] = useState([]);
  const [aiText, setAiText] = useState("");
  const [aiTyping, setAiTyping] = useState(false);

  // ===== Nhà hàng =====
  const [staffMessages, setStaffMessages] = useState([]);
  const [staffText, setStaffText] = useState("");
  const [staffSending, setStaffSending] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const staffInterval = useRef(null);

  // ===== Chung =====
  const [menuItems, setMenuItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [hasNew, setHasNew] = useState(true);
  const bottomRef = useRef();

  // Load menu
  useEffect(() => {
    api.menu
      .list("", "Tất cả", "popular")
      .then((d) => setMenuItems(Array.isArray(d) ? d : []))
      .catch(() => setMenuItems([]));
  }, []);

  // Chào AI lần đầu
  useEffect(() => {
    if (open && mode === "ai" && aiMessages.length === 0) {
      setAiMessages([
        {
          id: "welcome",
          from: "bot",
          content:
            "Xin chào " + (user?.name || "bạn") + "! 👋\n" +
            "Mình là trợ lý Canteen AI.\n\n" +
            "Mình có thể gợi ý món theo giá, loại hoặc sở thích. " +
            "Hoặc chuyển sang tab \"Nhà hàng\" để chat với nhân viên thật.",
          created_at: new Date().toISOString()
        }
      ]);
    }
  }, [open, mode, user]);

  // Load chat nhà hàng khi chuyển tab
  const loadStaff = async (silent = true) => {
    if (!silent) setStaffLoading(true);
    try {
      const data = await api.chat.myMessages();
      setStaffMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      if (!silent) console.error(e);
    } finally {
      if (!silent) setStaffLoading(false);
    }
  };

  useEffect(() => {
    if (!open || mode !== "staff") return;

    loadStaff(false);
    staffInterval.current = setInterval(() => loadStaff(true), 3000);

    return () => {
      if (staffInterval.current) clearInterval(staffInterval.current);
    };
  }, [open, mode]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages.length, staffMessages.length, aiTyping, mode]);

  useEffect(() => {
    if (open) setHasNew(false);
  }, [open]);

  // ===== Gửi AI =====
  const sendAI = (value) => {
    const val = (value || aiText).trim();
    if (!val || aiTyping) return;
    setAiText("");
    setAiMessages((m) => [
      ...m,
      { id: "u-" + Date.now(), from: "user", content: val, created_at: new Date().toISOString() }
    ]);
    setAiTyping(true);
    setTimeout(() => {
      const reply = getBotReply(val, menuItems);
      setAiTyping(false);
      if (!reply) return;
      setAiMessages((m) => [
        ...m,
        {
          id: "b-" + Date.now(),
          from: "bot",
          content: reply.text,
          items: reply.items || [],
          created_at: new Date().toISOString()
        }
      ]);
    }, 600);
  };

  // ===== Gửi nhà hàng =====
  const sendStaff = async () => {
    const val = staffText.trim();
    if (!val || staffSending) return;
    setStaffSending(true);
    try {
      const msg = await api.chat.send({ content: val });
      setStaffText("");
      setStaffMessages((m) => [...m, msg]);
      setTimeout(() => loadStaff(true), 500);
    } catch (e) {
      toast(e.message || "Không gửi được", "error");
    } finally {
      setStaffSending(false);
    }
  };

  const quickAdd = (m) => {
    const key = (m._id || m.id) + "-S-";
    setCart((c) => {
      const existing = c[key];
      return {
        ...c,
        [key]: {
          ...m,
          name: m.name,
          price: m.price,
          qty: existing ? existing.qty + 1 : 1,
          stock: m.stock || 99, _originalId: m._id || m.id
        }
      };
    });
    toast("Đã thêm " + m.name + " vào giỏ!", "success");
  };

  // ===== Icon động theo mode =====
  const ModeIcon = mode === "ai" ? Bot : Store;

  return (
    <>
      {/* ============ NÚT FAB ============ */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Mở chat"
          className="chatbot-fab"
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #8b5cf6, #2634d5)",
            color: "#fff",
            border: 0,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(139, 92, 246, 0.45)",
            display: "grid",
            placeItems: "center",
            zIndex: 90,
            transition: "transform 0.2s"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <MessageCircleHeart size={26} />
          {hasNew && (
           <span
  style={{
    position: "absolute",
    top: 0,
    right: 0,
    minWidth: 20,
    height: 20,
    borderRadius: "50%",
    background: "#ef4444",
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    display: "grid",
    placeItems: "center",
    border: "2px solid #fff",
    padding: "0 5px",
    lineHeight: 1,
    transform: "translate(25%, -25%)"
  }}
>
  1
</span>
          )}
          <span className="chatbot-pulse" />
        </button>
      )}

      {/* ============ KHUNG CHAT ============ */}
      {open && (
        <div
          className="chatbot-panel"
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 400,
            maxWidth: "calc(100vw - 32px)",
            height: 580,
            maxHeight: "calc(100vh - 100px)",
            background: "var(--card-bg, #fff)",
            borderRadius: 18,
            boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 100,
            border: "1px solid var(--border-color, #e5e9ef)"
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "12px 14px",
              background: "linear-gradient(135deg, #8b5cf6, #2634d5)",
              color: "#fff"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.18)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  border: "2px solid rgba(255,255,255,0.35)"
                }}
              >
                <ModeIcon size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <b style={{ fontSize: 14, display: "block" }}>
                  {mode === "ai" ? "Trợ lý Canteen AI" : "Nhà hàng Canteen"}
                </b>
                <span style={{ fontSize: 11, opacity: 0.92 }}>
                  {mode === "ai"
                    ? "Gợi ý món ăn thông minh"
                    : "Nhân viên hỗ trợ trực tuyến"}
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.18)",
                  border: 0,
                  color: "#fff",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center"
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Toggle AI / Nhà hàng */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 4,
                background: "rgba(255,255,255,0.15)",
                borderRadius: 10,
                padding: 4
              }}
            >
              <button
                onClick={() => setMode("ai")}
                style={{
                  padding: "8px 10px",
                  background: mode === "ai" ? "#fff" : "transparent",
                  color: mode === "ai" ? "#2634d5" : "#fff",
                  border: 0,
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  transition: "all 0.2s"
                }}
              >
                <Bot size={14} /> Trợ lý AI
              </button>
              <button
                onClick={() => setMode("staff")}
                style={{
                  padding: "8px 10px",
                  background: mode === "staff" ? "#fff" : "transparent",
                  color: mode === "staff" ? "#2634d5" : "#fff",
                  border: 0,
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  transition: "all 0.2s"
                }}
              >
                <Store size={14} /> Nhà hàng
              </button>
            </div>
          </div>

          {/* ============ NỘI DUNG ============ */}
          {mode === "ai" ? (
            <AIContent
              messages={aiMessages}
              typing={aiTyping}
              onSend={sendAI}
              text={aiText}
              setText={setAiText}
              onQuickAdd={quickAdd}
              onView={setSelected}
              bottomRef={bottomRef}
            />
          ) : (
            <StaffContent
              messages={staffMessages}
              loading={staffLoading}
              sending={staffSending}
              onSend={sendStaff}
              text={staffText}
              setText={setStaffText}
              bottomRef={bottomRef}
            />
          )}
        </div>
      )}

      {selected && (
        <FoodDetailModal
          item={selected}
          cart={cart}
          setCart={setCart}
          user={user}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

/* ============================================================
   SUB-COMPONENTS
   ============================================================ */

function AIContent({
  messages,
  typing,
  onSend,
  text,
  setText,
  onQuickAdd,
  onView,
  bottomRef
}) {
  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 14,
          background: "var(--bg-tertiary, #f5f7fb)"
        }}
      >
        {messages.map((m) => {
          const isUser = m.from === "user";
          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                justifyContent: isUser ? "flex-end" : "flex-start",
                gap: 8,
                marginBottom: 12
              }}
            >
              {!isUser && (
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #8b5cf6, #2634d5)",
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    alignSelf: "flex-end"
                  }}
                >
                  <Bot size={16} />
                </div>
              )}
              <div
                style={{
                  maxWidth: "78%",
                  padding: "10px 12px",
                  borderRadius: isUser
                    ? "14px 14px 4px 14px"
                    : "14px 14px 14px 4px",
                  background: isUser
                    ? "#2634d5"
                    : "var(--card-bg, #fff)",
                  color: isUser ? "#fff" : "var(--text-primary, #172033)",
                  fontSize: 13,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                }}
              >
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                  {m.content}
                </div>

                {!isUser && m.items && m.items.length > 0 && (
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                    {m.items.map((it) => (
                      <div
                        key={it.id || it._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: 6,
                          background: "var(--bg-tertiary, #f8fafc)",
                          borderRadius: 10,
                          border: "1px solid var(--border-color, #e5e9ef)"
                        }}
                      >
                        <img
                          src={it.image}
                          alt={it.name}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 8,
                            objectFit: "cover",
                            flexShrink: 0
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "var(--text-primary, #172033)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}
                          >
                            {it.name}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#18a967",
                              fontWeight: 700
                            }}
                          >
                            {money(it.price)}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                          <button
                            onClick={() => onQuickAdd(it)}
                            title="Thêm vào giỏ"
                            style={{
                              background: "#2634d5",
                              color: "#fff",
                              border: 0,
                              width: 30,
                              height: 30,
                              borderRadius: 7,
                              cursor: "pointer",
                              display: "grid",
                              placeItems: "center"
                            }}
                          >
                            <ShoppingCart size={13} />
                          </button>
                          <button
                            onClick={() => onView(it)}
                            title="Xem chi tiết"
                            style={{
                              background: "#f59e0b",
                              color: "#fff",
                              border: 0,
                              padding: "0 10px",
                              height: 30,
                              borderRadius: 7,
                              cursor: "pointer",
                              fontSize: 11,
                              fontWeight: 700
                            }}
                          >
                            Xem
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  style={{
                    fontSize: 10,
                    opacity: 0.65,
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
          );
        })}

        {typing && (
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #8b5cf6, #2634d5)",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                flexShrink: 0
              }}
            >
              <Bot size={16} />
            </div>
            <div
              style={{
                padding: "12px 16px",
                background: "var(--card-bg, #fff)",
                borderRadius: "14px 14px 14px 4px",
                display: "flex",
                gap: 4,
                alignItems: "center"
              }}
            >
              <span className="dot-typing" />
              <span className="dot-typing" style={{ animationDelay: "0.15s" }} />
              <span className="dot-typing" style={{ animationDelay: "0.3s" }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div
        style={{
          padding: "8px 10px 0",
          display: "flex",
          gap: 6,
          overflowX: "auto",
          background: "var(--card-bg, #fff)",
          borderTop: "1px solid var(--border-color, #eef2f7)"
        }}
      >
        {QUICK_REPLIES.map((q) => (
          <button
            key={q}
            onClick={() => onSend(q)}
            disabled={typing}
            style={{
              padding: "5px 12px",
              background: "var(--bg-tertiary, #f5f7fb)",
              border: "1px solid var(--border-color, #e5e9ef)",
              borderRadius: 20,
              cursor: "pointer",
              fontSize: 11.5,
              color: "var(--text-muted, #475569)",
              whiteSpace: "nowrap",
              fontWeight: 500
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: 10, display: "flex", gap: 6 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKey}
          placeholder="Bạn cần mình giúp gì?"
          disabled={typing}
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
          onClick={() => onSend()}
          disabled={typing || !text.trim()}
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: text.trim() ? "#2634d5" : "#94a3b8",
            color: "#fff",
            border: 0,
            cursor: text.trim() && !typing ? "pointer" : "not-allowed",
            display: "grid",
            placeItems: "center"
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </>
  );
}

function StaffContent({ messages, loading, sending, onSend, text, setText, bottomRef }) {
  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 14,
          background: "var(--bg-tertiary, #f5f7fb)"
        }}
      >
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: 20,
              color: "var(--text-light, #8993a3)",
              fontSize: 13
            }}
          >
            Đang tải...
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              color: "var(--text-light, #8993a3)",
              fontSize: 13
            }}
          >
            <Store
              size={44}
              style={{ opacity: 0.3, margin: "0 auto 12px", display: "block" }}
            />
            <b
              style={{
                display: "block",
                color: "var(--text-primary, #172033)",
                fontSize: 14,
                marginBottom: 6
              }}
            >
              Chat với nhà hàng
            </b>
            <p style={{ margin: 0 }}>
              Gửi tin nhắn đầu tiên để nhân viên Canteen hỗ trợ bạn.
            </p>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              justifyContent: m.from === "customer" ? "flex-end" : "flex-start",
              marginBottom: 10
            }}
          >
            <div
              style={{
                maxWidth: "75%",
                padding: "10px 14px",
                borderRadius:
                  m.from === "customer"
                    ? "16px 16px 4px 16px"
                    : "16px 16px 16px 4px",
                background:
                  m.from === "customer"
                    ? "#2634d5"
                    : "var(--card-bg, #fff)",
                color:
                  m.from === "customer"
                    ? "#fff"
                    : "var(--text-primary, #172033)",
                fontSize: 13,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
              }}
            >
              {m.from === "staff" && (
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#2634d5",
                    marginBottom: 4
                  }}
                >
                  {m.from_name || "Nhân viên"}
                </div>
              )}
              <div style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
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

      <div style={{ padding: 10, display: "flex", gap: 6 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKey}
          placeholder="Gửi tin cho nhà hàng..."
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
          onClick={onSend}
          disabled={sending || !text.trim()}
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: text.trim() ? "#2634d5" : "#94a3b8",
            color: "#fff",
            border: 0,
            cursor: text.trim() && !sending ? "pointer" : "not-allowed",
            display: "grid",
            placeItems: "center"
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </>
  );
}