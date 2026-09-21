import { useEffect, useState } from "react";
import { Search, Eye, EyeOff } from "lucide-react";
import { api } from "../../api";
import { money, StatusBadge } from "../../components/UI";
import { toast } from "../../components/Effects";

export default function EmployeeMenu() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    api.menu.list("", "Tất cả", "popular", true).then(setItems).catch(() => {});
  }, []);

  const toggleActive = async (item) => {
    const newActive = item.active ? 0 : 1;
    try {
      await api.menu.update(item._id || item.id, { active: newActive });
      toast(newActive ? "Đã bật món" : "Đã tắt món", "success");
      api.menu.list("", "Tất cả", "popular", true).then(setItems).catch(() => {});
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const filtered = items.filter((m) =>
    m.name?.toLowerCase().includes(q.toLowerCase()) ||
    m.category?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "var(--card-bg, #fff)",
          border: "1px solid var(--border-color, #e5e9ef)",
          borderRadius: 10,
          padding: "10px 14px",
          flex: 1,
          maxWidth: 400
        }}>
          <Search size={18} style={{ color: "var(--text-light, #8993a3)" }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm món ăn..."
            style={{
              flex: 1,
              border: 0,
              outline: "none",
              fontSize: 13,
              background: "transparent",
              color: "var(--text-primary, #172033)"
            }}
          />
        </div>
      </div>

      {/* Bảng */}
      <div style={{
        background: "var(--card-bg, #fff)",
        border: "1px solid var(--border-color, #e7ebf0)",
        borderRadius: 12,
        padding: 20
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16
        }}>
          <h3 style={{ margin: 0, color: "var(--text-primary, #172033)" }}>
            Thực đơn Canteen
          </h3>
          <span style={{ color: "var(--text-light, #8993a3)", fontSize: 12 }}>
            {filtered.length} món
          </span>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-tertiary, #f5f7fb)" }}>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Ảnh</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Món ăn</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Danh mục</th>
              <th style={{ padding: 11, textAlign: "right", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Giá</th>
              <th style={{ padding: 11, textAlign: "center", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Tồn</th>
              <th style={{ padding: 11, textAlign: "center", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Đã bán</th>
              <th style={{ padding: 11, textAlign: "left", fontSize: 12, color: "var(--text-muted, #64748b)" }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m._id || m.id} style={{ borderBottom: "1px solid var(--border-color, #eef2f7)" }}>
                <td style={{ padding: 11 }}>
                  <img
                    src={m.image}
                    alt={m.name}
                    style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }}
                  />
                </td>
                <td style={{ padding: 11 }}>
                  <b style={{ color: "var(--text-primary, #172033)", fontSize: 13 }}>{m.name}</b>
                  <div style={{ fontSize: 11, color: "var(--text-light, #8993a3)", marginTop: 2 }}>
                    #{m._id ? m._id.slice(-4) : m.id}
                  </div>
                </td>
                <td style={{ padding: 11, color: "var(--text-muted, #64748b)", fontSize: 13 }}>
                  {m.category}
                </td>
                <td style={{ padding: 11, textAlign: "right" }}>
                  <b style={{ color: "#18a967", fontSize: 13 }}>{money(m.price)}</b>
                </td>
                <td style={{ padding: 11, textAlign: "center", color: "var(--text-primary, #172033)", fontSize: 13 }}>
                  {m.stock}
                </td>
                <td style={{ padding: 11, textAlign: "center", color: "var(--text-muted, #64748b)", fontSize: 13 }}>
                  {m.sold || 0}
                </td>
                <td style={{ padding: 11 }}>
                  <StatusBadge status={m.stock === 0 ? "Hết hàng" : m.stock < 10 ? "Sắp hết" : "Còn hàng"} />
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: 30, color: "var(--text-light, #8993a3)" }}>
                  Không có món nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
