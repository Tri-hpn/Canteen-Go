import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Plus, ShoppingBag, Save } from "lucide-react";
import { money } from "./UI";
import { toast } from "./Effects";
import ToppingSelector from "./ToppingSelector";
import ReviewSection from "./ReviewSection";

export default function FoodDetailModal({ item, cart, setCart, user, mode = "cart", onClose, editingKey, initialToppings, initialSize, initialQty, onUpdate }) {
  const navigate = useNavigate();
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [selectedSize, setSelectedSize] = useState("S");
  const [totalWithToppings, setTotalWithToppings] = useState(item?.price || 0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (item) {
      setSelectedToppings(initialToppings || []);
      setSelectedSize(initialSize || "S");
      setTotalWithToppings(item.price || 0);
    }
  }, [item, initialToppings, initialSize, initialQty]);

  if (!item) return null;

  const buildKey = () =>
    (item._id || item.id) + "-" + selectedSize + "-" + selectedToppings.join(",");

  const buildName = () =>
    item.name +
    (selectedSize !== "S" ? " (" + selectedSize + ")" : "") +
    (selectedToppings.length > 0 ? " + " + selectedToppings.length + " topping" : "");

  const addToCart = () => {
    const key = buildKey();
    const name = buildName();
    setCart((c) => {
      const existing = c[key];
      return {
        ...c,
        [key]: {
          ...item,
          name,
          price: totalWithToppings || item.price,
          qty: existing ? existing.qty + 1 : 1,
          stock: item.stock || 99, _originalId: item._id || item.id,
          _toppings: selectedToppings,
          _size: selectedSize
        }
      };
    });
    return name;
  };

  const handleAddToCart = () => {
    if (editingKey && onUpdate) {
      const key = buildKey();
      const name = buildName();
      onUpdate(editingKey, key, { ...item, name, price: totalWithToppings || item.price, qty: qty, stock: item.stock || 99, _originalId: item._id || item.id, _toppings: selectedToppings, _size: selectedSize });
      toast("Đã cập nhật " + name, "success");
      onClose?.();
      return;
    }
    const name = addToCart();
    toast("Đã thêm " + name + " vào giỏ!", "success");
    onClose?.();
  };

  const handleBuyNow = () => {
    const name = addToCart();
    toast("Đã thêm " + name + "! Chuyển sang thanh toán...", "success");
    onClose?.();
    navigate("/customer/checkout");
  };

  return (
    <div
      onClick={onClose}
      className="food-detail-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "grid",
        placeItems: "center",
        zIndex: 100,
        padding: 20,
        overflowY: "auto"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="food-detail-content"
        style={{
          background: "var(--card-bg, #fff)",
          borderRadius: 14,
          padding: 24,
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          overflowY: "auto"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16
          }}
        >
          <h3 style={{ margin: 0, color: "var(--text-primary, #172033)" }}>{item.name}</h3>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: 0,
              fontSize: 24,
              color: "var(--text-light, #8993a3)",
              cursor: "pointer",
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        <img
          src={item.image}
          alt={item.name}
          style={{
            width: "100%",
            height: 200,
            objectFit: "cover",
            borderRadius: 10,
            marginBottom: 14
          }}
        />

        <p
          style={{
            margin: "0 0 12px",
            color: "var(--text-muted, #64748b)",
            fontSize: 13,
            lineHeight: 1.5
          }}
        >
          {item.description}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14
          }}
        >
          <b style={{ color: "#18a967", fontSize: 20 }}>{money(item.price)}</b>
          <span style={{ fontSize: 12, color: "var(--text-light, #8993a3)" }}>
            Còn {item.stock} phần
          </span>
        </div>

        {item.rating && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 14,
              fontSize: 13
            }}
          >
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <b style={{ color: "var(--text-primary, #172033)" }}>{item.rating}</b>
            <span style={{ color: "var(--text-light, #8993a3)" }}>
              ({item.review_count || 0} đánh giá)
            </span>
          </div>
        )}

        <ToppingSelector
          category={item.category}
          basePrice={item.price}
          onToppingsChange={setSelectedToppings}
          onSizeChange={setSelectedSize}
          onTotalChange={setTotalWithToppings}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border-color, #eef2f7)" }}>
          <span style={{ fontSize: 13, color: "var(--text-muted, #64748b)", fontWeight: 600 }}>S? lu?ng:</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1} style={{ width: 32, height: 32, border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 8, background: "var(--card-bg, #fff)", color: qty <= 1 ? "#cbd5e1" : "#172033", cursor: qty <= 1 ? "not-allowed" : "pointer", fontSize: 18, fontWeight: 700, display: "grid", placeItems: "center", lineHeight: 1 }}>-</button>
            <b style={{ minWidth: 40, textAlign: "center", fontSize: 16, color: "#172033" }}>{qty}</b>
            <button type="button" onClick={() => setQty(q => Math.min(item.stock || 1, q + 1))} disabled={qty >= (item.stock || 1)} style={{ width: 32, height: 32, border: "1px solid var(--border-color, #e5e9ef)", borderRadius: 8, background: "var(--card-bg, #fff)", color: qty >= (item.stock || 1) ? "#cbd5e1" : "#172033", cursor: qty >= (item.stock || 1) ? "not-allowed" : "pointer", fontSize: 18, fontWeight: 700, display: "grid", placeItems: "center", lineHeight: 1 }}>+</button>
          </div>
          <span style={{ fontSize: 11, color: "var(--text-light, #8993a3)" }}>T?i da: {item.stock || 0}</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid var(--border-color, #eef2f7)"
          }}
        >
          <span style={{ fontSize: 14, color: "var(--text-muted, #64748b)" }}>Tổng:</span>
          <b style={{ color: "#18a967", fontSize: 22 }}>
            {money(totalWithToppings || item.price)}
          </b>
        </div>

        {/* Nút hành động — chỉ hiện 1 nút theo mode */}
        <div style={{ position: "sticky", bottom: -24, marginTop: 16, marginLeft: -24, marginRight: -24, paddingTop: 14, paddingBottom: 24, paddingLeft: 24, paddingRight: 24, background: "var(--card-bg, #fff)", borderTop: "1px solid var(--border-color, #eef2f7)", boxShadow: "0 -8px 20px rgba(0,0,0,0.06)", zIndex: 5 }}>
          {mode === "buy" ? (
            <button
              onClick={handleBuyNow}
              style={{
                width: "100%",
                padding: 14,
                background: "#2634d5",
                color: "#fff",
                border: "2px solid #2634d5",
                borderRadius: 10,
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 14,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8
              }}
            >
              <ShoppingBag size={16} /> Mua ngay
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              style={{
                width: "100%",
                padding: 14,
                background: "var(--card-bg, #fff)",
                color: "#2634d5",
                border: "2px solid #2634d5",
                borderRadius: 10,
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 14,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8
              }}
            >
              {editingKey ? <Save size={16} /> : <Plus size={16} />} {editingKey ? "Cập nhật" : "Thêm vào giỏ"}
            </button>
          )}
        </div>

        <ReviewSection menuItemId={item._id || item.id} currentUser={user} readOnly={true} />
      </div>
    </div>
  );
}