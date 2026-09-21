import { useEffect, useRef, useState } from "react";
import { Send, RefreshCw, Bot, Sparkles, Store, ShoppingCart } from "lucide-react";
import { api } from "../../api";
import { money } from "../../components/UI";
import { toast } from "../../components/Effects";
import { getBotReply } from "../../components/ChatBot";
import FoodDetailModal from "../../components/FoodDetailModal";

const BOT_AVATAR = "/bot-avatar.svg";
const QUICK_REPLIES = ["Dưới 30k", "Chay", "Nước", "Cay", "Bán chạy", "Gợi ý"];

function BotAvatar({ size = 32 }) {
  return (
    <>
      <img
        src={BOT_AVATAR}
        alt="Bot"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          alignSelf: "flex-end",
          border: "2px solid #c7d2fe",
          backgroundColor: "#fff"
        }}
        onError={(e) => {
          e.target.style.display = "none";
          if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = "grid";
        }}
      />
      <div
        style={{
          display: "none",
          width: size,
          height: size,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #8b5cf6, #2634d5)",
          color: "#fff",
          placeItems: "center",
          flexShrink: 0,
          alignSelf: "flex-end"
        }}
      >
        <Bot size={size * 0.5} />
      </div>
    </>
  );
}

function TabButton({ active, onClick, icon, title, subtitle, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "14px 16px",
        background: active ? "var(--bg-tertiary, #f5f7fb)" : "transparent",
        border: 0,
        borderBottom: active ? "3px solid " + color : "3px solid transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 10,
        textAlign: "left",
        transition: "all 0.2s"
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: active ? color : color + "20",
          color: active ? "#fff" : color,
          display: "grid",
          placeItems: "center",
          flexShrink: 0
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: active ? "var(--text-primary, #172033)" : "var(--text-muted, #475569)"
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--text-light, #8993a3)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
        >
          {subtitle}
        </div>
      </div>
    </button>
  );
}

