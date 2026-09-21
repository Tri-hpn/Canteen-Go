import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, ArrowRight } from "lucide-react";
import { api } from "../../api";
import { money } from "../../components/UI";

export default function CustomerSignature() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Lấy top bán chạy — fallback nếu backend chưa hỗ trợ "signature" riêng
    api.menu.list("", "Tất cả", "popular").then((d) => setItems(d.slice(0, 6))).catch(() => setItems([]));
  }, []);

  return (
    <div>
      <div style={{
        background: "var(--card-bg, #fff)",
        border: "1px solid var(--border-color, #e7ebf0)",
        borderRadius: 12, padding: 20, marginBottom: 20
      }}>
        <h3 style={{ marginTop: 0, color: "var(--text-primary, #172033)", display: "flex", alignItems: "center", gap: 8 }}>
          <Star size={20} fill="#f59e0b" color="#f59e0b" /> Món Signature của Canteen
        </h3>
        <p style={{ color: "var(--text-muted, #64748b)", fontSize: 13, margin: 0 }}>
          Những món ăn được yêu thích nhất — được chọn lọc từ thực đơn Canteen VWA.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18 }}>
        {items.map((m) => (
          <Link
            key={m.id || m._id}
            to="/customer/menu"
            className="food-card-clickable"
            style={{
              background: "var(--card-bg, #fff)",
              border: "1px solid var(--border-color, #e5e9ef)",
              borderRadius: 14, overflow: "hidden",
              textDecoration: "none", color: "inherit",
              display: "flex", flexDirection: "column"
            }}
          >
            <img src={m.image} alt={m.name} style={{ width: "100%", height: 160, objectFit: "cover" }} />
            <div style={{ padding: 14 }}>
              <span style={{ fontSize: 11, color: "var(--text-light, #8993a3)", textTransform: "uppercase" }}>
                {m.category}
              </span>
              <h4 style={{ margin: "6px 0", fontSize: 15, color: "var(--text-primary, #172033)", fontWeight: 700 }}>
                {m.name}
              </h4>
              <b style={{ color: "#18a967", fontSize: 15 }}>{money(m.price)}</b>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <Link to="/customer/menu" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "10px 20px", background: "#2634d5", color: "#fff",
          borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 13
        }}>
          Xem toàn bộ thực đơn <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
