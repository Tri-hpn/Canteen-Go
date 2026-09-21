import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, Minus, Trash2, Check, ArrowRight, Store, Pencil } from "lucide-react";
import { money } from "../../components/UI";
import { toast } from "../../components/Effects";
import { useTranslation } from "../../i18n";
import FoodDetailModal from "../../components/FoodDetailModal";

const STORAGE_KEY = "canteen_cart_selected";

export default function CustomerCart({ cart, setCart }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const lines = Object.entries(cart).map(([key, item]) => ({ ...item, _key: key }));

  const [editingItem, setEditingItem] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const arr = JSON.parse(saved);
        const validKeys = arr.filter(k => Object.keys(cart).includes(k));
        if (validKeys.length > 0) return validKeys;
      }
    } catch {}
    return Object.keys(cart);
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedKeys));
    } catch {}
  }, [selectedKeys]);

  useEffect(() => {
    const keys = Object.keys(cart);
    setSelectedKeys(prev => {
      const stillValid = prev.filter(k => keys.includes(k));
      const newOnes = keys.filter(k => !prev.includes(k));
      return [...stillValid, ...newOnes];
    });
  }, [cart]);

  if (!lines.length) {
    return (
      <div style={{
        background: "var(--card-bg, #fff)",
        borderRadius: 16,
        padding: 80,
        textAlign: "center",
        border: "1px solid var(--border-color, #e7ebf0)"
      }}>
        <div style={{
          width: 120, height: 120, borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(38, 52, 213, 0.1), rgba(32, 199, 121, 0.1))",
          display: "grid", placeItems: "center",
          margin: "0 auto 20px"
        }}>
          <ShoppingCart size={56} style={{ color: "#2634d5" }} />
        </div>
        <h2 style={{ margin: "0 0 8px", color: "var(--text-primary, #172033)", fontSize: 22 }}>
          {t("cart.empty")}
        </h2>
        <p style={{ color: "var(--text-muted, #8993a3)", marginBottom: 24 }}>
          {t("cart.emptyDesc")}
        </p>
        <Link to="/customer/menu" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#2634d5", color: "#fff",
          padding: "12px 24px", borderRadius: 10,
          textDecoration: "none", fontWeight: 700, fontSize: 14
        }}>
          <Store size={16} /> {t("cart.exploreMenu")}
        </Link>
      </div>
    );
  }

  const toggleItem = (key) => {
    setSelectedKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const allSelected = lines.length > 0 && lines.every(m => selectedKeys.includes(m._key));
  const toggleAll = () => {
    if (allSelected) setSelectedKeys([]);
    else setSelectedKeys(lines.map(m => m._key));
  };

  const selectedLines = lines.filter(m => selectedKeys.includes(m._key));
  const total = selectedLines.reduce((s, m) => s + m.price * m.qty, 0);
  const totalQty = selectedLines.reduce((s, m) => s + m.qty, 0);

  const updateQty = (key, delta) => {
    setCart((c) => {
      const item = c[key];
      if (!item) return c;
      const maxQty = item.stock || 99;
      const currentQty = item.qty || 1;
      if (delta > 0 && currentQty >= maxQty) {
        toast("Chỉ còn " + maxQty + " phần trong kho", "error");
        return c;
      }
      const newQty = Math.max(1, Math.min(maxQty, currentQty + delta));
      return { ...c, [key]: { ...item, qty: newQty } };
    });
  };

  const removeItem = (key) => {
    setCart((c) => {
      const n = { ...c };
      delete n[key];
      return n;
    });
    setSelectedKeys(prev => prev.filter(k => k !== key));
  };

  const goCheckout = () => {
    if (!selectedLines.length) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedKeys));
    } catch {}
    navigate("/customer/checkout");
  };

  return (
    <div className="cart-2col" style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)", gap: 20, alignItems: "start" }}>
      {/* LEFT COLUMN */}
      <div style={{ minWidth: 0 }}>
        {/* Header with select all */}
        <div style={{
          background: "var(--card-bg, #fff)",
          border: "1px solid var(--border-color, #e7ebf0)",
          borderRadius: 14,
          padding: "14px 18px",
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap"
        }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
            <span
              onClick={toggleAll}
              style={{
                width: 22, height: 22, borderRadius: 6,
                border: allSelected ? "0" : "2px solid var(--border-color, #cbd5e1)",
                background: allSelected ? "#2634d5" : "transparent",
                display: "grid", placeItems: "center",
                cursor: "pointer", flexShrink: 0
              }}
            >
              {allSelected && <Check size={14} color="#fff" />}
            </span>
            <b style={{ fontSize: 14, color: "var(--text-primary, #172033)" }}>
              Chọn tất cả ({lines.length} món)
            </b>
          </label>

          <span style={{ fontSize: 13, color: "var(--text-muted, #64748b)" }}>
            Đã chọn <b style={{ color: "#2634d5" }}>{selectedLines.length}</b>/{lines.length}
          </span>
        </div>

        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {lines.map((m) => {
            const checked = selectedKeys.includes(m._key);
            const atMax = m.qty >= (m.stock || 99);
            const atMin = m.qty <= 1;
            return (
              <div
                key={m._key}
                className="cart-item-grid"
                style={{
                  background: "var(--card-bg, #fff)",
                  border: checked ? "1.5px solid #2634d5" : "1px solid var(--border-color, #e7ebf0)",
                  borderRadius: 14,
                  padding: 14,
                  display: "grid",
                  gridTemplateColumns: "auto 70px 1fr auto auto auto auto",
                  gap: 14,
                  alignItems: "center",
                  opacity: checked ? 1 : 0.65,
                  transition: "all 0.2s",
                  boxShadow: checked ? "0 4px 12px rgba(38, 52, 213, 0.08)" : "none"
                }}
              >
                <span
                  onClick={() => toggleItem(m._key)}
                  style={{
                    width: 22, height: 22, borderRadius: 6,
                    border: checked ? "0" : "2px solid var(--border-color, #cbd5e1)",
                    background: checked ? "#2634d5" : "transparent",
                    display: "grid", placeItems: "center",
                    cursor: "pointer", flexShrink: 0
                  }}
                >
                  {checked && <Check size={14} color="#fff" />}
                </span>

                <img
                  src={m.image}
                  alt={m.name}
                  onClick={() => toggleItem(m._key)}
                  style={{ width: 70, height: 70, borderRadius: 12, objectFit: "cover", cursor: "pointer" }}
                />

                <div style={{ minWidth: 0, cursor: "pointer" }} onClick={() => toggleItem(m._key)}>
                  <b style={{ fontSize: 14, color: "var(--text-primary, #172033)", display: "block", marginBottom: 4, lineHeight: 1.35 }}>
                    {m.name}
                  </b>
                  <div style={{ fontSize: 12, color: "var(--text-light, #8993a3)", display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <span>Đơn giá: <b style={{ color: "#18a967" }}>{money(m.price)}</b></span>
                    {m.stock && <span>Còn: {m.stock}</span>}
                  </div>
                </div>

                <div style={{
                  display: "inline-flex", alignItems: "center",
                  background: "var(--bg-tertiary, #f5f7fb)",
                  borderRadius: 24, padding: 3, gap: 2
                }}>
                  <button
                    onClick={() => updateQty(m._key, -1)}
                    disabled={atMin}
                    style={{
                      width: 28, height: 28, borderRadius: "50%",
                      border: 0, background: atMin ? "transparent" : "#fff",
                      cursor: atMin ? "not-allowed" : "pointer",
                      display: "grid", placeItems: "center",
                      color: atMin ? "#cbd5e1" : "#2634d5",
                      opacity: atMin ? 0.4 : 1,
                      boxShadow: atMin ? "none" : "0 1px 3px rgba(0,0,0,0.08)"
                    }}
                  >
                    <Minus size={14} />
                  </button>
                  <b style={{ minWidth: 28, textAlign: "center", fontSize: 14, color: "#172033" }}>{m.qty}</b>
                  <button
                    onClick={() => updateQty(m._key, 1)}
                    disabled={atMax}
                    style={{
                      width: 28, height: 28, borderRadius: "50%",
                      border: 0, background: atMax ? "transparent" : "#2634d5",
                      cursor: atMax ? "not-allowed" : "pointer",
                      display: "grid", placeItems: "center",
                      color: atMax ? "#cbd5e1" : "#fff",
                      opacity: atMax ? 0.4 : 1,
                      boxShadow: atMax ? "none" : "0 1px 3px rgba(38, 52, 213, 0.3)"
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div style={{ textAlign: "right", minWidth: 90 }}>
                  <b style={{ fontSize: 15, color: "#2634d5", fontWeight: 800 }}>
                    {money(m.price * m.qty)}
                  </b>
                </div>

                <button
                  onClick={() => setEditingItem({ key: m._key, item: m })}
                  title="Sửa"
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    border: "1px solid #2634d5",
                    background: "rgba(38, 52, 213, 0.08)",
                    cursor: "pointer",
                    color: "#2634d5",
                    display: "grid", placeItems: "center",
                    flexShrink: 0
                  }}
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => removeItem(m._key)}
                  title="Xoá"
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    border: "1px solid var(--border-color, #e5e9ef)",
                    background: "var(--card-bg, #fff)",
                    cursor: "pointer",
                    color: "#ef4444",
                    display: "grid", placeItems: "center",
                    flexShrink: 0
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN - Summary */}
      <div style={{
        background: "var(--card-bg, #fff)",
        border: "1px solid var(--border-color, #e7ebf0)",
        borderRadius: 14,
        padding: 20,
        position: "sticky",
        top: 90
      }}>
        <h3 style={{
          margin: "0 0 16px",
          color: "var(--text-primary, #172033)",
          fontSize: 16,
          display: "flex", alignItems: "center", gap: 8,
          paddingBottom: 14,
          borderBottom: "1px solid var(--border-color, #eef2f7)"
        }}>
          🧾 {t("checkout.summary")}
        </h3>

        <div style={{
          background: "linear-gradient(135deg, rgba(38, 52, 213, 0.06), rgba(32, 199, 121, 0.06))",
          border: "1px dashed rgba(38, 52, 213, 0.3)",
          borderRadius: 10,
          padding: "12px 14px",
          marginBottom: 14
        }}>
          <div style={{ fontSize: 11, color: "#2634d5", fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>
            ĐÃ CHỌN
          </div>
          {selectedLines.length === 0 ? (
            <div style={{ fontSize: 13, color: "#ef4444", fontWeight: 600 }}>
              Chưa chọn món nào
            </div>
          ) : (
            <div style={{ fontSize: 14, color: "var(--text-primary, #172033)" }}>
              <b style={{ color: "#2634d5" }}>{selectedLines.length}</b> món · <b style={{ color: "#2634d5" }}>{totalQty}</b> phần
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13.5 }}>
          <span style={{ color: "var(--text-muted, #64748b)" }}>{t("cart.subtotal")}</span>
          <b style={{ color: "var(--text-primary, #172033)" }}>{money(total)}</b>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13.5 }}>
          <span style={{ color: "var(--text-muted, #64748b)" }}>{t("cart.serviceFee")}</span>
          <b style={{ color: "var(--text-primary, #172033)" }}>{money(0)}</b>
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 0", marginTop: 8,
          borderTop: "2px solid var(--border-color, #eef2f7)"
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary, #172033)" }}>
            {t("cart.total")}
          </span>
          <strong style={{ color: "#2634d5", fontSize: 24, fontWeight: 800 }}>
            {money(total)}
          </strong>
        </div>

        <button
          onClick={goCheckout}
          disabled={!selectedLines.length}
          style={{
            width: "100%", padding: "14px 16px",
            background: selectedLines.length
              ? "linear-gradient(135deg, #2634d5, #3b4bef)"
              : "#94a3b8",
            color: "#fff", border: 0, borderRadius: 10,
            fontWeight: 700, fontSize: 14,
            cursor: selectedLines.length ? "pointer" : "not-allowed",
            marginTop: 12,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: selectedLines.length ? "0 4px 12px rgba(38, 52, 213, 0.3)" : "none"
          }}
        >
          {selectedLines.length ? (
            <>
              {t("cart.checkout")} <ArrowRight size={16} />
            </>
          ) : (
            "Chọn món để đặt"
          )}
        </button>
      </div>

      {editingItem && (
        <FoodDetailModal
          item={editingItem.item}
          cart={cart}
          setCart={setCart}
          editingKey={editingItem.key}
          initialToppings={editingItem.item._toppings || []}
          initialSize={editingItem.item._size || "S"}
          initialQty={editingItem.item.qty}
          onUpdate={(oldKey, newKey, newItem) => {
            setCart((cc) => { const n = { ...cc }; delete n[oldKey]; n[newKey] = newItem; return n; });
            setSelectedKeys(prev => prev.includes(oldKey) ? [...prev.filter(k => k !== oldKey), newKey] : prev);
          }}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}