export default function CustomerChat({ cart, setCart, user }) {
  const [tab, setTab] = useState("ai");

  // Chat nhà hàng
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  // Chat AI
  const [aiMessages, setAiMessages] = useState([]);
  const [aiText, setAiText] = useState("");
  const [aiTyping, setAiTyping] = useState(false);

  // Chung
  const [menuItems, setMenuItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const bottomRef = useRef();

  useEffect(() => {
    api.menu
      .list("", "Tất cả", "popular")
      .then((d) => setMenuItems(Array.isArray(d) ? d : []))
      .catch(() => setMenuItems([]));
  }, []);

  const loadStaff = async (silent = false) => {
    try {
      const data = await api.chat.myMessages();
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      if (!silent) console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (tab !== "staff") return;
    loadStaff(false);
    intervalRef.current = setInterval(() => loadStaff(true), 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tab]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, aiMessages.length, aiTyping, tab]);

  const sendStaff = async () => {
    const val = text.trim();
    if (!val || sending) return;
    setSending(true);
    try {
      const msg = await api.chat.send({ content: val });
      setText("");
      setMessages((m) => [...m, msg]);
      setTimeout(() => loadStaff(true), 500);
    } catch (e) {
      toast(e.message || "Không gửi được", "error");
    } finally {
      setSending(false);
    }
  };

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

  return (
    <div
      style={{
        background: "var(--card-bg, #fff)",
        border: "1px solid var(--border-color, #e7ebf0)",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 180px)",
        minHeight: 520,
        overflow: "hidden"
      }}
    >
      {/* TABS */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--border-color, #eef2f7)",
          background: "var(--card-bg, #fff)"
        }}
      >
        <TabButton
          active={tab === "ai"}
          onClick={() => setTab("ai")}
          icon={<Bot size={16} />}
          title="Trợ lý AI"
          subtitle="Gợi ý món ăn"
          color="#8b5cf6"
        />
        <TabButton
          active={tab === "staff"}
          onClick={() => setTab("staff")}
          icon={<Store size={16} />}
          title="Nhà hàng"
          subtitle="Nhân viên hỗ trợ"
          color="#2634d5"
        />
      </div>

      {/* ============ TAB AI ============ */}
      {tab === "ai" && (
        <>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 16,
              background: "var(--bg-tertiary, #f5f7fb)"
            }}
          >
            {aiMessages.length === 0 && (
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <BotAvatar />
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "12px 14px",
                    borderRadius: "16px 16px 16px 4px",
                    background: "#eef2ff",
                    color: "#172033",
                    fontSize: 13,
                    border: "1px solid #c7d2fe"
                  }}
                >
                  <div style={{ fontWeight: 700, color: "#2634d5", marginBottom: 6 }}>
                    🤖 Trợ lý Canteen
                  </div>
                  <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                    Xin chào {user?.name || "bạn"}! Mình có thể gợi ý món theo giá, loại hoặc sở thích.
                    {"\n\n"}
                    Bạn thử hỏi: "dưới 30k", "chay", "nước", "cay", "bán chạy".
                  </div>
                </div>
              </div>
            )}

            {aiMessages.map((m) => {
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
                  {!isUser && <BotAvatar />}
                  <div
                    style={{
                      maxWidth: "75%",
                      padding: "10px 14px",
                      borderRadius: isUser
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                      background: isUser ? "#2634d5" : "#eef2ff",
                      color: isUser ? "#fff" : "#172033",
                      fontSize: 13,
                      border: isUser ? "none" : "1px solid #c7d2fe",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                    }}
                  >
                    {!isUser && (
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#2634d5",
                          marginBottom: 4
                        }}
                      >
                        🤖 Trợ lý
                      </div>
                    )}
                    <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{m.content}</div>

                    {!isUser && m.items && m.items.length > 0 && (
                      <div
                        style={{
                          marginTop: 10,
                          display: "flex",
                          flexDirection: "column",
                          gap: 6
                        }}
                      >
                        {m.items.map((it) => (
                          <div
                            key={it.id || it._id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: 6,
                              background: "#fff",
                              borderRadius: 10,
                              border: "1px solid #c7d2fe"
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
                                  color: "#172033",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis"
                                }}
                              >
                                {it.name}
                              </div>
                              <div style={{ fontSize: 12, color: "#18a967", fontWeight: 700 }}>
                                {money(it.price)}
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                              <button
                                onClick={() => quickAdd(it)}
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
                                onClick={() => setSelected(it)}
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
              );
            })}

            {aiTyping && (
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <BotAvatar />
                <div
                  style={{
                    padding: "12px 16px",
                    background: "#eef2ff",
                    borderRadius: "16px 16px 16px 4px",
                    display: "flex",
                    gap: 4,
                    alignItems: "center",
                    border: "1px solid #c7d2fe"
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

          <div
            style={{
              padding: "10px 12px 0",
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
                onClick={() => sendAI(q)}
                disabled={aiTyping}
                style={{
                  padding: "6px 12px",
                  background: "var(--bg-tertiary, #f5f7fb)",
                  border: "1px solid var(--border-color, #e5e9ef)",
                  borderRadius: 20,
                  cursor: "pointer",
                  fontSize: 12,
                  color: "var(--text-muted, #475569)",
                  whiteSpace: "nowrap",
                  fontWeight: 500
                }}
              >
                {q}
              </button>
            ))}
          </div>

          <div style={{ padding: 12, display: "flex", gap: 8 }}>
            <input
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendAI();
                }
              }}
              placeholder="Hỏi trợ lý AI..."
              disabled={aiTyping}
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
              onClick={() => sendAI()}
              disabled={aiTyping || !aiText.trim()}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: aiText.trim() ? "#8b5cf6" : "#94a3b8",
                color: "#fff",
                border: 0,
                cursor: aiText.trim() && !aiTyping ? "pointer" : "not-allowed",
                display: "grid",
                placeItems: "center"
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </>
      )}

      {/* ============ TAB NHÀ HÀNG ============ */}
      {tab === "staff" && (
        <>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 16,
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
                  padding: 60,
                  color: "var(--text-light, #8993a3)",
                  fontSize: 13
                }}
              >
                <Store
                  size={48}
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
                    maxWidth: "70%",
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
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendStaff();
                }
              }}
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
              onClick={sendStaff}
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

      {selected && (
        <FoodDetailModal
          item={selected}
          cart={cart}
          setCart={setCart}
          user={user}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
