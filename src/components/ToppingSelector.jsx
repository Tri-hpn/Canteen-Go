import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { api } from "../api";
import { money } from "./UI";

export default function ToppingSelector({ category, onToppingsChange, onSizeChange, onTotalChange, basePrice }) {
  const [toppings, setToppings] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [selectedSize, setSelectedSize] = useState("S");

  useEffect(() => {
    api.toppings.list(category).then(setToppings).catch(() => setToppings([]));
    api.sizes.list().then(setSizes).catch(() => setSizes([]));
  }, [category]);

  useEffect(() => {
    const toppingsTotal = selectedToppings.reduce((s, id) => {
      const t = toppings.find((x) => x.id === id);
      return s + (t?.price || 0);
    }, 0);
    const size = sizes.find((s) => s.id === selectedSize);
    const sizeExtra = size?.extra_price || 0;
    const total = basePrice + toppingsTotal + sizeExtra;

    if (onToppingsChange) onToppingsChange(selectedToppings);
    if (onSizeChange) onSizeChange(selectedSize);
    if (onTotalChange) onTotalChange(total);
  }, [selectedToppings, selectedSize, toppings, sizes, basePrice]);

  const toggleTopping = (id) => {
    setSelectedToppings((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    );
  };

  if (!toppings.length && !sizes.length) return null;

  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px dashed var(--border-color, #eef2f7)" }}>
      {sizes.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ margin: "0 0 10px", fontSize: 13, color: "var(--text-primary, #172033)", fontWeight: 600 }}>
            Chọn size
          </h4>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {sizes.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSize(s.id)}
                style={{
                  padding: "8px 16px",
                  background: selectedSize === s.id ? "#2634d5" : "var(--card-bg, #fff)",
                  color: selectedSize === s.id ? "#fff" : "var(--text-primary, #172033)",
                  border: selectedSize === s.id ? "1px solid #2634d5" : "1px solid var(--border-color, #e5e9ef)",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13
                }}
              >
                {s.name}
                {s.extra_price > 0 && <span style={{ fontSize: 11, opacity: 0.8, marginLeft: 4 }}>+{money(s.extra_price)}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {toppings.length > 0 && (
        <div>
          <h4 style={{ margin: "0 0 10px", fontSize: 13, color: "var(--text-primary, #172033)", fontWeight: 600 }}>
            Thêm topping
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            {toppings.map((t) => {
              const active = selectedToppings.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTopping(t.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 12px",
                    background: active ? "#eef2ff" : "var(--card-bg, #fff)",
                    border: active ? "2px solid #2634d5" : "2px solid var(--border-color, #e5e9ef)",
                    borderRadius: 10,
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: 4,
                    border: active ? "0" : "2px solid var(--border-color, #cbd5e1)",
                    background: active ? "#2634d5" : "transparent",
                    display: "grid", placeItems: "center", flexShrink: 0
                  }}>
                    {active && <Check size={12} color="#fff" />}
                  </div>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ fontSize: 13, color: "var(--text-primary, #172033)", fontWeight: 500 }}>{t.name}</div>
                  </div>
                  <b style={{ fontSize: 12, color: "#18a967" }}>+{money(t.price)}</b>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
